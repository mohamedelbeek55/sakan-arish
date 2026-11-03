"use client";

import { recordWhatsAppClickAction } from "@/app/actions/property";
import { formatPrice } from "@/lib/utils";

interface WhatsAppBookingButtonProps {
  propertyId: string;
  whatsappUrl: string;
  className?: string;
  children?: React.ReactNode;
}

export default function WhatsAppBookingButton({
  propertyId,
  whatsappUrl,
  className = "",
  children,
}: WhatsAppBookingButtonProps) {
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
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children || "احجز وتواصل عبر واتساب"}
    </a>
  );
}
