"use client";

import { statutLabel, statutColor } from "@/lib/utils";

interface StatusBadgeProps {
  statut: string;
  className?: string;
}

export default function StatusBadge({ statut, className = "" }: StatusBadgeProps) {
  const colorClass = statutColor(statut);
  const label = statutLabel(statut);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
