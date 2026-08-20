import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { FunctionalSpecView } from "@/features/functional-spec/components/functional-spec-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/functional-specification",
  title: "Functional Specification",
  description:
    "Functional specification section by section: business logic, field-level tables, validation rules, error codes and the edge cases each one has to survive.",
});

export default function FunctionalSpecificationPage() {
  return (
    <ProjectScope>
      <FunctionalSpecView />
    </ProjectScope>
  );
}
