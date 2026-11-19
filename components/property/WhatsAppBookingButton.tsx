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
  const getCanonicalPropertyUrl = (overrideUrl?: string) => {
    if (overrideUrl) return overrideUrl;
    if (propertyUrl) return propertyUrl;
    if (typeof window !== "undefined") {
      return `${window.location.origin}/property/${propertyId}`;
    }
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sakan-arish.vercel.app";
    return `${siteUrl}/property/${propertyId}`;
  };

  const getUrl = (urlToUse?: string) => {
    if (phoneNumber && code && title && price) {
      return buildBookingWhatsAppUrl({
        phoneNumber,
        code,
        title,
        location,
        price,
        propertyUrl: getCanonicalPropertyUrl(urlToUse),
      });
    }
    if (initialWhatsappUrl) return initialWhatsappUrl;
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
      const livePropertyUrl = `${window.location.origin}/property/${propertyId}`;
      const liveHref = getUrl(livePropertyUrl);
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
