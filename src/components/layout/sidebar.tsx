"use client";

import * as React from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { WorkspaceLogo } from "@/components/layout/workspace-logo";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <WorkspaceLogo className="size-8 shrink-0 rounded-md" />
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Analyst Workspace</span>
              <span className="text-[11px] text-muted-foreground">Saadaoui Abdessalem</span>
            </span>
          )}
        </Link>
      </div>

      <div className="app-scrollbar flex-1 overflow-y-auto pt-4">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-2 border-t border-border px-3 py-2.5",
          collapsed && "justify-center px-0",
        )}
      >
        {!collapsed && (
          <div className="flex flex-1 flex-col leading-tight">
            <span className="text-[11px] font-medium">Workspace v2.3.0</span>
            <span className="text-[11px] text-muted-foreground">Environment · UAT</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>
    </aside>
  );
}
