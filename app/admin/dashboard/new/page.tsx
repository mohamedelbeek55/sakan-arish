import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, ChevronLeft, PlusCircle } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function NewPropertyPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Action Breadcrumb & Title (Stitch Screen 8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-outline/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-light-on-surface/60 font-medium">
            <Link href="/admin/dashboard" className="hover:text-light-primary">
              لوحة التحكم
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-light-primary font-bold">إضافة عقار سكن جديد</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-light-primary flex items-center gap-2">
            <PlusCircle className="h-7 w-7 text-light-secondary" />
            إضافة سكن جديد لمنصة طلاب العريش
          </h1>
          <p className="text-xs text-light-on-surface/70 mt-1">
            أدخل مواصفات السكن والجامعة والصور لربطه مباشرة بنظام الحجز والواتساب
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-light-outline text-light-on-surface/70 hover:bg-light-surface-subtle text-xs font-bold transition-colors w-fit"
        >
          <ArrowRight className="h-4 w-4" />
          <span>إلغاء والعودة للوحة</span>
        </Link>
      </div>

      <PropertyForm />
    </div>
  );
}
