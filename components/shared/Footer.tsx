"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Minimal footer for admin dashboard and login
  if (isAdminRoute) {
    return (
      <footer className="border-t border-[#EBE6DC] bg-white py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} سكن طلاب العريش — لوحة التحكم الإدارية
      </footer>
    );
  }

  // Standard public footer for students and visitors
  return (
    <footer className="border-t border-[#EBE6DC] bg-[#FAF7F0]/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0369A1] text-white shadow-2xs">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-black text-stone-900">سكن طلاب العريش</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
              منصة شبابية لخدمة طلبة جامعة سيناء وجامعة العريش. بنسهل عليك تلاقي سكن مناسب وتتواصل علطول مع صاحبه.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900">روابط سريعة</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-stone-500 hover:text-[#0369A1] transition-colors">
                  تصفّح كل السكنات
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-stone-500 hover:text-[#0369A1] transition-colors">
                  عن المبادرة
                </Link>
              </li>
              <li>
                <Link
                  href="/list-your-property"
                  className="text-[#0369A1] font-bold hover:underline"
                >
                  صاحب شقة؟ أعلن معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Areas */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900">مناطق السكن</h3>
            <ul className="space-y-2 text-xs text-stone-500">
              <li>المساعيد — جامعة سيناء وفرع العريش</li>
              <li>الضاحية — جامعة العريش ووسط البلد</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-[#EBE6DC] pt-6 text-center">
          <p className="text-xs text-stone-500">
            معمول بحب لطلبة جامعة سيناء وجامعة العريش في شمال سيناء 🌊🌴
          </p>
          <p className="text-[11px] text-stone-400 font-mono">
            © {new Date().getFullYear()} سكن طلاب العريش
          </p>
        </div>
      </div>
    </footer>
  );
}
