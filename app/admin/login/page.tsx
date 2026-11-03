"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn, ShieldCheck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    setError(null);
    startTransition(async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (authError) {
          if (
            authError.message.includes("Invalid login credentials") ||
            authError.message.includes("invalid_credentials")
          ) {
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
          } else {
            setError("تعذر تسجيل الدخول، يرجى التأكد من البيانات المدخلة");
          }
        } else if (authData?.user) {
          router.push("/admin/dashboard");
          router.refresh();
        }
      } catch {
        setError("حدث خطأ أثناء تسجيل الدخول. يرجى التحقق من اتصال الإنترنت.");
      }
    });
  };

  return (
    <div className="flex min-h-[82vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        {/* Return to website */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#0369A1] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>العودة للمنصة الرئيسية</span>
          </Link>
        </div>

        <Card className="rounded-2xl border border-[#EBE6DC] bg-white shadow-sm overflow-hidden">
          <CardHeader className="text-center pb-4 pt-7 px-6 sm:px-8 space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#0369A1] border border-sky-100 shadow-2xs">
              <ShieldCheck className="h-7 w-7 text-[#0369A1]" />
            </div>
            <CardTitle className="text-2xl font-black text-stone-900">
              تسجيل دخول المشرف
            </CardTitle>
            <CardDescription className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
              أهلاً بيك، ادخل بيانات حسابك للوصول للوحة تحكم سكن طلاب العريش
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-2 sm:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 leading-relaxed text-right animate-in fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-stone-700">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  placeholder="admin@example.com"
                  className="h-11 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-stone-700">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-rose-600 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold text-sm rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer mt-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 ml-2" />
                    دخول للوحة التحكم
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
