import * as React from "react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/**
 * Single mapping from any workspace status string to a visual tone, so the same
 * word never renders in two different colours across pages.
 */
const STATUS_TONE: Record<string, BadgeVariant> = {
  // Artefact lifecycle
  Draft: "neutral",
  "In Review": "warning",
  Approved: "info",
  Implemented: "success",
  Deprecated: "neutral",
  Rejected: "danger",
  // Project lifecycle
  Completed: "success",
  "In Progress": "info",
  Planned: "neutral",
  "On Hold": "warning",
  // Test execution
  Passed: "success",
  Failed: "danger",
  Blocked: "warning",
  "Not Run": "neutral",
  // Validation / service
  Validated: "success",
  "Needs Review": "warning",
  Live: "success",
  "In Development": "info",
  // Dependencies & milestones
  Resolved: "success",
  "On Track": "info",
  "At Risk": "warning",
  Upcoming: "neutral",
  // Coverage
  Full: "success",
  Partial: "warning",
  Gap: "danger",
};

export function StatusBadge({
  status,
  className,
  ...props
}: { status: string } & Omit<BadgeProps, "variant" | "children">) {
  return (
    <Badge variant={STATUS_TONE[status] ?? "neutral"} className={cn("shrink-0", className)} {...props}>
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current opacity-70"
      />
      {status}
    </Badge>
  );
}

const PRIORITY_TONE: Record<string, BadgeVariant> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  return (
    <Badge variant={PRIORITY_TONE[priority] ?? "neutral"} className={cn("shrink-0", className)}>
      {priority}
    </Badge>
  );
}

const METHOD_TONE: Record<string, string> = {
  GET: "bg-sky-600",
  POST: "bg-emerald-600",
  PUT: "bg-amber-600",
  PATCH: "bg-violet-600",
  DELETE: "bg-red-600",
};

export function MethodBadge({ method, className }: { method: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[3.75rem] shrink-0 items-center justify-center rounded px-2 py-1 text-micro font-bold tracking-wide text-white",
        METHOD_TONE[method] ?? "bg-slate-600",
        className,
      )}
    >
      {method}
    </span>
  );
}

const RISK_TONE: Record<string, BadgeVariant> = {
  High: "danger",
  Medium: "warning",
  Low: "success",
};

export function RiskBadge({ level, className }: { level: string; className?: string }) {
  return (
    <Badge variant={RISK_TONE[level] ?? "neutral"} className={className}>
      {level}
    </Badge>
  );
}
