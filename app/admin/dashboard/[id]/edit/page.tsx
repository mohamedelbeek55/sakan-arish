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

  const found = await getPropertyById(id);

  if (!found) {
    notFound();
  }

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
          <h1 className="text-xl font-bold text-slate-900">تعديل الإعلان</h1>
          <p className="text-sm text-slate-500">
            تعديل بيانات السكن: {found.code}
          </p>
        </div>
      </div>

      <PropertyForm property={found} />
    </div>
  );
}
