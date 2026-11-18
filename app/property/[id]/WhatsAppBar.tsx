"use client";

import { buildWhatsAppUrl, formatPrice } from "@/lib/utils";
import { recordWhatsAppClickAction } from "@/app/actions/property";
import { MessageSquare } from "lucide-react";

interface WhatsAppBarProps {
  propertyId?: string;
  phoneNumber: string;
  code: string;
  title?: string;
  location: string;
  price: number;
  propertyUrl?: string;
}

export default function WhatsAppBar({
  propertyId,
  phoneNumber,
  code,
  title,
  location,
  price,
  propertyUrl = "",
}: WhatsAppBarProps) {
  const initialUrl = buildWhatsAppUrl(
    phoneNumber,
    code,
    location,
    price,
    title,
    propertyUrl
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (propertyId) {
      try {
        recordWhatsAppClickAction(propertyId);
      } catch {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      const liveUrl = propertyId
        ? `${window.location.origin}/property/${propertyId}`
        : window.location.href;
      e.currentTarget.href = buildWhatsAppUrl(
        phoneNumber,
        code,
        location,
        price,
        title,
        liveUrl
      );
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 lg:hidden shadow-lg">
      <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 font-mono font-bold truncate">
            كود: {code}
          </p>
          <p className="text-base font-black text-[#0D3B4C] leading-tight">
            {formatPrice(price)} ج.م{" "}
            <span className="text-xs text-slate-500 font-normal">/ شهرياً</span>
          </p>
        </div>

        <a
          href={initialUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span>تواصل واتساب</span>
        </a>
      </div>
    </div>
  );
}
