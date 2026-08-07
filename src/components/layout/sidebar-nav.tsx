"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { navigationSections } from "@/config/navigation";
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
  const pathname = usePathname();
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
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Current project
          </p>
          <p className="text-[13px] font-semibold leading-snug">{project.shortName}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">{project.code}</span>
            <StatusBadge status={project.status} />
          </div>
          <Link
            href="/"
            onClick={() => {
              closeProject();
              onNavigate?.();
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
          )}

          {section.items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const count = item.countKey ? counts[item.countKey] : undefined;
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
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
                  />
                )}
                <Icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {chip && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground group-hover:bg-background",
                        )}
                      >
                        {chip}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );

            if (!collapsed) return link;

            return (
              <Tooltip key={item.href} delayDuration={120}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
