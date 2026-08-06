import * as React from "react";
import { Check, CircleDashed, LoaderCircle, TriangleAlert } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";

export interface TimelineEntry {
  id: string;
  label: string;
  date: string;
  status: "Completed" | "In Progress" | "Upcoming" | "At Risk";
  description: string;
}

const STATUS_STYLES = {
  Completed: {
    icon: Check,
    dot: "border-emerald-500 bg-emerald-500 text-white",
    line: "bg-emerald-500/40",
  },
  "In Progress": {
    icon: LoaderCircle,
    dot: "border-sky-500 bg-sky-500 text-white",
    line: "bg-border",
  },
  "At Risk": {
    icon: TriangleAlert,
    dot: "border-amber-500 bg-amber-500 text-white",
    line: "bg-border",
  },
  Upcoming: {
    icon: CircleDashed,
    dot: "border-border bg-surface text-muted-foreground",
    line: "bg-border",
  },
} as const;

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative space-y-0">
      {entries.map((entry, index) => {
        const style = STATUS_STYLES[entry.status];
        const Icon = style.icon;
        const isLast = index === entries.length - 1;

        return (
          <li key={entry.id} className="relative flex gap-3.5 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn("absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px", style.line)}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                style.dot,
              )}
            >
              <Icon className="size-3" />
            </span>
            <div className="min-w-0 flex-1 space-y-0.5 pb-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium">{entry.label}</p>
                <time className="text-xs tabular-nums text-muted-foreground" dateTime={entry.date}>
                  {formatDate(entry.date)}
                </time>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{entry.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
