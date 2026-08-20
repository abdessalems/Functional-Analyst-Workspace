import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { BusinessRulesView } from "@/features/business-rules/components/business-rules-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/business-rules",
  title: "Business Rules",
  description:
    "Catalogue of business rules with the source of authority behind each one, the rule logic in full, and the requirements and processes it governs.",
});

export default function BusinessRulesPage() {
  return (
    <ProjectScope>
      <BusinessRulesView />
    </ProjectScope>
  );
}
