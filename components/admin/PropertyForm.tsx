"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  X,
  ImagePlus,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Phone,
  Sparkles,
  Save,
  CheckCircle,
  Video,
  Layers,
  Info,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  AMENITY_OPTIONS,
  derivePropertyStatus,
  getStatusLabel,
  getStatusStyles,
} from "@/lib/utils";
import type { Property } from "@/components/property/PropertyCard";
import { savePropertyAction } from "@/app/actions/property";

const propertySchema = z
  .object({
    code: z.string().min(1, "الكود مطلوب"),
    title: z.string().min(1, "العنوان مطلوب"),
    area: z.enum(["al_masaeed", "al_dahiya"], {
      message: "المنطقة مطلوبة",
    }),
    gender: z.enum(["male", "female"], {
      message: "نوع السكن مطلوب",
    }),
    rental_type: z.enum(["bed", "room", "full_apartment"], {
      message: "نوع الإيجار مطلوب",
    }),
    price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
    rooms_count: z.number().int().min(1, "عدد الغرف يجب أن يكون 1 على الأقل"),
    location_desc: z.string().optional(),
    total_beds: z.number().int().min(1, "إجمالي الأسرّة يجب أن يكون 1 على الأقل"),
    available_beds: z.number().int().min(0, "الأسرّة المتاحة لا يمكن أن تكون سالبة"),
    youtube_video_url: z.string().optional().or(z.literal("")),
    description: z.string().optional(),
    walking_minutes_to_university: z
      .number()
      .int()
      .min(0)
      .max(180)
      .optional()
      .nullable(),
    maps_url: z.string().optional().or(z.literal("")),
    floor: z.number().int().min(-2).max(40).optional().nullable(),
    furnished: z.boolean().optional().nullable(),
    utilities_included: z.boolean().optional().nullable(),
    deposit: z.number().min(0).optional().nullable(),
    contract_months: z.number().int().min(1).max(36).optional().nullable(),
    students_per_room: z.number().int().min(1).max(10).optional().nullable(),
    owner_phone: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.available_beds <= data.total_beds, {
    message: "عدد الأسرّة المتاحة لا يمكن أن يتجاوز إجمالي الأسرّة",
    path: ["available_beds"],
  });

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  property?: Property;
}

