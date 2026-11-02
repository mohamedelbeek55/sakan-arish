"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
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
  const timerRef = useCallback(() => {
    let timeout: NodeJS.Timeout;
    return (fn: () => void, ms: number) => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, ms);
    };
  }, [])();

  const currentArea = searchParams.get("area") || "all";
  const currentGender = searchParams.get("gender") || "all";
  const currentType = searchParams.get("type") || "all";
  const currentSearch = searchParams.get("q") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Area Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">المنطقة</label>
          <Select
            value={currentArea}
            onValueChange={(v) => updateFilter("area", v)}
          >
            <SelectTrigger id="area-filter">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="al_masaeed">المساعيد (جامعة سيناء)</SelectItem>
              <SelectItem value="al_dahiya">الضاحية (جامعة العريش)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">النوع</label>
          <Select
            value={currentGender}
            onValueChange={(v) => updateFilter("gender", v)}
          >
            <SelectTrigger id="gender-filter">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="male">سكن شباب</SelectItem>
              <SelectItem value="female">سكن بنات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rental Type Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">نوع الإيجار</label>
          <Select
            value={currentType}
            onValueChange={(v) => updateFilter("type", v)}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="bed">سرير</SelectItem>
              <SelectItem value="room">غرفة خاصة</SelectItem>
              <SelectItem value="full_apartment">شقة كاملة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">بحث بالكود أو الموقع</label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="search-input"
              placeholder="مثال: MS-01 أو جامعة سيناء"
              defaultValue={currentSearch}
              className="pr-9"
              onChange={(e) => {
                const value = e.target.value;
                timerRef(() => updateFilter("q", value), 350);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
