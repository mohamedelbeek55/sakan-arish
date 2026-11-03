"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

import { deletePropertyAction } from "@/app/actions/property";

interface DeleteButtonProps {
  propertyId: string;
}

export default function DeleteButton({ propertyId }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deletePropertyAction(propertyId);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
          title="حذف السكن"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border border-[#EBE6DC] bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-stone-900">حذف الإعلان نهائياً</DialogTitle>
          <DialogDescription className="text-xs text-stone-500 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ سيتم حذف جميع الصور والتفاصيل المرتبطة به فوراً ولا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl border-[#EBE6DC] text-stone-600 hover:bg-[#FAF7F0] text-xs font-bold"
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
            ) : (
              "تأكيد الحذف"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
