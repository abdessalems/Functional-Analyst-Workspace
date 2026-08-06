import * as React from "react";

import { cn } from "@/lib/utils";

export interface DefinitionItem {
  label: string;
  value: React.ReactNode;
}

/** Label/value grid used across Overview, detail panels and document cards. */
export function DefinitionList({
  items,
  columns = 2,
  className,
}: {
  items: DefinitionItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-1">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="text-sm leading-relaxed">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Compact inline variant for card footers. */
export function InlineFacts({
  items,
  className,
}: {
  items: DefinitionItem[];
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
