"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import {
  upsertProperty,
  updatePropertyStatus,
  deleteProperty,
  getPropertyById,
  recordWhatsAppClick,
} from "@/lib/properties-store";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/components/property/PropertyCard";

// Simple in-memory per-IP click throttle: max 12 clicks per minute per IP
const clickThrottleMap = new Map<string, { count: number; firstAt: number }>();

function checkClickThrottle(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxClicks = 12;

  const record = clickThrottleMap.get(ip);
  if (!record) {
    clickThrottleMap.set(ip, { count: 1, firstAt: now });
    return true;
  }

  if (now - record.firstAt > windowMs) {
    clickThrottleMap.set(ip, { count: 1, firstAt: now });
    return true;
  }

  if (record.count >= maxClicks) {
    return false;
  }

  record.count += 1;
  return true;
}

const propertyServerSchema = z
  .object({
    id: z.string().optional(),
    code: z
      .string({ message: "كود السكن مطلوب" })
      .trim()
      .min(1, "كود السكن مطلوب")
      .max(20, "كود السكن لا يجب أن يتجاوز 20 حرفاً"),
    title: z
      .string({ message: "عنوان السكن مطلوب" })
      .trim()
      .min(1, "عنوان السكن مطلوب")
      .max(200, "عنوان السكن طويل جداً"),
    area: z.enum(["al_masaeed", "al_dahiya"], {
      message: "المنطقة غير صالحة، يجب أن تكون المساعيد أو الضاحية",
    }),
    gender: z.enum(["male", "female"], {
      message: "نوع السكن غير صالح، يجب أن يكون شباب أو بنات",
    }),
    rental_type: z.enum(["bed", "room", "full_apartment"], {
      message: "نوع الإيجار غير صالح",
    }),
    price: z
      .number({ message: "السعر مطلوب" })
      .positive("السعر يجب أن يكون أكبر من صفر"),
    rooms_count: z
      .number({ message: "عدد الغرف مطلوب" })
      .int("عدد الغرف يجب أن يكون رقماً صحيحاً")
      .min(1, "عدد الغرف يجب أن يكون 1 على الأقل"),
    location_desc: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val?.trim() ? val.trim() : null)),
    total_beds: z
      .number()
      .int()
      .min(1, "إجمالي الأسرّة يجب أن يكون 1 على الأقل"),
    available_beds: z
      .number()
      .int()
      .min(0, "الأسرّة المتاحة لا يمكن أن تكون أقل من صفر"),
    youtube_video_url: z
      .string()
      .optional()
      .nullable()
      .transform((val) => {
        if (!val || !val.trim()) return null;
        const trimmed = val.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
          return `https://${trimmed}`;
        }
        return trimmed;
      }),
    description: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val?.trim() ? val.trim() : null)),
    amenities: z.array(z.string()).default([]),
    images: z
      .array(z.string())
      .max(10, "الحد الأقصى المسموح به هو 10 صور فقط")
      .default([]),
    walking_minutes_to_university: z
      .number()
      .int()
      .min(0, "دقائق السير لا يمكن أن تكون سالبة")
      .max(180, "دقائق السير غير منطقية")
      .optional()
      .nullable(),
    maps_url: z
      .string()
      .optional()
      .nullable()
      .transform((val) => {
        if (!val || !val.trim()) return null;
        const trimmed = val.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
          return `https://${trimmed}`;
        }
        return trimmed;
      }),
    floor: z
      .number()
      .int()
      .min(-2, "الدور غير صالح")
      .max(40, "الدور غير صالح")
      .optional()
      .nullable(),
    furnished: z.boolean().optional().nullable(),
    utilities_included: z.boolean().optional().nullable(),
    deposit: z
      .number()
      .min(0, "مبلغ التأمين لا يمكن أن يكون سالباً")
      .optional()
      .nullable(),
    contract_months: z
      .number()
      .int()
      .min(1, "مدة العقد يجب أن تكون شهراً على الأقل")
      .max(36, "مدة العقد غير صالحة")
      .optional()
      .nullable(),
    students_per_room: z
      .number()
      .int()
      .min(1, "سعة الغرفة يجب أن تكون 1 على الأقل")
      .max(10, "سعة الغرفة غير منطقية")
      .optional()
      .nullable(),
    last_verified_at: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || !val.trim()) return true;
          const d = new Date(val);
          return !isNaN(d.getTime());
        },
        { message: "تاريخ المعاينة يجب أن يكون بصيغة تاريخ ISO صالحة" }
      )
      .transform((val) => (val && val.trim() ? new Date(val).toISOString() : null)),
    owner_phone: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val?.trim() ? val.trim() : null)),
    status: z
      .enum(["available", "one_bed_left", "booked"])
      .optional(),
  })
  .refine((data) => data.available_beds <= data.total_beds, {
    message: "عدد الأسرّة المتاحة لا يمكن أن يتجاوز إجمالي الأسرّة",
    path: ["available_beds"],
  });

