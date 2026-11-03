"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/actions/submission";
import Link from "next/link";

interface SubmissionActionsProps {
  submissionId: string;
  status: "pending" | "approved" | "rejected";
}

export default function SubmissionActions({
  submissionId,
  status,
}: SubmissionActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    if (!confirm("هل أنت متأكد من رغبتك في اعتماد هذا السكن ونشره في المنصة؟")) {
      return;
    }
    startTransition(async () => {
      const res = await approveSubmissionAction(submissionId);
      if (res.success && res.propertyId) {
        router.push(`/admin/dashboard/${res.propertyId}/edit`);
      } else {
        alert(res.error || "فشل اعتماد الطلب");
      }
    });
  };

  const handleReject = () => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) {
      return;
    }
    startTransition(async () => {
      const res = await rejectSubmissionAction(submissionId);
      if (!res.success) {
        alert(res.error || "فشل رفض الطلب");
      }
    });
  };

  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#166534] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
        <Check className="h-3.5 w-3.5" />
        تم الاعتماد
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg">
        <X className="h-3.5 w-3.5" />
        مرفوض
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={handleApprove}
        className="bg-[#166534] hover:bg-[#15803D] text-white font-bold text-xs h-8 gap-1.5 rounded-xl cursor-pointer shadow-2xs"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Check className="h-3.5 w-3.5" />
            قبول وتحويل لسكن
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleReject}
        className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs h-8 gap-1 rounded-xl cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
        رفض
      </Button>
    </div>
  );
}
