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
  className = "border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-bold rounded-xl",
  variant = "outline",
}: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
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
