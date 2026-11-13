"use client";

import { recordWhatsAppClickAction } from "@/app/actions/property";
import { buildBookingWhatsAppUrl } from "@/lib/utils";

interface WhatsAppBookingButtonProps {
  propertyId: string;
  phoneNumber?: string;
  code?: string;
  title?: string;
  location?: string | null;
  price?: number;
  propertyUrl?: string;
  whatsappUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function WhatsAppBookingButton({
  propertyId,
  phoneNumber,
  code,
  title,
  location,
  price,
  propertyUrl = "",
  whatsappUrl: initialWhatsappUrl = "",
  className = "",
  children,
}: WhatsAppBookingButtonProps) {
  const getUrl = (urlToUse?: string) => {
    if (initialWhatsappUrl) return initialWhatsappUrl;
    if (phoneNumber && code && title && price) {
      return buildBookingWhatsAppUrl({
        phoneNumber,
        code,
        title,
        location,
        price,
        propertyUrl: urlToUse || propertyUrl,
      });
    }
    return "";
  };

  const initialHref = getUrl();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      recordWhatsAppClickAction(propertyId);
    } catch {
      // Ignore background analytics error
    }
    if (typeof window !== "undefined") {
      const liveHref = getUrl(window.location.href);
      if (liveHref) {
        e.currentTarget.href = liveHref;
      }
    }
  };

  if (!initialHref) {
    return (
      <button disabled className={`opacity-50 cursor-not-allowed ${className}`}>
        {children || "حجز عبر واتساب"}
      </button>
    );
  }

  return (
    <a
      href={initialHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children || "حجز عبر واتساب"}
    </a>
  );
}
