import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { RequirementsView } from "@/features/requirements/components/requirements-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/requirements",
  title: "Business Requirements",
  description:
    "Business requirements with Given / When / Then acceptance criteria, priority and status, each linked to the business rules and test cases that cover it.",
});

export default function RequirementsPage() {
  return (
    <ProjectScope>
      <RequirementsView />
    </ProjectScope>
  );
}