export async function savePropertyAction(rawData: unknown): Promise<{
  success: boolean;
  property?: Property;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}> {
  // 1. Enforce admin authorization
  const auth = await requireAdmin({ redirectOnFail: false });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  // 2. Validate input with Zod on the server
  const parsed = propertyServerSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map((i) => i.message).join("، ");
    return {
      success: false,
      error: errorMessages,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // 3. Ensure code uniqueness across properties
  try {
    const supabase = await createClient();
    let query = supabase
      .from("properties")
      .select("id")
      .eq("code", data.code);

    if (data.id) {
      query = query.neq("id", data.id);
    }

    const { data: existing, error: codeErr } = await query.maybeSingle();

    if (codeErr) {
      return {
        success: false,
        error: `خطأ أثناء التحقق من كود السكن: ${codeErr.message}`,
      };
    }

    if (existing) {
      return {
        success: false,
        error: `كود السكن "${data.code}" مستخدم بالفعل في سكن آخر. يرجى اختيار كود فريد.`,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "تعذر التحقق من كود السكن";
    return { success: false, error: msg };
  }

  // 4. Save to Supabase (upsertProperty handles properties + property_private separation)
  const result = await upsertProperty({
    ...data,
    status: data.status || "available",
    location_desc: data.location_desc || "",
    furnished: data.furnished ?? null,
    utilities_included: data.utilities_included ?? null,
    deposit: data.deposit ?? null,
    contract_months: data.contract_months ?? null,
    students_per_room: data.students_per_room ?? null,
    last_verified_at: data.last_verified_at ?? null,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || "فشل حفظ بيانات السكن في قاعدة البيانات",
    };
  }

  // 5. Revalidate cache
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  if (result.property?.id) {
    revalidatePath(`/property/${result.property.id}`);
  }

  return { success: true, property: result.property };
}

export async function updateStatusAction(
  id: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin({ redirectOnFail: false });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const validStatuses = ["available", "one_bed_left", "booked"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "حالة السكن المحددة غير صالحة" };
  }

  // Set available_beds (booked -> 0, one_bed_left -> 1, available -> total_beds) and derive status
  const result = await updatePropertyStatus(id, status);

  if (result.success) {
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/property/${id}`);
  }

  return result;
}

export async function deletePropertyAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin({ redirectOnFail: false });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  if (!id || typeof id !== "string") {
    return { success: false, error: "معرف السكن غير صالح" };
  }

  const result = await deleteProperty(id);

  if (result.success) {
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
  }

  return result;
}

export async function recordWhatsAppClickAction(
  propertyId: string
): Promise<{ success: boolean }> {
  if (!propertyId || typeof propertyId !== "string") {
    return { success: false };
  }

  // Validate UUID format to prevent non-UUID inputs
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(propertyId)) {
    return { success: false };
  }

  // Per-IP throttle
  try {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown_client";
    if (!checkClickThrottle(ip)) {
      return { success: false };
    }
  } catch {
    // Proceed if headers cannot be read
  }

  const result = await recordWhatsAppClick(propertyId);
  if (result.success) {
    revalidatePath("/admin/dashboard");
  }
  return result;
}
