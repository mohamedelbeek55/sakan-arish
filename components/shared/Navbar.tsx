"use client";

import Link from "next/link";
import { Building2, Menu, X, Shield, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { buildOwnerWhatsAppUrl, getWhatsAppNumber } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const whatsappNumber = getWhatsAppNumber();

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAdmin(false);
    setMobileMenuOpen(false);
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white transition-colors group-hover:bg-teal-800">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 leading-tight">
              سكن طلاب العريش
            </span>
            <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">
              ابحث عن سكنك بسهولة
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              الرئيسية
            </Button>
          </Link>
          <Link href="/#about">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              عن المنصة
            </Button>
          </Link>

          <Link href="/list-your-property" className="mr-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-teal-200 text-teal-800 bg-teal-50/70 hover:bg-teal-100 hover:text-teal-900 font-semibold cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-teal-600" />
              صاحب سكن؟ أعلن معنا
            </Button>
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-2 mr-2 pr-2 border-r border-slate-200">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline" className="gap-1.5 text-teal-800 border-teal-200 bg-teal-50 hover:bg-teal-100">
                  <Shield className="h-4 w-4" />
                  لوحة التحكم
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
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
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="القائمة"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col p-4 gap-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start text-slate-600">
                الرئيسية
              </Button>
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start text-slate-600">
                عن المنصة
              </Button>
            </Link>

            <Link
              href="/list-your-property"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-teal-200 text-teal-800 bg-teal-50/70 hover:bg-teal-100 font-semibold cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-teal-600" />
                صاحب سكن؟ أعلن معنا
              </Button>
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full justify-start text-teal-800 border-teal-200 bg-teal-50">
                    <Shield className="h-4 w-4 mr-2" />
                    لوحة التحكم
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  تسجيل الخروج
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
