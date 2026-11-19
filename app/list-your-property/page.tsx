"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MessageSquare,
  Building,
  Home,
  Bed,
  CheckCircle2,
  ChevronLeft,
  User,
  MapPin,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getWhatsAppNumber } from "@/lib/utils";

const formSchema = z
  .object({
    owner_name: z
      .string()
      .trim()
      .min(2, "يرجى كتابة اسم صاحب السكن بالكامل (حرفين على الأقل)"),
    area: z.enum(["sinai_masaeed", "arish_dahiya"], {
      message: "يرجى اختيار الجامعة أو المنطقة الأقرب",
    }),
    accommodation_type: z.enum(["full_apartment", "private_room", "shared_bed"], {
      message: "يرجى اختيار نوع السكن",
    }),
    target_audience: z.enum(["male", "female", "both"], {
      message: "يرجى تحديد الفئة المناسبة للسكن",
    }),
    price: z
      .number({ message: "يرجى كتابة الإيجار الشهري" })
      .positive("الإيجار يجب أن يكون أكبر من صفر"),
    available_beds: z
      .number()
      .int("يجب أن يكون رقماً صحيحاً")
      .positive("عدد الأسرة المتاحة يجب أن يكون 1 على الأقل")
      .optional(),
    occupants_count: z
      .number()
      .int("يجب أن يكون رقماً صحيحاً")
      .positive("عدد الأفراد يجب أن يكون 1 على الأقل")
      .optional(),
    additional_details: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.accommodation_type === "shared_bed") {
        return typeof data.available_beds === "number" && data.available_beds >= 1;
      }
      return true;
    },
    {
      message: "يرجى تحديد عدد الأسرة المتاحة في الغرفة المشتركة",
      path: ["available_beds"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const areaLabels: Record<string, string> = {
  sinai_masaeed: "جامعة سيناء – المساعيد",
  arish_dahiya: "جامعة العريش – الضاحية",
};

const accommodationLabels: Record<string, string> = {
  full_apartment: "شقة كاملة",
  private_room: "غرفة مستقلة",
  shared_bed: "سرير في غرفة مشتركة",
};

const audienceLabels: Record<string, string> = {
  male: "طلاب",
  female: "طالبات",
  both: "طلاب وطالبات",
};

function buildWhatsAppMessage(data: FormValues): string {
  const lines: string[] = [
    "السلام عليكم، أرغب في إضافة سكن على منصة سكن طلاب العريش.",
    "",
    "بيانات السكن:",
    "",
    `اسم صاحب السكن: ${data.owner_name.trim()}`,
    `الجامعة الأقرب: ${areaLabels[data.area] || data.area}`,
    `نوع السكن: ${accommodationLabels[data.accommodation_type] || data.accommodation_type}`,
    `السكن مناسب لـ: ${audienceLabels[data.target_audience] || data.target_audience}`,
    `الإيجار الشهري: ${data.price} جنيه`,
  ];

  if (data.accommodation_type === "shared_bed" && data.available_beds) {
    lines.push(`عدد الأسرة المتاحة: ${data.available_beds}`);
  } else if (data.accommodation_type === "private_room" && data.occupants_count) {
    lines.push(`عدد الأفراد المناسب للغرفة: ${data.occupants_count}`);
  }

  if (data.additional_details && data.additional_details.trim()) {
    lines.push(`تفاصيل إضافية: ${data.additional_details.trim()}`);
  }

  lines.push("", "أرجو التواصل معي لاستكمال إجراءات إضافة السكن.");

  return lines.join("\n");
}

export default function ListYourPropertyPage() {
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner_name: "",
      area: "sinai_masaeed",
      accommodation_type: "full_apartment",
      target_audience: "male",
      price: 1300,
      available_beds: 2,
      occupants_count: 1,
      additional_details: "",
    },
  });

  const watchedArea = watch("area");
  const watchedAccommodationType = watch("accommodation_type");
  const watchedTargetAudience = watch("target_audience");

  const onSubmit = (data: FormValues) => {
    const rawNumber = getWhatsAppNumber();
    const cleanNumber = rawNumber.replace(/\D/g, "") || "201012345678";
    const message = buildWhatsAppMessage(data);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    setSubmittedMessage(message);
    setSubmittedUrl(whatsappUrl);

    // Open WhatsApp directly
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Screen: Success / Direct WhatsApp Trigger
  if (submittedUrl && submittedMessage) {
    return (
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full text-right">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold">
              <Check className="h-3.5 w-3.5" />
              تم تجهيز رسالة الواتساب بنجاح
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D3B4C]">
              بيانات السكن جاهزة للإرسال
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              تم تجهيز رسالة الواتساب بكافة تفاصيل السكن للتواصل مع المشرف العام. إذا لم يفتح تطبيق واتساب تلقائياً، اضغط على الزر أدناه لإرسال الرسالة.
            </p>
          </div>

          {/* Primary WhatsApp Action */}
          <div className="space-y-3">
            <a
              href={submittedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="h-5 w-5" />
              <span>فتح محادثة واتساب مع المشرف الآن</span>
            </a>
            <p className="text-[11px] text-center text-slate-400">
              سيتم فتح تطبيق واتساب مباشرة مع تجهيز الرسالة، اضغط على زر الإرسال (Send) داخل المحادثة.
            </p>
          </div>

          {/* Message Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-right space-y-2">
            <h3 className="text-xs font-bold text-[#0D3B4C] flex items-center gap-1.5">
              <span>معاينة نص الرسالة المرسلة:</span>
            </h3>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
              {submittedMessage}
            </pre>
          </div>

          {/* Secondary Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubmittedUrl(null);
                setSubmittedMessage(null);
              }}
              className="w-full sm:w-auto rounded-xl border-slate-300 text-slate-700 text-xs font-bold h-10 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>تعديل البيانات أو إضافة سكن آخر</span>
            </Button>

            <Link
              href="/"
              className="w-full sm:w-auto text-center text-xs font-bold text-slate-500 hover:text-[#0D3B4C] transition-colors py-2"
            >
              العودة لتصفح السكنات
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Screen: Simplified Submission Form
  return (
    <main className="flex-1 py-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-right space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-[#0D3B4C] transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-[#0D3B4C] font-bold">إضافة سكن جديد</span>
      </nav>

      {/* Intro Header */}
      <div className="bg-gradient-to-r from-[#0D3B4C] via-[#0D3B4C] to-[#0F766E] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold shadow-xs">
          <MessageSquare className="h-3.5 w-3.5" />
          تواصل مباشر مع المشرف عبر واتساب
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          أضف عقارك كسكن لطلاب العريش
        </h1>
        <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl">
          املأ البيانات الأساسية للسكن، وسنساعدك في عرضه على طلاب العريش. بعد إرسال بياناتك عبر واتساب، ستتواصل معك إدارة المنصة لمراجعة السكن.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {/* 1. Owner Name */}
          <div className="space-y-1.5">
            <Label htmlFor="owner_name" className="text-xs font-bold text-slate-800">
              اسم صاحب السكن بالكامل *
            </Label>
            <div className="relative flex items-center">
              <User className="absolute right-3.5 text-slate-400 h-4 w-4 pointer-events-none" />
              <Input
                id="owner_name"
                required
                placeholder="مثال: أحمد محمد"
                className="pr-11 pl-4 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                {...register("owner_name")}
              />
            </div>
            {errors.owner_name && (
              <p className="text-xs text-rose-600 font-medium">{errors.owner_name.message}</p>
            )}
          </div>

          {/* 2. Nearest University / Area */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-800">
              الجامعة أو المنطقة الأقرب *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("area", "sinai_masaeed")}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  watchedArea === "sinai_masaeed"
                    ? "border-[#0F766E] bg-teal-50/50 ring-2 ring-[#0F766E]/20 text-[#0D3B4C]"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      watchedArea === "sinai_masaeed"
                        ? "bg-[#0F766E] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">
                      جامعة سيناء – المساعيد
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      منطقة المساعيد وشارع البحر
                    </span>
                  </div>
                </div>
                {watchedArea === "sinai_masaeed" && (
                  <Check className="h-4 w-4 text-[#0F766E] shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setValue("area", "arish_dahiya")}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  watchedArea === "arish_dahiya"
                    ? "border-[#0F766E] bg-teal-50/50 ring-2 ring-[#0F766E]/20 text-[#0D3B4C]"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      watchedArea === "arish_dahiya"
                        ? "bg-[#0F766E] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">
                      جامعة العريش – الضاحية
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      منطقة ضاحية السلام والمحافظة
                    </span>
                  </div>
                </div>
                {watchedArea === "arish_dahiya" && (
                  <Check className="h-4 w-4 text-[#0F766E] shrink-0" />
                )}
              </button>
            </div>
            {errors.area && (
              <p className="text-xs text-rose-600 font-medium">{errors.area.message}</p>
            )}
          </div>

          {/* 3. Accommodation Type */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-800">
              نوع السكن *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Full Apartment */}
              <button
                type="button"
                onClick={() => setValue("accommodation_type", "full_apartment")}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  watchedAccommodationType === "full_apartment"
                    ? "border-[#0F766E] bg-teal-50/50 ring-2 ring-[#0F766E]/20 text-[#0D3B4C]"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      watchedAccommodationType === "full_apartment"
                        ? "bg-[#0F766E] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Building className="h-5 w-5" />
                  </div>
                  {watchedAccommodationType === "full_apartment" && (
                    <Check className="h-4 w-4 text-[#0F766E]" />
                  )}
                </div>
                <div>
                  <strong className="font-bold text-sm block">شقة كاملة</strong>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                    الشقة بالكامل معروضة للإيجار
                  </span>
                </div>
              </button>

              {/* Option 2: Private Room */}
              <button
                type="button"
                onClick={() => setValue("accommodation_type", "private_room")}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  watchedAccommodationType === "private_room"
                    ? "border-[#0F766E] bg-teal-50/50 ring-2 ring-[#0F766E]/20 text-[#0D3B4C]"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      watchedAccommodationType === "private_room"
                        ? "bg-[#0F766E] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Home className="h-5 w-5" />
                  </div>
                  {watchedAccommodationType === "private_room" && (
                    <Check className="h-4 w-4 text-[#0F766E]" />
                  )}
                </div>
                <div>
                  <strong className="font-bold text-sm block">غرفة مستقلة</strong>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                    غرفة خاصة لطالب (مرافق مشتركة)
                  </span>
                </div>
              </button>

              {/* Option 3: Bed in Shared Room */}
              <button
                type="button"
                onClick={() => setValue("accommodation_type", "shared_bed")}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  watchedAccommodationType === "shared_bed"
                    ? "border-[#0F766E] bg-teal-50/50 ring-2 ring-[#0F766E]/20 text-[#0D3B4C]"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      watchedAccommodationType === "shared_bed"
                        ? "bg-[#0F766E] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Bed className="h-5 w-5" />
                  </div>
                  {watchedAccommodationType === "shared_bed" && (
                    <Check className="h-4 w-4 text-[#0F766E]" />
                  )}
                </div>
                <div>
                  <strong className="font-bold text-sm block">سرير في غرفة مشتركة</strong>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                    سرير فردي داخل غرفة مشتركة
                  </span>
                </div>
              </button>
            </div>
            {errors.accommodation_type && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.accommodation_type.message}
              </p>
            )}
          </div>

          {/* Conditional Field: Available beds when Bed in Shared Room */}
          {watchedAccommodationType === "shared_bed" && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 transition-all">
              <Label htmlFor="available_beds" className="text-xs font-bold text-slate-900 block">
                عدد الأسرة المتاحة *
              </Label>
              <Input
                id="available_beds"
                type="number"
                min={1}
                required
                placeholder="مثال: 2"
                className="h-11 rounded-xl border-amber-200 bg-white text-slate-900 font-bold focus:border-[#0D3B4C]"
                {...register("available_beds", { valueAsNumber: true })}
              />
              <span className="text-[11px] text-slate-600 block">
                حدد عدد الأسرة الشاغرة المتاحة للتسكين حالياً في هذه الغرفة.
              </span>
              {errors.available_beds && (
                <p className="text-xs text-rose-600 font-medium">
                  {errors.available_beds.message}
                </p>
              )}
            </div>
          )}

          {/* Conditional Field: Suitable occupants when Private Room */}
          {watchedAccommodationType === "private_room" && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 transition-all">
              <Label htmlFor="occupants_count" className="text-xs font-bold text-slate-800 block">
                عدد الأفراد المناسب للغرفة (اختياري)
              </Label>
              <Input
                id="occupants_count"
                type="number"
                min={1}
                placeholder="مثال: فرد واحد (أو 2)"
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 focus:border-[#0D3B4C]"
                {...register("occupants_count", { valueAsNumber: true })}
              />
              <span className="text-[11px] text-slate-500 block">
                هل الغرفة مناسبة لطالب واحد أم يمكن أن تستوعب طالبين؟
              </span>
            </div>
          )}

          {/* 4. Target Audience */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-800">
              السكن مناسب لمين؟ (الفئة المستهدفة) *
            </Label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <button
                type="button"
                onClick={() => setValue("target_audience", "male")}
                className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  watchedTargetAudience === "male"
                    ? "border-[#0D3B4C] bg-[#0D3B4C] text-white font-bold shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
                }`}
              >
                <span className="text-xs sm:text-sm block">طلاب (شباب)</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("target_audience", "female")}
                className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  watchedTargetAudience === "female"
                    ? "border-[#0D3B4C] bg-[#0D3B4C] text-white font-bold shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
                }`}
              >
                <span className="text-xs sm:text-sm block">طالبات (بنات)</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("target_audience", "both")}
                className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  watchedTargetAudience === "both"
                    ? "border-[#0D3B4C] bg-[#0D3B4C] text-white font-bold shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
                }`}
              >
                <span className="text-xs sm:text-sm block">طلاب وطالبات</span>
              </button>
            </div>
            {errors.target_audience && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.target_audience.message}
              </p>
            )}
          </div>

          {/* 5. Monthly Rent */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-bold text-slate-800">
              الإيجار الشهري بالجنيه المصري *
            </Label>
            <div className="relative flex items-center">
              <Input
                id="price"
                type="number"
                required
                min={1}
                placeholder="مثال: 1300"
                className="pl-20 pr-4 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-base focus:bg-white focus:border-[#0D3B4C]"
                {...register("price", { valueAsNumber: true })}
              />
              <span className="absolute left-4 text-xs font-bold text-slate-500 pointer-events-none">
                ج.م / شهرياً
              </span>
            </div>
            {errors.price && (
              <p className="text-xs text-rose-600 font-medium">{errors.price.message}</p>
            )}
          </div>

          {/* 6. Optional Additional Details */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <Label htmlFor="additional_details" className="text-xs font-bold text-slate-800">
              تفاصيل إضافية (اختياري)
            </Label>
            <Textarea
              id="additional_details"
              rows={3}
              placeholder="مثال: الغرفة مفروشة وقريبة من الجامعة، تكييف، واي فاي، سخان، عداد كهرباء كارت..."
              className="p-3.5 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C] text-xs leading-relaxed"
              {...register("additional_details")}
            />
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#16A34A]/40 shadow-xs space-y-4">
          <Button
            type="submit"
            className="w-full h-13 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="h-5 w-5" />
            <span>إرسال بيانات السكن عبر واتساب</span>
          </Button>

          <p className="text-center text-[11px] sm:text-xs text-slate-500 leading-relaxed">
            بالضغط على الزر، سيتم فتح محادثة مباشرة مع مشرف منصة سكن طلاب العريش عبر واتساب مع رسالة جاهزة تتضمن كافة البيانات لمراجعتها واعتماد السكن.
          </p>
        </div>
      </form>
    </main>
  );
}
