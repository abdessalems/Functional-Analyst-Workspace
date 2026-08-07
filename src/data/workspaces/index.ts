import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";
import { europayHubBundle } from "@/data/workspaces/europay-hub";
import { instantPaymentsBundle } from "@/data/workspaces/instant-payments";

/**
 * Registry of every project whose documentation set has been migrated into the
 * workspace. Adding a project is a new entry here plus its bundle file — no
 * component, route or navigation change.
 */
const BUNDLES: ProjectDataBundle[] = [instantPaymentsBundle, europayHubBundle];

const BY_ID = new Map(BUNDLES.map((bundle) => [bundle.projectId, bundle]));

export function getProjectBundle(projectId: string): ProjectDataBundle {
  return BY_ID.get(projectId) ?? { ...EMPTY_BUNDLE, projectId };
}

/** True when a project has any documentation at all in the workspace. */
export function hasProjectBundle(projectId: string): boolean {
  return BY_ID.has(projectId);
}

/** Artefact counts used for the sidebar chips and the project register. */
export function getBundleCounts(bundle: ProjectDataBundle) {
  return {
    requirements: bundle.requirements.length,
    businessRules: bundle.businessRules.length,
    actors: bundle.actors.length,
    functionalSpecSections: bundle.functionalSpecSections.length,
    processFlows: bundle.processFlows.length,
    bpmnModels: bundle.diagrams.filter((d) => d.type === "BPMN").length,
    diagrams: bundle.diagrams.filter((d) => d.type !== "BPMN").length,
    wireframes: bundle.wireframes.length,
    apis: bundle.apiServices.reduce((sum, service) => sum + service.endpoints.length, 0),
    sqlValidations: bundle.sqlValidations.length,
    testCases: bundle.testCases.length,
    documents: bundle.documents.length,
  };
}

export type { ProjectDataBundle };
