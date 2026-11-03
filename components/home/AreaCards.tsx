"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, MapPin, Waves, Building } from "lucide-react";

interface AreaCardsProps {
  currentArea?: string;
  masaeedCount?: number;
  dahiyaCount?: number;
}

export default function AreaCards({
  currentArea = "all",
  masaeedCount,
  dahiyaCount,
}: AreaCardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectArea = (area: "al_masaeed" | "al_dahiya") => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("area") === area) {
      params.delete("area");
    } else {
      params.set("area", area);
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const isMasaeed = currentArea === "al_masaeed";
  const isDahiya = currentArea === "al_dahiya";

  return (
    <div className="grid gap-3 sm:grid-cols-2 pt-2">
      {/* 1. Al-Masaeed Card */}
      <button
        type="button"
        onClick={() => handleSelectArea("al_masaeed")}
        className={`group relative text-right p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
          isMasaeed
            ? "border-sky-800 bg-sky-50/70 shadow-sm ring-2 ring-sky-800/15"
            : "border-stone-200/80 bg-white hover:border-stone-300 hover:shadow-xs"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-sky-900 transition-colors">
                المساعيد
              </span>
              <span className="inline-flex items-center rounded-md bg-sky-100/80 px-2 py-0.5 text-xs font-semibold text-sky-900">
                جامعة سيناء
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              شارع أسيوط، شاطئ البحر، والمطاعم والكافيهات
            </p>
          </div>

          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
              isMasaeed
                ? "bg-sky-800 text-white"
                : "bg-stone-100 text-stone-600 group-hover:bg-sky-50 group-hover:text-sky-800"
            }`}
          >
            <Waves className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <span
            className={`font-semibold ${
              isMasaeed ? "text-sky-900 font-bold" : "text-stone-600"
            }`}
          >
            {isMasaeed ? "✓ معروض سكنات المساعيد" : "تصفّح سكنات المساعيد"}
          </span>
          {typeof masaeedCount === "number" && (
            <span className="text-stone-400 font-mono text-[11px]">
              {masaeedCount} سكن
            </span>
          )}
        </div>
      </button>

      {/* 2. Al-Dahiya Card */}
      <button
        type="button"
        onClick={() => handleSelectArea("al_dahiya")}
        className={`group relative text-right p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
          isDahiya
            ? "border-emerald-800 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-800/15"
            : "border-stone-200/80 bg-white hover:border-stone-300 hover:shadow-xs"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                الضاحية
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-100/80 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                جامعة العريش
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              وسط المدينة، الكليات، سكن هادئ ومواصلات قريبة
            </p>
          </div>

          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
              isDahiya
                ? "bg-emerald-800 text-white"
                : "bg-stone-100 text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-800"
            }`}
          >
            <Building className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <span
            className={`font-semibold ${
              isDahiya ? "text-emerald-900 font-bold" : "text-stone-600"
            }`}
          >
            {isDahiya ? "✓ معروض سكنات الضاحية" : "تصفّح سكنات الضاحية"}
          </span>
          {typeof dahiyaCount === "number" && (
            <span className="text-stone-400 font-mono text-[11px]">
              {dahiyaCount} سكن
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
