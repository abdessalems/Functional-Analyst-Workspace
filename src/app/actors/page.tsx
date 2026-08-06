import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { ActorsView } from "@/features/actors/components/actors-view";

export const metadata: Metadata = {
  title: "Actors",
};

export default function ActorsPage() {
  return (
    <ProjectScope>
      <ActorsView />
    </ProjectScope>
  );
}
