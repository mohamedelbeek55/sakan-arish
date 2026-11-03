import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            إدارة إعلانات السكن والطلبات الواردة وإحصائيات التفاعل
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/dashboard/submissions">
            <Button
              variant="outline"
              size="sm"
              className="relative gap-1.5 border-teal-200 bg-teal-50/50 text-teal-800 hover:bg-teal-100"
            >
              <Inbox className="h-4 w-4 text-teal-600" />
              طلبات الإعلان
              {pendingSubmissionsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                  {pendingSubmissionsCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4" />
              الرئيسية
            </Button>
          </Link>
          <Link href="/admin/dashboard/new">
            <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
              <Plus className="h-4 w-4" />
              إضافة سكن جديد
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalListings}
                </p>
                <p className="text-xs text-slate-500">إجمالي الإعلانات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">
                  {availableCount}
                </p>
                <p className="text-xs text-slate-500">متاح</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">
                  {oneBedCount}
                </p>
                <p className="text-xs text-slate-500">متبقي سرير واحد</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-500">
                  {bookedCount}
                </p>
                <p className="text-xs text-slate-500">محجوز بالكامل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Clicks Card */}
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/20 text-[#25D366]">
                <MessageSquare className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">
                  {totalClicks}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  نقرات حجز واتساب
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  الكود
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  العنوان
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 hidden sm:table-cell">
                  المنطقة
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 hidden md:table-cell">
                  النوع
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 hidden md:table-cell">
                  السعر
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 hidden lg:table-cell">
                  الأسرّة
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  نقرات واتساب
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 hidden xl:table-cell">
                  هاتف المالك
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 className="h-10 w-10 text-slate-300" />
                      <p className="text-base font-medium text-slate-600">
                        لا توجد إعلانات حالياً في قاعدة البيانات
                      </p>
                      <Link href="/admin/dashboard/new">
                        <Button size="sm" className="gap-1.5">
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
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                      {property.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">
                      {property.title}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" className="text-[11px]">
                        {getAreaLabel(property.area)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[11px]">
                        {getGenderLabel(property.gender)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-700 font-semibold">
                      {formatPrice(property.price)} ج
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-600">
                      <span className="font-bold text-emerald-700">
                        {property.available_beds}
                      </span>{" "}
                      / {property.total_beds}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        📞 {clicksMap.get(property.id) || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs font-mono text-slate-600">
                      {property.owner_phone ? (
                        <a
                          href={`https://wa.me/${property.owner_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-teal-700 hover:underline flex items-center gap-1"
                          dir="ltr"
                        >
                          <Phone className="h-3 w-3 text-slate-400" />
                          {property.owner_phone}
                        </a>
                      ) : (
                        "—"
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
                            className="h-8 w-8 text-slate-500 hover:text-teal-700 cursor-pointer"
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
                            className="h-8 w-8 text-slate-500 hover:text-blue-700 cursor-pointer"
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
