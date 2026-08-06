"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navigationSections } from "@/config/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace sections" className="flex flex-col gap-5 px-3 pb-6">
      {navigationSections.map((section) => (
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

            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground group-hover:bg-background",
                        )}
                      >
                        {item.badge}
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
