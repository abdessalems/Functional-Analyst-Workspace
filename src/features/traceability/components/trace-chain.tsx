"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Database,
  FileCode2,
  FileText,
  GitBranch,
  ListChecks,
  ShieldCheck,
  Table2,
} from "lucide-react";

import type { TraceabilityLink } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArtifactLink } from "@/components/common/artifact-link";

interface ChainLevel {
  key: keyof TraceabilityLink | "requirement";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ids: string[];
  /** Database objects are plain names, not linkable artefacts. */
  plain?: boolean;
}

/**
 * Vertical rendering of the full traceability chain for one requirement:
 * Requirement → Business Rule → Diagram → API → Database → SQL → Test → Document.
 */
export function TraceChain({ link }: { link: TraceabilityLink }) {
  const levels: ChainLevel[] = [
    { key: "requirement", label: "Requirement", icon: ListChecks, ids: [link.requirementId] },
    { key: "businessRuleIds", label: "Business Rules", icon: ShieldCheck, ids: link.businessRuleIds },
    { key: "diagramIds", label: "UML Models", icon: GitBranch, ids: link.diagramIds },
    { key: "apiIds", label: "APIs", icon: FileCode2, ids: link.apiIds },
    {
      key: "databaseObjects",
      label: "Database Objects",
      icon: Database,
      ids: link.databaseObjects,
      plain: true,
    },
    { key: "sqlValidationIds", label: "SQL Validation", icon: Table2, ids: link.sqlValidationIds },
    { key: "testCaseIds", label: "Test Cases", icon: ClipboardCheck, ids: link.testCaseIds },
    { key: "documentIds", label: "Documents", icon: FileText, ids: link.documentIds },
  ];

  return (
    <ol className="space-y-0">
      {levels.map((level, index) => {
        const Icon = level.icon;
        const isLast = index === levels.length - 1;
        const empty = level.ids.length === 0;

        return (
          <li key={level.label} className="relative flex gap-3.5 pb-4 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px",
                  empty ? "bg-border" : "bg-primary/30",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border",
                empty
                  ? "border-dashed border-border bg-surface-muted text-muted-foreground"
                  : "border-primary/30 bg-primary/10 text-primary",
              )}
            >
              <Icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1 space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {level.label}
                </p>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {level.ids.length}
                </span>
              </div>

              {empty ? (
                <p className="text-sm italic text-muted-foreground">
                  No linked artefact at this level
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {level.ids.map((id) =>
                    level.plain ? (
                      <span
                        key={id}
                        className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {id}
                      </span>
                    ) : (
                      <ArtifactLink key={id} id={id} />
                    ),
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
