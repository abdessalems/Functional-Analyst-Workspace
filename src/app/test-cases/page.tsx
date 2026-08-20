import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { TestCasesView } from "@/features/test-cases/components/test-cases-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/test-cases",
  title: "Test Cases",
  description:
    "Test catalogue with steps, expected results, execution status and defect links, mapped back to the requirements and business rules under test.",
});

export default function TestCasesPage() {
  return (
    <ProjectScope>
      <TestCasesView />
    </ProjectScope>
  );
}
