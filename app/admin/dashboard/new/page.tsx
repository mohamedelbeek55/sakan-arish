import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function NewPropertyPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-[#EBE6DC] pb-5">
        <Link
          href="/admin/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EBE6DC] bg-white text-stone-600 hover:bg-[#FAF7F0] hover:text-stone-900 transition-colors shadow-2xs"
          title="العودة للوحة التحكم"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-stone-900">إضافة سكن جديد</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            أضف إعلان سكن جديد للطلاب وتأكد من ملء التفاصيل بدقة
          </p>
        </div>
      </div>

      <PropertyForm />
    </div>
  );
}
