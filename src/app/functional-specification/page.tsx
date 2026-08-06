import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { FunctionalSpecView } from "@/features/functional-spec/components/functional-spec-view";

export const metadata: Metadata = {
  title: "Functional Specification",
};

export default function FunctionalSpecificationPage() {
  return (
    <ProjectScope>
      <FunctionalSpecView />
    </ProjectScope>
  );
}
