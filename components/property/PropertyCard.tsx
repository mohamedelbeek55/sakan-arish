import Link from "next/link";
import Image from "next/image";
import { Bed, ArrowLeft } from "lucide-react";
import {
  formatPrice,
  getAreaLabel,
  getGenderLabel,
  getStatusLabel,
  getStatusStyles,
  getRentalTypePriceLabel,
} from "@/lib/utils";

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
    property.images && property.images.length > 0
      ? property.images[0]
      : null;

  const isFemale = property.gender === "female";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200/70 shadow-xs hover:shadow-md transition-all duration-200">
      {/* 1. Photo First with max 2 small tags */}
      <Link
        href={`/property/${property.id}`}
        className="relative block aspect-[16/11] overflow-hidden bg-stone-100"
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <Bed className="h-10 w-10" />
          </div>
        )}

        {/* Top Badges: Max 2 small tags (Status + Gender), strictly no hashtags */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold backdrop-blur-xs shadow-2xs ${getStatusStyles(
              property.status
            )}`}
          >
            {getStatusLabel(property.status)}
          </span>

          {/* Gender Tag */}
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-xs shadow-2xs ${
              isFemale
                ? "bg-rose-50/95 text-rose-800 border border-rose-200/60"
                : "bg-sky-50/95 text-sky-800 border border-sky-200/60"
            }`}
          >
            {isFemale ? "بنات" : "شباب"}
          </span>
        </div>
      </Link>

      {/* 2. Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Location & Code Info */}
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>{getAreaLabel(property.area)}</span>
            <span className="font-mono text-[11px] text-stone-400">
              {property.code}
            </span>
          </div>

          {/* Title */}
          <Link href={`/property/${property.id}`} className="block">
            <h3 className="font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-sky-800 transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Specs Snippet (Clean, no hashtags) */}
          <p className="text-xs text-stone-600 line-clamp-1">
            {property.rooms_count ? `${property.rooms_count} غرف • ` : ""}
            {property.available_beds > 0
              ? `${property.available_beds} سرير متاح`
              : "كامل العدد"}
            {property.walking_minutes_to_university
              ? ` • 🚶‍♂️ ${property.walking_minutes_to_university} د للجامعة`
              : ""}
          </p>
        </div>

        {/* 3. Big Price & Link (No pulsing buttons) */}
        <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {formatPrice(property.price)} ج
            </span>
            <span className="text-xs text-stone-500 font-normal">
              / {getRentalTypePriceLabel(property.rental_type)}
            </span>
          </div>

          <Link
            href={`/property/${property.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 hover:text-sky-900 transition-colors"
          >
            <span>التفاصيل</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
