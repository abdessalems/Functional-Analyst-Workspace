import type { Metadata } from "next";

import { StructuredData } from "@/components/common/structured-data";
import { PortfolioView } from "@/features/projects/components/portfolio-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Analyst Workspace — Banking Projects Analysed End to End",
  description:
    "Banking analysis projects, each traced from the business need through requirements, rules, process and UML models, interface contracts and validation evidence to the tests that close the loop.",
});

/** Landing page — the portfolio of projects the analyst owns. */
export default function PortfolioPage() {
  return (
    <>
      <StructuredData />
      <PortfolioView />
    </>
  );
}
