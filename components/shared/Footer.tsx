"use client";

import Link from "next/link";
import { MapPin, MessageSquare, Shield } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const whatsappNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER?.trim() || "201012345678";

  // Minimal footer for admin dashboard and login
  if (isAdminRoute) {
    return (
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        © 2026 سكن طلاب العريش — لوحة التحكم الإدارية المركزية
      </footer>
    );
  }

  // Stitch Design Public Footer
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-700 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0D3B4C] text-white flex items-center justify-center shadow-xs">
                <MapPin className="h-5 w-5 text-[#D97706]" />
              </div>
              <span className="font-extrabold text-lg text-[#0D3B4C]">
                سكن طلاب العريش
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
              المنصة الأهلية المستقلة لمساعدة طلاب جامعة سيناء وجامعة العريش في إيجاد سكن جامعي آمن ومريح وموثوق بمحافظة شمال سيناء بدون وسطاء أو عمولات.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-[#0D3B4C] mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/?area=al_masaeed#browse-listings"
                  className="text-slate-600 hover:text-[#0F766E] transition-colors"
                >
                  سكنات المساعيد (جامعة سيناء)
                </Link>
              </li>
              <li>
                <Link
                  href="/?area=al_dahiya#browse-listings"
                  className="text-slate-600 hover:text-[#0F766E] transition-colors"
                >
                  سكنات الضاحية (جامعة العريش)
                </Link>
              </li>
              <li>
                <Link
                  href="/list-your-property"
                  className="text-slate-600 hover:text-[#0F766E] transition-colors"
                >
                  إضافة عقار جديد
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-slate-600 hover:text-[#0F766E] transition-colors flex items-center gap-1"
                >
                  <Shield className="h-3.5 w-3.5" /> لوحة إدارة المنصة
                </Link>
              </li>
            </ul>
          </div>

          {/* Support and Assistance */}
          <div>
            <h4 className="font-bold text-sm text-[#0D3B4C] mb-3">الدعم والمساعدة</h4>
            <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">
              للاستفسارات ومساعدة الطلاب وأولياء الأمور:
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                "السلام عليكم، أحتاج مساعدة واستفسار بخصوص السكن في العريش."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#16A34A] hover:underline bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl"
            >
              <MessageSquare className="h-4 w-4 text-[#16A34A]" />
              دعم الطلاب عبر واتساب
            </a>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 سكن طلاب العريش. جميع الحقوق محفوظة لطلاب شمال سيناء.</p>
          <p className="mt-2 sm:mt-0 font-medium text-slate-400">
            تصميم وتطوير رقمي مخصص لخدمة مجتمع العريش الجامعي
          </p>
        </div>
      </div>
    </footer>
  );
}
