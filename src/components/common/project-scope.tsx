"use client";

import * as React from "react";
import Link from "next/link";
import { Database, FolderKanban } from "lucide-react";

import { useWorkspace } from "@/components/providers/workspace-provider";
import { ACTIVE_PROJECT_ID, getProjectById } from "@/data/projects";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/states";
import { ReadingNav } from "@/components/common/reading-nav";

/**
 * Guards every project-scoped page. A page is only meaningful once an analyst
 * has opened a project, and only the flagship project has a migrated artefact
 * set — both cases resolve to a documented state rather than a blank page.
 */
export function ProjectScope({ children }: { children: React.ReactNode }) {
  const { project, isProjectOpen, hasArtifacts, openProject } = useWorkspace();
  const migrated = getProjectById(ACTIVE_PROJECT_ID);

  if (!isProjectOpen) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No project selected"
        description="Pick a project from the portfolio to open its requirements, models, interfaces, validation evidence and traceability."
        action={
          <Button size="sm" asChild>
            <Link href="/">Browse all projects</Link>
          </Button>
        }
      />
    );
  }

  if (!hasArtifacts) {
    return (
      <EmptyState
        icon={Database}
        title={`No artefacts migrated for ${project.shortName}`}
        description={`${project.code} is still maintained in the legacy requirements repository. Its documentation set will be migrated into the workspace during the ${project.release} release window.`}
        action={
              <Button variant="outline" size="sm" onClick={() => openProject(ACTIVE_PROJECT_ID)}>
            Open {migrated?.shortName ?? "the migrated project"} instead
          </Button>
        }
      />
    );
  }

  // Every project page ends with the next step, so the whole analysis can be
  // read straight through without using the sidebar.
  return (
    <div className="space-y-8">
      {children}
      <ReadingNav />
    </div>
  );
}
