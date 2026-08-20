import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { PlantUmlView } from "@/features/diagrams/components/plantuml-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/plantuml",
  title: "UML Models",
  description:
    "Use case, sequence, state, class and entity-relationship models, each rendered alongside the PlantUML source that produced it.",
});

export default function PlantUmlPage() {
  return (
    <ProjectScope>
      <PlantUmlView />
    </ProjectScope>
  );
}
