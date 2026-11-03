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

  try {
    const supabase = await createClient();

    // 1. Fetch submission
    const { data: sub, error: fetchErr } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();

    if (fetchErr || !sub) {
      return { success: false, error: "الطلب غير موجود" };
    }

    // 2. Generate unique property code based on area
    const prefix = sub.area === "al_masaeed" ? "MS" : "DH";
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit number
    const code = `${prefix}-${randomSuffix}`;

    // 3. Insert property
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
      amenities: [],
      images: [],
      youtube_video_url: null,
      status: "available",
    });

    if (!propResult.success || !propResult.property) {
      return {
        success: false,
        error: propResult.error || "فشل تحويل الطلب إلى سكن معتمد",
      };
    }

    // 4. Mark submission as approved
    await supabase
      .from("submissions")
      .update({ status: "approved" })
      .eq("id", submissionId);

    return { success: true, propertyId: propResult.property.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "حدث خطأ أثناء اعتماد الطلب";
    return { success: false, error: msg };
  }
}