// Client-side image compression: downscale to max 1600px & export as WebP (~150KB-300KB)
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_DIM = 1600;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context is not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("فشل تحويل الصورة إلى صيغة WebP"));
          }
        },
        "image/webp",
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("تعذر قراءة ملف الصورة"));
    };

    img.src = url;
  });
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property?.amenities || []
  );
  const [images, setImages] = useState<string[]>(property?.images || []);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(
    !!property?.last_verified_at
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      code: property?.code || "",
      title: property?.title || "",
      area: property?.area as "al_masaeed" | "al_dahiya" | undefined,
      gender: property?.gender as "male" | "female" | undefined,
      rental_type: property?.rental_type as
        | "bed"
        | "room"
        | "full_apartment"
        | undefined,
      price: property?.price || 0,
      rooms_count: property?.rooms_count || 1,
      location_desc: property?.location_desc || "",
      total_beds: property?.total_beds || 1,
      available_beds: property?.available_beds ?? 1,
      youtube_video_url: property?.youtube_video_url || "",
      description: property?.description || "",
      walking_minutes_to_university:
        property?.walking_minutes_to_university ?? null,
      maps_url: property?.maps_url || "",
      floor: property?.floor ?? null,
      furnished: property?.furnished ?? null,
      utilities_included: property?.utilities_included ?? null,
      deposit: property?.deposit ?? null,
      contract_months: property?.contract_months ?? null,
      students_per_room: property?.students_per_room ?? null,
      owner_phone: property?.owner_phone || "",
    },
  });

  const watchedArea = watch("area");
  const watchedGender = watch("gender");
  const watchedRentalType = watch("rental_type");
  const watchedAvailableBeds = watch("available_beds") ?? 1;
  const watchedTotalBeds = watch("total_beds") ?? 1;
  const watchedFurnished = watch("furnished");
  const watchedUtilities = watch("utilities_included");

  // Automatically derive property status based on available_beds, total_beds, and rental_type
  const derivedStatus = derivePropertyStatus(
    watchedAvailableBeds,
    watchedTotalBeds,
    watchedRentalType
  );

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const fileList = Array.from(files);

    if (images.length + fileList.length > 10) {
      setUploadError(
        `الحد الأقصى المسموح به هو 10 صور فقط. لديك بالفعل ${images.length} صور.`
      );
      e.target.value = "";
      return;
    }

    setUploading(true);
    const newImages: string[] = [];
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const file of fileList) {
      if (!allowedMimeTypes.includes(file.type)) {
        setUploadError(
          `الملف "${file.name}" غير مدعوم. يرجى اختيار صور بصيغة JPG أو PNG أو WebP فقط.`
        );
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError(
          `حجم الصورة "${file.name}" كبير جداً (أكبر من 10 ميجابايت).`
        );
        continue;
      }

      try {
        const compressedBlob = await compressImage(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        const filePath = `properties/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("property-images")
          .upload(filePath, compressedBlob, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: false,
          });

        if (uploadErr) {
          setUploadError(
            `فشل رفع الصورة إلى Supabase: ${uploadErr.message}. تأكد من تفعيل صلاحيات التخزين.`
          );
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage.from("property-images").getPublicUrl(filePath);
          newImages.push(publicUrl);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "حدث خطأ أثناء معالجة الصورة";
        setUploadError(`تعذر ضغط ورفع الصورة: ${msg}`);
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }

    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PropertyFormValues) => {
    setServerError(null);
    startTransition(async () => {
      let cleanVideoUrl = data.youtube_video_url?.trim() || null;
      if (
        cleanVideoUrl &&
        !cleanVideoUrl.startsWith("http://") &&
        !cleanVideoUrl.startsWith("https://")
      ) {
        cleanVideoUrl = `https://${cleanVideoUrl}`;
      }

      let cleanMapsUrl = data.maps_url?.trim() || null;
      if (
        cleanMapsUrl &&
        !cleanMapsUrl.startsWith("http://") &&
        !cleanMapsUrl.startsWith("https://")
      ) {
        cleanMapsUrl = `https://${cleanMapsUrl}`;
      }

      const payload = {
        ...data,
        location_desc: data.location_desc || "",
        rooms_count: data.rooms_count || 1,
        status: derivedStatus,
        amenities: selectedAmenities,
        images,
        youtube_video_url: cleanVideoUrl,
        maps_url: cleanMapsUrl,
        description: data.description || null,
        owner_phone: data.owner_phone?.trim() || null,
        last_verified_at: isVerified
          ? property?.last_verified_at || new Date().toISOString()
          : null,
        id: property?.id,
      };

      const result = await savePropertyAction(payload);
      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setServerError(result.error || "حدث خطأ غير متوقع أثناء حفظ السكن");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="space-y-1">
            <p className="font-bold">تعذر حفظ الإعلان:</p>
            <p className="whitespace-pre-line leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* Status & Publication Setting Banner (Stitch Screen 8) */}
      <div className="bg-white p-5 rounded-2xl border border-light-outline/70 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-base text-light-primary">
              حالة العقار في المنصة: {getStatusLabel(derivedStatus)}
            </h4>
            <span className="text-xs text-light-on-surface/70">
              يتم الحساب تلقائياً بناءً على عدد الأسرّة ({watchedAvailableBeds} متاح من أصل {watchedTotalBeds})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold ${getStatusStyles(
              derivedStatus
            )}`}
          >
            {getStatusLabel(derivedStatus)}
          </span>
        </div>
      </div>

      {/* Core Information Section (Stitch Screen 8) */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-light-outline/70 shadow-2xs space-y-6">
        <h2 className="font-headline text-base sm:text-lg text-light-primary font-bold pb-3 border-b border-light-outline/60 flex items-center gap-2">
          <Info className="h-5 w-5 text-light-secondary" />
          المعلومات الأساسية وبيانات الإعلان
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-bold text-light-primary">
              كود السكن التعريفي *
            </Label>
            <Input
              id="code"
              placeholder="مثال: MS-01 أو ASH-104"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary focus:bg-white focus:border-light-primary h-11 text-xs font-mono font-bold"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs text-rose-600">{errors.code.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="title" className="text-xs font-bold text-light-primary">
              عنوان الإعلان الظاهر للطلاب *
            </Label>
            <Input
              id="title"
              placeholder="مثال: شقة فندقية 3 غرف مكيفة بالمساعيد شارع أسماء الزيات"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary focus:bg-white focus:border-light-primary h-11 text-xs font-semibold"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-rose-600">{errors.title.message}</p>
            )}
          </div>

          {/* Area / Campus */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-light-primary">
              الحرم الجامعي والحي *
            </Label>
            <Select
              value={watchedArea}
              onValueChange={(v) =>
                setValue("area", v as "al_masaeed" | "al_dahiya", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs font-medium">
                <SelectValue placeholder="اختر الحرم الجامعي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="al_masaeed">
                  جامعة سيناء — فرع العريش (حي المساعيد)
                </SelectItem>
                <SelectItem value="al_dahiya">
                  جامعة العريش الحكومية (حي الضاحية)
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.area && (
              <p className="text-xs text-rose-600">{errors.area.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-light-primary">
              نوع التسكين (شباب / بنات) *
            </Label>
            <Select
              value={watchedGender}
              onValueChange={(v) =>
                setValue("gender", v as "male" | "female", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs font-medium">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">سكن شباب / طلاب</SelectItem>
                <SelectItem value="female">سكن طالبات (إشراف عائلي)</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-xs text-rose-600">{errors.gender.message}</p>
            )}
          </div>

          {/* Rental Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-light-primary">
              نوع الإيجار *
            </Label>
            <Select
              value={watchedRentalType}
              onValueChange={(v) =>
                setValue(
                  "rental_type",
                  v as "bed" | "room" | "full_apartment",
                  { shouldValidate: true }
                )
              }
            >
              <SelectTrigger className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs font-medium">
                <SelectValue placeholder="اختر نوع الإيجار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bed">سرير في غرفة مشتركة</SelectItem>
                <SelectItem value="room">غرفة خاصة مستقلة</SelectItem>
                <SelectItem value="full_apartment">شقة كاملة مستقلة</SelectItem>
              </SelectContent>
            </Select>
            {errors.rental_type && (
              <p className="text-xs text-rose-600">
                {errors.rental_type.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-bold text-light-primary">
              الإيجار الشهري (ج.م / شهر) *
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="مثال: 1300"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary focus:bg-white focus:border-light-primary h-11 text-xs font-bold"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-rose-600">{errors.price.message}</p>
            )}
          </div>

          {/* Deposit */}
          <div className="space-y-1.5">
            <Label htmlFor="deposit" className="text-xs font-bold text-light-primary">
              مبلغ التأمين المسترد (ج.م) - اختياري
            </Label>
            <Input
              id="deposit"
              type="number"
              placeholder="0 أو اتركه فارغاً"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs"
              {...register("deposit", { valueAsNumber: true })}
            />
          </div>

          {/* Walking minutes to university */}
          <div className="space-y-1.5">
            <Label htmlFor="walking_minutes_to_university" className="text-xs font-bold text-light-primary">
              المسافة الدقيقة للحرم الجامعي (دقائق مشياً)
            </Label>
            <Input
              id="walking_minutes_to_university"
              type="number"
              placeholder="مثال: 4"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs"
              {...register("walking_minutes_to_university", {
                valueAsNumber: true,
              })}
            />
          </div>

          {/* Location Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="location_desc" className="text-xs font-bold text-light-primary">
              وصف الموقع التقريبي والعلامة المميزة *
            </Label>
            <Input
              id="location_desc"
              placeholder="مثال: المساعيد — 4 دقائق من البوابة الغربية، أمام سوبرماركت الفيروز"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs"
              {...register("location_desc")}
            />
          </div>

          {/* Full Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description" className="text-xs font-bold text-light-primary">
              وصف السكن الكامل والتفاصيل
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="اكتب تفاصيل إضافية عن السكن، الهدوء، تشطيب العمارة، الأجهزة المتوفرة..."
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary p-3 text-xs leading-relaxed"
              {...register("description")}
            />
          </div>
        </div>
      </section>

      {/* Specifications & Room Setup Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-light-outline/70 shadow-2xs space-y-6">
        <h2 className="font-headline text-base sm:text-lg text-light-primary font-bold pb-3 border-b border-light-outline/60 flex items-center gap-2">
          <Layers className="h-5 w-5 text-light-secondary" />
          مواصفات التسكين، الغرف، والأثاث
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Rooms count */}
          <div className="space-y-1.5">
            <Label htmlFor="rooms_count" className="text-xs font-bold text-light-primary">
              عدد الغرف
            </Label>
            <Input
              id="rooms_count"
              type="number"
              min={1}
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs"
              {...register("rooms_count", { valueAsNumber: true })}
            />
          </div>

          {/* Total beds */}
          <div className="space-y-1.5">
            <Label htmlFor="total_beds" className="text-xs font-bold text-light-primary">
              إجمالي الأسرّة بالسكن
            </Label>
            <Input
              id="total_beds"
              type="number"
              min={1}
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs"
              {...register("total_beds", { valueAsNumber: true })}
            />
            {errors.total_beds && (
              <p className="text-xs text-rose-600">{errors.total_beds.message}</p>
            )}
          </div>

          {/* Available beds */}
          <div className="space-y-1.5">
            <Label htmlFor="available_beds" className="text-xs font-bold text-light-primary">
              الأسرّة المتاحة حالياً
            </Label>
            <Input
              id="available_beds"
              type="number"
              min={0}
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs font-bold"
              {...register("available_beds", { valueAsNumber: true })}
            />
            {errors.available_beds && (
              <p className="text-xs text-rose-600">{errors.available_beds.message}</p>
            )}
          </div>

          {/* Floor */}
          <div className="space-y-1.5">
            <Label htmlFor="floor" className="text-xs font-bold text-light-primary">
              الطابق / الدور
            </Label>
            <Input
              id="floor"
              type="number"
              placeholder="0 للأرضي، 1، 2، 3..."
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs"
              {...register("floor", { valueAsNumber: true })}
            />
          </div>

          {/* Furnished */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-light-primary">
              حالة الفرش
            </Label>
            <Select
              value={
                watchedFurnished === true
                  ? "true"
                  : watchedFurnished === false
                  ? "false"
                  : "unspecified"
              }
              onValueChange={(val) => {
                setValue(
                  "furnished",
                  val === "true" ? true : val === "false" ? false : null,
                  { shouldDirty: true }
                );
              }}
            >
              <SelectTrigger className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs">
                <SelectValue placeholder="اختر حالة الفرش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">غير محدد</SelectItem>
                <SelectItem value="true">مفروشة بالكامل (أجهزة وأثاث)</SelectItem>
                <SelectItem value="false">غير مفروشة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Utilities */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-light-primary">
              الفواتير والخدمات
            </Label>
            <Select
              value={
                watchedUtilities === true
                  ? "true"
                  : watchedUtilities === false
                  ? "false"
                  : "unspecified"
              }
              onValueChange={(val) => {
                setValue(
                  "utilities_included",
                  val === "true" ? true : val === "false" ? false : null,
                  { shouldDirty: true }
                );
              }}
            >
              <SelectTrigger className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs">
                <SelectValue placeholder="اختر حالة الفواتير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">غير محدد</SelectItem>
                <SelectItem value="true">شامل الفواتير (مياه وكهرباء وإنترنت)</SelectItem>
                <SelectItem value="false">الفواتير منفصلة (على الطلاب)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* YouTube Video URL */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="youtube_video_url" className="text-xs font-bold text-light-primary flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-rose-600" />
              رابط جولة الفيديو من يوتيوب (اختياري)
            </Label>
            <Input
              id="youtube_video_url"
              placeholder="https://www.youtube.com/watch?v=... أو https://youtube.com/shorts/..."
              dir="ltr"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs font-mono"
              {...register("youtube_video_url")}
            />
          </div>

          {/* Maps URL */}
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="maps_url" className="text-xs font-bold text-light-primary flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-light-secondary" />
              رابط Google Maps
            </Label>
            <Input
              id="maps_url"
              placeholder="https://maps.google.com/..."
              dir="ltr"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs font-mono"
              {...register("maps_url")}
            />
          </div>
        </div>
      </section>

      {/* Landlord Contact & Private Admin Settings (Stitch Screen 8) */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-light-outline/70 shadow-2xs space-y-5">
        <h2 className="font-headline text-base sm:text-lg text-light-primary font-bold pb-3 border-b border-light-outline/60 flex items-center gap-2">
          <Phone className="h-5 w-5 text-whatsapp" />
          بيانات المالك وقناة الواتساب المباشرة
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="owner_phone" className="text-xs font-bold text-light-primary">
              رقم واتساب المالك للتواصل المباشر
            </Label>
            <Input
              id="owner_phone"
              placeholder="01XXXXXXXXX"
              dir="ltr"
              className="rounded-xl border-light-outline bg-light-surface-subtle/50 text-light-primary h-11 text-xs font-mono font-bold"
              {...register("owner_phone")}
            />
            <p className="text-[11px] text-light-on-surface/60">
              يُحفظ بأمان في جدول البيانات الإدارية المحمية ويستخدم للتواصل مع المالك
            </p>
          </div>

          <div className="flex flex-col justify-center pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer text-xs font-bold text-emerald-950">
              <Checkbox
                checked={isVerified}
                onCheckedChange={(checked) => setIsVerified(!!checked)}
              />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                سكن موثق بمعاينة ميدانية من فريق سكن طلاب العريش
              </span>
            </label>
            {isVerified && property?.last_verified_at && (
              <p className="text-[10px] text-emerald-800 mt-1 mr-4">
                تاريخ المعاينة المسجل:{" "}
                {new Date(property.last_verified_at).toLocaleDateString("ar-EG")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-light-outline/70 shadow-2xs space-y-4">
        <h2 className="font-headline text-base sm:text-lg text-light-primary font-bold pb-3 border-b border-light-outline/60 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          المرافق والخدمات المتوفرة بالسكن
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AMENITY_OPTIONS.map((item) => (
            <label
              key={item.value}
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition ${
                selectedAmenities.includes(item.value)
                  ? "bg-light-primary/10 border-light-primary text-light-primary"
                  : "bg-light-surface-subtle/40 border-light-outline/70 text-light-on-surface/80 hover:bg-light-surface-subtle"
              }`}
            >
              <Checkbox
                checked={selectedAmenities.includes(item.value)}
                onCheckedChange={() => toggleAmenity(item.value)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Manage Uploaded Gallery Photos (Stitch Screen 8) */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-light-outline/70 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-light-outline/60">
          <h2 className="font-headline text-base sm:text-lg text-light-primary font-bold flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-light-secondary" />
            صور السكن المعتمدة ({images.length} صور حالية من 10)
          </h2>
          <span className="text-xs text-light-on-surface/60 font-medium">
            JPG أو PNG أو WebP بحد أقصى 10 ميجابايت
          </span>
        </div>

        {uploadError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-light-outline bg-light-surface-subtle group shadow-2xs"
            >
              <Image
                src={img}
                alt={`صورة السكن ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {index === 0 && (
                <span className="absolute top-2 right-2 bg-light-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  الصورة الرئيسية
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                title="حذف الصورة"
                aria-label="حذف الصورة"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {images.length < 10 && (
            <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-xl border-2 border-dashed border-light-outline hover:border-light-primary hover:bg-light-primary/5 transition cursor-pointer text-light-on-surface/60 hover:text-light-primary p-4 text-center">
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-xs text-light-primary font-bold">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>جاري معالجة ورفع الصورة...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <ImagePlus className="h-6 w-6 text-light-secondary mb-1" />
                  <span className="font-bold text-xs text-light-primary">
                    إضافة صور جديدة
                  </span>
                  <span className="text-[10px] text-light-on-surface/50">
                    انقر للاختيار من جهازك
                  </span>
                </div>
              )}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      </section>

      {/* Sticky Save Toolbar (Stitch Screen 8) */}
      <div className="sticky bottom-6 bg-white p-4 sm:p-5 rounded-2xl border-2 border-light-primary/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-2.5 text-xs text-light-on-surface/80">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>أنت في وضع التعديل الإداري المباشر بحساب المشرف العام</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/dashboard"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-light-outline text-light-on-surface/70 hover:bg-light-surface-subtle text-xs font-bold text-center transition-colors"
          >
            إلغاء
          </Link>
          <Button
            type="submit"
            disabled={isPending || uploading}
            className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-light-primary text-white hover:bg-light-primary/95 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer h-10"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري الحفظ في Supabase...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{property ? "حفظ ونشر التعديلات" : "حفظ ونشر السكن الآن"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
