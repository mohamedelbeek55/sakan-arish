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
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
        <Check className="h-3.5 w-3.5" />
        تم الاعتماد
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
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
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 gap-1 rounded-lg cursor-pointer"
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
        className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8 gap-1 rounded-lg cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
        رفض
      </Button>
    </div>
  );
}
