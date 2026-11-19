"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Landmark } from "lucide-react";

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
    router.replace(`/?${params.toString()}#browse-listings`, { scroll: false });
  };

  const isMasaeed = currentArea === "al_masaeed";
  const isDahiya = currentArea === "al_dahiya";

  return (
    <div id="universities" className="max-w-3xl mx-auto my-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campus 1: Sinai University (Al-Masaeed) */}
        <button
          type="button"
          onClick={() => handleSelectArea("al_masaeed")}
          className={`flex items-center gap-4 p-4 rounded-2xl border text-right transition-all duration-200 group cursor-pointer ${
            isMasaeed
              ? "border-2 border-[#0F766E] bg-white shadow-md ring-2 ring-[#0F766E]/15"
              : "border-slate-200 bg-white hover:border-[#0F766E]/60 hover:shadow-xs"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isMasaeed
                ? "bg-[#0F766E]/15 text-[#0F766E]"
                : "bg-slate-100 text-[#0D3B4C] group-hover:bg-[#0F766E]/10 group-hover:text-[#0F766E]"
            }`}
          >
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#0D3B4C]">
                جامعة سيناء — فرع العريش
              </h3>
              {isMasaeed && (
                <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              حي المساعيد • شارع البحر • {masaeedCount ?? 0} سكن متاح
            </p>
          </div>
        </button>

        {/* Campus 2: Arish University (Al-Dahiya) */}
        <button
          type="button"
          onClick={() => handleSelectArea("al_dahiya")}
          className={`flex items-center gap-4 p-4 rounded-2xl border text-right transition-all duration-200 group cursor-pointer ${
            isDahiya
              ? "border-2 border-[#0F766E] bg-white shadow-md ring-2 ring-[#0F766E]/15"
              : "border-slate-200 bg-white hover:border-[#0F766E]/60 hover:shadow-xs"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isDahiya
                ? "bg-[#0F766E]/15 text-[#0F766E]"
                : "bg-slate-100 text-[#0D3B4C] group-hover:bg-[#0F766E]/10 group-hover:text-[#0F766E]"
            }`}
          >
            <Landmark className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#0D3B4C]">
                جامعة العريش — الضاحية
              </h3>
              {isDahiya && (
                <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              حي الضاحية • وسط البلد • {dahiyaCount ?? 0} سكن متاح
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
