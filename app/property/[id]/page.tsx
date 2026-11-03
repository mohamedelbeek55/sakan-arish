import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Wifi,
  Snowflake,
  Shield,
  BookOpen,
  ArrowUpDown,
  Flame,
  CookingPot,
  Home,
  ArrowRight,
  Fuel,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PropertyGallery from "@/components/property/PropertyGallery";
import YouTubeEmbed from "@/components/property/YouTubeEmbed";
import WhatsAppBar from "./WhatsAppBar";
import ShareButton from "@/components/property/ShareButton";
import {
  formatPrice,
  getAreaLabel,
  getGenderLabel,
  getStatusLabel,
  getStatusStyles,
  getRentalTypeLabel,
  getRentalTypePriceLabel,
  buildBookingWhatsAppUrl,
  buildWhatsAppUrl,
  getWhatsAppNumber,
} from "@/lib/utils";
import type { Metadata } from "next";
import type { Property } from "@/components/property/PropertyCard";
import { getPropertyById } from "@/lib/properties-store";

const amenityIcons: Record<string, React.ReactNode> = {
  تكييف: <Snowflake className="h-4 w-4" />,
  "واي فاي": <Wifi className="h-4 w-4" />,
  سخان: <Flame className="h-4 w-4" />,
  بوتجاز: <CookingPot className="h-4 w-4" />,
  "غاز طبيعي": <Fuel className="h-4 w-4" />,
  غاز: <Fuel className="h-4 w-4" />,
  "مكتب مذاكرة": <BookOpen className="h-4 w-4" />,
  مصعد: <ArrowUpDown className="h-4 w-4" />,
  "أمن/بواب": <Shield className="h-4 w-4" />,
};

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPropertyById(id);

  if (!item) return { title: "سكن غير موجود" };

  return {
    title: `${item.title} | سكن طلاب العريش`,
    description: `${item.title} - ${item.location_desc || ""} - ${formatPrice(item.price)} ج.م`,
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyPageProps) {
  const { id } = await params;
  const p = await getPropertyById(id);

  if (!p) {
    notFound();
  }
  const whatsappNumber = getWhatsAppNumber();

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700 mb-6 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لكافة السكنات
        </Link>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Gallery Column */}
          <div className="lg:col-span-3 space-y-6">
            <PropertyGallery images={p.images} title={p.title} />

            {p.youtube_video_url && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  جولة فيديو
                </h3>
                <YouTubeEmbed url={p.youtube_video_url} />
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-semibold ${getStatusStyles(
                  p.status
                )}`}
              >
                {getStatusLabel(p.status)}
              </span>
              <span className="inline-flex items-center rounded-lg bg-teal-50 border border-teal-200 px-3 py-1 text-sm font-semibold text-teal-800 shadow-2xs">
                #{getAreaLabel(p.area)}
              </span>
              <span
                className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm font-semibold shadow-2xs ${
                  p.gender === "female"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                #{getGenderLabel(p.gender)}
              </span>
              <span className="inline-flex items-center rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-semibold text-amber-800 shadow-2xs">
                #{getRentalTypeLabel(p.rental_type)}
              </span>
            </div>

            {/* Title & Code + Share */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{p.title}</h1>
                <p className="text-sm text-slate-400 mt-1">كود: {p.code}</p>
              </div>
              <ShareButton title={p.title} code={p.code} price={p.price} />
            </div>

            {/* Location (Optional) */}
            {p.location_desc ? (
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <span className="text-sm">{p.location_desc}</span>
              </div>
            ) : null}

            {/* Price */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-teal-700">
                  {formatPrice(p.price)}
                </span>
                <span className="text-base text-slate-500">
                  ج.م / {getRentalTypePriceLabel(p.rental_type)}
                </span>
              </div>
            </div>

            {/* Unit Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">معلومات السكن</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Home className="h-4 w-4 text-teal-600" />
                  <span>عدد الغرف: {p.rooms_count || 1}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Bed className="h-4 w-4 text-slate-400" />
                  <span>إجمالي الأسرّة: {p.total_beds}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Bed className="h-4 w-4 text-emerald-500" />
                  <span>متاح: {p.available_beds}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {p.amenities && p.amenities.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  المرافق والخدمات
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {p.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 border border-slate-100"
                    >
                      <span className="text-slate-400">
                        {amenityIcons[amenity] || (
                          <div className="h-4 w-4 rounded-full bg-slate-200" />
                        )}
                      </span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {p.description && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">وصف تفصيلي</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {p.description}
                </p>
              </div>
            )}

            {/* Desktop WhatsApp CTA */}
            <div className="hidden lg:block">
              <a
                href={buildBookingWhatsAppUrl({
                  phoneNumber: whatsappNumber,
                  code: p.code,
                  title: p.title,
                  location: p.location_desc,
                  price: p.price,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white transition hover:bg-[#20BD5A] shadow-md hover:shadow-lg transform active:scale-[0.99]"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                احجز السكن الآن (واتساب)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating WhatsApp Bar */}
      <WhatsAppBar
        phoneNumber={whatsappNumber}
        code={p.code}
        title={p.title}
        location={p.location_desc}
        price={p.price}
      />
    </>
  );
}
