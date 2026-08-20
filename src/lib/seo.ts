import type { Metadata } from "next";

/**
 * The workspace's public address.
 *
 * It is exported as static files and served from a subfolder of the portfolio,
 * so Next has no way to infer an absolute URL on its own: every canonical link
 * and Open Graph tag has to be told where the page will live. Holding the
 * address here keeps it in one file rather than eighteen, the same way
 * navigation.ts owns the sidebar.
 *
 * The trailing slash matters. `trailingSlash: true` means the exported page is
 * /fa/overview/, and a canonical that points at /fa/overview would nominate a
 * URL that redirects — which is the one thing a canonical must never do.
 */
export const SITE_URL = "https://www.saadaoui.it.com/fa";

/**
 * Share card. It lives on the portfolio rather than in this export because the
 * portfolio is what owns /images — and a card that moves when the workspace is
 * rebuilt is a card that stops resolving in every link already shared.
 */
export const OG_IMAGE = {
  url: "https://www.saadaoui.it.com/images/og-analyst-workspace.png",
  width: 1200,
  height: 630,
  alt: "Analyst Workspace — Saadaoui Abdessalem",
};

/** Absolute URL for a route, in the exact form the export publishes it. */
export function canonicalUrl(path: string): string {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.replace(/\/?$/, "/")}`;
}

interface PageSeo {
  /** Route path, as it appears in the app router — "/" or "/requirements". */
  path: string;
  /** Page title. The layout template appends the workspace name. */
  title: string;
  /**
   * What this page holds, in the searcher's words. Every page needs its own:
   * eighteen pages sharing one description is eighteen pages that look
   * identical to a search engine.
   */
  description: string;
  /**
   * Set for pages that duplicate content published elsewhere in the workspace.
   * They stay reachable and keep passing link value — `follow` — they simply
   * do not compete with the pages they were assembled from.
   */
  noindex?: boolean;
}

/**
 * Title, description, canonical and share card for one page.
 *
 * Open Graph inherits the rest (site name, locale, image) from the layout, so
 * only the parts that differ per page are set here.
 */
/**
 * Title, description, canonical and share card for one page.
 *
 * Open Graph and Twitter are written out in full rather than left to inherit.
 * Next replaces those objects wholesale when a page declares one — it does not
 * merge them field by field — so a page that set only a title would publish a
 * share card with no image and quietly downgrade the Twitter card type.
 */
export function pageMetadata({ path, title, description, noindex }: PageSeo): Metadata {
  const url = canonicalUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Analyst Workspace",
      locale: "en_GB",
      title,
      description,
      url,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}
