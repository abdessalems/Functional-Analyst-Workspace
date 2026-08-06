import * as React from "react";

import { cn } from "@/lib/utils";

export interface DistributionRow {
  label: string;
  count: number;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
}

const TONE_BAR: Record<NonNullable<DistributionRow["tone"]>, string> = {
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-slate-400 dark:bg-slate-500",
};

/**
 * Proportional breakdown of artefact states. Deliberately a labelled list with
 * a magnitude bar rather than a chart — analysts read the numbers, not shapes.
 */
export function DistributionList({ rows }: { rows: DistributionRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => {
        const percent = Math.round((row.count / total) * 100);
        return (
          <li key={row.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate">{row.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                <span className="font-medium text-foreground">{row.count}</span> · {percent}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", TONE_BAR[row.tone ?? "primary"])}
                style={{ width: `${Math.max(percent, row.count > 0 ? 2 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
