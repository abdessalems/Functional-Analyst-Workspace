import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { BpmnView } from "@/features/diagrams/components/bpmn-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/bpmn",
  title: "BPMN Model",
  description:
    "The process as a BPMN model, rendered in the browser with zoom, pan, full screen and PNG export for reuse in specification documents.",
});

export default function BpmnPage() {
  return (
    <ProjectScope>
      <BpmnView />
    </ProjectScope>
  );
}
