import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { RequirementsView } from "@/features/requirements/components/requirements-view";

export const metadata: Metadata = {
  title: "Business Requirements",
};

export default function RequirementsPage() {
  return (
    <ProjectScope>
      <RequirementsView />
    </ProjectScope>
  );
}
