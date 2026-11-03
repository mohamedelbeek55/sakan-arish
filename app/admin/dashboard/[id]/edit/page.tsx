import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import type { Property } from "@/components/property/PropertyCard";
import { getPropertyById } from "@/lib/properties-store";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const { id } = await params;
  await requireAdmin();

  const found = await getPropertyById(id, { forAdmin: true });

  if (!found) {
    notFound();
  }

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
          <h1 className="text-2xl font-black text-stone-900">تعديل بيانات السكن</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            تعديل بيانات السكن: <span className="font-mono font-bold text-stone-800">{found.code}</span>
          </p>
        </div>
      </div>

      <PropertyForm property={found} />
    </div>
  );
}
