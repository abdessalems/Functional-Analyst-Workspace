import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { PlantUmlView } from "@/features/diagrams/components/plantuml-view";

export const metadata: Metadata = {
  title: "PlantUML",
};

export default function PlantUmlPage() {
  return (
    <ProjectScope>
      <PlantUmlView />
    </ProjectScope>
  );
}
