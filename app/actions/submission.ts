"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import {
  createSubmission,
  approveAndConvertSubmission,
  updateSubmissionStatus,
} from "@/lib/submissions-store";
import { requireAdmin } from "@/lib/auth";

// Basic in-memory rate limiter: max 4 submissions per 15 minutes per IP
const rateLimitMap = new Map<string, { count: number; firstAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 4;

  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstAt: now });
    return true;
  }

  if (now - record.firstAt > windowMs) {
    rateLimitMap.set(ip, { count: 1, firstAt: now });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

const submissionSchema = z.object({
  owner_name: z
    .string({ message: "اسم صاحب السكن أو المسؤول مطلوب" })
    .trim()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100, "الاسم طويل جداً"),
  owner_phone: z
    .string({ message: "رقم الهاتف / الواتساب مطلوب" })
    .trim()
    .min(10, "رقم الهاتف غير صالح")
    .max(20, "رقم الهاتف غير صالح"),
  title: z
    .string({ message: "عنوان الإعلان المقترح مطلوب" })
    .trim()
    .min(3, "العنوان يجب أن يكون 3 أحرف على الأقل")
    .max(200, "العنوان طويل جداً"),
  area: z.enum(["al_masaeed", "al_dahiya"], {
    message: "يرجى تحديد المنطقة (المساعيد أو الضاحية)",
  }),
  gender: z.enum(["male", "female"], {
    message: "يرجى تحديد نوع السكن (شباب أو بنات)",
  }),
  rental_type: z.enum(["bed", "room", "full_apartment"], {
    message: "يرجى تحديد نوع الإيجار",
  }),
  price: z
    .number({ message: "السعر المتوقع مطلوب" })
    .positive("السعر يجب أن يكون أكبر من صفر"),
  rooms_count: z
    .number()
    .int()
    .min(1, "عدد الغرف يجب أن يكون 1 على الأقل")
    .default(1),
  total_beds: z
    .number()
    .int()
    .min(1, "إجمالي الأسرّة يجب أن يكون 1 على الأقل")
    .default(1),
  available_beds: z
    .number()
    .int()
    .min(0, "الأسرّة المتاحة لا يمكن أن تكون سالبة")
    .default(1),
  walking_minutes_to_university: z
    .number()
    .int()
    .min(0)
    .max(180)
    .optional()
    .nullable(),
  location_desc: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  // Honeypot field: must be empty
  hp_website: z.string().optional().nullable(),
});

export async function submitPropertyAction(rawData: unknown): Promise<{
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}> {
  // 1. Rate limiting by IP header
  try {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown_client";

    if (!checkRateLimit(ip)) {
      return {
        success: false,
        error: "تم تجاوز الحد المسموح من الطلبات المؤقتة. يرجى الانتظار 15 دقيقة قبل إعادة المحاولة.",
      };
    }
  } catch {
    // If headers cannot be read, proceed gracefully
  }

  // 2. Validate input
  const parsed = submissionSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join("، ");
    return {
      success: false,
      error: errorMsg,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // 3. Honeypot check: If bot filled hp_website, silently pretend success
  if (data.hp_website && data.hp_website.trim().length > 0) {
    return { success: true };
  }

  // 4. Save submission
  const result = await createSubmission({
    owner_name: data.owner_name,
    owner_phone: data.owner_phone,
    title: data.title,
    area: data.area,
    gender: data.gender,
    rental_type: data.rental_type,
    price: data.price,
    rooms_count: data.rooms_count,
    total_beds: data.total_beds,
    available_beds: data.available_beds,
    walking_minutes_to_university: data.walking_minutes_to_university,
    location_desc: data.location_desc,
    description: data.description,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || "فشل إرسال طلبك. يرجى المحاولة لاحقاً.",
    };
  }

  revalidatePath("/admin/dashboard/submissions");
  return { success: true };
}

export async function approveSubmissionAction(
  submissionId: string
): Promise<{ success: boolean; propertyId?: string; error?: string }> {
  const auth = await requireAdmin({ redirectOnFail: false });
  if (!auth.success) return { success: false, error: auth.error };

  const result = await approveAndConvertSubmission(submissionId);
  if (result.success) {
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/dashboard/submissions");
  }
  return result;
}

export async function rejectSubmissionAction(
  submissionId: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin({ redirectOnFail: false });
  if (!auth.success) return { success: false, error: auth.error };

  const result = await updateSubmissionStatus(submissionId, "rejected");
  if (result.success) {
    revalidatePath("/admin/dashboard/submissions");
  }
  return result;
}
