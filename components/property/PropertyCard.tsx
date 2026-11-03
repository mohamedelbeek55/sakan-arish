import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  furnished?: boolean;
  utilities_included?: boolean;
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

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Image */}
      <Link href={`/property/${property.id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <Bed className="h-12 w-12" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getStatusStyles(
              property.status
            )}`}
          >
            {getStatusLabel(property.status)}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Badges / Hashtags Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-teal-50 border border-teal-200/90 px-2 py-0.5 text-xs font-semibold text-teal-800">
            #{getAreaLabel(property.area)}
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
              property.gender === "female"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            #{getGenderLabel(property.gender)}
          </span>
          {property.rooms_count ? (
            <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {property.rooms_count} {property.rooms_count === 1 ? "غرفة" : property.rooms_count === 2 ? "غرفتان" : "غرف"}
            </span>
          ) : null}
          {property.walking_minutes_to_university ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              🚶‍♂️ {property.walking_minutes_to_university} د للجامعة
            </span>
          ) : null}
        </div>

        {/* Title */}
        <Link href={`/property/${property.id}`} className="block">
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-1 hover:text-teal-700 transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Location (Optional) */}
        {property.location_desc ? (
          <div className="flex items-start gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-1">{property.location_desc}</span>
          </div>
        ) : null}

        {/* Amenities / Hashtags */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {property.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium border border-slate-200/80"
              >
                #{amenity.replace(/\s+/g, "_")}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-500 px-2 py-0.5 text-[11px] font-medium border border-slate-200/80">
                +{property.amenities.length - 4} المزيد
              </span>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-teal-700">
              {formatPrice(property.price)}
            </span>
            <span className="text-sm text-slate-400">
              ج / {getRentalTypePriceLabel(property.rental_type)}
            </span>
          </div>
          <Link href={`/property/${property.id}`}>
            <Button variant="outline" size="sm" className="text-xs">
              عرض التفاصيل
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
