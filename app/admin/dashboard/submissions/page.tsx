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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EBE6DC] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EBE6DC] bg-white text-stone-600 hover:bg-[#FAF7F0] hover:text-stone-900 transition-colors shadow-2xs"
            title="العودة للوحة التحكم"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-stone-900">
              طلبات أصحاب الشقق
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              مراجعة الطلبات المقدمة من أصحاب السكنات لاعتمادها وتحويلها لإعلانات منشورة
            </p>
          </div>
        </div>

        <Link href="/admin/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="border-[#EBE6DC] bg-white hover:bg-[#FAF7F0] text-stone-700 rounded-xl h-9 text-xs font-semibold cursor-pointer"
          >
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            العودة لجدول الإعلانات
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#EBE6DC] bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-500">
            <Inbox className="h-4 w-4 text-stone-600" />
            <span className="text-xs font-bold">إجمالي الطلبات</span>
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">
            {submissions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#B45309]">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold">بانتظار المراجعة</span>
          </div>
          <p className="mt-2 text-2xl font-black text-[#B45309]">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#166534]">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold">تمت الموافقة</span>
          </div>
          <p className="mt-2 text-2xl font-black text-[#166534]">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#EBE6DC] bg-[#FAF7F0]/60 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-stone-500">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-bold">مرفوضة</span>
          </div>
          <p className="mt-2 text-2xl font-black text-stone-700">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-[#EBE6DC] bg-white p-12 text-center space-y-3 shadow-2xs">
          <Inbox className="mx-auto h-12 w-12 text-stone-300" />
          <h3 className="text-base font-bold text-stone-800">
            لا توجد طلبات جديدة حالياً
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            ستظهر هنا أي طلبات يرسلها أصحاب السكنات عبر صفحة «أعلن عن سكنك».
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border border-[#EBE6DC] bg-white p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#EBE6DC]/70 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-stone-900 text-base">
                      {sub.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-bold rounded-lg px-2.5 py-0.5 ${
                        sub.status === "pending"
                          ? "bg-amber-50 text-[#B45309] border-amber-200"
                          : sub.status === "approved"
                          ? "bg-emerald-50 text-[#166534] border-emerald-200"
                          : "bg-stone-100 text-stone-500 border-stone-200"
                      }`}
                    >
                      {sub.status === "pending"
                        ? "قيد المراجعة"
                        : sub.status === "approved"
                        ? "معتمد ومضاف"
                        : "مرفوض"}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-400">
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
                <div className="space-y-1 bg-[#FAF7F0] p-3 rounded-xl border border-[#EBE6DC]/70">
                  <span className="text-stone-400 font-bold text-[11px]">صاحب السكن</span>
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <User className="h-3.5 w-3.5 text-stone-500" />
                    <span>{sub.owner_name}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-[#FAF7F0] p-3 rounded-xl border border-[#EBE6DC]/70">
                  <span className="text-stone-400 font-bold text-[11px]">الهاتف والواتساب</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#0369A1]" dir="ltr">
                    <Phone className="h-3.5 w-3.5 text-[#0369A1]" />
                    <a
                      href={`https://wa.me/${sub.owner_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-mono"
                    >
                      {sub.owner_phone}
                    </a>
                  </div>
                </div>

                <div className="space-y-1 bg-[#FAF7F0] p-3 rounded-xl border border-[#EBE6DC]/70">
                  <span className="text-stone-400 font-bold text-[11px]">المواصفات</span>
                  <p className="font-bold text-stone-800">
                    {getAreaLabel(sub.area)} • {getGenderLabel(sub.gender)} •{" "}
                    {getRentalTypeLabel(sub.rental_type)}
                  </p>
                </div>

                <div className="space-y-1 bg-[#FAF7F0] p-3 rounded-xl border border-[#EBE6DC]/70">
                  <span className="text-stone-400 font-bold text-[11px]">السعر والأسرّة</span>
                  <p className="font-bold text-[#166534]">
                    {formatPrice(sub.price)} ج.م • {sub.rooms_count} غرف • {sub.total_beds} أسرّة
                  </p>
                </div>
              </div>

              {/* Extra notes */}
              {(sub.location_desc || sub.description) && (
                <div className="text-xs text-stone-600 bg-[#FAF7F0]/50 p-3.5 rounded-xl space-y-1.5 border border-[#EBE6DC]/70">
                  {sub.location_desc && (
                    <p>
                      <strong className="text-stone-800 font-bold">الموقع: </strong>
                      {sub.location_desc}
                    </p>
                  )}
                  {sub.description && (
                    <p>
                      <strong className="text-stone-800 font-bold">ملاحظات إضافية: </strong>
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
