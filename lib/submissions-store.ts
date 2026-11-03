import { createClient } from "./supabase/server";
import { requireAdmin } from "./auth";
import { upsertProperty } from "./properties-store";

export interface PropertySubmission {
  id: string;
  owner_name: string;
  owner_phone: string;
  title: string;
  area: "al_masaeed" | "al_dahiya";
  gender: "male" | "female";
  rental_type: "bed" | "room" | "full_apartment";
  price: number;
  rooms_count: number;
  total_beds: number;
  available_beds: number;
  walking_minutes_to_university?: number | null;
  location_desc?: string | null;
  description?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export async function createSubmission(
  submission: Omit<PropertySubmission, "id" | "status" | "created_at">
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Defense-in-depth constraint
    if (submission.available_beds > submission.total_beds) {
      return {
        success: false,
        error: "عدد الأسرّة المتاحة لا يمكن أن يتجاوز إجمالي الأسرّة",
      };
    }

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        ...submission,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل إرسال طلب السكن";
    return { success: false, error: msg };
  }
}

export async function getAllSubmissions(): Promise<PropertySubmission[]> {
  const auth = await requireAdmin({ redirectOnFail: true });
  if (!auth.success) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database error fetching submissions:", error);
    throw new Error(`تعذر جلب طلبات السكن: ${error.message}`);
  }

  return (data || []) as PropertySubmission[];
}

export async function updateSubmissionStatus(
  id: string,
  newStatus: "approved" | "rejected"
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin({ redirectOnFail: false });
  if (!auth.success) return { success: false, error: auth.error };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("submissions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تحديث حالة الطلب";
    return { success: false, error: msg };
  }
}

export async function approveAndConvertSubmission(
  submissionId: string
): Promise<{ success: boolean; propertyId?: string; error?: string }> {
  const auth = await requireAdmin({ redirectOnFail: false });
  if (!auth.success) return { success: false, error: auth.error };

  const supabase = await createClient();

  // Try PostgreSQL RPC function first (guarantees atomic single-transaction execution)
  try {
    const { data: rpcPropId, error: rpcErr } = await supabase.rpc(
      "approve_submission",
      { p_submission_id: submissionId }
    );

    if (!rpcErr && rpcPropId) {
      return { success: true, propertyId: rpcPropId as string };
    }

    // Surface explicit domain error from Postgres if raised
    if (
      rpcErr &&
      !rpcErr.message.includes("function") &&
      !rpcErr.message.includes("does not exist")
    ) {
      return { success: false, error: rpcErr.message };
    }
  } catch (rpcEx) {
    console.warn("RPC approve_submission unavailable, using fallback flow:", rpcEx);
  }

  // Fallback transactional application flow
  try {
    // 1. Fetch submission
    const { data: sub, error: fetchErr } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();

    if (fetchErr || !sub) {
      return { success: false, error: "الطلب غير موجود" };
    }

    // Must be pending
    if (sub.status !== "pending") {
      return {
        success: false,
        error: `لا يمكن اعتماد هذا الطلب لأنه تمت معالجته مسبقاً (الحالة الحالية: ${sub.status})`,
      };
    }

    // 2. Generate sequential property code based on area prefix
    const prefix = sub.area === "al_masaeed" ? "MS" : "DH";

    // Query existing codes for this prefix to find the next sequential number
    const { data: existingProps } = await supabase
      .from("properties")
      .select("code")
      .like("code", `${prefix}-%`);

    let maxNum = 0;
    if (existingProps && existingProps.length > 0) {
      for (const row of existingProps) {
        const match = row.code?.match(new RegExp(`^${prefix}-(\\d+)$`));
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > maxNum) {
            maxNum = n;
          }
        }
      }
    }

    let nextNum = maxNum + 1;
    let createdPropertyId: string | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    // Retry loop on unique constraint collision
    while (!createdPropertyId && attempts < maxAttempts) {
      attempts++;
      const code = `${prefix}-${String(nextNum).padStart(2, "0")}`;

      const propResult = await upsertProperty({
        code,
        title: sub.title,
        area: sub.area,
        gender: sub.gender,
        rental_type: sub.rental_type,
        price: sub.price,
        rooms_count: sub.rooms_count || 1,
        total_beds: sub.total_beds || 1,
        available_beds: sub.available_beds || sub.total_beds || 1,
        walking_minutes_to_university: sub.walking_minutes_to_university || null,
        location_desc: sub.location_desc || "",
        description: sub.description || "",
        owner_phone: sub.owner_phone || null,
        last_verified_at: null, // Never automatically verified on submission approval
        amenities: [],
        images: [],
        youtube_video_url: null,
        status: "available",
      });

      if (propResult.success && propResult.property) {
        createdPropertyId = propResult.property.id;
      } else {
        nextNum++;
      }
    }

    if (!createdPropertyId) {
      return {
        success: false,
        error: "تعذر توليد كود فريد للسكن بعد عدة محاولات",
      };
    }

    // 3. Mark submission as approved
    const { error: markErr } = await supabase
      .from("submissions")
      .update({ status: "approved" })
      .eq("id", submissionId)
      .eq("status", "pending");

    if (markErr) {
      // Rollback: delete created property so no orphan row exists
      await supabase.from("properties").delete().eq("id", createdPropertyId);
      return {
        success: false,
        error: `فشل تحديث حالة الطلب (${markErr.message}). تم التراجع عن إنشاء السكن.`,
      };
    }

    return { success: true, propertyId: createdPropertyId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "حدث خطأ أثناء اعتماد الطلب";
    return { success: false, error: msg };
  }
}
