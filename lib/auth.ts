import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AuthResult =
  | { success: true; user: User }
  | {
      success: false;
      error: string;
      code: "UNAUTHENTICATED" | "FORBIDDEN" | "CONFIG_ERROR";
    };

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL?.trim() || "";
  if (!raw) return [];
  return raw
    .split(/[,\s;]+/)
    .map((e) => e.replace(/['"]/g, "").trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmail(): string {
  const emails = getAdminEmails();
  return emails[0] || "";
}

export async function verifyAdmin(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      error: "يجب تسجيل الدخول أولاً للمتابعة.",
      code: "UNAUTHENTICATED",
    };
  }

  const adminEmails = getAdminEmails();
  const userEmail = user.email?.trim().toLowerCase();

  // If ADMIN_EMAIL is configured, verify that the authenticated user's email is in the allowed list
  if (adminEmails.length > 0) {
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return {
        success: false,
        error: `غير مصرح لك بالوصول. الحساب (${userEmail || "مجهول"}) غير مسجل في قائمة المشرفين المعتمدين.`,
        code: "FORBIDDEN",
      };
    }
  } else {
    // If ADMIN_EMAIL is not configured in Vercel, allow the authenticated Supabase user
    console.warn(
      "ADMIN_EMAIL is not configured in environment variables; allowing authenticated Supabase user:",
      userEmail
    );
  }

  return { success: true, user };
}

export async function requireAdmin(options?: {
  redirectOnFail?: boolean;
}): Promise<AuthResult> {
  const result = await verifyAdmin();
  if (!result.success && options?.redirectOnFail !== false) {
    redirect(`/admin/login?error=${result.code.toLowerCase()}`);
  }
  return result;
}
