import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { JourneyView } from "@/features/journey/components/journey-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/journey",
  title: "The Analysis Journey",
  description:
    "How a business need becomes a delivered feature: elicitation, requirements, business rules, process modelling, interface contracts, data validation and acceptance testing, step by step.",
});

export default function JourneyPage() {
  return (
    <ProjectScope>
      <JourneyView />
    </ProjectScope>
  );
}
