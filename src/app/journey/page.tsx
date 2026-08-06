import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { JourneyView } from "@/features/journey/components/journey-view";

export const metadata: Metadata = {
  title: "Analysis Process",
};

export default function JourneyPage() {
  return (
    <ProjectScope>
      <JourneyView />
    </ProjectScope>
  );
}
