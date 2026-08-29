import type { Project } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";
import { readSetting, writeSetting } from "@/lib/safe-storage";

/**
 * Projects added through the studio, held in this browser.
 *
 * The site is a static export, so nothing here reaches the published pages —
 * a draft is real for the person who imported it and invisible to everyone
 * else. That is the honest boundary: the workspace can show the project at
 * once, and publishing it stays a deliberate commit.
 */

const DRAFTS_KEY = "baw.draft-projects";

export interface DraftProject {
  project: Project;
  bundle: ProjectDataBundle;
  importedAt: string;
  sourceFile: string;
}

export function readDrafts(): DraftProject[] {
  const raw = readSetting(DRAFTS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    // A half-written or hand-edited value should lose the drafts, not the app.
    if (!Array.isArray(parsed)) return [];

    return (parsed as DraftProject[])
      .filter((draft) => draft?.project?.id)
      .map((draft) => ({
        ...draft,
        // A draft stored before a collection existed would arrive without it,
        // and every page that maps over one would throw. Filling the gaps from
        // EMPTY_BUNDLE means an old draft degrades to "nothing there yet".
        bundle: { ...EMPTY_BUNDLE, ...draft.bundle, projectId: draft.project.id },
      }));
  } catch {
    return [];
  }
}

function writeDrafts(drafts: DraftProject[]): boolean {
  try {
    writeSetting(DRAFTS_KEY, JSON.stringify(drafts));
    return readDrafts().length === drafts.length;
  } catch {
    return false;
  }
}

/** Replaces a draft with the same id, so re-importing a corrected file works. */
export function saveDraft(draft: DraftProject): boolean {
  const others = readDrafts().filter((item) => item.project.id !== draft.project.id);
  return writeDrafts([...others, draft]);
}

export function deleteDraft(projectId: string): void {
  writeDrafts(readDrafts().filter((item) => item.project.id !== projectId));
}

export function isDraft(projectId: string): boolean {
  return readDrafts().some((item) => item.project.id === projectId);
}

/**
 * Builds the register entry for an imported project.
 *
 * A spreadsheet of artefacts says nothing about scope, stakeholders, timeline
 * or risk, so those stay empty rather than being invented — the overview page
 * will show them as not yet filled in, which is true.
 */
export function draftProjectRecord(
  projectId: string,
  name: string,
  owner: string,
  bundle: ProjectDataBundle,
  /** Whatever the Project / Scope / Stakeholders / Timeline sheets carried. */
  meta: Partial<Project> = {},
): Project {
  const today = new Date().toISOString().slice(0, 10);
  const words = name.split(/\s+/).filter(Boolean);
  const code = (words[0] ?? "PRJ").slice(0, 3).toUpperCase() + "-1.0";

  return {
    code,
    name,
    shortName: words.slice(0, 3).join(" ") || name,
    domain: "Banking",
    subDomain: "Imported",
    status: "In Progress",
    version: "1.0",
    release: "—",
    owner: {
      id: "USR-DRAFT",
      name: owner,
      role: "Functional Analyst",
      email: "",
      department: "",
    },
    businessOwner: "",
    programme: "",
    summary: `Imported into this browser from a spreadsheet on ${today}. It is a draft: it is not on the published site until its bundle is committed.`,
    businessObjective: "",
    inScope: [],
    outOfScope: [],
    stakeholders: [],
    timeline: [],
    dependencies: [],
    risks: [],
    tags: ["Draft", "Imported"],
    startDate: today,
    targetDate: "",
    lastUpdated: today,
    completion: 0,
    regulatoryDrivers: [],
    // The sheets win wherever they said something; the defaults only fill gaps.
    ...meta,
    // Never overridable: these identify the project and count what arrived.
    id: projectId,
    metrics: {
      requirements: bundle.requirements.length,
      businessRules: bundle.businessRules.length,
      apis: bundle.apiServices.reduce((sum, service) => sum + service.endpoints.length, 0),
      documents: bundle.documents.length,
      testCases: bundle.testCases.length,
      actors: bundle.actors.length,
      diagrams: bundle.diagrams.length,
    },
  };
}
