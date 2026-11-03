import { createClient } from "./supabase/server";
import { requireAdmin } from "./auth";

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

  try {
    const supabase = await createClient();

    // Call atomic PostgreSQL RPC function directly
    const { data: rpcPropId, error: rpcErr } = await supabase.rpc(
      "approve_submission",
      { p_submission_id: submissionId }
    );

    if (rpcErr) {
      return {
        success: false,
        error: `فشل اعتماد الطلب: ${rpcErr.message}`,
      };
    }

    if (!rpcPropId) {
      return {
        success: false,
        error: "لم يتم إرجاع معرف السكن الجديد من قاعدة البيانات",
      };
    }

    return { success: true, propertyId: rpcPropId as string };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "حدث خطأ أثناء اعتماد الطلب";
    return { success: false, error: msg };
  }
}
