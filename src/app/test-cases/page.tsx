import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { TestCasesView } from "@/features/test-cases/components/test-cases-view";

export const metadata: Metadata = {
  title: "Test Cases",
};

export default function TestCasesPage() {
  return (
    <ProjectScope>
      <TestCasesView />
    </ProjectScope>
  );
}
