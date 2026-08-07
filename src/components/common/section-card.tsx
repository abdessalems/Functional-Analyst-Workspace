import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Removes the content padding for tables and code panels that manage their own. */
  flush?: boolean;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  contentClassName,
  flush,
}: SectionCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        className={cn(
          "flex-row items-start justify-between gap-3 space-y-0",
          flush && "border-b border-border",
        )}
      >
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
            <span className="truncate">{title}</span>
          </CardTitle>
          {description && (
            <p className="max-w-measure text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className={cn("flex-1", flush && "p-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
