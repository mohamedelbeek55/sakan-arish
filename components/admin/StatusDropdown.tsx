"use client";

import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Loader2, AlertCircle, X } from "lucide-react";
import {
  getStatusLabel,
  getStatusStyles,
  derivePropertyStatus,
} from "@/lib/utils";
import { updateStatusAction } from "@/app/actions/property";

interface StatusDropdownProps {
  propertyId: string;
  currentStatus: string;
  totalBeds?: number;
  rentalType?: string;
  onStatusChange?: (newStatus: string) => void;
}

const statuses = ["available", "one_bed_left", "booked"] as const;

export default function StatusDropdown({
  propertyId,
  currentStatus,
  totalBeds = 1,
  rentalType = "bed",
  onStatusChange,
}: StatusDropdownProps) {
  const [status, setStatus] = useState(currentStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Only render "one_bed_left" option when rentalType === "bed"
  const availableStatuses = statuses.filter(
    (s) => s !== "one_bed_left" || rentalType === "bed"
  );

  const handleStatusChange = (newStatus: string) => {
    const previousStatus = status;
    setErrorMessage(null);

    startTransition(async () => {
      // Calculate available beds according to rule: booked -> 0, one_bed_left -> 1, available -> total_beds
      const availableBeds =
        newStatus === "booked" ? 0 : newStatus === "one_bed_left" ? 1 : totalBeds;
      const computedStatus = derivePropertyStatus(availableBeds, totalBeds, rentalType);

      // Optimistic state update
      setStatus(computedStatus);

      // Check the result of updateStatusAction
      const result = await updateStatusAction(propertyId, newStatus);
      if (!result.success) {
        // On failure: revert the optimistic state and show error message
        setStatus(previousStatus);
        setErrorMessage(result.error || "فشل تحديث الحالة في قاعدة البيانات");
      } else {
        onStatusChange?.(computedStatus);
      }
    });
  };

  return (
    <div className="relative inline-block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-1.5 text-xs ${getStatusStyles(status)}`}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : null}
            {getStatusLabel(status)}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableStatuses.map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusChange(s)}
              className="gap-2 cursor-pointer"
            >
              {status === s && <Check className="h-3.5 w-3.5 text-teal-700" />}
              <span className={status === s ? "font-medium" : ""}>
                {getStatusLabel(s)}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Inline failure notification with rollback message */}
      {errorMessage && (
        <div className="absolute top-full right-0 mt-1 z-50 flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg animate-in fade-in">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="mr-1 text-white/80 hover:text-white"
            aria-label="إغلاق التنبيه"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
