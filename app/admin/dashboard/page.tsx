import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Plus,
  Pencil,
  GraduationCap,
  Landmark,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusDropdown from "@/components/admin/StatusDropdown";
import DeleteButton from "./DeleteButton";
import {
  formatPrice,
  getAreaLabel,
  getGenderLabel,
  getWhatsAppNumber,
} from "@/lib/utils";
import { getAllProperties } from "@/lib/properties-store";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireAdmin();

  // Load properties with admin privileges (includes owner_phone)
  const listings = await getAllProperties({ forAdmin: true });
  const totalListings = listings.length;
  const availableCount = listings.filter((p) => p.status === "available").length;
  const oneBedCount = listings.filter((p) => p.status === "one_bed_left").length;
  const bookedCount = listings.filter((p) => p.status === "booked").length;

  const sinaiCount = listings.filter((p) => p.area === "al_masaeed" || p.area === "sinai_univ_dist").length;
  const arishCount = listings.filter((p) => p.area === "al_dahiya" || p.area === "arish_univ_dist").length;

  const sinaiPercent = totalListings > 0 ? Math.round((sinaiCount / totalListings) * 100) : 0;
  const arishPercent = totalListings > 0 ? Math.round((arishCount / totalListings) * 100) : 0;

  // Compute WhatsApp clicks via grouped query on property_clicks
  const supabase = await createClient();
  let totalClicks = 0;
  const clicksMap = new Map<string, number>();

  try {
    const { data: clicksData } = await supabase
      .from("property_clicks")
      .select("property_id");

    if (clicksData && clicksData.length > 0) {
      totalClicks = clicksData.length;
      for (const row of clicksData) {
        if (row.property_id) {
          clicksMap.set(
            row.property_id,
            (clicksMap.get(row.property_id) || 0) + 1
          );
        }
      }
    }
  } catch (clicksErr) {
    console.warn("Could not fetch property_clicks analytics:", clicksErr);
  }

  // Check pending submissions count
  let pendingSubmissionsCount = 0;
  try {
    const { count } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingSubmissionsCount = count || 0;
  } catch {
    // Graceful fallback
  }

  const adminWhatsApp = getWhatsAppNumber();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header & Action Controls (Stitch Screen 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-outline/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="font-headline text-2xl sm:text-3xl font-black text-light-primary">
              لوحة الإدارة الشاملة لعقارات سكن طلاب العريش
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              متصل بصلاحيات كاملة
            </span>
          </div>
          <p className="text-sm text-light-on-surface/70 max-w-2xl leading-relaxed">
            أنت تمتلك التحكم الكامل: إضافة عقارات جديدة بعد مراجعة الواتساب، وتعديل الأسعار والمواصفات، أو حذف وتحديث حالة التسكين فوراً.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`https://wa.me/${adminWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-whatsapp/15 text-whatsapp hover:bg-whatsapp/25 border border-whatsapp/30 font-bold text-sm transition-colors shadow-xs"
          >
            <MessageSquare className="h-4 w-4" />
            <span>واتساب طلبات السكن</span>
            {pendingSubmissionsCount > 0 && (
              <span className="bg-whatsapp text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingSubmissionsCount}
              </span>
            )}
          </a>
          <Link href="/admin/dashboard/new">
            <Button
              size="default"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-light-primary text-white hover:bg-light-primary/90 font-bold text-sm transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة عقار سكن جديد</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats & Key Metrics Grid (Stitch Screen 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Properties */}
        <div className="bg-white p-6 rounded-2xl border border-light-outline/70 shadow-2xs flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-light-on-surface/60 font-medium block mb-1">
              إجمالي العقارات المعروضة
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-black text-light-primary">
              {totalListings} <span className="text-base font-bold text-light-on-surface/60">سكن</span>
            </h3>
            <span className="text-xs text-emerald-800 font-bold inline-flex items-center gap-1 mt-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              {availableCount} متاح للتسكين الفوري
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-light-primary/10 text-light-primary flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        {/* Sinai Univ Area */}
        <div className="bg-white p-6 rounded-2xl border border-light-outline/70 shadow-2xs flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-light-on-surface/60 font-medium block mb-1">
              سكنات جامعة سيناء (المساعيد)
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-black text-light-secondary">
              {sinaiCount} <span className="text-base font-bold text-light-on-surface/60">سكن</span>
            </h3>
            <span className="text-xs text-light-on-surface/60 block mt-1 font-medium">
              {sinaiPercent}% من إجمالي المعروض
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-light-secondary/10 text-light-secondary flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        {/* Arish Univ Area */}
        <div className="bg-white p-6 rounded-2xl border border-light-outline/70 shadow-2xs flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-light-on-surface/60 font-medium block mb-1">
              سكنات جامعة العريش (الضاحية)
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-black text-light-primary">
              {arishCount} <span className="text-base font-bold text-light-on-surface/60">سكن</span>
            </h3>
            <span className="text-xs text-light-on-surface/60 block mt-1 font-medium">
              {arishPercent}% من إجمالي المعروض
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-light-primary/10 text-light-primary flex items-center justify-center shrink-0">
            <Landmark className="h-6 w-6" />
          </div>
        </div>

        {/* WhatsApp Bookings / Submissions */}
        <div className="bg-white p-6 rounded-2xl border-2 border-whatsapp/40 shadow-2xs flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-light-on-surface/60 font-medium block mb-1">
              نقرات حجز واتساب وطلبات الملاك
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-black text-whatsapp">
              {totalClicks} <span className="text-base font-bold text-emerald-950">نقرة</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {pendingSubmissionsCount > 0 ? (
                <Link
                  href="/admin/dashboard/submissions"
                  className="text-xs text-amber-900 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  {pendingSubmissionsCount} طلبات ملاك جديدة
                </Link>
              ) : (
                <span className="text-xs text-emerald-800 font-medium inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  نشاط الحجز مستقر
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-whatsapp/15 text-whatsapp flex items-center justify-center shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Quick Status Breakdown Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white rounded-xl border border-light-outline/70 shadow-2xs text-xs font-bold text-light-on-surface/80">
        <span className="text-light-on-surface/50 font-medium">حالة الوحدات المتاحة:</span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
          {availableCount} متاح بالكامل
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          {oneBedCount} متبقي سرير واحد
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
          <XCircle className="h-3.5 w-3.5 text-stone-500" />
          {bookedCount} محجوز بالكامل
        </span>
        <div className="mr-auto hidden sm:flex items-center gap-2 text-stone-500 font-normal">
          <span>إجمالي الوحدات: {totalListings}</span>
          <span>•</span>
          <Link
            href="/admin/dashboard/submissions"
            className="text-light-secondary hover:underline font-bold"
          >
            سجل المراجعة ({pendingSubmissionsCount})
          </Link>
        </div>
      </div>

      {/* Properties Management Table Section (Stitch Screen 6) */}
      <section className="bg-white rounded-2xl border border-light-outline/70 shadow-2xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-5 border-b border-light-outline/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-light-surface-subtle/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-light-primary text-white flex items-center justify-center font-bold text-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-light-primary">
                قائمة العقارات المسجلة والتحكم الفوري
              </h2>
              <p className="text-xs text-light-on-surface/60">
                تعديل الأسعار، تغيير حالة الغرف، ومعاينة بيانات الملاك والواتساب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard/new">
              <Button
                size="sm"
                className="bg-light-secondary hover:bg-light-secondary/90 text-white rounded-xl text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة سكن جديد
              </Button>
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-light-surface-subtle border-b border-light-outline/70 text-light-on-surface/80 font-bold">
              <tr>
                <th scope="col" className="py-4 px-4 font-bold">
                  العقار والعنوان
                </th>
                <th scope="col" className="py-4 px-4 font-bold hidden sm:table-cell">
                  الحرم الجامعي والحي
                </th>
                <th scope="col" className="py-4 px-4 font-bold hidden md:table-cell">
                  النوع
                </th>
                <th scope="col" className="py-4 px-4 font-bold">
                  الإيجار
                </th>
                <th scope="col" className="py-4 px-4 font-bold hidden lg:table-cell">
                  الأسرّة
                </th>
                <th scope="col" className="py-4 px-4 font-bold">
                  نقرات واتساب
                </th>
                <th scope="col" className="py-4 px-4 font-bold hidden xl:table-cell">
                  بيانات المالك
                </th>
                <th scope="col" className="py-4 px-4 font-bold">
                  حالة النشر
                </th>
                <th scope="col" className="py-4 px-4 font-bold text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline/50">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-light-on-surface/50">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 className="h-10 w-10 text-light-outline" />
                      <p className="text-sm font-semibold text-light-on-surface/70">
                        لا توجد إعلانات سكن مسجلة حالياً
                      </p>
                      <Link href="/admin/dashboard/new">
                        <Button
                          size="sm"
                          className="gap-1.5 bg-light-primary hover:bg-light-primary/90 text-white rounded-xl text-xs font-bold"
                        >
                          <Plus className="h-4 w-4" />
                          إضافة أول سكن الآن
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((property) => {
                  const isSinai = property.area === "al_masaeed" || property.area === "sinai_univ_dist";
                  const imageUrl =
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80";

                  return (
                    <tr
                      key={property.id}
                      className="hover:bg-light-surface-subtle/50 transition-colors"
                    >
                      {/* Property Title & Image */}
                      <td className="py-3.5 px-4 font-medium text-light-primary">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-light-surface-subtle border border-light-outline shrink-0">
                            <Image
                              src={imageUrl}
                              alt={property.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="max-w-[200px] truncate">
                            <Link
                              href={`/property/${property.id}`}
                              target="_blank"
                              className="font-bold text-light-primary hover:text-light-secondary hover:underline block truncate"
                            >
                              {property.title}
                            </Link>
                            <span className="text-[11px] text-light-on-surface/60 font-mono">
                              #{property.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Campus & Distance */}
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isSinai
                                ? "bg-light-primary/10 text-light-primary"
                                : "bg-light-secondary/15 text-light-secondary"
                            }`}
                          >
                            {getAreaLabel(property.area)}
                          </span>
                          <span className="block text-[11px] text-light-on-surface/60">
                            {property.walking_minutes_to_university
                              ? `${property.walking_minutes_to_university} دقيقة مشياً`
                              : (property.location_desc || "قريب من الحرم")}
                          </span>
                        </div>
                      </td>

                      {/* Type & Gender */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                            property.gender === "female"
                              ? "bg-rose-50 border-rose-200 text-rose-800"
                              : "bg-sky-50 border-sky-200 text-sky-800"
                          }`}
                        >
                          {getGenderLabel(property.gender)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-light-primary tabular-nums">
                        {formatPrice(property.price)} ج
                        <span className="text-[10px] text-light-on-surface/50 font-normal block">
                          / شهرياً
                        </span>
                      </td>

                      {/* Beds */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-light-on-surface/70">
                        <span className="font-bold text-emerald-800">
                          {property.available_beds}
                        </span>{" "}
                        / {property.total_beds}
                      </td>

                      {/* WhatsApp Clicks */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <MessageSquare className="h-3 w-3 text-emerald-600" />
                          {clicksMap.get(property.id) || 0}
                        </span>
                      </td>

                      {/* Owner Phone */}
                      <td className="py-3.5 px-4 hidden xl:table-cell text-xs font-mono text-light-on-surface/70">
                        {property.owner_phone ? (
                          <a
                            href={`https://wa.me/${property.owner_phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-whatsapp hover:underline inline-flex items-center gap-1 font-semibold"
                            dir="ltr"
                          >
                            <Phone className="h-3 w-3 text-light-on-surface/40" />
                            {property.owner_phone}
                          </a>
                        ) : (
                          <span className="text-light-outline">—</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <StatusDropdown
                          propertyId={property.id}
                          currentStatus={property.status}
                          totalBeds={property.total_beds}
                          rentalType={property.rental_type}
                        />
                      </td>

                      {/* Management Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <Link
                            href={`/admin/dashboard/${property.id}/edit`}
                            title="تعديل بيانات السكن"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-light-primary hover:text-light-primary hover:bg-light-primary/10 rounded-lg cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link
                            href={`/property/${property.id}`}
                            target="_blank"
                            title="معاينة كطالب"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-light-secondary hover:text-light-secondary hover:bg-light-secondary/10 rounded-lg cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <DeleteButton propertyId={property.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 bg-light-surface-subtle/50 border-t border-light-outline/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-light-on-surface/70">
          <div>
            عرض <strong className="font-bold text-light-primary">{listings.length}</strong> من إجمالي{" "}
            <strong className="font-bold text-light-primary">{listings.length}</strong> عقار مدرج
          </div>
          <div className="flex items-center gap-2">
            <span className="text-light-on-surface/50">لوحة التحكم محدثة مباشرة من Supabase</span>
          </div>
        </div>
      </section>
    </div>
  );
}
