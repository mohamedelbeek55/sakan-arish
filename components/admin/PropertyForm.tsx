"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, ImagePlus, AlertCircle } from "lucide-react";
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
import { AMENITY_OPTIONS } from "@/lib/utils";
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
      available_beds: property?.available_beds || 1,
      youtube_video_url: property?.youtube_video_url || "",
      description: property?.description || "",
    },
  });

  const watchedArea = watch("area");
  const watchedGender = watch("gender");
  const watchedRentalType = watch("rental_type");
  const watchedYoutubeUrl = watch("youtube_video_url");

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

    // 1. Limit total images to 10
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
      // 2. Validate file type
      if (!allowedMimeTypes.includes(file.type)) {
        setUploadError(
          `الملف "${file.name}" غير مدعوم. يرجى اختيار صور بصيغة JPG أو PNG أو WebP فقط.`
        );
        continue;
      }

      // 3. Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(
          `حجم الصورة "${file.name}" كبير جداً (أكبر من 10 ميجابايت).`
        );
        continue;
      }

      try {
        // 4. Client-side compression to WebP (max 1600px, quality 0.82)
        const compressedBlob = await compressImage(file);

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        const filePath = `properties/${fileName}`;

        // 5. Upload directly to Supabase Storage
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

      const payload = {
        ...data,
        location_desc: data.location_desc || "",
        rooms_count: data.rooms_count || 1,
        status: property?.status || "available",
        amenities: selectedAmenities,
        images,
        youtube_video_url: cleanVideoUrl,
        description: data.description || null,
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
              placeholder="مثال: شقة 3 غرف بالمساعيد"
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
            <Label>النوع</Label>
            <Select
              value={watchedGender}
              onValueChange={(v) =>
                setValue("gender", v as "male" | "female", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر النوع" />
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

          {/* Rooms Count */}
          <div className="space-y-1.5">
            <Label htmlFor="rooms_count">عدد الغرف في الشقة</Label>
            <Input
              id="rooms_count"
              type="number"
              min={1}
              placeholder="مثال: 3"
              {...register("rooms_count", { valueAsNumber: true })}
            />
            {errors.rooms_count && (
              <p className="text-xs text-red-500">{errors.rooms_count.message}</p>
            )}
          </div>

          {/* Location Description */}
          <div className="space-y-1.5">
            <Label htmlFor="location_desc">وصف الموقع التقريبي (اختياري)</Label>
            <Input
              id="location_desc"
              placeholder="مثال: المساعيد - 4 دقائق من بوابة الجامعة، أمام سوبرماركت الفيروز"
              {...register("location_desc")}
            />
            {errors.location_desc && (
              <p className="text-xs text-red-500">
                {errors.location_desc.message}
              </p>
            )}
          </div>

          {/* Total Beds */}
          <div className="space-y-1.5">
            <Label htmlFor="total_beds">إجمالي الأسرّة في السكن</Label>
            <Input
              id="total_beds"
              type="number"
              min={1}
              {...register("total_beds", { valueAsNumber: true })}
            />
            {errors.total_beds && (
              <p className="text-xs text-red-500">
                {errors.total_beds.message}
              </p>
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
        </div>
      </div>

      {/* Amenities */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">المرافق والخدمات</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {AMENITY_OPTIONS.map((amenity) => (
            <label
              key={amenity.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedAmenities.includes(amenity.value)}
                onCheckedChange={() => toggleAmenity(amenity.value)}
              />
              <span className="text-sm text-slate-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            الصور ({images.length} / 10)
          </h3>
          <span className="text-xs text-slate-400">
            يتم ضغط الصور تلقائياً لصيغة WebP لتسريع التصفح
          </span>
        </div>

        {uploadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 group"
            >
              <Image
                src={img}
                alt={`صورة ${i + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100 shadow-sm"
                title="حذف الصورة"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          {images.length < 10 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-teal-400 hover:text-teal-600">
              {uploading ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                  <span className="text-[11px] text-slate-500">جاري الضغط والرفع...</span>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">رفع صور</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* YouTube & Description */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">معلومات إضافية</h3>

        <div className="space-y-1.5">
          <Label htmlFor="youtube_video_url">رابط فيديو يوتيوب أو Shorts (اختياري)</Label>
          <Input
            id="youtube_video_url"
            placeholder="مثال: https://youtube.com/shorts/... أو https://youtu.be/..."
            dir="ltr"
            {...register("youtube_video_url")}
          />
          {watchedYoutubeUrl && watchedYoutubeUrl.trim() && (
            extractYouTubeId(watchedYoutubeUrl) ? (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ تم التعرف على رابط يوتيوب بنجاح (سيظهر المشغل في صفحة السكن)
              </p>
            ) : (
              <p className="text-xs text-amber-600">
                تأكد من كتابة رابط يوتيوب صحيح (يدعم الفيديوهات العادية وروابط Shorts)
              </p>
            )
          )}
          {errors.youtube_video_url && (
            <p className="text-xs text-red-500">
              {errors.youtube_video_url.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">وصف تفصيلي (اختياري)</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="أضف وصفاً تفصيلياً للسكن..."
            {...register("description")}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending || uploading} className="min-w-[140px]">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : property ? (
            "حفظ التعديلات"
          ) : (
            "إضافة السكن"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/dashboard")}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}
