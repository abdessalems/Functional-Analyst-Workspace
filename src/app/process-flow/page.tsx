import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { ProcessFlowView } from "@/features/process-flow/components/process-flow-view";

export const metadata: Metadata = {
  title: "Process Flow",
};

export default function ProcessFlowPage() {
  return (
    <ProjectScope>
      <ProcessFlowView />
    </ProjectScope>
  );
}
