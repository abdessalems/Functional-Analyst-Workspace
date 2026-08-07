"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Github, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { initials } from "@/lib/utils";
import { findNavItem, findNavSection } from "@/config/navigation";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { GlobalSearch } from "@/components/layout/global-search";
import { ProjectSelector } from "@/components/layout/project-selector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ANALYST = {
  name: "Saadaoui Abdessalem",
  role: "Functional Analyst",
  portfolio: "https://www.saadaoui.it.com/",
  github: "https://github.com/abdessalems",
};

export function Topbar() {
  const pathname = usePathname();
  const { project, isProjectOpen } = useWorkspace();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const breadcrumbs = React.useMemo<BreadcrumbItem[]>(() => {
    const item = findNavItem(pathname);
    const section = findNavSection(pathname);
    const trail: BreadcrumbItem[] = [{ label: "Projects", href: "/" }];

    if (isProjectOpen && section?.scope === "project") {
      trail.push({ label: project.shortName, href: "/journey" });
      if (section.id !== "workspace") trail.push({ label: section.label });
    }

    if (item && item.href !== "/") trail.push({ label: item.label, href: pathname });
    return trail;
  }, [pathname, project.shortName, isProjectOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-surface/80 sm:px-4">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu />
        </Button>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Analysis Workspace</SheetTitle>
          </SheetHeader>
          <SheetBody className="px-0 py-3">
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </SheetBody>
        </SheetContent>
      </Sheet>

      <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
        {isProjectOpen && (
          <>
            <ProjectSelector />
            <span className="h-5 w-px shrink-0 bg-border" aria-hidden />
          </>
        )}
        <Breadcrumb items={breadcrumbs} className="hidden xl:block" />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        <div className="min-w-0 flex-1 md:flex-none">
          <GlobalSearch />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={ANALYST.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">
                <Github />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>GitHub</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={ANALYST.portfolio} aria-label="Back to portfolio">
                <ExternalLink />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to portfolio</TooltipContent>
        </Tooltip>

        <ThemeToggle />

        <span className="ml-1 flex items-center gap-2 border-l border-border pl-2.5">
          <Avatar className="size-7">
            <AvatarFallback>{initials(ANALYST.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden flex-col items-start leading-tight xl:flex">
            <span className="text-[13px] font-medium">{ANALYST.name}</span>
            <span className="text-[11px] text-muted-foreground">{ANALYST.role}</span>
          </span>
        </span>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {mounted && isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
