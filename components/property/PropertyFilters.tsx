"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const currentArea = searchParams.get("area") || "all";
  const currentGender = searchParams.get("gender") || "all";
  const currentType = searchParams.get("type") || "all";
  const currentPrice = searchParams.get("price") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("q") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "" || (key === "sort" && value === "newest")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateFilter("q", value);
    }, 280);
  };

  const hasActiveFilters =
    currentArea !== "all" ||
    currentGender !== "all" ||
    currentType !== "all" ||
    currentPrice !== "all" ||
    currentSort !== "newest" ||
    currentSearch !== "";

  const clearAllFilters = () => {
    router.replace("/", { scroll: false });
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          id="search-input"
          placeholder="ابحث بالشارع، الكود، أو اسم السكن..."
          defaultValue={currentSearch}
          className="h-11 pr-10 pl-4 text-sm bg-stone-50 border-stone-200/80 focus:bg-white rounded-xl shadow-2xs text-stone-900 placeholder:text-stone-400"
          onChange={handleSearchChange}
        />
        {currentSearch && (
          <button
            onClick={() => updateFilter("q", "")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Horizontally Scrollable Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar select-none">
        {/* Reset / All Indicator */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300 transition-colors"
          >
            <X className="h-3 w-3" />
            <span>مسح الفلاتر</span>
          </button>
        )}

        {/* Gender Chips */}
        <div className="flex items-center gap-1 flex-shrink-0 border-l border-stone-200 pl-2">
          <button
            onClick={() => updateFilter("gender", "all")}
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentGender === "all"
                ? "bg-stone-900 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() =>
              updateFilter("gender", currentGender === "male" ? "all" : "male")
            }
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentGender === "male"
                ? "bg-sky-800 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            شباب
          </button>
          <button
            onClick={() =>
              updateFilter("gender", currentGender === "female" ? "all" : "female")
            }
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentGender === "female"
                ? "bg-rose-700 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            بنات
          </button>
        </div>

        {/* Rental Type Chips */}
        <div className="flex items-center gap-1 flex-shrink-0 border-l border-stone-200 pl-2">
          <button
            onClick={() =>
              updateFilter("type", currentType === "bed" ? "all" : "bed")
            }
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentType === "bed"
                ? "bg-stone-900 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            سرير
          </button>
          <button
            onClick={() =>
              updateFilter("type", currentType === "room" ? "all" : "room")
            }
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentType === "room"
                ? "bg-stone-900 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            غرفة خاصة
          </button>
          <button
            onClick={() =>
              updateFilter(
                "type",
                currentType === "full_apartment" ? "all" : "full_apartment"
              )
            }
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentType === "full_apartment"
                ? "bg-stone-900 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            شقة كاملة
          </button>
        </div>

        {/* Price Sort & Filter */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() =>
              updateFilter(
                "sort",
                currentSort === "price_asc" ? "newest" : "price_asc"
              )
            }
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentSort === "price_asc"
                ? "bg-emerald-800 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>الأقل سعراً</span>
          </button>
          <button
            onClick={() =>
              updateFilter(
                "sort",
                currentSort === "walking_asc" ? "newest" : "walking_asc"
              )
            }
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentSort === "walking_asc"
                ? "bg-emerald-800 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            الأقرب للجامعة
          </button>
          <button
            onClick={() =>
              updateFilter(
                "price",
                currentPrice === "under_1500" ? "all" : "under_1500"
              )
            }
            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              currentPrice === "under_1500"
                ? "bg-stone-900 text-white shadow-2xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
            }`}
          >
            أقل من 1,500 ج
          </button>
        </div>
      </div>
    </div>
  );
}
