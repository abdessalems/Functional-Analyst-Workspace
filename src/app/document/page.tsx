import type { Metadata } from "next";

import { PrintView } from "@/features/print/components/print-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/document",
  title: "Full Project Document",
  description:
    "The open project as one printable document: requirements, acceptance criteria, business rules, actors, specification, interfaces, tests and traceability.",
  noindex: true,
});

export default function DocumentPage() {
  return <PrintView />;
}
