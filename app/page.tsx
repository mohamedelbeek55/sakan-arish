import { Suspense } from "react";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyFilters from "@/components/property/PropertyFilters";
import AreaCards from "@/components/home/AreaCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
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
      <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-stone-200/60 p-8">
        <SearchIcon className="mx-auto h-10 w-10 text-stone-300" />
        <h3 className="text-base font-bold text-stone-800">
          مفيش سكنات مطابقة للبحث حالياً
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          جرّب تشيل بعض الفلاتر أو اختار منطقة تانية من الكروت فوق.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-stone-200/60 bg-white overflow-hidden space-y-3 p-3"
        >
          <Skeleton className="aspect-[16/11] w-full rounded-xl" />
          <div className="space-y-2 px-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  // Pre-calculate counts for the 2 area cards
  let masaeedCount = 0;
  let dahiyaCount = 0;
  try {
    const all = await getAllProperties();
    masaeedCount = all.filter((p) => p.area === "al_masaeed").length;
    dahiyaCount = all.filter((p) => p.area === "al_dahiya").length;
  } catch {
    // Graceful fallback
  }

  return (
    <div className="min-h-screen space-y-8 pb-16">
      {/* 1. Hero: Headline + Two Large Tappable Area Cards (No badges, No 3-icon feature section) */}
      <section className="bg-stone-50/70 border-b border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
              سكنك في العريش، جمب جامعتك 🏠
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              شقق وسكنات مفروشة لطلبة جامعة سيناء وجامعة العريش — متأكدين منها وبدون وسيط.
            </p>
          </div>

          {/* Two Large Tappable Cards that Filter the List */}
          <Suspense fallback={null}>
            <AreaCards
              currentArea={params.area}
              masaeedCount={masaeedCount}
              dahiyaCount={dahiyaCount}
            />
          </Suspense>
        </div>
      </section>

      {/* 2. Listings Section: Scrollable Chips + Photo-First Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              السكنات المتاحة
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              تواصل مباشرة مع المالك على واتساب بدون أي عمولة
            </p>
          </div>
        </div>

        {/* Scrollable Filters */}
        <Suspense fallback={null}>
          <PropertyFilters />
        </Suspense>

        {/* Property Grid */}
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

      {/* 3. Short About Footer Note */}
      <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-2xl border border-stone-200/60 bg-stone-50/60 p-6 text-center space-y-2">
          <h3 className="font-bold text-stone-900 text-sm">عن المنصة</h3>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xl mx-auto">
            مبادرة طلابية مجانية لخدمة زمايلنا في جامعة سيناء وجامعة العريش. بنساعدك تلاقي سكن مضمون ونوفر عليك لف وتعب السماسرة.
          </p>
        </div>
      </section>
    </div>
  );
}
