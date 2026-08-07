"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import type { Requirement, TraceabilityLink } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatusBadge } from "@/components/common/status-badge";
import { TraceChain } from "@/features/traceability/components/trace-chain";

/**
 * The default reading of the matrix: one requirement at a time, followed down
 * its chain. Nine columns side by side is a grid nobody reads; the same data
 * read vertically is a story — this requirement, these rules, this model, this
 * test.
 */
export function TraceList({
  links,
  getRequirementById,
  highlight,
}: {
  links: TraceabilityLink[];
  getRequirementById: (id: string) => Requirement | undefined;
  highlight: string | null;
}) {
  const [open, setOpen] = React.useState<string | null>(links[0]?.requirementId ?? null);

  React.useEffect(() => {
    if (highlight) setOpen(highlight);
  }, [highlight]);

  return (
    <div className="space-y-3">
      {links.map((link) => {
        const requirement = getRequirementById(link.requirementId);
        const isOpen = open === link.requirementId;
        const linked =
          link.businessRuleIds.length +
          link.diagramIds.length +
          link.apiIds.length +
          link.sqlValidationIds.length +
          link.testCaseIds.length +
          link.documentIds.length;

        return (
          <Card
            key={link.requirementId}
            id={link.requirementId}
            className={cn(
              "scroll-mt-24 overflow-hidden",
              highlight === link.requirementId && "border-primary/50 ring-1 ring-primary/20",
            )}
          >
            <Collapsible
              open={isOpen}
              onOpenChange={(next) => setOpen(next ? link.requirementId : null)}
            >
              <CollapsibleTrigger className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {link.requirementId}
                    </Badge>
                    <StatusBadge status={link.coverage} />
                    <span className="text-xs text-muted-foreground">
                      {linked} linked {linked === 1 ? "artefact" : "artefacts"}
                    </span>
                  </span>
                  <span className="block max-w-measure text-sm font-medium leading-snug">
                    {requirement?.title ?? link.requirementId}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="border-t border-border p-5">
                  <TraceChain link={link} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
