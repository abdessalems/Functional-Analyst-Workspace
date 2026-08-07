"use client";

import * as React from "react";

import type { Project } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { ACTIVE_PROJECT_ID, projects } from "@/data/projects";
import { hasProjectBundle } from "@/data/workspaces";
import { readSetting, writeSetting } from "@/lib/safe-storage";
import { readDrafts, type DraftProject } from "@/features/studio/lib/draft-store";

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
  /** Set when the open project was imported in this browser rather than committed. */
  draftBundle: ProjectDataBundle | null;
  /** Every project imported through the studio in this browser. */
  drafts: DraftProject[];
  /** Re-reads the drafts after the studio adds or removes one. */
  refreshDrafts: () => void;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectId] = React.useState(ACTIVE_PROJECT_ID);
  const [isProjectOpen, setIsProjectOpen] = React.useState(false);
  // Drafts exist only in this browser, so they load after hydration like the
  // rest of the stored context — the server has no way to know about them.
  const [drafts, setDrafts] = React.useState<DraftProject[]>([]);

  const refreshDrafts = React.useCallback(() => setDrafts(readDrafts()), []);

  // Restore the analyst's last context after hydration to keep SSR output stable.
  React.useEffect(() => {
    const loaded = readDrafts();
    setDrafts(loaded);

    const known = [...projects.map((project) => project.id), ...loaded.map((d) => d.project.id)];
    const storedProject = readSetting(PROJECT_KEY);
    if (storedProject && known.includes(storedProject)) {
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
    const all = [...projects, ...drafts.map((draft) => draft.project)];
    const project = all.find((item) => item.id === projectId) ?? all[0];
    const draft = drafts.find((item) => item.project.id === project.id);

    return {
      projects: all,
      project,
      isProjectOpen,
      openProject,
      closeProject,
      selectProject,
      hasArtifacts: draft ? true : hasProjectBundle(project.id),
      draftBundle: draft?.bundle ?? null,
      drafts,
      refreshDrafts,
    };
  }, [projectId, isProjectOpen, openProject, closeProject, selectProject, drafts, refreshDrafts]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  }
  return context;
}
