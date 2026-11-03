import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyFilters from "@/components/property/PropertyFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, GraduationCap, Search as SearchIcon, ShieldCheck } from "lucide-react";
import type { Property } from "@/components/property/PropertyCard";
import { getAllProperties } from "@/lib/properties-store";

import { normalizeArabicText } from "@/lib/utils";

interface HomePageProps {
  searchParams: Promise<{
    area?: string;
    gender?: string;
    type?: string;
    price?: string;
    sort?: string;
    q?: string;
  }>;
}

async function PropertyGrid({
  area,
  gender,
  type,
  price,
  sort = "newest",
  q,
}: {
  area?: string;
  gender?: string;
  type?: string;
  price?: string;
  sort?: string;
  q?: string;
}) {
  const allProperties = await getAllProperties();

  const normalizedQuery = q ? normalizeArabicText(q) : "";

  // 1. Filter
  const filtered = allProperties.filter((p) => {
    if (area && area !== "all" && p.area !== area) return false;
    if (gender && gender !== "all" && p.gender !== gender) return false;
    if (type && type !== "all" && p.rental_type !== type) return false;

    // Price range filtering
    if (price && price !== "all") {
      if (price === "under_1500" && p.price >= 1500) return false;
      if (price === "1500_2500" && (p.price < 1500 || p.price > 2500)) return false;
      if (price === "over_2500" && p.price <= 2500) return false;
    }

    // Normalized Arabic search (أ/ا, ة/ه, ى/ي, tashkeel)
    if (normalizedQuery) {
      const targetText = normalizeArabicText(
        `${p.code} ${p.title} ${p.location_desc || ""} ${p.description || ""} ${p.area}`
      );
      if (!targetText.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  // 2. Sort: available first, booked last; secondary sort by user choice
  const sorted = [...filtered].sort((a, b) => {
    // Primary tier: available & one_bed_left first (0), booked last (1)
    const rankA = a.status === "booked" ? 1 : 0;
    const rankB = b.status === "booked" ? 1 : 0;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Secondary tier: user-selected sort
    if (sort === "price_asc") {
      return a.price - b.price;
    }
    if (sort === "price_desc") {
      return b.price - a.price;
    }
    if (sort === "walking_asc") {
      const walkA = a.walking_minutes_to_university ?? 9999;
      const walkB = b.walking_minutes_to_university ?? 9999;
      return walkA - walkB;
    }

    // Default: newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <SearchIcon className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-600">لا توجد نتائج مطابقة للبحث</h3>
        <p className="text-sm text-slate-400">
          جرّب تغيير معايير البحث، إزالة بعض الفلاتر، أو استكشاف مناطق أخرى
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((property) => (
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
            price={params.price}
            sort={params.sort}
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
