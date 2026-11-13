import { Suspense } from "react";
import Link from "next/link";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyFilters from "@/components/property/PropertyFilters";
import AreaCards from "@/components/home/AreaCards";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search as SearchIcon,
  ShieldCheck,
  MessageSquare,
  Footprints,
  Plus,
} from "lucide-react";
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

    // Normalized Arabic search
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
    const rankA = a.status === "booked" ? 1 : 0;
    const rankB = b.status === "booked" ? 1 : 0;

    if (rankA !== rankB) {
      return rankA - rankB;
    }

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

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <SearchIcon className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="text-base font-bold text-slate-800">
          لا توجد سكنات مطابقة للبحث حالياً
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          جرّب إزالة بعض الفلاتر أو تصفّح سكنات جامعة أخرى من الأعلى.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden space-y-4 p-4 shadow-xs"
        >
          <Skeleton className="h-52 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  let masaeedCount = 0;
  let dahiyaCount = 0;
  let totalCount = 0;
  try {
    const all = await getAllProperties();
    totalCount = all.length;
    masaeedCount = all.filter((p) => p.area === "al_masaeed").length;
    dahiyaCount = all.filter((p) => p.area === "al_dahiya").length;
  } catch {
    // Graceful fallback
  }

  const sectionTitle =
    params.area === "al_masaeed"
      ? "سكنات جامعة سيناء — المساعيد"
      : params.area === "al_dahiya"
      ? "سكنات جامعة العريش — الضاحية"
      : "أحدث السكنات المعروضة بالعريش";

  const currentCount =
    params.area === "al_masaeed"
      ? masaeedCount
      : params.area === "al_dahiya"
      ? dahiyaCount
      : totalCount;

  return (
    <div className="min-h-screen space-y-12 pb-16">
      {/* 1. Hero Section (Stitch Redesign) */}
      <section className="relative bg-gradient-to-b from-[#F1F5F9] to-[#F8FAFC] py-12 lg:py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
              سكن آمن، هادئ، وبدون وساطة أو عمولات إضافية
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D3B4C] tracking-tight leading-tight">
              سكنك الجامعي المثالي في العريش بضغطة زر
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              اكتشف وقارن أفضل الشقق والغرف المفروشة القريبة من جامعة سيناء (المساعيد) وجامعة العريش (الضاحية)، وتواصل فوراً مع المالك عبر واتساب.
            </p>
          </div>

          {/* Campus Selection Segmented Switch */}
          <Suspense fallback={null}>
            <AreaCards
              currentArea={params.area}
              masaeedCount={masaeedCount}
              dahiyaCount={dahiyaCount}
            />
          </Suspense>

          {/* Unified Interactive Search & Filter Bar */}
          <div className="max-w-5xl mx-auto mt-6">
            <Suspense fallback={null}>
              <PropertyFilters />
            </Suspense>
          </div>
        </div>
      </section>

      {/* 2. Main Listings Section */}
      <section id="browse-listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#0D3B4C]">
                {sectionTitle}
              </h2>
              <span className="bg-[#0F766E]/15 text-[#0F766E] text-xs font-bold px-2.5 py-1 rounded-full">
                {currentCount} سكن معتمد
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تحديثات دورية بأسعار مؤكدة وتواصل مباشر مع المالك بدون سماسرة
            </p>
          </div>
        </div>

        {/* Properties Grid */}
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

      {/* 3. Why Choose Platform Section (Stitch Design) */}
      <section id="how-it-works" className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0D3B4C]">
              لماذا يختار طلاب العريش منصتنا؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              صممت المنصة لرفع عناء البحث والتفاوض عن كاهل الطلاب وأولياء الأمور مع بداية كل عام دراسي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs text-right space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#0F766E]/15 text-[#0F766E] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#0D3B4C]">
                عقارات مفحوصة وموثقة
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                يقوم فريق المنصة المحلي في العريش بمراجعة وتأكيد بيانات كل شقة والتأكد من مطابقة الصور للواقع قبل النشر.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs text-right space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#16A34A]/15 text-[#16A34A] flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#0D3B4C]">
                تواصل فوري عبر واتساب
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                تحدث مباشرة مع صاحب العقار دون وسطاء، حدد موعد المعاينة، واستفسر عن كل التفاصيل بنقرة زر واحدة.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs text-right space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
                <Footprints className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#0D3B4C]">
                حساب دقيق للمسافة للجامعة
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                تعرف على وقت المشي والمواصلات من السكن إلى كليتك مباشرة، سواء في المساعيد أو الضاحية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Landlord CTA Banner (Stitch Design) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0D3B4C] text-white rounded-3xl p-8 sm:p-12 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8 text-right">
          <div className="space-y-3 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0F766E] text-white text-xs font-bold">
              لأصحاب العقارات والشقق في العريش
            </span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              هل تمتلك شقة أو غرفاً بالقرب من الجامعات؟
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              اعرض سكنك الآن ليصل إلى آلاف الطلاب المغتربين الباحثين عن سكن موثوق. المراجعة سريعة والإدراج مجاني.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href="/list-your-property"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-[#0D3B4C] hover:bg-slate-100 font-extrabold text-sm sm:text-base transition-all shadow-md"
            >
              <Plus className="h-5 w-5" />
              سجّل سكنك للمراجعة الآن
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Short About Section */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-2 shadow-xs">
          <h3 className="font-bold text-[#0D3B4C] text-sm sm:text-base">عن المنصة</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            مبادرة طلابية مستقلة لخدمة زملائنا في جامعة سيناء وجامعة العريش بمحافظة شمال سيناء. بنساعدك تلاقي سكن مضمون ومريح وتوفر على نفسك لف وتعب السماسرة.
          </p>
        </div>
      </section>
    </div>
  );
}
