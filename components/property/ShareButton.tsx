"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  code: string;
  price: number;
}

export default function ShareButton({ title, code, price }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareData = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `شاهد هذا السكن الطلابي في العريش (${title}) كود: ${code} بسعر ${price} ج.م\n${url}`;
    return { url, text };
  };

  const handleCopy = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const { text } = getShareData();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleWhatsAppShare}
        className="flex-1 sm:flex-initial justify-center gap-1.5 text-xs font-bold text-[#166534] border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl h-9 shadow-2xs transition-colors cursor-pointer"
      >
        <MessageCircle className="h-3.5 w-3.5 text-[#166534]" />
        مشاركة واتساب
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex-1 sm:flex-initial justify-center gap-1.5 text-xs font-bold text-stone-700 border-[#EBE6DC] bg-white hover:bg-[#FAF7F0] rounded-xl h-9 shadow-2xs transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#166534]" />
            <span className="text-[#166534]">تم النسخ!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-stone-500" />
            نسخ الرابط
          </>
        )}
      </Button>
    </div>
  );
}
