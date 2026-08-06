import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { BusinessRulesView } from "@/features/business-rules/components/business-rules-view";

export const metadata: Metadata = {
  title: "Business Rules",
};

export default function BusinessRulesPage() {
  return (
    <ProjectScope>
      <BusinessRulesView />
    </ProjectScope>
  );
}
