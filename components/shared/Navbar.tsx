"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Shield,
  LogOut,
  Inbox,
  Plus,
  Home,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const isAdminRoute = pathname?.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    if (isAdminRoute) {
      supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .then(({ count }) => {
          if (typeof count === "number") {
            setPendingCount(count);
          }
        });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdminRoute]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAdmin(false);
    setMobileMenuOpen(false);
    router.push("/admin/login");
    router.refresh();
  };

  // 1. Minimal Header for Admin Login Page
  if (isLoginPage) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0D3B4C] text-white flex items-center justify-center shadow-xs">
              <MapPin className="h-6 w-6 text-[#D97706]" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-[#0D3B4C] block leading-none">
                سكن طلاب العريش
              </span>
              <span className="text-[11px] sm:text-xs text-[#0F766E] font-semibold">
                بوابة الإدارة المركزية والتحكم
              </span>
            </div>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold gap-1.5 h-9"
            >
              <Home className="h-3.5 w-3.5 text-slate-500" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>
    );
  }

  // 2. Dedicated Admin Navbar (when inside /admin/dashboard, etc.)
  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex h-18 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
          {/* Brand + Admin Tag */}
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0D3B4C] text-white flex items-center justify-center shadow-xs">
                <MapPin className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-[#0D3B4C] block leading-none">
                  سكن طلاب العريش
                </span>
                <span className="text-[11px] sm:text-xs text-[#0F766E] font-semibold">
                  لوحة تحكم المشرف العام
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2 mr-6 pr-6 border-r border-slate-200">
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs font-bold rounded-xl h-9.5 px-3.5 transition-colors ${
                    pathname === "/admin/dashboard"
                      ? "bg-[#0D3B4C] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0D3B4C] hover:bg-slate-100"
                  }`}
                >
                  إدارة العقارات والتحكم
                </Button>
              </Link>

              <Link href="/admin/dashboard/submissions">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative text-xs font-bold rounded-xl h-9.5 px-3.5 gap-1.5 transition-colors ${
                    pathname?.startsWith("/admin/dashboard/submissions")
                      ? "bg-[#0D3B4C] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0D3B4C] hover:bg-slate-100"
                  }`}
                >
                  <Inbox className="h-4 w-4" />
                  طلبات أصحاب الشقق
                  {pendingCount > 0 && (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#B45309] px-1.5 text-[10px] font-black text-white">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/admin/dashboard/new">
                <Button
                  size="sm"
                  className="bg-[#0F766E] hover:bg-[#0F766E]/90 text-white font-bold rounded-xl h-9.5 text-xs shadow-xs gap-1.5 px-4 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  إضافة عقار جديد
                </Button>
              </Link>
            </nav>
          </div>

          {/* Desktop Left Controls */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl h-9.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                معاينة الموقع للطلاب
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl h-9.5 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              تسجيل الخروج
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-700 hover:bg-slate-100 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Admin Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden p-4 space-y-2">
            <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs font-bold text-slate-800 rounded-xl h-10"
              >
                إدارة العقارات والتحكم
              </Button>
            </Link>

            <Link
              href="/admin/dashboard/submissions"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-xs font-bold text-slate-800 rounded-xl h-10 gap-2"
              >
                <Inbox className="h-4 w-4 text-[#0D3B4C]" />
                طلبات أصحاب الشقق
                {pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B45309] px-1.5 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link
              href="/admin/dashboard/new"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full justify-start bg-[#0F766E] hover:bg-[#0F766E]/90 text-white text-xs font-bold rounded-xl h-10 gap-2">
                <Plus className="h-4 w-4" />
                إضافة عقار جديد
              </Button>
            </Link>

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-300 text-slate-700 text-xs font-bold rounded-xl h-10 gap-2"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                  معاينة الموقع للطلاب
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl h-10 gap-2"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // 3. Standard Public Navbar for Students & Visitors
  return (
    <>
      {/* Top Announcement Bar (Stitch design) */}
      <aside className="bg-[#0D3B4C] text-white py-2 px-4 text-center text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#D97706]" />
            جميع العقارات المعروضة مفحوصة وموثقة لطلاب وطالبات الجامعات في العريش
          </span>
          <div className="hidden md:flex items-center gap-4 text-white/80">
            {isAdmin ? (
              <Link
                href="/admin/dashboard"
                className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-xs"
              >
                <Shield className="h-3.5 w-3.5 text-[#2DD4BF]" /> لوحة التحكم الإدارية
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="hover:text-white transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <Lock className="h-3.5 w-3.5 text-white/70" /> بوابة المشرفين
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0D3B4C] text-white flex items-center justify-center shadow-xs">
              <MapPin className="h-6 w-6 text-[#D97706]" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-xl text-[#0D3B4C] block leading-none">
                سكن طلاب العريش
              </span>
              <span className="text-xs text-[#0F766E] font-semibold mt-1 block">
                جامعة سيناء • جامعة العريش
              </span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#browse-listings"
              className="text-sm font-bold text-[#0D3B4C] hover:text-[#0F766E] transition-colors"
            >
              تصفح السكنات
            </Link>
            <Link
              href="/#universities"
              className="text-sm font-medium text-slate-600 hover:text-[#0D3B4C] transition-colors"
            >
              الجامعات والمناطق
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-[#0D3B4C] transition-colors"
            >
              كيف يعمل السكن؟
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium text-slate-600 hover:text-[#0D3B4C] transition-colors"
            >
              عن المنصة
            </Link>
          </nav>

          {/* Header CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/list-your-property">
              <Button
                size="sm"
                className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] text-white hover:bg-[#0F766E]/90 transition-all shadow-xs text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>أضف عقارك</span>
              </Button>
            </Link>

            {isAdmin && (
              <div className="hidden md:flex items-center gap-2 mr-2 pr-2 border-r border-slate-200">
                <Link href="/admin/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300 text-[#0D3B4C] rounded-xl text-xs font-bold gap-1"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    لوحة التحكم
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-700 hover:bg-slate-100 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden p-4 space-y-3">
            <nav className="flex flex-col gap-2">
              <Link
                href="/#browse-listings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-800 p-2 rounded-lg hover:bg-slate-50"
              >
                تصفح السكنات
              </Link>
              <Link
                href="/#universities"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50"
              >
                الجامعات والمناطق
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50"
              >
                كيف يعمل السكن؟
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50"
              >
                عن المنصة
              </Link>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/list-your-property"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-[#0F766E] hover:bg-[#0F766E]/90 text-white font-bold rounded-xl h-11 gap-2">
                  <Plus className="h-4 w-4" />
                  أضف عقارك كسكن للطلاب
                </Button>
              </Link>

              {isAdmin ? (
                <div className="flex gap-2">
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-slate-300 text-[#0D3B4C] text-xs font-bold rounded-xl h-10 gap-1.5"
                    >
                      <Shield className="h-4 w-4" />
                      لوحة المشرف
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl h-10 px-3"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full text-slate-500 hover:text-slate-800 text-xs font-medium rounded-xl h-9 gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    بوابة المشرفين
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
