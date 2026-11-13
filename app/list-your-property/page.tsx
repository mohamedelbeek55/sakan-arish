"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Loader2,
  Phone,
  User,
  MessageSquare,
  ShieldCheck,
  Send,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitPropertyAction } from "@/app/actions/submission";
import { getWhatsAppNumber } from "@/lib/utils";

const formSchema = z.object({
  owner_name: z.string().min(2, "يرجى إدخال اسمك الكريم"),
  owner_phone: z.string().min(10, "يرجى إدخال رقم هاتف صحيح"),
  title: z.string().min(3, "يرجى كتابة عنوان مختصر للسكن"),
  area: z.enum(["al_masaeed", "al_dahiya"], {
    message: "يرجى اختيار المنطقة",
  }),
  gender: z.enum(["male", "female"], {
    message: "يرجى تحديد الفئة",
  }),
  rental_type: z.enum(["bed", "room", "full_apartment"], {
    message: "يرجى تحديد نوع الإيجار",
  }),
  price: z.number({ message: "السعر مطلوب" }).positive("السعر يجب أن يكون أكبر من صفر"),
  rooms_count: z.number().int().min(1, "عدد الغرف يجب أن يكون 1 على الأقل"),
  total_beds: z.number().int().min(1, "إجمالي الأسرّة يجب أن يكون 1 على الأقل"),
  available_beds: z.number().int().min(0, "الأسرّة المتاحة لا يمكن أن تكون سالبة"),
  walking_minutes_to_university: z
    .number()
    .int()
    .min(0)
    .max(120)
    .optional(),
  location_desc: z.string().optional(),
  description: z.string().optional(),
  hp_website: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ListYourPropertyPage() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);

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
      owner_phone: "",
      title: "",
      area: "al_masaeed",
      gender: "male",
      rental_type: "bed",
      price: 1300,
      rooms_count: 3,
      total_beds: 4,
      available_beds: 4,
      walking_minutes_to_university: 5,
      location_desc: "",
      description: "",
      hp_website: "",
    },
  });

  const watchedArea = watch("area");
  const watchedGender = watch("gender");
  const watchedRentalType = watch("rental_type");

  let whatsappNumber = "201012345678";
  try {
    whatsappNumber = getWhatsAppNumber();
  } catch {
    // fallback
  }

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitPropertyAction(data);
      if (result.success) {
        setSubmittedData(data);
        setSubmitted(true);
      } else {
        setServerError(result.error || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.");
      }
    });
  };

  // Screen 4: Success confirmation screen matching Stitch
  if (submitted) {
    const message = `السلام عليكم ورحمة الله،
أرغب في إضافة عقار جديد في منصة سكن طلاب العريش:

🏢 بيانات العقار:
- الجامعة الأقرب: ${submittedData?.area === "al_masaeed" ? "جامعة سيناء — المساعيد" : "جامعة العريش — الضاحية"}
- العنوان: ${submittedData?.location_desc || submittedData?.title || ""}
- المسافة للجامعة: ${submittedData?.walking_minutes_to_university || 5} دقائق مشياً

🛏️ مواصفات التسكين:
- الفئة المستهدفة: ${submittedData?.gender === "female" ? "سكن طالبات" : "سكن شباب"}
- نوع الغرفة: ${submittedData?.rental_type === "room" ? "غرفة خاصة" : submittedData?.rental_type === "full_apartment" ? "شقة كاملة" : "سرير في غرفة"}
- الإيجار المطلوب: ${submittedData?.price || 0} ج.م شهرياً

👤 بيانات المالك:
- الاسم: ${submittedData?.owner_name || ""}
- هاتف التواصل: ${submittedData?.owner_phone || ""}

📝 ملاحظات إضافية:
${submittedData?.description || ""}

برجاء مراجعة البيانات واعتماد نشر السكن في لوحة المشرفين.`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 py-14">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 text-center">
          {/* WhatsApp Connected Success Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold mb-3">
            <Check className="h-3.5 w-3.5" />
            تم توجيه تفاصيل العقار إلى واتساب المشرف مباشرة
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0D3B4C] mb-3">
            تم إرسال العقار لمشرف المنصة بنجاح!
          </h1>

          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
            وصلت تفاصيل السكن بالكامل إلى محادثة واتساب مع مشرف منصة سكن طلاب العريش. سيقوم المشرف بمراجعة الشقة والتواصل معك عبر واتساب لتأكيد رفعها وإتاحتها للطلاب على الفور.
          </p>

          {/* Next Steps Guidance (Stitch Design) */}
          <div className="bg-[#F8FAFC] rounded-2xl p-6 text-right border border-slate-200/80 mb-8 space-y-4">
            <h3 className="font-extrabold text-sm text-[#0D3B4C] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0F766E]" />
              ماذا يحدث بعد استلام المشرف للرسالة؟
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="font-bold text-[#0D3B4C] block">
                    فحص البيانات في محادثة الواتساب
                  </strong>
                  <span>
                    يراجع المشرف تفاصيل الشقة والأسعار والمسافة من الحرم الجامعي (المساعيد أو الضاحية).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0D3B4C] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="font-bold text-[#0D3B4C] block">
                    إضافة السكن في لوحة التحكم الإدارية
                  </strong>
                  <span>
                    يقوم المشرف بإدراج العقار وصوره في قاعدة بيانات الموقع وتفعيله ليظهر في نتائج البحث.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="font-bold text-[#0D3B4C] block">
                    إرسال رابط المعاينة إليك
                  </strong>
                  <span>
                    يرسل لك المشرف رابط صفحة السكن الرسمية لتبدأ في استقبال اتصالات وحجوزات الطلاب مباشرة.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#16A34A] text-white hover:bg-[#15803D] text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>مراسلة المشرف بالصور عبر واتساب</span>
            </a>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors"
            >
              العودة لتصفح السكنات
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Screen 3: Landlord Submission Form matching Stitch
  return (
    <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
      {/* Form Intro Card (Stitch Design) */}
      <div className="bg-gradient-to-r from-[#0D3B4C] via-[#0D3B4C] to-[#0F766E] text-white p-6 sm:p-8 rounded-3xl shadow-sm text-right">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold mb-3 shadow-xs">
          <Send className="h-3.5 w-3.5" />
          إرسال مباشر إلى إدارة المنصة للمراجعة والإدراج
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mb-2">
          أضف عقارك كسكن لطلاب العريش
        </h1>
        <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
          بمجرد ملء البيانات والضغط على الزر، سيتم تسجيل طلبك مباشرة وإرساله لمشرف المنصة المعتمد في العريش لمراجعته وتأكيده وإدراج العقار رسمياً للطلاب بدون أي عمولات.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {serverError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 leading-relaxed text-right">
            {serverError}
          </div>
        )}

        {/* Honeypot field (hidden from humans) */}
        <div style={{ display: "none" }} aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("hp_website")}
          />
        </div>

        {/* Section 1: Landlord Contact Information */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-right space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="w-8 h-8 rounded-full bg-[#0D3B4C]/10 text-[#0D3B4C] flex items-center justify-center font-bold text-sm">
              1
            </span>
            <h2 className="text-base font-bold text-[#0D3B4C]">
              بيانات المالك أو المسؤول عن السكن
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_name" className="text-xs font-bold text-slate-800">
                اسم صاحب السكن بالكامل *
              </Label>
              <div className="relative flex items-center">
                <User className="absolute right-3.5 text-slate-400 h-4 w-4 pointer-events-none" />
                <Input
                  id="owner_name"
                  required
                  placeholder="مثال: م. عادل الشوربجي"
                  className="pr-11 pl-4 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                  {...register("owner_name")}
                />
              </div>
              <span className="text-[11px] text-slate-500">
                الاسم الذي سيظهر للطلاب في بطاقة العقار
              </span>
              {errors.owner_name && (
                <p className="text-xs text-rose-600 font-medium">{errors.owner_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_phone" className="text-xs font-bold text-slate-800">
                رقم الواتساب الخاص بك للتواصل الفوري *
              </Label>
              <div className="relative flex items-center">
                <Phone className="absolute right-3.5 text-[#16A34A] h-4 w-4 pointer-events-none" />
                <Input
                  id="owner_phone"
                  type="tel"
                  required
                  placeholder="01012345678"
                  dir="ltr"
                  className="pr-11 pl-4 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C] text-left"
                  {...register("owner_phone")}
                />
              </div>
              <span className="text-[11px] text-slate-500">
                رقم هاتفك الذي سيتواصل عليه الطلاب ومسؤول المنصة
              </span>
              {errors.owner_phone && (
                <p className="text-xs text-rose-600 font-medium">{errors.owner_phone.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Property Location and University Affiliation */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-right space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="w-8 h-8 rounded-full bg-[#0D3B4C]/10 text-[#0D3B4C] flex items-center justify-center font-bold text-sm">
              2
            </span>
            <h2 className="text-base font-bold text-[#0D3B4C]">
              موقع السكن والجامعة القريبة
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-800">الجامعة الأقرب للسكن *</Label>
              <Select
                value={watchedArea}
                onValueChange={(val: "al_masaeed" | "al_dahiya") =>
                  setValue("area", val)
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900">
                  <SelectValue placeholder="اختر الجامعة" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="al_masaeed">جامعة سيناء — فرع العريش (المساعيد)</SelectItem>
                  <SelectItem value="al_dahiya">جامعة العريش الحكومية (الضاحية)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title" className="text-xs font-bold text-slate-800">
                عنوان مختصر للإعلان *
              </Label>
              <Input
                id="title"
                required
                placeholder="مثال: شقة 3 غرف مفروشة لوكس بالمساعيد"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-rose-600 font-medium">{errors.title.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="location_desc" className="text-xs font-bold text-slate-800">
                العنوان التفصيلي والعلامات المميزة *
              </Label>
              <Input
                id="location_desc"
                placeholder="مثال: شارع أسماء الزيات، متفرع من شارع البحر، عمارة الأمل، بجوار صيدلية كذا"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                {...register("location_desc")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="walking_minutes_to_university" className="text-xs font-bold text-slate-800">
                المسافة للحرم الجامعي (دقائق مشياً) *
              </Label>
              <Input
                id="walking_minutes_to_university"
                type="number"
                placeholder="مثال: 5"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                {...register("walking_minutes_to_university", { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-800">نوع السكن المستهدف *</Label>
              <Select
                value={watchedGender}
                onValueChange={(val: "male" | "female") =>
                  setValue("gender", val)
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="male">سكن شباب / طلاب</SelectItem>
                  <SelectItem value="female">سكن طالبات مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Section 3: Accommodation Specs, Pricing, and Rules */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-right space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="w-8 h-8 rounded-full bg-[#0D3B4C]/10 text-[#0D3B4C] flex items-center justify-center font-bold text-sm">
              3
            </span>
            <h2 className="text-base font-bold text-[#0D3B4C]">
              مواصفات السكن والأسعار
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-800">نوع التسكين والإيجار *</Label>
              <Select
                value={watchedRentalType}
                onValueChange={(val: "bed" | "room" | "full_apartment") =>
                  setValue("rental_type", val)
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900">
                  <SelectValue placeholder="اختر نوع الإيجار" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="bed">سرير في غرفة مشتركة</SelectItem>
                  <SelectItem value="room">غرفة مفردة خاصة</SelectItem>
                  <SelectItem value="full_apartment">شقة كاملة لمجموعة طلاب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price" className="text-xs font-bold text-slate-800">
                الإيجار الشهري المطلوب (ج.م) *
              </Label>
              <Input
                id="price"
                type="number"
                required
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 font-extrabold text-[#0D3B4C] focus:bg-white focus:border-[#0D3B4C]"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-rose-600 font-medium">{errors.price.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rooms_count" className="text-xs font-bold text-slate-800">
                عدد الغرف *
              </Label>
              <Input
                id="rooms_count"
                type="number"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                {...register("rooms_count", { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total_beds" className="text-xs font-bold text-slate-800">
                إجمالي الأسرّة في السكن *
              </Label>
              <Input
                id="total_beds"
                type="number"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                {...register("total_beds", { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="available_beds" className="text-xs font-bold text-slate-800">
                الأسرّة المتاحة حالياً *
              </Label>
              <Input
                id="available_beds"
                type="number"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
                {...register("available_beds", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <Label htmlFor="description" className="text-xs font-bold text-slate-800">
              ملاحظات ومميزات إضافية تود إرسالها للمشرف:
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="شقة حديثة التشطيب ومكيفة، واي فاي سريع، صالة للمذاكرة، قريبة من المواصلات..."
              className="p-3.5 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C]"
              {...register("description")}
            />
          </div>
        </section>

        {/* Direct Admin WhatsApp Dispatch Card (Stitch Design) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#16A34A]/50 shadow-md space-y-6 text-right">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0D3B4C]">
                وجهة الإرسال المباشرة: إدارة منصة سكن طلاب العريش
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                سيتم حفظ الطلب وإتاحته للمشرفين لمراجعته واعتماد نشره مباشرة.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              defaultChecked
              className="mt-1 rounded text-[#16A34A] focus:ring-[#16A34A]"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              أؤكد دقة هذه البيانات وأوافق على إرسالها مباشرة لإدارة سكن طلاب العريش لإضافتها في لوحة التحكم بعد المراجعة.
            </span>
          </label>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-center text-xs font-bold transition-colors"
            >
              إلغاء والعودة
            </Link>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer h-12"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري إرسال البيانات...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>إرسال تفاصيل السكن للإدارة للمراجعة</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
