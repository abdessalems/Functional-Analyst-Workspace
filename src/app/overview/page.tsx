import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { OverviewView } from "@/features/overview/components/overview-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/overview",
  title: "Project Overview",
  description:
    "Project objective, scope and exclusions, stakeholder RACI, milestones, dependencies and the risk register for the open project.",
});

export default function OverviewPage() {
  return (
    <ProjectScope>
      <OverviewView />
    </ProjectScope>
  );
}
