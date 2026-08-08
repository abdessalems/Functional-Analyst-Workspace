import type { Metadata } from "next";

import { PrintView } from "@/features/print/components/print-view";

export const metadata: Metadata = {
  title: "Document",
  description:
    "The open project as a single document: requirements, acceptance criteria, rules, actors, specification, interfaces, tests and traceability.",
};

export default function DocumentPage() {
  return <PrintView />;
}
