"use client";

import * as React from "react";

import type { Project } from "@/lib/types";
import { ACTIVE_PROJECT_ID, projects } from "@/data/projects";
import { hasProjectBundle } from "@/data/workspaces";
import { readSetting, writeSetting } from "@/lib/safe-storage";

const PROJECT_KEY = "baw.selected-project";
const OPEN_KEY = "baw.project-open";

interface WorkspaceContextValue {
  projects: Project[];
  /** The project currently in context. Always defined so views stay simple. */
  project: Project;
  /** True once the analyst has entered a project from the portfolio landing. */
  isProjectOpen: boolean;
  /** Enter a project — scopes the sidebar and every artefact page to it. */
  openProject: (projectId: string) => void;
  /** Return to the portfolio landing. */
  closeProject: () => void;
  selectProject: (projectId: string) => void;
  /** True when the project's documentation set has been migrated. */
  hasArtifacts: boolean;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectId] = React.useState(ACTIVE_PROJECT_ID);
  const [isProjectOpen, setIsProjectOpen] = React.useState(false);

  // Restore the analyst's last context after hydration to keep SSR output stable.
  React.useEffect(() => {
    const storedProject = readSetting(PROJECT_KEY);
    if (storedProject && projects.some((project) => project.id === storedProject)) {
      setProjectId(storedProject);
    }
    setIsProjectOpen(readSetting(OPEN_KEY) === "true");
  }, []);

  const selectProject = React.useCallback((next: string) => {
    setProjectId(next);
    writeSetting(PROJECT_KEY, next);
  }, []);

  const openProject = React.useCallback(
    (next: string) => {
      selectProject(next);
      setIsProjectOpen(true);
      writeSetting(OPEN_KEY, "true");
    },
    [selectProject],
  );

  const closeProject = React.useCallback(() => {
    setIsProjectOpen(false);
    writeSetting(OPEN_KEY, "false");
  }, []);

  const value = React.useMemo<WorkspaceContextValue>(() => {
    const project = projects.find((item) => item.id === projectId) ?? projects[0];
    return {
      projects,
      project,
      isProjectOpen,
      openProject,
      closeProject,
      selectProject,
      hasArtifacts: hasProjectBundle(project.id),
    };
  }, [projectId, isProjectOpen, openProject, closeProject, selectProject]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;
}
