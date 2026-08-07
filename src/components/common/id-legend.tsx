"use client";

import * as React from "react";
import { ChevronDown, KeyRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * Every artefact carries a coded identifier, and the codes are only obvious to
 * someone who already works this way. Ten seconds of reading removes that
 * barrier — collapsed by default so it never gets in the way of people who
 * already know.
 */
const PREFIXES: { prefix: string; meaning: string }[] = [
  { prefix: "FR- / REQ-", meaning: "Requirement — something the business needs" },
  { prefix: "BR-", meaning: "Business rule — a decision the system must take" },
  { prefix: "AC-", meaning: "Acceptance criterion — how you prove it was delivered" },
  { prefix: "FS-", meaning: "Specification section — detailed behaviour" },
  { prefix: "ACT-", meaning: "Actor — a person or system that takes part" },
  { prefix: "UML-", meaning: "Model — use case, sequence, class, state or BPMN" },
  { prefix: "WF-", meaning: "Wireframe — a screen design" },
  { prefix: "API-", meaning: "Endpoint — one operation in the interface contract" },
  { prefix: "SQL-", meaning: "Validation query — evidence taken from the database" },
  { prefix: "TC-", meaning: "Test case — a check that the system behaves as agreed" },
  { prefix: "DOC-", meaning: "Document — a controlled deliverable" },
  { prefix: "R-", meaning: "Risk — what could go wrong, and the mitigation" },
];

export function IdLegend({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <KeyRound className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">What do the codes mean?</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <dl className="grid gap-x-8 gap-y-2 border-t border-border px-4 py-4 sm:grid-cols-2">
            {PREFIXES.map((entry) => (
              <div key={entry.prefix} className="flex gap-3">
                <dt className="w-24 shrink-0 font-mono text-xs text-primary">{entry.prefix}</dt>
                <dd className="text-sm text-muted-foreground">{entry.meaning}</dd>
              </div>
            ))}
          </dl>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
