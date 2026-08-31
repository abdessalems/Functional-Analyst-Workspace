"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn, normalisePath } from "@/lib/utils";
import { navigationSections } from "@/config/navigation";
import { READING_PATH } from "@/config/reading-path";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/common/status-badge";
import { useProjectCounts } from "@/hooks/use-project-data";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Project-scoped navigation. Only portfolio-level entries are shown until an
 * analyst opens a project; from then on the sidebar belongs to that project.
 */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  // Normalised: the export serves /requirements/ while the menu declares
  // /requirements, so comparing them raw matched nothing on the live site.
  const pathname = normalisePath(usePathname());
  const { project, isProjectOpen, closeProject } = useWorkspace();
  const counts = useProjectCounts();

  // The same navigation on every project: the analysis lifecycle is the point,
  // so a stage a project has not reached stays visible and shows its own empty
  // state rather than disappearing from the menu.
  const sections = navigationSections.filter(
    (section) => section.scope === "portfolio" || isProjectOpen,
  );

  return (
    <nav aria-label="Workspace sections" className="flex flex-col gap-5 px-3 pb-6">
      {isProjectOpen && !collapsed && (
        <div className="space-y-2 rounded-lg border border-border bg-surface-muted p-3">
          <p className="text-micro font-semibold uppercase tracking-wider text-muted-foreground">
            Current project
          </p>
          <p className="text-sm font-semibold leading-snug">{project.shortName}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-micro text-muted-foreground">{project.code}</span>
            <StatusBadge status={project.status} />
          </div>
          <Link
            href="/"
            onClick={() => {
              closeProject();
              onNavigate?.();
            }}
            className="inline-flex items-center gap-1 text-micro font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-3" /> All projects
          </Link>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.id} className="flex flex-col gap-1">
          {collapsed ? (
            <div className="mx-2 my-1 h-px bg-border" role="presentation" />
          ) : (
            /*
             * The group heading carries its own colour rather than a grey label
             * with a 2px hint beside it. Every section looked identical before,
             * so the sidebar read as one long list of nineteen items instead of
             * five groups of three or four.
             *
             * The tint is mixed against the surface so it stays a wash rather
             * than a block; where color-mix is unsupported the rule is dropped
             * and the heading simply has no background, which is what it had.
             */
            <p
              className="mb-0.5 flex items-center gap-2 rounded-md px-2 py-1 text-micro font-semibold uppercase tracking-wider"
              style={{
                color: section.accent,
                backgroundColor: `color-mix(in srgb, ${section.accent} 10%, transparent)`,
              }}
            >
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: section.accent }}
              />
              {section.label}
            </p>
          )}

          {section.items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const count = item.countKey ? counts[item.countKey] : undefined;
            const pathIndex = READING_PATH.findIndex((entry) => entry.href === item.href);
            const step = pathIndex === -1 ? undefined : pathIndex + 1;
            const chip = count !== undefined ? (count > 0 ? String(count) : undefined) : item.badge;

            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (item.href === "/") closeProject();
                  onNavigate?.();
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  collapsed && "justify-center px-0 py-2",
                  isActive
                    ? // bg-accent is the floor, not the finish: the tinted
                      // background below replaces it wherever color-mix is
                      // understood, and where it is not the row still reads as
                      // the selected one instead of losing its highlight.
                      "bg-accent font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
                /*
                  The whole row takes the section's colour, not just the marker
                  beside it. A neutral grey highlight said "you are somewhere";
                  a blue row under a blue Analysis heading, or a violet one under
                  Design & Modelling, says which part of the work you are in
                  without reading a word.
                */
                style={
                  isActive
                    ? {
                        color: section.accent,
                        backgroundColor: `color-mix(in srgb, ${section.accent} 14%, transparent)`,
                      }
                    : undefined
                }
              >
                {/*
                  The marker takes the section's colour, not the brand's. Every
                  page used to highlight in the same teal, so the sidebar never
                  told you which group you were standing in — only that you were
                  somewhere.
                */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full"
                    style={{ backgroundColor: section.accent }}
                  />
                )}
                {/*
                  The step number teaches the order; the icon aids recognition.
                  The column is reserved even when a page has no step, so the
                  icons and labels stay in one straight line — two of the
                  seventeen items sit outside the reading path, and without this
                  they pulled the whole row left.
                */}
                {!collapsed && (
                  <span
                    aria-hidden={step === undefined}
                    className="w-4 shrink-0 text-right text-micro tabular-nums"
                    /*
                      The numbers run down the sidebar in their section colour,
                      so the five groups are legible as a column even before a
                      label is read. Kept well under the label in strength —
                      this is the quietest thing in the row, and it must never
                      be mistaken for the count on the right.
                    */
                    style={{
                      color: section.accent,
                      opacity: isActive ? 0.85 : 0.5,
                    }}
                  >
                    {step ?? ""}
                  </span>
                )}
                <Icon
                  className="size-4 shrink-0"
                  style={isActive ? { color: section.accent } : undefined}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {chip && (
                      <span
                        /*
                          A pill, not a number. Each row can show two figures —
                          the step on the left and how many artefacts on the
                          right — and "4 Functional Specification 4" was
                          unreadable while both looked the same. The pill shape,
                          the border and the weight now say "this is a quantity".
                        */
                        title={count !== undefined ? `${count} in this project` : undefined}
                        className={cn(
                          "min-w-[1.375rem] rounded-full border px-1.5 py-px text-center text-micro font-semibold tabular-nums",
                          !isActive &&
                            "border-border bg-muted text-muted-foreground group-hover:bg-background",
                        )}
                        style={
                          isActive
                            ? {
                                color: section.accent,
                                borderColor: `color-mix(in srgb, ${section.accent} 35%, transparent)`,
                                backgroundColor: `color-mix(in srgb, ${section.accent} 16%, transparent)`,
                              }
                            : undefined
                        }
                      >
                        {chip}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );

            /*
              Expanded, the tooltip explains the label rather than repeating it.
              "BPMN", "PlantUML" and "SQL Validation" are the words an IT
              recruiter scans for, so they stay — but they tell a recruiter from
              HR nothing, and the plain sentence was already written in
              navigation.ts and shown nowhere. It costs no width.
            */
            return (
              <Tooltip key={item.href} delayDuration={collapsed ? 120 : 400}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="max-w-64">
                  {collapsed ? (
                    <>
                      <span className="font-medium">{item.label}</span>
                      <span className="mt-0.5 block text-muted-foreground">{item.description}</span>
                    </>
                  ) : (
                    item.description
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
