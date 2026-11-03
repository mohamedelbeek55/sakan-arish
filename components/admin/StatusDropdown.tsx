"use client";

import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Loader2 } from "lucide-react";
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
  onStatusChange?: (newStatus: string) => void;
}

const statuses = ["available", "one_bed_left", "booked"] as const;

export default function StatusDropdown({
  propertyId,
  currentStatus,
  totalBeds = 1,
  onStatusChange,
}: StatusDropdownProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      // Calculate available beds according to rule: booked -> 0, one_bed_left -> 1, available -> total_beds
      const availableBeds =
        newStatus === "booked" ? 0 : newStatus === "one_bed_left" ? 1 : totalBeds;
      const computedStatus = derivePropertyStatus(availableBeds);

      setStatus(computedStatus);
      await updateStatusAction(propertyId, newStatus);
      onStatusChange?.(computedStatus);
    });
  };

  return (
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
        {statuses.map((s) => (
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
  );
}
