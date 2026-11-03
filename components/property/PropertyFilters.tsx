"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    }, 300);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
      {/* Primary Row: Area, Gender, Type, Price, Sort */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Area Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">المنطقة</label>
          <Select
            value={currentArea}
            onValueChange={(v) => updateFilter("area", v)}
          >
            <SelectTrigger id="area-filter" className="h-10 text-xs">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المناطق</SelectItem>
              <SelectItem value="al_masaeed">المساعيد (جامعة سيناء)</SelectItem>
              <SelectItem value="al_dahiya">الضاحية (جامعة العريش)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">الفئة</label>
          <Select
            value={currentGender}
            onValueChange={(v) => updateFilter("gender", v)}
          >
            <SelectTrigger id="gender-filter" className="h-10 text-xs">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل (شباب وبنات)</SelectItem>
              <SelectItem value="male">سكن شباب</SelectItem>
              <SelectItem value="female">سكن بنات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rental Type Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">نوع الإيجار</label>
          <Select
            value={currentType}
            onValueChange={(v) => updateFilter("type", v)}
          >
            <SelectTrigger id="type-filter" className="h-10 text-xs">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="bed">سرير</SelectItem>
              <SelectItem value="room">غرفة خاصة</SelectItem>
              <SelectItem value="full_apartment">شقة كاملة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">نطاق السعر</label>
          <Select
            value={currentPrice}
            onValueChange={(v) => updateFilter("price", v)}
          >
            <SelectTrigger id="price-filter" className="h-10 text-xs">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأسعار</SelectItem>
              <SelectItem value="under_1500">أقل من 1,500 ج.م</SelectItem>
              <SelectItem value="1500_2500">1,500 إلى 2,500 ج.م</SelectItem>
              <SelectItem value="over_2500">أكثر من 2,500 ج.م</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
            ترتيب حسب
          </label>
          <Select
            value={currentSort}
            onValueChange={(v) => updateFilter("sort", v)}
          >
            <SelectTrigger id="sort-filter" className="h-10 text-xs">
              <SelectValue placeholder="الأحدث" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث أولاً</SelectItem>
              <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
              <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
              <SelectItem value="walking_asc">الأقرب للجامعة مشياً</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Input Row */}
      <div className="relative pt-1">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          id="search-input"
          placeholder="ابحث بالاسم، كود السكن (مثال: MS-01)، الشارع أو العلامة المميزة..."
          defaultValue={currentSearch}
          className="h-11 pr-10 pl-4 text-sm bg-slate-50/60 border-slate-200 focus:bg-white rounded-xl"
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
}
