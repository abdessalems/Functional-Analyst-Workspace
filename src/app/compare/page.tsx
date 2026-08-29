import type { Metadata } from "next";

import { CompareView } from "@/features/compare/components/compare-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/compare",
  title: "Compare Two Projects",
  description:
    "An AS-IS and a TO-BE analysis side by side: which requirements, rules, actors, interfaces, process steps and tests were added, removed or carried over.",
});

export default function ComparePage() {
  return <CompareView />;
}
