import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Small labelled facts rendered under the title (owner, version, last updated…). */
  meta?: { label: string; value: React.ReactNode }[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, meta, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 pb-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description && (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {meta && meta.length > 0 && (
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-3 text-[13px]">
          {meta.map((entry) => (
            <div key={entry.label} className="flex items-center gap-1.5">
              <dt className="text-muted-foreground">{entry.label}</dt>
              <dd className="font-medium">{entry.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
