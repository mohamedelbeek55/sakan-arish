import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ar-EG").format(price);
}

export function getRentalTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bed: "سرير",
    room: "غرفة خاصة",
    full_apartment: "شقة كاملة",
  };
  return labels[type] || type;
}

export function getRentalTypePriceLabel(type: string): string {
  const labels: Record<string, string> = {
    bed: "سرير",
    room: "الغرفة",
    full_apartment: "الشقة",
  };
  return labels[type] || type;
}

export function getAreaLabel(area: string): string {
  const labels: Record<string, string> = {
    al_masaeed: "المساعيد",
    al_dahiya: "الضاحية",
  };
  return labels[area] || area;
}

export function getGenderLabel(gender: string): string {
  const labels: Record<string, string> = {
    male: "سكن شباب",
    female: "سكن بنات",
  };
  return labels[gender] || gender;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: "متاح",
    one_bed_left: "فاضي سرير واحد",
    booked: "محجوز",
  };
  return labels[status] || status;
}

export function getStatusStyles(status: string): string {
  const styles: Record<string, string> = {
    available:
      "bg-emerald-50/90 text-emerald-800 border border-emerald-200/70",
    one_bed_left:
      "bg-amber-50/90 text-amber-900 border border-amber-200/70",
    booked:
      "bg-stone-100/90 text-stone-500 border border-stone-200",
  };
  return styles[status] || "";
}

export function derivePropertyStatus(
  availableBeds: number
): "available" | "one_bed_left" | "booked" {
  if (availableBeds <= 0) return "booked";
  if (availableBeds === 1) return "one_bed_left";
  return "available";
}

export function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove tashkeel/harakat
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim()
    .toLowerCase();
}

export function getWhatsAppNumber(): string {
  const num = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER?.trim();
  if (!num) {
    throw new Error(
      "Missing NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER environment variable. Please configure it in your environment."
    );
  }
  return num;
}

export function buildBookingWhatsAppUrl({
  phoneNumber,
  code,
  title,
  location,
  price,
}: {
  phoneNumber: string;
  code: string;
  title: string;
  location?: string | null;
  price: number;
}): string {
  const locLine = location ? `\n📍 الموقع: ${location}` : "";
  const message = `السلام عليكم، أرغب في حجز ومعاينة السكن التالي:
📌 كود السكن: ${code}
🏠 العنوان: ${title}${locLine}
💰 السعر: ${formatPrice(price)} ج.م
— تم الإرسال من منصة سكن طلاب العريش`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function buildOwnerWhatsAppUrl(phoneNumber: string): string {
  const message = `السلام عليكم، أنا صاحب سكن في العريش وأرغب في عرض شقتي/سكني على منصة "سكن طلاب العريش"`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppUrl(
  phoneNumber: string,
  code: string,
  location?: string | null,
  price?: number,
  title?: string
): string {
  if (title && price) {
    return buildBookingWhatsAppUrl({
      phoneNumber,
      code,
      title,
      location,
      price,
    });
  }
  const locText = location ? ` في ${location}` : "";
  const priceText = price ? ` والمعروض بسعر ${formatPrice(price)} ج` : "";
  const message = `السلام عليكم، أرغب في حجز ومعاينة السكن كود: ${code}${locText}${priceText}`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export const AMENITY_OPTIONS = [
  { value: "تكييف", label: "تكييف", icon: "Snowflake" },
  { value: "واي فاي", label: "واي فاي", icon: "Wifi" },
  { value: "غسالة", label: "غسالة", icon: "WashingMachine" },
  { value: "سخان", label: "سخان", icon: "Flame" },
  { value: "ثلاجة", label: "ثلاجة", icon: "Refrigerator" },
  { value: "بوتجاز", label: "بوتجاز", icon: "CookingPot" },
  { value: "غاز طبيعي", label: "غاز طبيعي", icon: "Fuel" },
  { value: "مكتب مذاكرة", label: "مكتب مذاكرة", icon: "BookOpen" },
  { value: "مصعد", label: "مصعد", icon: "ArrowUpDown" },
  { value: "أمن/بواب", label: "أمن/بواب", icon: "Shield" },
] as const;
