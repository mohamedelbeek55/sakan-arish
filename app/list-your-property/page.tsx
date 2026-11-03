"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  CheckCircle,
  Home,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
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
      price: 1500,
      rooms_count: 3,
      total_beds: 6,
      available_beds: 6,
      walking_minutes_to_university: 7,
      location_desc: "",
      description: "",
      hp_website: "",
    },
  });

  const watchedArea = watch("area");
  const watchedGender = watch("gender");
  const watchedRentalType = watch("rental_type");

  let whatsappNumber = "";
  try {
    whatsappNumber = getWhatsAppNumber();
  } catch {
    // Graceful fallback if env is missing
  }

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitPropertyAction(data);
      if (result.success) {
        setSubmitted(true);
      } else {
        setServerError(result.error || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.");
      }
    });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#166534] border border-emerald-200/80 shadow-2xs">
          <CheckCircle className="h-10 w-10 text-[#166534]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-stone-900 sm:text-3xl">
            تم استلام بيانات سكنك بنجاح! 🎉
          </h1>
          <p className="text-stone-600 max-w-md mx-auto leading-relaxed text-sm">
            شكراً لثقتك بنا. سيقوم فريق «سكن طلاب العريش» بمراجعة بيانات السكن والتواصل معك لتأكيده وعرضه مباشرة أمام آلاف الطلاب.
          </p>
        </div>

        {whatsappNumber && (
          <div className="p-5 rounded-2xl border border-emerald-200/80 bg-[#F0FDF4] max-w-md mx-auto space-y-3 shadow-2xs">
            <p className="text-xs font-bold text-[#166534]">
              هل ترغب في إرسال صور وفيديوهات السكن لنا الآن مباشرة؟
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                "السلام عليكم، قمت للتو بتقديم طلب إضافة سكن على المنصة وأرغب في إرسال الصور والتفاصيل."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#20BD5A] shadow-xs cursor-pointer"
            >
              مراسلتنا عبر واتساب لإرسال الصور
            </a>
          </div>
        )}

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-[#0369A1] transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200/80 px-3.5 py-1 text-xs font-bold text-[#0369A1]">
          <Sparkles className="h-3.5 w-3.5" />
          أصحاب الشقق والسكنات في العريش
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          أعلن عن سكنك معنا واصل لآلاف الطلاب
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          اعرض شقتك أو غرفتك لطلاب جامعة سيناء وجامعة العريش مباشرة، بدون أي وسيط وبدون أي عمولة. املأ النموذج وسيتم التواصل معك لاعتماده.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-[#EBE6DC] bg-white p-6 sm:p-8 shadow-2xs space-y-6"
      >
        {serverError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 leading-relaxed text-right">
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

        {/* 1. Owner Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#EBE6DC]/80">
            <User className="h-4 w-4 text-[#0369A1]" />
            <h2 className="text-sm font-black text-stone-900">بيانات المالك أو المسؤول</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="owner_name" className="text-xs font-bold text-stone-700">
                الاسم الكريم
              </Label>
              <Input
                id="owner_name"
                placeholder="مثال: الحاج محمد"
                className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                {...register("owner_name")}
              />
              {errors.owner_name && (
                <p className="text-xs text-rose-600 font-medium">{errors.owner_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner_phone" className="text-xs font-bold text-stone-700">
                رقم الهاتف / الواتساب
              </Label>
              <Input
                id="owner_phone"
                placeholder="01XXXXXXXXX"
                dir="ltr"
                className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition text-right"
                {...register("owner_phone")}
              />
              {errors.owner_phone && (
                <p className="text-xs text-rose-600 font-medium">{errors.owner_phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Property Specifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#EBE6DC]/80">
            <Home className="h-4 w-4 text-[#0369A1]" />
            <h2 className="text-sm font-black text-stone-900">مواصفات السكن</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-stone-700">
              عنوان الإعلان المختصر
            </Label>
            <Input
              id="title"
              placeholder="مثال: شقة 3 غرف مفروشة لوكس قريبة من جامعة سيناء"
              className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-700">المنطقة</Label>
              <Select
                value={watchedArea}
                onValueChange={(val: "al_masaeed" | "al_dahiya") =>
                  setValue("area", val)
                }
              >
                <SelectTrigger className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40">
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#EBE6DC]">
                  <SelectItem value="al_masaeed">المساعيد (جامعة سيناء)</SelectItem>
                  <SelectItem value="al_dahiya">الضاحية (جامعة العريش)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-700">نوع السكن</Label>
              <Select
                value={watchedGender}
                onValueChange={(val: "male" | "female") =>
                  setValue("gender", val)
                }
              >
                <SelectTrigger className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#EBE6DC]">
                  <SelectItem value="male">سكن شباب</SelectItem>
                  <SelectItem value="female">سكن بنات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-700">نوع الإيجار</Label>
              <Select
                value={watchedRentalType}
                onValueChange={(val: "bed" | "room" | "full_apartment") =>
                  setValue("rental_type", val)
                }
              >
                <SelectTrigger className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40">
                  <SelectValue placeholder="اختر نوع الإيجار" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#EBE6DC]">
                  <SelectItem value="bed">سرير</SelectItem>
                  <SelectItem value="room">غرفة خاصة</SelectItem>
                  <SelectItem value="full_apartment">شقة كاملة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-bold text-stone-700">
                السعر المتوقع (ج.م)
              </Label>
              <Input
                id="price"
                type="number"
                className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-rose-600 font-medium">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rooms_count" className="text-xs font-bold text-stone-700">
                عدد الغرف
              </Label>
              <Input
                id="rooms_count"
                type="number"
                className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                {...register("rooms_count", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="total_beds" className="text-xs font-bold text-stone-700">
                إجمالي الأسرّة
              </Label>
              <Input
                id="total_beds"
                type="number"
                className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                {...register("total_beds", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="walking_minutes_to_university" className="text-xs font-bold text-stone-700">
                دقائق السير للجامعة
              </Label>
              <Input
                id="walking_minutes_to_university"
                type="number"
                placeholder="مثال: 5"
                className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                {...register("walking_minutes_to_university", {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location_desc" className="text-xs font-bold text-stone-700">
              العنوان أو علامة مميزة
            </Label>
            <Input
              id="location_desc"
              placeholder="مثال: المساعيد، شارع أسيوط بجوار صيدلية كذا"
              className="h-10 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
              {...register("location_desc")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-stone-700">
              ملاحظات ومميزات إضافية
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="مثال: الشقة بها تكييف، غسالة أوتوماتيك، إنترنت فائق السرعة، عمارة هادئة..."
              className="rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
              {...register("description")}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold text-base rounded-xl transition shadow-xs cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              جاري إرسال الطلب...
            </>
          ) : (
            "إرسال السكن للمراجعة والإعلان"
          )}
        </Button>
      </form>
    </div>
  );
}
