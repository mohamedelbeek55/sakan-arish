"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Menu,
  X,
  Shield,
  LogOut,
  Inbox,
  Plus,
  Home,
  ExternalLink,
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

  const whatsappNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER?.trim() || "";
  const ownerWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "السلام عليكم، أنا صاحب سكن وعايز أعلن عن شقة متاحة عندي للطلبة."
  )}`;

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

    // If on admin routes, load pending submissions count
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
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b border-[#EBE6DC] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8 w-full">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0369A1] text-white shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-black text-stone-900 leading-tight truncate">
                سكن طلاب العريش
              </span>
              <span className="text-[10px] text-stone-400 font-medium truncate">
                بوابة دخول المشرف
              </span>
            </div>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-[#EBE6DC] text-stone-700 hover:bg-[#FAF7F0] rounded-xl text-xs font-bold gap-1.5 h-9 shrink-0"
            >
              <Home className="h-3.5 w-3.5 text-stone-500" />
              العودة للمنصة الرئيسية
            </Button>
          </Link>
        </div>
      </header>
    );
  }

  // 2. Dedicated Admin Navbar (when inside /admin/dashboard, etc.)
  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b border-[#EBE6DC] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8 w-full">
          {/* Brand + Admin Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
            <Link href="/admin/dashboard" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0369A1] text-white shadow-2xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base font-black text-stone-900 leading-tight truncate">
                  سكن طلاب العريش
                </span>
                <span className="text-[10px] font-bold text-[#0369A1] truncate">
                  لوحة التحكم الإدارية
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 mr-4 pr-4 border-r border-[#EBE6DC]">
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs font-bold rounded-xl h-9 transition-colors ${
                    pathname === "/admin/dashboard"
                      ? "bg-sky-50 text-[#0369A1] border border-sky-200/80"
                      : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F0]"
                  }`}
                >
                  جدول الإعلانات
                </Button>
              </Link>

              <Link href="/admin/dashboard/submissions">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative text-xs font-bold rounded-xl h-9 gap-1.5 transition-colors ${
                    pathname?.startsWith("/admin/dashboard/submissions")
                      ? "bg-sky-50 text-[#0369A1] border border-sky-200/80"
                      : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F0]"
                  }`}
                >
                  <Inbox className="h-4 w-4 text-[#0369A1]" />
                  طلبات أصحاب الشقق
                  {pendingCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-2xs">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/admin/dashboard/new">
                <Button
                  size="sm"
                  className="bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold rounded-xl h-9 text-xs shadow-xs mr-2 gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة سكن جديد
                </Button>
              </Link>
            </nav>
          </div>

          {/* Desktop Left Controls */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="border-[#EBE6DC] bg-white hover:bg-[#FAF7F0] text-stone-700 rounded-xl h-9 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-stone-500" />
                عرض المنصة
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl h-9 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              تسجيل الخروج
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-stone-700 hover:bg-[#FAF7F0] rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Admin Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#EBE6DC] bg-white md:hidden">
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs font-bold text-stone-800 rounded-xl h-10"
                >
                  جدول الإعلانات
                </Button>
              </Link>

              <Link
                href="/admin/dashboard/submissions"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs font-bold text-stone-800 rounded-xl h-10 gap-2"
                >
                  <Inbox className="h-4 w-4 text-[#0369A1]" />
                  طلبات أصحاب الشقق
                  {pendingCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link
                href="/admin/dashboard/new"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full justify-start bg-[#0369A1] hover:bg-[#0284C7] text-white text-xs font-bold rounded-xl h-10 gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة سكن جديد
                </Button>
              </Link>

              <div className="pt-2 border-t border-[#EBE6DC] flex flex-col gap-2">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#EBE6DC] text-stone-700 text-xs font-bold rounded-xl h-10 gap-2"
                  >
                    <ExternalLink className="h-4 w-4 text-stone-500" />
                    عرض المنصة
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
            </nav>
          </div>
        )}
      </header>
    );
  }

  // 3. Standard Public Navbar for Students & Visitors
  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b border-[#EBE6DC] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8 w-full">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 flex-shrink">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0369A1] text-white transition-colors group-hover:bg-[#0284C7] shadow-2xs">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-black text-stone-900 leading-tight truncate">
              سكن طلاب العريش
            </span>
            <span className="text-[10px] text-stone-400 font-medium leading-tight hidden sm:block">
              جامعة سيناء • جامعة العريش
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F0] rounded-xl text-xs font-bold"
            >
              الرئيسية
            </Button>
          </Link>
          <Link href="/#about">
            <Button
              variant="ghost"
              size="sm"
              className="text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F0] rounded-xl text-xs font-bold"
            >
              عن المنصة
            </Button>
          </Link>

          <a
            href={ownerWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-1"
          >
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-[#EBE6DC] text-stone-800 bg-[#FAF7F0] hover:bg-stone-100 font-bold cursor-pointer rounded-xl text-xs"
            >
              <Building2 className="h-4 w-4 text-[#0369A1]" />
              أعلن عن سكنك
            </Button>
          </a>

          {isAdmin && (
            <div className="flex items-center gap-2 mr-2 pr-2 border-r border-[#EBE6DC]">
              <Link href="/admin/dashboard">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-[#0369A1] border-sky-200 bg-sky-50 hover:bg-sky-100 rounded-xl text-xs font-bold"
                >
                  <Shield className="h-4 w-4" />
                  لوحة التحكم
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-stone-700 hover:bg-[#FAF7F0] rounded-xl shrink-0 h-9 w-9"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="القائمة"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#EBE6DC] bg-white md:hidden">
          <nav className="flex flex-col p-4 gap-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-stone-700 text-xs font-bold rounded-xl"
              >
                الرئيسية
              </Button>
            </Link>
            <Link href="/#about" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-stone-700 text-xs font-bold rounded-xl"
              >
                عن المنصة
              </Button>
            </Link>

            <a
              href={ownerWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-sky-200 text-[#0369A1] bg-sky-50/70 hover:bg-sky-100 font-bold rounded-xl text-xs"
              >
                <Building2 className="h-4 w-4 text-[#0369A1]" />
                أعلن عن سكنك
              </Button>
            </a>

            {isAdmin && (
              <div className="pt-2 border-t border-[#EBE6DC] flex flex-col gap-2">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start text-[#0369A1] border-sky-200 bg-sky-50 rounded-xl text-xs font-bold gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    لوحة التحكم
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
