import { SITE_URL } from "@/lib/seo";

const PORTFOLIO_URL = "https://www.saadaoui.it.com/";

/**
 * Schema.org description of the workspace, for search engines.
 *
 * Two things it establishes that the page text cannot: that this subfolder is
 * a collection authored by a named person who also owns the parent site, and
 * that /fa sits one level below the portfolio — which is what lets a result
 * render as `saadaoui.it.com › fa` rather than a bare URL.
 */
export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Analyst Workspace",
        description:
          "Functional analysis of banking projects: requirements, business rules, process and UML models, interface contracts, validation evidence and end-to-end traceability.",
        inLanguage: "en",
        isPartOf: { "@id": `${PORTFOLIO_URL}#website` },
        author: { "@id": `${PORTFOLIO_URL}#person` },
        publisher: { "@id": `${PORTFOLIO_URL}#person` },
      },
      {
        "@type": "Person",
        "@id": `${PORTFOLIO_URL}#person`,
        name: "Abdessalem Saadaoui",
        jobTitle: "Functional Analyst & Java Developer",
        url: PORTFOLIO_URL,
        sameAs: [
          "https://www.linkedin.com/in/saadaoui-abdessalem-10bb7018a",
          "https://github.com/abdessalems",
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Abdessalem Saadaoui", item: PORTFOLIO_URL },
          { "@type": "ListItem", position: 2, name: "Analyst Workspace", item: `${SITE_URL}/` },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built here from constants, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
