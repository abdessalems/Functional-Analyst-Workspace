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

  /*
   * The code comes from the id, which was itself derived from the name and made
   * unique — taking it from the first word instead produced "1-1.0" for a file
   * named "1 AS IS …", and two projects sharing a code when two names started
   * with the same word.
   */
  const [, letters = "PRJ", number = "1"] = projectId.split("-");
  const code = `${letters}-${Number(number) || 1}.0`;

  // The short name is what a sidebar and a card show, so it drops the AS-IS /
  // TO-BE marker only when there is something left to identify the project by.
  const words = name.split(/\s+/).filter(Boolean);
  const meaningful = words.filter((word) => !/^(AS-IS|TO-BE|—|-)$/i.test(word));

  return {
    code,
    name,
    shortName: (meaningful.length >= 2 ? meaningful : words).slice(0, 4).join(" ") || name,
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
    /*
     * Empty, not a note about being a draft.
     *
     * This field is the paragraph under the project's name on its card and on
     * its overview — the first thing anyone reads. A sentence explaining the
     * import mechanism was written here as a placeholder, and it reached the
     * published site, where it told visitors the project was "not on the
     * published site". Nothing is better than the wrong thing: the card simply
     * shows no description until the Project sheet carries a Summary.
     */
    summary: "",
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
