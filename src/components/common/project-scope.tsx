"use client";

import * as React from "react";
import { Database } from "lucide-react";

import { useWorkspace } from "@/components/providers/workspace-provider";
import { ACTIVE_PROJECT_ID, getProjectById } from "@/data/projects";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/states";

/**
 * Artefact pages are scoped to the selected project. Only the flagship project
 * has been migrated into the workspace, so every other selection resolves to a
 * documented empty state rather than a blank page.
 */
export function ProjectScope({ children }: { children: React.ReactNode }) {
  const { project, hasArtifacts, selectProject } = useWorkspace();
  const migrated = getProjectById(ACTIVE_PROJECT_ID);

  if (hasArtifacts) return <>{children}</>;

  return (
    <EmptyState
      icon={Database}
      title={`No artefacts migrated for ${project.shortName}`}
      description={`${project.code} is still maintained in the legacy requirements repository. Its documentation set will be migrated into the workspace during the ${project.release} release window.`}
      action={
        <Button variant="outline" size="sm" onClick={() => selectProject(ACTIVE_PROJECT_ID)}>
          Switch to {migrated?.shortName ?? "the migrated project"}
        </Button>
      }
    />
  );
}
