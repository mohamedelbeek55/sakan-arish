import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  Building2,
  Plus,
  Pencil,
  Home,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  MessageSquare,
  Inbox,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusDropdown from "@/components/admin/StatusDropdown";
import DeleteButton from "./DeleteButton";
import LogoutButton from "./LogoutButton";
import {
  formatPrice,
  getAreaLabel,
  getGenderLabel,
} from "@/lib/utils";
import type { Property } from "@/components/property/PropertyCard";
import { getAllProperties } from "@/lib/properties-store";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireAdmin();

  // Load properties with admin privileges (includes owner_phone)
  const listings = await getAllProperties({ forAdmin: true });
  const totalListings = listings.length;
  const availableCount = listings.filter(
    (p) => p.status === "available"
  ).length;
  const oneBedCount = listings.filter(
    (p) => p.status === "one_bed_left"
  ).length;
  const bookedCount = listings.filter((p) => p.status === "booked").length;

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
    // If table doesn't exist yet, gracefully fallback
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EBE6DC] pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">لوحة تحكم السكنات</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            متابعة حالة الوحدات، وتعديل بيانات السكن، ومراقبة نقرات حجز الواتساب
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard/new">
            <Button
              size="sm"
              className="bg-[#0369A1] hover:bg-[#0284C7] text-white rounded-xl h-9 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              إضافة سكن جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Warm Coastal Palette */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-2xl border border-[#EBE6DC] bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0369A1] border border-sky-100">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-stone-900">
                  {totalListings}
                </p>
                <p className="text-xs text-stone-500 font-medium">إجمالي الإعلانات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100/70 text-[#166534]">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#166534]">
                  {availableCount}
                </p>
                <p className="text-xs text-emerald-800 font-medium">سكن متاح</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100/70 text-[#B45309]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#B45309]">
                  {oneBedCount}
                </p>
                <p className="text-xs text-amber-800 font-medium">متبقي سرير واحد</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-[#EBE6DC] bg-[#FAF7F0]/60 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-200/70 text-stone-600">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-stone-600">
                  {bookedCount}
                </p>
                <p className="text-xs text-stone-500 font-medium">محجوز بالكامل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Clicks Card */}
        <Card className="rounded-2xl border border-emerald-200 bg-[#F0FDF4] shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366]/20 text-[#166534]">
                <MessageSquare className="h-5 w-5 text-[#166534]" />
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-950">
                  {totalClicks}
                </p>
                <p className="text-xs text-emerald-800 font-bold">
                  نقرات حجز واتساب
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <Card className="rounded-2xl border border-[#EBE6DC] bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBE6DC] bg-[#FAF7F0]">
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs">
                  الكود
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs">
                  العنوان
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs hidden sm:table-cell">
                  المنطقة
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs hidden md:table-cell">
                  النوع
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs hidden md:table-cell">
                  السعر
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs hidden lg:table-cell">
                  الأسرّة
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs">
                  نقرات واتساب
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs hidden xl:table-cell">
                  هاتف المالك
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs">
                  الحالة
                </th>
                <th className="px-4 py-3.5 text-right font-bold text-stone-700 text-xs">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-16 text-center text-stone-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 className="h-10 w-10 text-stone-300" />
                      <p className="text-sm font-semibold text-stone-600">
                        لا توجد إعلانات سكن مسجلة حالياً
                      </p>
                      <Link href="/admin/dashboard/new">
                        <Button size="sm" className="gap-1.5 bg-[#0369A1] hover:bg-[#0284C7] text-white rounded-xl text-xs font-bold">
                          <Plus className="h-4 w-4" />
                          إضافة أول سكن الآن
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-[#EBE6DC]/80 hover:bg-[#FAF7F0]/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-stone-800">
                      {property.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-900 max-w-[180px] truncate text-xs">
                      {property.title}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center rounded-md bg-sky-50 border border-sky-200/80 px-2 py-0.5 text-[11px] font-bold text-[#0369A1]">
                        {getAreaLabel(property.area)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                          property.gender === "female"
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : "bg-sky-50 border-sky-200 text-sky-800"
                        }`}
                      >
                        {getGenderLabel(property.gender)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-stone-900 font-bold text-xs">
                      {formatPrice(property.price)} ج
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-stone-600">
                      <span className="font-bold text-[#166534]">
                        {property.available_beds}
                      </span>{" "}
                      / {property.total_beds}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-xs font-bold text-[#166534]">
                        📞 {clicksMap.get(property.id) || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs font-mono text-stone-600">
                      {property.owner_phone ? (
                        <a
                          href={`https://wa.me/${property.owner_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#0369A1] hover:underline flex items-center gap-1 font-semibold"
                          dir="ltr"
                        >
                          <Phone className="h-3 w-3 text-stone-400" />
                          {property.owner_phone}
                        </a>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown
                        propertyId={property.id}
                        currentStatus={property.status}
                        totalBeds={property.total_beds}
                        rentalType={property.rental_type}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/property/${property.id}`}
                          target="_blank"
                          title="معاينة كما يراها الطالب"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-500 hover:text-[#0369A1] hover:bg-sky-50 rounded-lg cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link
                          href={`/admin/dashboard/${property.id}/edit`}
                          title="تعديل السكن"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-500 hover:text-[#0369A1] hover:bg-sky-50 rounded-lg cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <DeleteButton propertyId={property.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
