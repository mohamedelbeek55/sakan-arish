import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Home,
  User,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllSubmissions } from "@/lib/submissions-store";
import {
  formatPrice,
  getAreaLabel,
  getGenderLabel,
  getRentalTypeLabel,
} from "@/lib/utils";
import SubmissionActions from "./SubmissionActions";

export default async function AdminSubmissionsPage() {
  await requireAdmin();
  const submissions = await getAllSubmissions();

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              طلبات إعلان السكن (Submissions)
            </h1>
            <p className="text-xs text-slate-500">
              إدارة الطلبات المقدمة من أصحاب الشقق لاعتمادها ونشرها على المنصة
            </p>
          </div>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs h-9">
            العودة للوحة الإعلانات
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Inbox className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-medium">إجمالي الطلبات</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {submissions.length}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium">بانتظار المراجعة</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-800">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium">تمت الموافقة</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-medium">مرفوضة</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-700">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Inbox className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-800">
            لا توجد طلبات جديدة حالياً
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ستظهر هنا أي طلبات يرسلها أصحاب السكنات عبر صفحة «أعلن عن سكنك».
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {sub.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        sub.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : sub.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {sub.status === "pending"
                        ? "قيد المراجعة"
                        : sub.status === "approved"
                        ? "معتمد"
                        : "مرفوض"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    تاريخ الطلب:{" "}
                    {new Date(sub.created_at).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <SubmissionActions
                  submissionId={sub.id}
                  status={sub.status}
                />
              </div>

              {/* Grid of details */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">صاحب السكن</span>
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span>{sub.owner_name}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">الهاتف والواتساب</span>
                  <div className="flex items-center gap-1.5 font-bold text-teal-700" dir="ltr">
                    <Phone className="h-3.5 w-3.5 text-teal-600" />
                    <a
                      href={`https://wa.me/${sub.owner_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {sub.owner_phone}
                    </a>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">المواصفات</span>
                  <p className="font-semibold text-slate-800">
                    {getAreaLabel(sub.area)} • {getGenderLabel(sub.gender)} •{" "}
                    {getRentalTypeLabel(sub.rental_type)}
                  </p>
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium">السعر والأسرّة</span>
                  <p className="font-bold text-teal-800">
                    {formatPrice(sub.price)} ج.م • {sub.rooms_count} غرف • {sub.total_beds} أسرّة
                  </p>
                </div>
              </div>

              {/* Extra notes */}
              {(sub.location_desc || sub.description) && (
                <div className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg space-y-1 border border-slate-100">
                  {sub.location_desc && (
                    <p>
                      <strong className="text-slate-700">الموقع: </strong>
                      {sub.location_desc}
                    </p>
                  )}
                  {sub.description && (
                    <p>
                      <strong className="text-slate-700">ملاحظات إضافية: </strong>
                      {sub.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
