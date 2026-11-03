import Link from "next/link";
import { Building2 } from "lucide-react";
import { buildOwnerWhatsAppUrl, getWhatsAppNumber } from "@/lib/utils";

export default function Footer() {
  const whatsappNumber = getWhatsAppNumber();

  return (
    <footer className="border-t border-slate-200 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900">سكن طلاب العريش</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              منصة تربط طلاب جامعة سيناء وجامعة العريش بالسكن المناسب بدون وسطاء.
              تصفّح، قارن، واحجز سكنك مباشرة.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-teal-700 transition-colors">
                  تصفّح السكنات
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-slate-500 hover:text-teal-700 transition-colors">
                  عن المنصة
                </Link>
              </li>
              <li>
                <Link
                  href="/list-your-property"
                  className="text-teal-700 font-semibold hover:underline"
                >
                  صاحب سكن؟ أعلن معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Areas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">المناطق</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>المساعيد — جامعة سيناء</li>
              <li>الضاحية — جامعة العريش</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} سكن طلاب العريش. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
