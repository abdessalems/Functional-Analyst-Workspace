import type { Metadata, Viewport } from "next";

import "./globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";

/**
 * Defaults every page inherits. Pages override the parts that are theirs —
 * title, description, canonical — through pageMetadata() in @/lib/seo.
 *
 * metadataBase is what turns the relative image path below into the absolute
 * URL that Open Graph requires; without it Next emits no og:image at all.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Analyst Workspace · Saadaoui Abdessalem",
    template: "%s · Analyst Workspace",
  },
  description:
    "Functional analysis workspace: requirements, business rules, process and UML models, interface contracts, validation evidence and end-to-end traceability, project by project.",
  applicationName: "Analyst Workspace",
  authors: [{ name: "Saadaoui Abdessalem", url: "https://www.saadaoui.it.com/" }],
  creator: "Saadaoui Abdessalem",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Analyst Workspace",
    locale: "en_GB",
    url: "/",
    title: "Analyst Workspace · Saadaoui Abdessalem",
    description:
      "Requirements, business rules, process and UML models, interface contracts, validation evidence and end-to-end traceability — a banking project, analysed in the open.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Analyst Workspace · Saadaoui Abdessalem",
    description:
      "Requirements, business rules, process and UML models, interface contracts, validation evidence and end-to-end traceability.",
    images: [OG_IMAGE.url],
  },
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
