import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function NewPropertyPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">إضافة سكن جديد</h1>
          <p className="text-sm text-slate-500">أضف إعلان سكن جديد للمنصة</p>
        </div>
      </div>

      <PropertyForm />
    </div>
  );
}
