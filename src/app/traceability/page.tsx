import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { TraceabilityView } from "@/features/traceability/components/traceability-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/traceability",
  title: "Traceability Matrix",
  description:
    "Requirement to business rule to model to interface to data to test to document — a matrix derived from the artefacts themselves, so it cannot drift from them.",
});

export default function TraceabilityPage() {
  return (
    <ProjectScope>
      <TraceabilityView />
    </ProjectScope>
  );
}
