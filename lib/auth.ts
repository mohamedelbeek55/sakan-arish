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

export function getAdminEmail(): string {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    throw new Error(
      "ADMIN_EMAIL environment variable is missing. Please set it in your environment variables."
    );
  }
  return adminEmail;
}

export async function verifyAdmin(): Promise<AuthResult> {
  let adminEmail: string;
  try {
    adminEmail = getAdminEmail();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ADMIN_EMAIL is not configured.";
    return {
      success: false,
      error: message,
      code: "CONFIG_ERROR",
    };
  }

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

  const userEmail = user.email?.trim().toLowerCase();
  if (userEmail !== adminEmail) {
    return {
      success: false,
      error: "غير مصرح لك بالوصول. هذا الحساب لا يمتلك صلاحيات المشرف.",
      code: "FORBIDDEN",
    };
  }

  return { success: true, user };
}

export async function requireAdmin(options?: {
  redirectOnFail?: boolean;
}): Promise<AuthResult> {
  const result = await verifyAdmin();
  if (!result.success && options?.redirectOnFail !== false) {
    redirect("/admin/login");
  }
  return result;
}
