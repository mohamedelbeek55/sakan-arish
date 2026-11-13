"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/actions/submission";

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
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
        <Check className="h-4 w-4 text-emerald-600" />
        تم الاعتماد
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl">
        <X className="h-4 w-4 text-rose-500" />
        مرفوض للتعديل
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleReject}
        className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs h-9 px-3.5 gap-1.5 rounded-xl cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
        رفض الطلب
      </Button>

      <Button
        size="sm"
        disabled={isPending}
        onClick={handleApprove}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 gap-1.5 rounded-xl cursor-pointer shadow-xs"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Check className="h-3.5 w-3.5" />
            اعتماد ونشر السكن فوراً
          </>
        )}
      </Button>
    </div>
  );
}
