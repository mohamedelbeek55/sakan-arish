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
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleWhatsAppShare}
        className="gap-1.5 text-xs text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 hover:text-emerald-800"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        مشاركة على واتساب
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-1.5 text-xs text-slate-600 hover:text-slate-900"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-medium">تم النسخ!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            نسخ الرابط
          </>
        )}
      </Button>
    </div>
  );
}
