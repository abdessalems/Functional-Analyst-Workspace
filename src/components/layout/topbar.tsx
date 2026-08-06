"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookMarked,
  CircleHelp,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";

import { cn, formatDateTime, initials } from "@/lib/utils";
import { findNavItem, findNavSection } from "@/config/navigation";
import { notifications } from "@/data/activity";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { GlobalSearch } from "@/components/layout/global-search";
import { ProjectSelector } from "@/components/layout/project-selector";

const CURRENT_USER = {
  name: "Saadaoui Abdessalem",
  role: "Lead Business Analyst",
  email: "abdessalemsaa@gmail.com",
  department: "Payments Change Delivery",
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

  const unread = notifications.filter((notification) => !notification.read).length;

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
            <SheetTitle>Analyst Workspace</SheetTitle>
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

        <NotificationsMenu unread={unread} />

        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/settings" aria-label="Settings">
            <Settings />
          </Link>
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 px-1.5"
              aria-label="Account menu"
            >
              <Avatar className="size-7">
                <AvatarFallback>{initials(CURRENT_USER.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden flex-col items-start leading-tight xl:flex">
                <span className="text-[13px] font-medium">{CURRENT_USER.name}</span>
                <span className="text-[11px] text-muted-foreground">{CURRENT_USER.role}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="size-9">
                <AvatarFallback>{initials(CURRENT_USER.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{CURRENT_USER.name}</p>
                <p className="truncate text-xs text-muted-foreground">{CURRENT_USER.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserRound /> Profile &amp; preferences
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Workspace settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookMarked /> Analysis standards
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CircleHelp /> Help &amp; support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function NotificationsMenu({ unread }: { unread: number }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
          <Bell />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          <Badge variant="neutral">{unread} unread</Badge>
        </div>
        <div className="app-scrollbar max-h-[24rem] overflow-y-auto">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.href}
              className={cn(
                "flex gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                !notification.read && "bg-primary/[0.04]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  notification.severity === "warning" && "bg-amber-500",
                  notification.severity === "success" && "bg-emerald-500",
                  notification.severity === "info" && "bg-sky-500",
                  notification.read && "bg-muted-foreground/40",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{notification.title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {notification.description}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {formatDateTime(notification.timestamp)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
