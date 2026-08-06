import type { Metadata } from "next";

import { PortfolioView } from "@/features/projects/components/portfolio-view";

export const metadata: Metadata = {
  title: "Projects",
};

/** Landing page — the portfolio of projects the analyst owns. */
export default function PortfolioPage() {
  return <PortfolioView />;
}
