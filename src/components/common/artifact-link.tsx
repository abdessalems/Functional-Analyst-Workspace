"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { resolveArtifact } from "@/lib/artifact-links";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Clickable reference chip for a business key such as REQ-004 or TC-017. */
export function ArtifactLink({ id, className }: { id: string; className?: string }) {
  const artifact = resolveArtifact(id);

  if (!artifact) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground",
          className,
        )}
      >
        {id}
      </span>
    );
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Link
          href={artifact.href}
          className={cn(
            "inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          {id}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <span className="block text-[10px] uppercase tracking-wide opacity-70">{artifact.kind}</span>
        <span className="block">{artifact.label}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export function ArtifactLinkList({
  ids,
  emptyLabel = "None",
  className,
}: {
  ids: string[];
  emptyLabel?: string;
  className?: string;
}) {
  if (ids.length === 0) {
    return <span className="text-[13px] text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {ids.map((id) => (
        <ArtifactLink key={id} id={id} />
      ))}
    </div>
  );
}
