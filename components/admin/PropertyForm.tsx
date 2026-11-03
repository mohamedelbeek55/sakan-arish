"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  X,
  ImagePlus,
  AlertCircle,
  Footprints,
  MapPin,
  Building,
  Shield,
  Phone,
  Sparkles,
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
import { extractYouTubeId } from "@/components/property/YouTubeEmbed";

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
    furnished: z.boolean().default(true),
    utilities_included: z.boolean().default(false),
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema as any),
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
      furnished: property?.furnished ?? true,
      utilities_included: property?.utilities_included ?? false,
      deposit: property?.deposit ?? null,
      contract_months: property?.contract_months ?? 10,
      students_per_room: property?.students_per_room ?? 2,
      owner_phone: property?.owner_phone || "",
    },
  });

  const watchedArea = watch("area");
  const watchedGender = watch("gender");
  const watchedRentalType = watch("rental_type");
  const watchedYoutubeUrl = watch("youtube_video_url");
  const watchedAvailableBeds = watch("available_beds") ?? 1;
  const watchedTotalBeds = watch("total_beds") ?? 1;
  const watchedFurnished = watch("furnished");
  const watchedUtilities = watch("utilities_included");

  // Automatically derive property status
  const derivedStatus = derivePropertyStatus(watchedAvailableBeds);

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
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="space-y-1">
            <p className="font-bold">تعذر حفظ الإعلان:</p>
            <p className="whitespace-pre-line leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">المعلومات الأساسية</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="code">كود السكن</Label>
            <Input
              id="code"
              placeholder="مثال: MS-01"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs text-red-500">{errors.code.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">عنوان الإعلان</Label>
            <Input
              id="title"
              placeholder="مثال: شقة 3 غرف بالمساعيد قريبة من جامعة سيناء"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <Label>المنطقة</Label>
            <Select
              value={watchedArea}
              onValueChange={(v) =>
                setValue("area", v as "al_masaeed" | "al_dahiya", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المنطقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="al_masaeed">
                  المساعيد (جامعة سيناء)
                </SelectItem>
                <SelectItem value="al_dahiya">
                  الضاحية (جامعة العريش)
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.area && (
              <p className="text-xs text-red-500">{errors.area.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label>نوع السكن (شباب / بنات)</Label>
            <Select
              value={watchedGender}
              onValueChange={(v) =>
                setValue("gender", v as "male" | "female", {
                  shouldValidate: true,
                })
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
            {errors.gender && (
              <p className="text-xs text-red-500">{errors.gender.message}</p>
            )}
          </div>

          {/* Rental Type */}
          <div className="space-y-1.5">
            <Label>نوع الإيجار</Label>
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
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الإيجار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bed">سرير في غرفة مشتركة</SelectItem>
                <SelectItem value="room">غرفة خاصة</SelectItem>
                <SelectItem value="full_apartment">شقة كاملة</SelectItem>
              </SelectContent>
            </Select>
            {errors.rental_type && (
              <p className="text-xs text-red-500">
                {errors.rental_type.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="price">السعر (ج.م)</Label>
            <Input
              id="price"
              type="number"
              placeholder="مثال: 1500"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-red-500">{errors.price.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Specifications & Extended Columns */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">مواصفات السكن والجامعة</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Walking minutes to university */}
          <div className="space-y-1.5">
            <Label htmlFor="walking_minutes_to_university">
              وقت المشي للجامعة (بالدقائق)
            </Label>
            <Input
              id="walking_minutes_to_university"
              type="number"
              placeholder="مثال: 7"
              {...register("walking_minutes_to_university", {
                valueAsNumber: true,
              })}
            />
          </div>

          {/* Floor */}
          <div className="space-y-1.5">
            <Label htmlFor="floor">الدور / الطابق</Label>
            <Input
              id="floor"
              type="number"
              placeholder="0 للأرضي، 1، 2، 3..."
              {...register("floor", { valueAsNumber: true })}
            />
          </div>

          {/* Students per room */}
          <div className="space-y-1.5">
            <Label htmlFor="students_per_room">سعة الغرفة (كم طالب بالمتوسط)</Label>
            <Input
              id="students_per_room"
              type="number"
              placeholder="مثال: 2"
              {...register("students_per_room", { valueAsNumber: true })}
            />
          </div>

          {/* Total Beds */}
          <div className="space-y-1.5">
            <Label htmlFor="total_beds">إجمالي الأسرّة في الشقة</Label>
            <Input
              id="total_beds"
              type="number"
              min={1}
              {...register("total_beds", { valueAsNumber: true })}
            />
            {errors.total_beds && (
              <p className="text-xs text-red-500">{errors.total_beds.message}</p>
            )}
          </div>

          {/* Available Beds */}
          <div className="space-y-1.5">
            <Label htmlFor="available_beds">الأسرّة المتاحة حالياً</Label>
            <Input
              id="available_beds"
              type="number"
              min={0}
              {...register("available_beds", { valueAsNumber: true })}
            />
            {errors.available_beds && (
              <p className="text-xs text-red-500">
                {errors.available_beds.message}
              </p>
            )}
          </div>

          {/* Rooms Count */}
          <div className="space-y-1.5">
            <Label htmlFor="rooms_count">عدد الغرف في السكن</Label>
            <Input
              id="rooms_count"
              type="number"
              min={1}
              {...register("rooms_count", { valueAsNumber: true })}
            />
          </div>

          {/* Deposit */}
          <div className="space-y-1.5">
            <Label htmlFor="deposit">مبلغ التأمين (ج.م) - اختياري</Label>
            <Input
              id="deposit"
              type="number"
              placeholder="0 أو فارغ إذا بدون تأمين"
              {...register("deposit", { valueAsNumber: true })}
            />
          </div>

          {/* Contract months */}
          <div className="space-y-1.5">
            <Label htmlFor="contract_months">مدة العقد (شهور)</Label>
            <Input
              id="contract_months"
              type="number"
              placeholder="مثال: 10"
              {...register("contract_months", { valueAsNumber: true })}
            />
          </div>

          {/* Maps URL */}
          <div className="space-y-1.5">
            <Label htmlFor="maps_url">رابط خرائط Google (Maps URL)</Label>
            <Input
              id="maps_url"
              placeholder="https://maps.google.com/..."
              dir="ltr"
              {...register("maps_url")}
            />
          </div>
        </div>

        {/* Checkboxes: Furnished & Utilities Included */}
        <div className="pt-2 flex flex-wrap gap-6 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <Checkbox
              checked={watchedFurnished}
              onCheckedChange={(checked) => setValue("furnished", !!checked)}
            />
            <span>مفروشة بالكامل (أثاث، مراتب، أجهزة)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <Checkbox
              checked={watchedUtilities}
              onCheckedChange={(checked) =>
                setValue("utilities_included", !!checked)
              }
            />
            <span>السعر شامل الفواتير (كهرباء / مياه / غاز / إنترنت)</span>
          </label>
        </div>

        {/* Derived status info box */}
        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span className="font-semibold text-teal-900">
              حالة السكن (محسوبة تلقائياً من الأسرّة المتاحة):
            </span>
          </div>
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${getStatusStyles(
              derivedStatus
            )}`}
          >
            {getStatusLabel(derivedStatus)} ({watchedAvailableBeds} من أصل{" "}
            {watchedTotalBeds})
          </span>
        </div>
      </div>

      {/* Admin-only info */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-700" />
          <h3 className="font-bold text-amber-900 text-sm">
            بيانات سرية خاصة بالمشرفين (Admin-Only)
          </h3>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          هذه البيانات تظهر لك فقط في لوحة التحكم ولن تظهر للطلاب أو الزوار نهائياً في أي مكان.
        </p>
        <div className="max-w-md space-y-1.5">
          <Label htmlFor="owner_phone">رقم هاتف / واتساب المالك الحقيقي</Label>
          <Input
            id="owner_phone"
            placeholder="01XXXXXXXXX"
            dir="ltr"
            className="bg-white text-right"
            {...register("owner_phone")}
          />
        </div>
      </div>

      {/* Location Desc & Video */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">الموقع والفيديو والوصف</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="location_desc">وصف الموقع التقريبي والعلامة المميزة</Label>
            <Input
              id="location_desc"
              placeholder="مثال: المساعيد - 4 دقائق من بوابة الجامعة، أمام سوبرماركت الفيروز"
              {...register("location_desc")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="youtube_video_url">
              رابط جولة الفيديو من يوتيوب (يوتيوب أو يوتيوب شورتس - اختياري)
            </Label>
            <Input
              id="youtube_video_url"
              placeholder="https://www.youtube.com/watch?v=... أو https://youtube.com/shorts/..."
              dir="ltr"
              {...register("youtube_video_url")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">وصف تفصيلي للسكن (اختياري)</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="اكتب تفاصيل إضافية عن السكن، الهدوء، العمارة، القرب من الخدمات..."
              {...register("description")}
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">المرافق والخدمات</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AMENITY_OPTIONS.map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs sm:text-sm text-slate-700 transition"
            >
              <Checkbox
                checked={selectedAmenities.includes(item.value)}
                onCheckedChange={() => toggleAmenity(item.value)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images Upload */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">صور السكن</h3>
          <span className="text-xs text-slate-500 font-medium">
            {images.length} من 10 صور كحد أقصى
          </span>
        </div>

        {uploadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group"
            >
              <Image
                src={img}
                alt={`صورة ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm opacity-90 hover:opacity-100 transition cursor-pointer"
                aria-label="حذف الصورة"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {images.length < 10 && (
            <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-lg border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition cursor-pointer text-slate-400 hover:text-teal-700">
              {uploading ? (
                <div className="flex flex-col items-center gap-1.5 text-xs text-teal-700">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>جاري الضغط والرفع...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-xs">
                  <ImagePlus className="h-6 w-6" />
                  <span className="font-semibold">إضافة صور</span>
                  <span className="text-[10px] text-slate-400">
                    JPG أو PNG أو WebP
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
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending || uploading}
        className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-base rounded-xl transition shadow-xs cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
            جاري حفظ البيانات...
          </>
        ) : property ? (
          "تحديث بيانات السكن"
        ) : (
          "إضافة السكن الآن"
        )}
      </Button>
    </form>
  );
}
