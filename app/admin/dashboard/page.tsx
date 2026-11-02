import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Home,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
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
  getRentalTypePriceLabel,
} from "@/lib/utils";
import type { Property } from "@/components/property/PropertyCard";
import { getAllProperties } from "@/lib/properties-store";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "true";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !hasAdminCookie) {
    redirect("/admin/login");
  }

  const listings = await getAllProperties();
  const totalListings = listings.length;
  const availableCount = listings.filter(
    (p) => p.status === "available"
  ).length;
  const oneBedCount = listings.filter(
    (p) => p.status === "one_bed_left"
  ).length;
  const bookedCount = listings.filter((p) => p.status === "booked").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            إدارة السكنات والإعلانات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4" />
              الرئيسية
            </Button>
          </Link>
          <Link href="/admin/dashboard/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              إضافة سكن
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    colSpan={7}
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
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {property.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
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
                    <td className="px-4 py-3 hidden md:table-cell text-slate-700">
                      {formatPrice(property.price)} ج
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown
                        propertyId={property.id}
                        currentStatus={property.status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/property/${property.id}`}
                          target="_blank"
                          title="معاينة كما يراها الطالب"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-teal-700">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link
                          href={`/admin/dashboard/${property.id}/edit`}
                          title="تعديل السكن"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-700">
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
