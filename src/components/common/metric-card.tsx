import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  caption?: string;
  href?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const TONE_STYLES: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  caption,
  href,
  tone = "default",
}: MetricCardProps) {
  const content = (
    <Card
      className={cn(
        "group lift surface-raised h-full p-4",
        href && "hover:border-primary/40 hover:shadow-raised",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          {caption && <p className="truncate text-xs text-muted-foreground">{caption}</p>}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            TONE_STYLES[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      {href && (
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open <ArrowUpRight className="size-3" />
        </span>
      )}
    </Card>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
