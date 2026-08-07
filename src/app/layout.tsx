import type { Metadata, Viewport } from "next";

import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";

export const metadata: Metadata = {
  title: {
    default: "Analyst Workspace · Saadaoui Abdessalem",
    template: "%s · Analyst Workspace",
  },
  description:
    "Functional analysis workspace: requirements, business rules, process and UML models, interface contracts, validation evidence and end-to-end traceability, project by project.",
  applicationName: "Analyst Workspace",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141b26" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Grammarly and similar extensions add attributes to the body before
          React hydrates; that difference is theirs, not ours. */}
      <body suppressHydrationWarning>
        {/* Dark by default so the workspace matches the portfolio it is embedded in. */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WorkspaceProvider>
            <AppShell>{children}</AppShell>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
