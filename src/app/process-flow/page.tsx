import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { ProcessFlowView } from "@/features/process-flow/components/process-flow-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/process-flow",
  title: "Process Flow",
  description:
    "The end-to-end business process decomposed into swimlanes, with the actor or system accountable for every step, decision and hand-off.",
});

export default function ProcessFlowPage() {
  return (
    <ProjectScope>
      <ProcessFlowView />
    </ProjectScope>
  );
}
