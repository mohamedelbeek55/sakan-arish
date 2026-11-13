import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Bed,
  Wifi,
  Snowflake,
  Shield,
  BookOpen,
  ArrowUpDown,
  Flame,
  CookingPot,
  Check,
  CheckCircle2,
  Users,
  Footprints,
  MessageSquare,
  ShieldCheck,
  Compass,
  ChevronLeft,
} from "lucide-react";
import PropertyGallery from "@/components/property/PropertyGallery";
import YouTubeEmbed from "@/components/property/YouTubeEmbed";
import WhatsAppBar from "./WhatsAppBar";
import ShareButton from "@/components/property/ShareButton";
import WhatsAppBookingButton from "@/components/property/WhatsAppBookingButton";
import {
  formatPrice,
  getAreaLabel,
  getGenderLabel,
  getStatusLabel,
  getRentalTypeLabel,
  getRentalTypePriceLabel,
  buildBookingWhatsAppUrl,
  getWhatsAppNumber,
} from "@/lib/utils";
import type { Metadata } from "next";
import { getPropertyById } from "@/lib/properties-store";

const amenityIcons: Record<string, React.ReactNode> = {
  تكييف: <Snowflake className="h-5 w-5" />,
  "واي فاي": <Wifi className="h-5 w-5" />,
  سخان: <Flame className="h-5 w-5" />,
  بوتجاز: <CookingPot className="h-5 w-5" />,
  "غاز طبيعي": <Flame className="h-5 w-5" />,
  غاز: <Flame className="h-5 w-5" />,
  "مكتب مذاكرة": <BookOpen className="h-5 w-5" />,
  مصعد: <ArrowUpDown className="h-5 w-5" />,
  "أمن/بواب": <Shield className="h-5 w-5" />,
};

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPropertyById(id);

  if (!item) return { title: "سكن غير موجود | سكن طلاب العريش" };

  const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
  const pageTitle = `${item.title} (${item.code}) | سكن طلاب العريش`;
  const pageDescription = `${getAreaLabel(item.area)} - ${getGenderLabel(
    item.gender
  )} - ${getRentalTypeLabel(item.rental_type)} - ${formatPrice(
    item.price
  )} ج.م/شهر${item.location_desc ? ` - ${item.location_desc}` : ""}`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      images: firstImage
        ? [
            {
              url: firstImage,
              width: 1200,
              height: 630,
              alt: item.title,
            },
          ]
        : [],
    },
    twitter: {
      card: firstImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description: pageDescription,
      images: firstImage ? [firstImage] : [],
    },
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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sakan-arish.vercel.app";
  const propertyUrl = `${siteUrl}/property/${p.id}`;

  const whatsappBookingUrl = buildBookingWhatsAppUrl({
    phoneNumber: whatsappNumber,
    code: p.code,
    title: p.title,
    location: p.location_desc,
    price: p.price,
    propertyUrl,
  });

  const campusTitle =
    p.area === "al_masaeed"
      ? "جامعة سيناء — المساعيد"
      : "جامعة العريش — الضاحية";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-16 space-y-6 w-full">
        {/* Breadcrumb & Share */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#0D3B4C]">
              الرئيسية
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <Link
              href={`/?area=${p.area}#browse-listings`}
              className="hover:text-[#0D3B4C]"
            >
              {campusTitle}
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-[#0D3B4C] font-bold line-clamp-1">
              {p.title}
            </span>
          </nav>

          <ShareButton title={p.title} code={p.code} price={p.price} />
        </div>

        {/* Title & Rent Header (Stitch Design) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0D3B4C] text-white text-xs font-bold shadow-xs">
                {campusTitle}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#16803D] border border-emerald-200/80 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16803D]"></span>
                {getStatusLabel(p.status)}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  p.gender === "female"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-teal-50 text-[#0F766E] border border-teal-200"
                }`}
              >
                {getGenderLabel(p.gender)}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                كود: {p.code}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0D3B4C] leading-snug">
              {p.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 text-[#0F766E] shrink-0" />
              {p.location_desc || getAreaLabel(p.area)}
              {p.walking_minutes_to_university
                ? ` — ${p.walking_minutes_to_university} دقائق مشياً من الحرم الجامعي`
                : ""}
            </p>
          </div>

          {/* Rent Badge */}
          <div className="md:text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
            <span className="text-xs text-slate-500 block">قيمة الإيجار الشهري</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#0D3B4C]">
                {formatPrice(p.price)}
              </span>
              <span className="text-xs font-bold text-slate-600">
                ج.م / {getRentalTypePriceLabel(p.rental_type)}
              </span>
            </div>
            {p.utilities_included !== null && (
              <span className="text-xs text-[#16803D] font-bold flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {p.utilities_included ? "شامل المياه والغاز والكهرباء" : "الفواتير منفصلة"}
              </span>
            )}
          </div>
        </div>

        {/* Property Gallery */}
        <section className="rounded-2xl overflow-hidden">
          <PropertyGallery images={p.images} title={p.title} />
        </section>

        {/* 2-Column Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Specs Bar (Stitch Design) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xs">
              <div className="text-right">
                <span className="text-xs text-slate-500 block mb-1">نوع السكن</span>
                <span className="font-extrabold text-sm sm:text-base text-[#0D3B4C] flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-[#0F766E]" />
                  {getRentalTypeLabel(p.rental_type)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block mb-1">المسافة للجامعة</span>
                <span className="font-extrabold text-sm sm:text-base text-[#0D3B4C] flex items-center gap-1.5">
                  <Footprints className="h-4 w-4 text-[#0F766E]" />
                  {p.walking_minutes_to_university
                    ? `${p.walking_minutes_to_university} د مشياً`
                    : "قريب من الجامعة"}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block mb-1">الطابق والمصعد</span>
                <span className="font-extrabold text-sm sm:text-base text-[#0D3B4C] flex items-center gap-1.5">
                  <ArrowUpDown className="h-4 w-4 text-[#0F766E]" />
                  {p.floor !== null && p.floor !== undefined
                    ? p.floor === 0
                      ? "الدور الأرضي"
                      : `الدور ${p.floor}`
                    : "طابق مناسب"}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block mb-1">الأسرّة المتاحة</span>
                <span className="font-extrabold text-sm sm:text-base text-[#16803D] flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#16803D]" />
                  {p.available_beds} من {p.total_beds} شاغر
                </span>
              </div>
            </div>

            {/* Description Section */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-right space-y-4">
              <h2 className="font-black text-lg text-[#0D3B4C] pb-3 border-b border-slate-100">
                وصف السكن والموقع
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {p.description ||
                  "سكن طلابي مميز ومفروش بالكامل، يقع في موقع حيوي وهادئ بالقرب من الجامعة والخدمات والمواصلات في العريش."}
              </div>
            </section>

            {/* Video Tour Section (if available) */}
            {p.youtube_video_url && (
              <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-right space-y-4">
                <h3 className="font-black text-lg text-[#0D3B4C] pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span>جولة فيديو داخل السكن 📹</span>
                </h3>
                <YouTubeEmbed url={p.youtube_video_url} />
              </section>
            )}

            {/* Amenities Section */}
            {p.amenities && p.amenities.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-right space-y-4">
                <h2 className="font-black text-lg text-[#0D3B4C] pb-3 border-b border-slate-100">
                  المرافق والخدمات المتوفرة
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {p.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 text-xs sm:text-sm font-semibold"
                    >
                      <span className="text-[#0F766E]">
                        {amenityIcons[amenity] || <CheckCircle2 className="h-4 w-4" />}
                      </span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Housing Rules Section */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-right space-y-4">
              <h2 className="font-black text-lg text-[#0D3B4C] pb-3 border-b border-slate-100">
                شروط وقواعد السكن
              </h2>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#16803D] shrink-0 mt-0.5" />
                  <span>السكن مخصص لطلاب وطالبات الجامعات فقط (يشترط إثبات القيد أو كارنيه الكلية).</span>
                </li>
                {p.deposit !== null && p.deposit !== undefined && (
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#16803D] shrink-0 mt-0.5" />
                    <span>
                      دفع تأمين {p.deposit > 0 ? `${formatPrice(p.deposit)} ج.م` : "بدون تأمين"} يُسترد عند تسليم الغرفة بحالتها الأصلية.
                    </span>
                  </li>
                )}
                {p.contract_months && (
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#16803D] shrink-0 mt-0.5" />
                    <span>مدة العقد المتفق عليها: {p.contract_months} شهور دراسية.</span>
                  </li>
                )}
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#16803D] shrink-0 mt-0.5" />
                  <span>التزام الهدوء التام خلال فترات الامتحانات والدراسة، والحفاظ على نظافة المكان.</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Sticky Sidebar (Contact Box & Proximity) */}
          <div className="space-y-6">
            {/* Sticky Landlord Contact Box (Stitch Design) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-[#0F766E]/40 shadow-md sticky top-28 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">سعر السرير / الشهر</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#0D3B4C]">
                      {formatPrice(p.price)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">ج.م</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#0F766E]/15 text-[#0F766E] text-xs font-bold">
                  بدون وسيط أو عمولة
                </span>
              </div>

              {/* Landlord Profile Snippet */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-12 h-12 rounded-full bg-[#0D3B4C] text-white flex items-center justify-center font-bold text-base">
                  س.ع
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-[#0D3B4C]">
                      صاحب السكن المعتمد
                    </h4>
                    <ShieldCheck className="h-4 w-4 text-[#D97706]" />
                  </div>
                  <p className="text-xs text-slate-500">استجابة سريعة عبر الواتساب</p>
                </div>
              </div>

              {/* WhatsApp CTA Action */}
              <div className="space-y-3">
                <WhatsAppBookingButton
                  propertyId={p.id}
                  phoneNumber={whatsappNumber}
                  code={p.code}
                  title={p.title}
                  location={p.location_desc}
                  price={p.price}
                  propertyUrl={propertyUrl}
                  whatsappUrl={whatsappBookingUrl}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center justify-center gap-2 text-sm font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>تواصل فوري عبر واتساب</span>
                </WhatsAppBookingButton>

                {p.maps_url && (
                  <a
                    href={p.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                  >
                    <Compass className="h-4 w-4 text-[#0F766E]" />
                    <span>عرض الموقع على Google Maps</span>
                  </a>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 text-[#16803D]" />
                  تواصل آمن ومباشر مع صاحب العقار بدون وسيط
                </p>
              </div>
            </div>

            {/* Campus Proximity Card (Stitch Design) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-right space-y-3">
              <h4 className="font-extrabold text-sm text-[#0D3B4C] flex items-center gap-2">
                <Footprints className="h-4 w-4 text-[#0F766E]" />
                المسافة للجامعة والمواصلات
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-700">{campusTitle}</span>
                  <span className="font-bold text-[#0F766E]">
                    {p.walking_minutes_to_university
                      ? `${p.walking_minutes_to_university} دقائق مشياً`
                      : "قريب جداً"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-700">موقف سرفيس ومواصلات</span>
                  <span className="font-bold text-[#0F766E]">2 دقيقة مشياً</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating WhatsApp Bar */}
      <WhatsAppBar
        propertyId={p.id}
        phoneNumber={whatsappNumber}
        code={p.code}
        title={p.title}
        location={p.location_desc || getAreaLabel(p.area)}
        price={p.price}
        propertyUrl={propertyUrl}
      />
    </>
  );
}
