import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { ActorsView } from "@/features/actors/components/actors-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/actors",
  title: "Actors & Roles",
  description:
    "Human, system and external actors: responsibilities, permissions, the processes each takes part in and the requirements that name them.",
});

export default function ActorsPage() {
  return (
    <ProjectScope>
      <ActorsView />
    </ProjectScope>
  );
}
