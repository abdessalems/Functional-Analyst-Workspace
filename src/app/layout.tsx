import type { Metadata, Viewport } from "next";

import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";

export const metadata: Metadata = {
  title: {
    default: "Business Analyst Workspace",
    template: "%s · Business Analyst Workspace",
  },
  description:
    "Internal workspace for Business and Functional Analysts to create, review and trace banking project documentation across the delivery lifecycle.",
  applicationName: "Business Analyst Workspace",
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
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <WorkspaceProvider>
            <AppShell>{children}</AppShell>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
