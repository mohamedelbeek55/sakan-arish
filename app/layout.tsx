import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "سكن طلاب العريش | ابحث عن سكنك بسهولة",
  description:
    "منصة سكن طلاب العريش تساعدك في إيجاد السكن المناسب بالقرب من جامعة سيناء وجامعة العريش. تصفّح الإعلانات، شاهد الصور والفيديوهات، وتواصل مباشرة مع صاحب السكن عبر واتساب.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FBF9F5] text-stone-900 selection:bg-sky-100 selection:text-sky-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
