"use client";

import * as React from "react";

import type { TraceabilityLink } from "@/lib/types";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { getBundleCounts, getProjectBundle } from "@/data/workspaces";

/**
 * The active project's documentation set. Every artefact page reads through
 * this hook, so switching project switches the whole workspace.
 */
export function useProjectData() {
  const { project, draftBundle } = useWorkspace();
  // A project imported in this browser is read from the draft, not the registry.
  return React.useMemo(
    () => draftBundle ?? getProjectBundle(project.id),
    [project.id, draftBundle],
  );
}

export function useProjectCounts() {
  const bundle = useProjectData();
  return React.useMemo(() => getBundleCounts(bundle), [bundle]);
}

function resolveCoverage(link: Omit<TraceabilityLink, "coverage">): TraceabilityLink["coverage"] {
  const hasTests = link.testCaseIds.length > 0;
  const hasRules = link.businessRuleIds.length > 0;
  const hasDesign = link.diagramIds.length > 0 || link.apiIds.length > 0;
  const hasEvidence = link.sqlValidationIds.length > 0 || link.documentIds.length > 0;

  if (!hasTests) return "Gap";
  if (hasRules && hasDesign && hasEvidence) return "Full";
  return "Partial";
}

/**
 * Traceability is derived, never stored twice: the chain is assembled from the
 * links already held on each artefact, so it cannot drift from the artefacts.
 */
export function useTraceability() {
  const bundle = useProjectData();

  return React.useMemo(() => {
    const links: TraceabilityLink[] = bundle.requirements.map((requirement) => {
      const base = {
        requirementId: requirement.id,
        businessRuleIds: requirement.relatedRules,
        diagramIds: bundle.diagrams
          .filter((diagram) => diagram.relatedRequirements.includes(requirement.id))
          .map((diagram) => diagram.id),
        apiIds: requirement.relatedApis,
        databaseObjects: bundle.databaseObjectsByRequirement[requirement.id] ?? [],
        sqlValidationIds: bundle.sqlValidations
          .filter((query) => query.relatedRequirements.includes(requirement.id))
          .map((query) => query.id),
        testCaseIds: requirement.relatedTestCases,
        documentIds: requirement.relatedDocuments,
      };
      return { ...base, coverage: resolveCoverage(base) };
    });

    return {
      links,
      summary: {
        total: links.length,
        full: links.filter((link) => link.coverage === "Full").length,
        partial: links.filter((link) => link.coverage === "Partial").length,
        gap: links.filter((link) => link.coverage === "Gap").length,
      },
    };
  }, [bundle]);
}
