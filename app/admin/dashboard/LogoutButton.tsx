"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  variant?: "outline" | "ghost" | "destructive" | "default";
}

export default function LogoutButton({
  className = "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium",
  variant = "outline",
}: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      // Clear local session cookie
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;";
      
      // Sign out from Supabase Auth
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }

      router.push("/admin/login");
      router.refresh();
    });
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className={`gap-1.5 cursor-pointer ${className}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>تسجيل الخروج</span>
    </Button>
  );
}
