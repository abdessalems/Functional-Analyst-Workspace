import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { WireframesView } from "@/features/wireframes/components/wireframes-view";

export const metadata: Metadata = {
  title: "Wireframes",
};

export default function WireframesPage() {
  return (
    <ProjectScope>
      <WireframesView />
    </ProjectScope>
  );
}
