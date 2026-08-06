"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const STORAGE_KEY = "baw.sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((current) => {
      window.localStorage.setItem(STORAGE_KEY, String(!current));
      return !current;
    });
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="app-scrollbar flex-1 overflow-y-auto focus-visible:outline-none"
          >
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
