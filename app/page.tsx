import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyFilters from "@/components/property/PropertyFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, GraduationCap, Search as SearchIcon, ShieldCheck } from "lucide-react";
import type { Property } from "@/components/property/PropertyCard";
import { getAllProperties } from "@/lib/properties-store";

interface HomePageProps {
  searchParams: Promise<{
    area?: string;
    gender?: string;
    type?: string;
    q?: string;
  }>;
}

async function PropertyGrid({
  area,
  gender,
  type,
  q,
}: {
  area?: string;
  gender?: string;
  type?: string;
  q?: string;
}) {
  const allProperties = await getAllProperties();

  const list = allProperties.filter((p) => {
    if (area && area !== "all" && p.area !== area) return false;
    if (gender && gender !== "all" && p.gender !== gender) return false;
    if (type && type !== "all" && p.rental_type !== type) return false;
    if (
      q &&
      !`${p.code} ${p.title} ${p.location_desc}`
        .toLowerCase()
        .includes(q.toLowerCase())
    )
      return false;
    return true;
  });

  if (list.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <SearchIcon className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-600">لا توجد نتائج</h3>
        <p className="text-sm text-slate-400">
          جرّب تغيير معايير البحث أو إزالة بعض الفلاتر
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-10" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 border border-teal-100">
              <GraduationCap className="h-4 w-4" />
              لطلاب جامعة سيناء وجامعة العريش
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              ابحث عن سكنك
              <span className="text-teal-700"> بسهولة</span>
            </h1>
            <p className="text-base text-slate-500 sm:text-lg max-w-lg mx-auto leading-relaxed">
              تصفّح السكنات المتاحة بالقرب من جامعتك، شاهد الصور والفيديوهات،
              وتواصل مباشرة مع صاحب السكن عبر واتساب — بدون وسطاء.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">إعلانات موثّقة</h3>
                <p className="text-xs text-slate-500 mt-0.5">جميع السكنات تم التحقق منها</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">صور وفيديو حقيقية</h3>
                <p className="text-xs text-slate-500 mt-0.5">شاهد السكن قبل الزيارة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <SearchIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">تواصل مباشر</h3>
                <p className="text-xs text-slate-500 mt-0.5">تواصل عبر واتساب بدون وسطاء</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">السكنات المتاحة</h2>
        </div>

        <Suspense fallback={null}>
          <PropertyFilters />
        </Suspense>

        <Suspense fallback={<PropertyGridSkeleton />}>
          <PropertyGrid
            area={params.area}
            gender={params.gender}
            type={params.type}
            q={params.q}
          />
        </Suspense>
      </section>

      {/* About Section */}
      <section id="about" className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">عن المنصة</h2>
            <p className="text-slate-500 leading-relaxed">
              &quot;سكن طلاب العريش&quot; هي منصة مجانية تهدف لمساعدة طلاب جامعة سيناء (فرع المساعيد)
              وجامعة العريش (الضاحية) في إيجاد سكن مناسب بسهولة وشفافية. نوفّر
              إعلانات موثّقة بالصور والفيديوهات، مع إمكانية التواصل المباشر مع
              أصحاب السكنات عبر واتساب — بدون وسطاء أو عمولات.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
