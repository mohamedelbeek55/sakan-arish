"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, MapPin, Bed, DollarSign, X } from "lucide-react";

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentArea = searchParams.get("area") || "all";
  const currentGender = searchParams.get("gender") || "all";
  const currentType = searchParams.get("type") || "all";
  const currentPrice = searchParams.get("price") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateFilters = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, val]) => {
        if (!val || val === "all" || (key === "sort" && val === "newest")) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      router.replace(`/?${params.toString()}#browse-listings`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput });
  };

  const hasActiveFilters =
    currentArea !== "all" ||
    currentGender !== "all" ||
    currentType !== "all" ||
    currentPrice !== "all" ||
    currentSort !== "newest" ||
    Boolean(currentSearch);

  const clearAllFilters = () => {
    setSearchInput("");
    router.replace("/#browse-listings", { scroll: false });
  };

  return (
    <div className="space-y-4">
      {/* Unified Search and Filter Bar (Stitch Design) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Campus / Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#0F766E]" />
              الجامعة والحي
            </label>
            <select
              value={currentArea}
              onChange={(e) => updateFilters({ area: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:border-[#0D3B4C] focus:bg-white focus:outline-hidden"
            >
              <option value="all">كل مناطق العريش</option>
              <option value="al_masaeed">جامعة سيناء — المساعيد</option>
              <option value="al_dahiya">جامعة العريش — الضاحية</option>
            </select>
          </div>

          {/* 2. Housing Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-[#0F766E]" />
              نوع السكن والإقامة
            </label>
            <select
              value={currentType}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:border-[#0D3B4C] focus:bg-white focus:outline-hidden"
            >
              <option value="all">جميع الأنواع</option>
              <option value="bed">سرير في غرفة مشتركة</option>
              <option value="room">غرفة مفردة خاصة (Single)</option>
              <option value="full_apartment">شقة كاملة لمجموعة طلاب</option>
            </select>
          </div>

          {/* 3. Price Range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-[#0F766E]" />
              الميزانية الشهرية
            </label>
            <select
              value={currentPrice}
              onChange={(e) => updateFilters({ price: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:border-[#0D3B4C] focus:bg-white focus:outline-hidden"
            >
              <option value="all">أي سعر</option>
              <option value="under_1500">أقل من 1,500 ج.م</option>
              <option value="1500_2500">1,500 — 2,500 ج.م</option>
              <option value="over_2500">أكثر من 2,500 ج.م</option>
            </select>
          </div>

          {/* 4. Text Search / Submit Button */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Search className="h-4 w-4 text-[#0F766E]" />
              بحث بالكلمات
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="ابحث بالشارع، الكود، المعلم..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full py-2 px-3 pl-8 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:border-[#0D3B4C] focus:bg-white focus:outline-hidden h-[42px]"
              />
              <button
                type="submit"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#0D3B4C] text-white hover:bg-[#0D3B4C]/90 transition cursor-pointer"
                title="بحث"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Quick Filter Tags (Stitch Design) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">تصفية سريعة:</span>

          <button
            type="button"
            onClick={() =>
              updateFilters({ gender: currentGender === "male" ? "all" : "male" })
            }
            className={`px-3 py-1 rounded-full font-semibold border transition cursor-pointer ${
              currentGender === "male"
                ? "bg-[#0D3B4C] text-white border-[#0D3B4C]"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            سكن شباب
          </button>

          <button
            type="button"
            onClick={() =>
              updateFilters({ gender: currentGender === "female" ? "all" : "female" })
            }
            className={`px-3 py-1 rounded-full font-semibold border transition cursor-pointer ${
              currentGender === "female"
                ? "bg-rose-700 text-white border-rose-700"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            سكن طالبات
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ q: "بحر" })}
            className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            قريب من بحر المساعيد
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ q: "تكييف" })}
            className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            مكيف بالكامل
          </button>

          <button
            type="button"
            onClick={() =>
              updateFilters({
                sort: currentSort === "walking_asc" ? "newest" : "walking_asc",
              })
            }
            className={`px-3 py-1 rounded-full font-semibold border transition cursor-pointer ${
              currentSort === "walking_asc"
                ? "bg-[#0F766E] text-white border-[#0F766E]"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            🚶‍♂️ الأقرب للجامعة
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold transition mr-auto cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
