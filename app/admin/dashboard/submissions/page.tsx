import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Inbox,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Alert and Header (Stitch Screen 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-outline/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="font-headline text-2xl sm:text-3xl font-black text-light-primary">
              مراجعة واعتماد طلبات الملاك الجدد
            </h1>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
              {pendingCount} طلبات معلقة
            </span>
          </div>
          <p className="text-sm text-light-on-surface/70 max-w-2xl leading-relaxed">
            فحص وتدقيق بيانات الشقق المرفوعة من أصحاب العقارات في العريش واعتماد نشرها للطلاب أو رفضها للتعديل.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard">
            <Button
              variant="outline"
              size="default"
              className="border-light-outline bg-white hover:bg-light-surface-subtle text-light-primary rounded-xl text-xs font-bold cursor-pointer gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة لجدول العقارات</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards (Stitch Screen 7) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-light-outline/70 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-light-on-surface/60">
            <Inbox className="h-4 w-4 text-light-primary" />
            <span className="text-xs font-bold">إجمالي الطلبات</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-light-primary">
            {submissions.length}
          </p>
        </div>

        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900">
            <Clock className="h-4 w-4 text-amber-700" />
            <span className="text-xs font-bold">بانتظار المراجعة</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-900">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle className="h-4 w-4 text-emerald-700" />
            <span className="text-xs font-bold">تمت الموافقة</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-900">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-light-outline/70 bg-stone-50 p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-light-on-surface/60">
            <XCircle className="h-4 w-4 text-rose-600" />
            <span className="text-xs font-bold">مرفوضة للتعديل</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-stone-700">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Submissions Cards Grid / Inspection List (Stitch Screen 7) */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-light-outline/70 bg-white p-12 text-center space-y-3 shadow-2xs">
          <Inbox className="mx-auto h-12 w-12 text-light-outline" />
          <h3 className="text-base font-bold text-light-primary">
            لا توجد طلبات إدراج جديدة حالياً
          </h3>
          <p className="text-xs text-light-on-surface/60 max-w-sm mx-auto leading-relaxed">
            ستظهر هنا أي طلبات يرسلها أصحاب السكنات عبر صفحة «أضف سكنك» للمراجعة والتدقيق والاعتماد.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => {
            const isPending = sub.status === "pending";
            const isSinai = sub.area === "al_masaeed";
            const defaultThumbnail = isSinai
              ? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80";

            return (
              <article
                key={sub.id}
                className={`bg-white rounded-2xl shadow-2xs p-6 relative transition-all ${
                  isPending
                    ? "border-2 border-amber-300"
                    : "border border-light-outline/70"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Thumbnail & Status Overlay */}
                  <div className="lg:w-72 shrink-0">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-light-surface-subtle border border-light-outline mb-2">
                      <Image
                        src={defaultThumbnail}
                        alt={sub.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 288px"
                      />
                      <span
                        className={`absolute top-2.5 right-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
                          isPending
                            ? "bg-amber-500 text-white"
                            : sub.status === "approved"
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-500 text-white"
                        }`}
                      >
                        {isPending
                          ? "بانتظار المراجعة"
                          : sub.status === "approved"
                          ? "معتمد ومنشور"
                          : "مرفوض"}
                      </span>
                      <span className="absolute bottom-2.5 left-2.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
                        {sub.rooms_count} غرف • {sub.total_beds} أسرّة
                      </span>
                    </div>
                  </div>

                  {/* Submission Details Body */}
                  <div className="flex-1 space-y-4 text-right">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block mb-1.5 ${
                            isSinai
                              ? "bg-light-primary/10 text-light-primary"
                              : "bg-light-secondary/15 text-light-secondary"
                          }`}
                        >
                          {getAreaLabel(sub.area)}
                        </span>
                        <h3 className="font-headline text-lg sm:text-xl text-light-primary font-bold">
                          {sub.title}
                        </h3>
                        <span className="text-xs text-light-on-surface/60 flex items-center gap-1.5 mt-1 font-mono">
                          <Calendar className="h-3.5 w-3.5 text-light-secondary" />
                          تاريخ التقديم:{" "}
                          {new Date(sub.created_at).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="bg-light-surface-subtle p-3 rounded-xl border border-light-outline text-left shrink-0">
                        <span className="text-[11px] text-light-on-surface/60 block">
                          الإيجار المطلوب
                        </span>
                        <span className="font-headline font-black text-xl text-light-primary tabular-nums">
                          {formatPrice(sub.price)} ج.م
                        </span>
                        <span className="text-[10px] text-light-on-surface/60 block">
                          شهرياً / للسرير
                        </span>
                      </div>
                    </div>

                    {/* Landlord Contact and Property Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-light-surface-subtle/70 border border-light-outline/60 text-xs">
                      <div>
                        <span className="text-light-on-surface/60 block text-[11px] mb-0.5">
                          المالك ومقدم الطلب:
                        </span>
                        <span className="font-bold text-light-primary">
                          {sub.owner_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-light-on-surface/60 block text-[11px] mb-0.5">
                          رقم الواتساب المسجل:
                        </span>
                        <a
                          href={`https://wa.me/${sub.owner_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold font-mono text-whatsapp hover:underline flex items-center gap-1"
                          dir="ltr"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {sub.owner_phone}
                        </a>
                      </div>
                      <div>
                        <span className="text-light-on-surface/60 block text-[11px] mb-0.5">
                          نوع التسكين:
                        </span>
                        <span className="font-bold text-light-secondary">
                          {getGenderLabel(sub.gender)} • {getRentalTypeLabel(sub.rental_type)}
                        </span>
                      </div>
                    </div>

                    {/* Description & Location Notes */}
                    {(sub.location_desc || sub.description) && (
                      <div className="text-xs text-light-on-surface/80 leading-relaxed bg-white p-3 rounded-xl border border-light-outline/60 space-y-1">
                        {sub.location_desc && (
                          <p>
                            <strong className="font-bold text-light-primary">
                              وصف الموقع والمسافة:{" "}
                            </strong>
                            {sub.location_desc}
                          </p>
                        )}
                        {sub.description && (
                          <p>
                            <strong className="font-bold text-light-primary">
                              ملاحظات المالك وتجهيزات الشقة:{" "}
                            </strong>
                            {sub.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Review Actions (Approve / Reject / Contact) */}
                    <div className="pt-3 border-t border-light-outline/60 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${sub.owner_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `مرحباً ${sub.owner_name}، بخصوص طلب إضافة عقار "${sub.title}" على منصة سكن طلاب العريش`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-whatsapp/15 text-whatsapp hover:bg-whatsapp/25 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>محادثة المالك واتساب للتحقق</span>
                        </a>
                      </div>

                      <SubmissionActions
                        submissionId={sub.id}
                        status={sub.status}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
