import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { TraceabilityView } from "@/features/traceability/components/traceability-view";

export const metadata: Metadata = {
  title: "Traceability Matrix",
};

export default function TraceabilityPage() {
  return (
    <ProjectScope>
      <TraceabilityView />
    </ProjectScope>
  );
}
