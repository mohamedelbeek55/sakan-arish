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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            تم استلام بيانات سكنك بنجاح! 🎉
          </h1>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            شكراً لثقتك بنا. سيقوم فريق «سكن طلاب العريش» بمراجعة بيانات السكن والتواصل معك لتأكيده وعرضه مباشرة أمام آلاف الطلاب.
          </p>
        </div>

        {whatsappNumber && (
          <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/60 max-w-md mx-auto space-y-3">
            <p className="text-xs font-medium text-teal-800">
              هل ترغب في إرسال صور وفيديوهات السكن لنا الآن مباشرة؟
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                "السلام عليكم، قمت للتو بتقديم طلب إضافة سكن على المنصة وأرغب في إرسال الصور والتفاصيل."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#20BD5A] shadow-sm"
            >
              مراسلتنا عبر واتساب لإرسال الصور
            </a>
          </div>
        )}

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 transition"
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
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3.5 py-1 text-xs font-semibold text-teal-800">
          <Sparkles className="h-3.5 w-3.5" />
          أصحاب الشقق والسكنات في العريش
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          أعلن عن سكنك معنا واصل لآلاف الطلاب
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          اعرض شقتك أو غرفتك لطلاب جامعة سيناء وجامعة العريش مباشرة، بدون وسطاء ودون أي رسوم مسبقة. املأ النموذج وسيتم التواصل معك لاعتماده.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">بيانات المالك أو المسؤول</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="owner_name">الاسم الكريم</Label>
              <Input
                id="owner_name"
                placeholder="مثال: الحاج محمد"
                {...register("owner_name")}
              />
              {errors.owner_name && (
                <p className="text-xs text-red-500">{errors.owner_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner_phone">رقم الهاتف / الواتساب</Label>
              <Input
                id="owner_phone"
                placeholder="01XXXXXXXXX"
                dir="ltr"
                className="text-right"
                {...register("owner_phone")}
              />
              {errors.owner_phone && (
                <p className="text-xs text-red-500">{errors.owner_phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Property Specifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Home className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">مواصفات السكن</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">عنوان الإعلان المختصر</Label>
            <Input
              id="title"
              placeholder="مثال: شقة 3 غرف مفروشة لوكس قريبة من جامعة سيناء"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>المنطقة</Label>
              <Select
                value={watchedArea}
                onValueChange={(val: "al_masaeed" | "al_dahiya") =>
                  setValue("area", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="al_masaeed">المساعيد (جامعة سيناء)</SelectItem>
                  <SelectItem value="al_dahiya">الضاحية (جامعة العريش)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>نوع السكن</Label>
              <Select
                value={watchedGender}
                onValueChange={(val: "male" | "female") =>
                  setValue("gender", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">سكن شباب</SelectItem>
                  <SelectItem value="female">سكن بنات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>نوع الإيجار</Label>
              <Select
                value={watchedRentalType}
                onValueChange={(val: "bed" | "room" | "full_apartment") =>
                  setValue("rental_type", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الإيجار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bed">سرير</SelectItem>
                  <SelectItem value="room">غرفة خاصة</SelectItem>
                  <SelectItem value="full_apartment">شقة كاملة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">السعر المتوقع (ج.م)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rooms_count">عدد الغرف</Label>
              <Input
                id="rooms_count"
                type="number"
                {...register("rooms_count", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="total_beds">إجمالي الأسرّة</Label>
              <Input
                id="total_beds"
                type="number"
                {...register("total_beds", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="walking_minutes_to_university">
                دقائق السير للجامعة
              </Label>
              <Input
                id="walking_minutes_to_university"
                type="number"
                placeholder="مثال: 5"
                {...register("walking_minutes_to_university", {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location_desc">العنوان / العلامة المميزة</Label>
            <Input
              id="location_desc"
              placeholder="مثال: المساعيد، شارع أسيوط بجوار صيدلية كذا"
              {...register("location_desc")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">ملاحظات ومميزات إضافية</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="مثال: الشقة بها تكييف، غسالة أوتوماتيك، إنترنت فائق السرعة، عمارة هادئة..."
              {...register("description")}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-base rounded-xl transition shadow-xs cursor-pointer"
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
