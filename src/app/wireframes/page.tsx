import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { WireframesView } from "@/features/wireframes/components/wireframes-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/wireframes",
  title: "Wireframes",
  description:
    "Annotated screen designs with field-level notes, interaction and validation rules, and the version history behind each revision.",
});

export default function WireframesPage() {
  return (
    <ProjectScope>
      <WireframesView />
    </ProjectScope>
  );
}
