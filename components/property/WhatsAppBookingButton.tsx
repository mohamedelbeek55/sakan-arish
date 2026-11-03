"use client";

import { useState, useEffect } from "react";
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
  const [href, setHref] = useState(() => {
    if (initialWhatsappUrl) return initialWhatsappUrl;
    if (phoneNumber && code && title && price) {
      return buildBookingWhatsAppUrl({
        phoneNumber,
        code,
        title,
        location,
        price,
        propertyUrl,
      });
    }
    return "";
  });

  useEffect(() => {
    const currentUrl =
      propertyUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (phoneNumber && code && title && price) {
      setHref(
        buildBookingWhatsAppUrl({
          phoneNumber,
          code,
          title,
          location,
          price,
          propertyUrl: currentUrl,
        })
      );
    }
  }, [phoneNumber, code, title, location, price, propertyUrl]);

  const handleClick = () => {
    // Fire click tracking without blocking navigation
    try {
      recordWhatsAppClickAction(propertyId);
    } catch {
      // Ignore background analytics error
    }
  };

  return (
    <a
      href={href || initialWhatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children || "احجز وتواصل عبر واتساب"}
    </a>
  );
}
