import Link from "next/link";
import Image from "next/image";
import {
  Bed,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Wifi,
  Snowflake,
} from "lucide-react";
import {
  formatPrice,
  getAreaLabel,
  getRentalTypePriceLabel,
  getRentalTypeLabel,
} from "@/lib/utils";
import WhatsAppBookingButton from "./WhatsAppBookingButton";

export interface Property {
  id: string;
  code: string;
  title: string;
  area: string;
  gender: string;
  rental_type: string;
  price: number;
  location_desc: string;
  status: string;
  rooms_count?: number;
  total_beds: number;
  available_beds: number;
  amenities: string[];
  images: string[];
  youtube_video_url: string | null;
  description: string | null;
  walking_minutes_to_university?: number | null;
  maps_url?: string | null;
  floor?: number | null;
  furnished?: boolean | null;
  utilities_included?: boolean | null;
  deposit?: number | null;
  contract_months?: number | null;
  students_per_room?: number | null;
  last_verified_at?: string | null;
  owner_phone?: string | null;
  whatsapp_clicks?: number;
  created_at: string;
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const thumbnail =
    property.images && property.images.length > 0 ? property.images[0] : null;

  const isFemale = property.gender === "female";
  const whatsappNumber =
    process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER?.trim() || "201012345678";

  const campusTitle =
    property.area === "al_masaeed"
      ? "جامعة سيناء — المساعيد"
      : "جامعة العريش — الضاحية";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sakan-arish.vercel.app";
  const propertyUrl = `${siteUrl}/property/${property.id}`;

  return (
    <article
      data-campus={property.area === "al_masaeed" ? "sinai" : "dahiya"}
      className="property-card group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-[#0F766E]/60 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* 1. Photo with Badges & Price Overlay */}
      <div className="relative h-52 sm:h-56 w-full bg-slate-100 overflow-hidden">
        <Link href={`/property/${property.id}`} className="block w-full h-full">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <Bed className="h-12 w-12" />
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-start pointer-events-none">
          <span className="bg-[#0D3B4C] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
            {campusTitle}
          </span>
          {property.last_verified_at ? (
            <span className="bg-[#D97706] text-white px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> موثق ومفحوص
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                isFemale
                  ? "bg-rose-600 text-white"
                  : "bg-teal-700 text-white"
              }`}
            >
              {isFemale ? "سكن طالبات" : "سكن شباب"}
            </span>
          )}
        </div>

        {/* Price Tag Overlay (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-[#0D3B4C] font-extrabold px-3 py-1 rounded-xl text-sm sm:text-base shadow-xs pointer-events-none">
          {formatPrice(property.price)} ج.م{" "}
          <span className="text-xs font-normal text-slate-500">
            / {getRentalTypePriceLabel(property.rental_type)}
          </span>
        </div>
      </div>

      {/* 2. Body Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Location & Walking distance */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[#0F766E] font-semibold flex items-center gap-1 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {property.location_desc || getAreaLabel(property.area)}
              {property.walking_minutes_to_university
                ? ` (${property.walking_minutes_to_university} د مشياً)`
                : ""}
            </span>
            <span className="font-mono text-[11px] text-slate-400 font-bold flex-shrink-0">
              {property.code}
            </span>
          </div>

          {/* Title */}
          <Link href={`/property/${property.id}`} className="block">
            <h3 className="font-extrabold text-base text-[#0D3B4C] leading-snug line-clamp-1 group-hover:text-[#0F766E] transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Snippet / Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {property.description ||
              `${getRentalTypeLabel(property.rental_type)} ${
                property.rooms_count ? `• ${property.rooms_count} غرف` : ""
              } • متاح ${property.available_beds} من ${property.total_beds} أسرّة`}
          </p>
        </div>

        {/* 3. Amenities and CTAs */}
        <div>
          {/* Amenities icons row */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mb-4">
            <span className="inline-flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5 text-[#0F766E]" /> واي فاي
            </span>
            <span className="inline-flex items-center gap-1">
              <Snowflake className="h-3.5 w-3.5 text-[#0F766E]" /> تكييف
            </span>
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-[#0F766E]" />{" "}
              {property.available_beds > 0
                ? `${property.available_beds} سرير شاغر`
                : "كامل العدد"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/property/${property.id}`}
              className="flex-1 py-2 px-3 rounded-xl border border-[#0D3B4C] text-[#0D3B4C] hover:bg-[#0D3B4C] hover:text-white text-center text-xs font-bold transition-colors"
            >
              التفاصيل والصور
            </Link>

            <WhatsAppBookingButton
              propertyId={property.id}
              phoneNumber={whatsappNumber}
              code={property.code}
              title={property.title}
              location={property.location_desc}
              price={property.price}
              propertyUrl={propertyUrl}
              className="py-2 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>واتساب</span>
            </WhatsAppBookingButton>
          </div>
        </div>
      </div>
    </article>
  );
}
