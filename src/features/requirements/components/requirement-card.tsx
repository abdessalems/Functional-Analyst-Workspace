"use client";

import * as React from "react";
import { ChevronDown, FileCode2, FileText, ClipboardCheck, ShieldCheck } from "lucide-react";

import type { Requirement } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { PriorityBadge, StatusBadge } from "@/components/common/status-badge";

interface RequirementCardProps {
  requirement: Requirement;
  highlighted?: boolean;
  defaultOpen?: boolean;
}

export function RequirementCard({
  requirement,
  highlighted = false,
  defaultOpen = false,
}: RequirementCardProps) {
  const [open, setOpen] = React.useState(defaultOpen || highlighted);

  React.useEffect(() => {
    if (highlighted) setOpen(true);
  }, [highlighted]);

  return (
    <Card
      id={requirement.id}
      className={cn(
        "scroll-mt-24 transition-shadow",
        highlighted && "border-primary/50 shadow-raised ring-1 ring-primary/20",
      )}
    >
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {requirement.id}
          </Badge>
          <StatusBadge status={requirement.status} />
          <PriorityBadge priority={requirement.priority} />
          <Badge variant="neutral">{requirement.category}</Badge>
          <Badge variant="outline" className="font-normal">
            MoSCoW · {requirement.moscow}
          </Badge>
          <span className="ml-auto text-xs text-muted-foreground">
            v{requirement.version} · updated {formatDate(requirement.lastUpdated)}
          </span>
        </div>

        <h3 className="text-[15px] font-semibold leading-snug tracking-tight">
          {requirement.title}
        </h3>

        <div className="space-y-2 rounded-lg border border-border bg-surface-muted p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Business need
          </p>
          <p className="text-[13px] leading-relaxed">{requirement.businessNeed}</p>
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {requirement.description}
        </p>

        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                {requirement.relatedRules.length} rules
              </span>
              <span className="flex items-center gap-1.5">
                <FileCode2 className="size-3.5" />
                {requirement.relatedApis.length} APIs
              </span>
              <span className="flex items-center gap-1.5">
                <ClipboardCheck className="size-3.5" />
                {requirement.relatedTestCases.length} tests
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="size-3.5" />
                {requirement.relatedDocuments.length} documents
              </span>
              <span>Owner · {requirement.owner}</span>
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="xs" aria-expanded={open}>
                {open ? "Hide detail" : "View acceptance criteria & links"}
                <ChevronDown
                  className={cn("transition-transform duration-200", open && "rotate-180")}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="space-y-4 pt-4">
              <Separator />

              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Acceptance criteria
                </p>
                <ul className="space-y-2.5">
                  {requirement.acceptanceCriteria.map((criterion) => (
                    <li
                      key={criterion.id}
                      className="rounded-lg border border-border bg-surface-muted p-3.5 text-[13px] leading-relaxed"
                    >
                      <p className="mb-1.5 font-mono text-[11px] text-muted-foreground">
                        {criterion.id}
                      </p>
                      <p>
                        <span className="font-semibold text-primary">Given</span> {criterion.given}
                      </p>
                      <p>
                        <span className="font-semibold text-primary">When</span> {criterion.when}
                      </p>
                      <p>
                        <span className="font-semibold text-primary">Then</span> {criterion.then}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <LinkGroup label="Business rules" ids={requirement.relatedRules} />
                <LinkGroup label="Related APIs" ids={requirement.relatedApis} />
                <LinkGroup label="Test cases" ids={requirement.relatedTestCases} />
                <LinkGroup label="Documents" ids={requirement.relatedDocuments} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}

function LinkGroup({ label, ids }: { label: string; ids: string[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ArtifactLinkList ids={ids} emptyLabel="Not linked" />
    </div>
  );
}
