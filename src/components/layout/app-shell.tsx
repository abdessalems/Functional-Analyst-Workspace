"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { readSetting, writeSetting } from "@/lib/safe-storage";

const STORAGE_KEY = "baw.sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(readSetting(STORAGE_KEY) === "true");
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((current) => {
      writeSetting(STORAGE_KEY, String(!current));
      return !current;
    });
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/*
        `100dvh` rather than `100vh`: on a phone the browser chrome makes 100vh
        taller than the visible area, so with `overflow-hidden` the bottom of
        the app becomes unreachable.
      */}
      <div className="flex h-[100dvh] overflow-hidden bg-background">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        {/*
          `min-h-0` and `min-w-0` are load-bearing: a flex item defaults to
          min-height auto, so without them the scroll container below refuses
          to shrink and its content is clipped instead of scrolling.
        */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Topbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="app-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden focus-visible:outline-none"
          >
            {/* A single wash of brand colour behind the top of the page. */}
            <div className="brand-wash">
              <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
