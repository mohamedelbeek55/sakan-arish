"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn, ShieldCheck, Mail, Lock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <main className="flex-1 flex items-center justify-center p-4 sm:p-8 py-14">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 text-right space-y-6">
        {/* Lock Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#0D3B4C]/10 text-[#0D3B4C] flex items-center justify-center mx-auto sm:mx-0">
          <ShieldCheck className="h-9 w-9 text-[#0D3B4C]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            جلسة دخول مشفرة ومحمية بالكامل
          </div>

          <h1 className="text-2xl font-black text-[#0D3B4C]">
            تسجيل دخول المشرف العام
          </h1>

          <p className="text-xs text-slate-500 leading-relaxed">
            سجّل الدخول بحسابك الإداري للوصول إلى لوحة التحكم الشاملة لإدارة وتعديل السكنات ومراجعة الطلبات.
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 leading-relaxed text-right animate-in fade-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">
              البريد الإلكتروني للإدارة
            </Label>
            <div className="relative flex items-center">
              <Mail className="absolute right-3.5 text-slate-400 h-4 w-4 pointer-events-none" />
              <Input
                id="email"
                type="email"
                dir="ltr"
                placeholder="admin@domain.com"
                className="pr-11 pl-4 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C] text-left font-mono text-sm"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">
              كلمة مرور المشرف
            </Label>
            <div className="relative flex items-center">
              <Lock className="absolute right-3.5 text-slate-400 h-4 w-4 pointer-events-none" />
              <Input
                id="password"
                type="password"
                dir="ltr"
                placeholder="••••••••••••"
                className="pr-11 pl-4 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#0D3B4C] text-left text-sm"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#0D3B4C] hover:bg-[#0D3B4C]/90 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري التحقق من بيانات الدخول...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 ml-1.5" />
                دخول لوحة التحكم والتحكم الكامل
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0D3B4C] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>العودة للمنصة الرئيسية</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
