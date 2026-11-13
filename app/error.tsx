"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-headline text-xl font-bold text-[#0D3B4C]">
            حدث خطأ غير متوقع أثناء تحميل البيانات
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            تعذر الاتصال بخدمة البيانات في الوقت الحالي. قد يكون هناك تحديث مؤقت للخدمة أو بطء في الاتصال.
          </p>
        </div>

        {error.digest && (
          <p className="text-[11px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
            رمز الخطأ: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#0D3B4C] hover:bg-[#0D3B4C]/90 text-white rounded-xl text-xs font-bold gap-2 h-10 px-5 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>إعادة المحاولة</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold gap-2 h-10 px-5 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>الرئيسية</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

