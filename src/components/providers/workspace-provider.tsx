"use client";

import * as React from "react";

import type { Project } from "@/lib/types";
import { ACTIVE_PROJECT_ID, projects } from "@/data/projects";

const STORAGE_KEY = "baw.selected-project";

interface WorkspaceContextValue {
  projects: Project[];
  project: Project;
  selectProject: (projectId: string) => void;
  /** Only the flagship project has a fully migrated artefact set in this workspace. */
  hasArtifacts: boolean;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectId] = React.useState(ACTIVE_PROJECT_ID);

  // Restore the analyst's last project after hydration to keep SSR output stable.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && projects.some((project) => project.id === stored)) {
      setProjectId(stored);
    }
  }, []);

  const selectProject = React.useCallback((next: string) => {
    setProjectId(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = React.useMemo<WorkspaceContextValue>(() => {
    const project = projects.find((item) => item.id === projectId) ?? projects[0];
    return {
      projects,
      project,
      selectProject,
      hasArtifacts: project.id === ACTIVE_PROJECT_ID,
    };
  }, [projectId, selectProject]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;
}
