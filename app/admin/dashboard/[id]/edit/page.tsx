import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ExternalLink } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Action Breadcrumb & Title (Stitch Screen 8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-outline/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-light-on-surface/60 font-medium">
            <Link href="/admin/dashboard" className="hover:text-light-primary">
              لوحة التحكم
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>تعديل عقار</span>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-mono text-light-primary font-bold">
              #{found.code}
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-light-primary">
            تعديل وإدارة عقار: {found.title}
          </h1>
          <p className="text-xs text-light-on-surface/70 mt-1">
            أنت في وضع التعديل الإداري المباشر بحساب المشرف العام
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/property/${found.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-light-outline text-light-secondary hover:bg-light-surface-subtle text-xs font-bold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>معاينة كطالب</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-light-outline text-light-on-surface/70 hover:bg-light-surface-subtle text-xs font-bold transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة</span>
          </Link>
        </div>
      </div>

      <PropertyForm property={found} />
    </div>
  );
}
