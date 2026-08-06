import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { BpmnView } from "@/features/diagrams/components/bpmn-view";

export const metadata: Metadata = {
  title: "BPMN",
};

export default function BpmnPage() {
  return (
    <ProjectScope>
      <BpmnView />
    </ProjectScope>
  );
}
