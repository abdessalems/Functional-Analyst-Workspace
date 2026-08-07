import type { ProjectDataBundle } from "@/data/workspaces/types";

/**
 * Integrity checks for a project's documentation set.
 *
 * The workspace renders an unresolvable reference as a plain grey chip, which
 * looks deliberate — on a tool whose whole point is traceability, a dead link
 * that looks fine is the worst failure available. These checks surface them.
 */

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  level: IssueLevel;
  where: string;
  message: string;
}

export interface ValidationReport {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  counts: Record<string, number>;
  coverage: { full: number; partial: number; gap: number };
}

function collectIds(bundle: ProjectDataBundle) {
  return {
    requirements: new Set(bundle.requirements.map((item) => item.id)),
    rules: new Set(bundle.businessRules.map((item) => item.id)),
    actors: new Set(bundle.actors.map((item) => item.id)),
    spec: new Set(bundle.functionalSpecSections.map((item) => item.id)),
    diagrams: new Set(bundle.diagrams.map((item) => item.id)),
    wireframes: new Set(bundle.wireframes.map((item) => item.id)),
    apis: new Set(bundle.apiServices.flatMap((s) => s.endpoints).map((item) => item.id)),
    sql: new Set(bundle.sqlValidations.map((item) => item.id)),
    tests: new Set(bundle.testCases.map((item) => item.id)),
    documents: new Set(bundle.documents.map((item) => item.id)),
  };
}

/** Reports the same id appearing twice in one collection. */
function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

export function validateBundle(bundle: ProjectDataBundle): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const ids = collectIds(bundle);

  const collections: [string, string[]][] = [
    ["requirements", bundle.requirements.map((i) => i.id)],
    ["business rules", bundle.businessRules.map((i) => i.id)],
    ["actors", bundle.actors.map((i) => i.id)],
    ["spec sections", bundle.functionalSpecSections.map((i) => i.id)],
    ["diagrams", bundle.diagrams.map((i) => i.id)],
    ["wireframes", bundle.wireframes.map((i) => i.id)],
    ["endpoints", bundle.apiServices.flatMap((s) => s.endpoints).map((i) => i.id)],
    ["SQL validations", bundle.sqlValidations.map((i) => i.id)],
    ["test cases", bundle.testCases.map((i) => i.id)],
    ["documents", bundle.documents.map((i) => i.id)],
  ];

  for (const [name, list] of collections) {
    for (const duplicate of findDuplicates(list)) {
      errors.push({ level: "error", where: name, message: `duplicate id ${duplicate}` });
    }
  }

  // Every reference a requirement makes must resolve to something real.
  for (const requirement of bundle.requirements) {
    const check = (refs: string[], set: Set<string>, kind: string) => {
      for (const ref of refs) {
        if (!set.has(ref)) {
          errors.push({
            level: "error",
            where: requirement.id,
            message: `${kind} ${ref} does not exist`,
          });
        }
      }
    };
    check(requirement.relatedRules, ids.rules, "business rule");
    check(requirement.relatedApis, ids.apis, "endpoint");
    check(requirement.relatedTestCases, ids.tests, "test case");
    check(requirement.relatedDocuments, ids.documents, "document");
  }

  for (const rule of bundle.businessRules) {
    for (const ref of rule.impactedRequirements) {
      if (!ids.requirements.has(ref)) {
        errors.push({ level: "error", where: rule.id, message: `requirement ${ref} does not exist` });
      }
    }
  }

  for (const testCase of bundle.testCases) {
    if (testCase.linkedRequirement && !ids.requirements.has(testCase.linkedRequirement)) {
      warnings.push({
        level: "warning",
        where: testCase.id,
        message: `linked requirement ${testCase.linkedRequirement} does not exist`,
      });
    }
  }

  for (const section of bundle.functionalSpecSections) {
    for (const ref of section.requirementRefs) {
      if (!ids.requirements.has(ref)) {
        errors.push({ level: "error", where: section.id, message: `requirement ${ref} does not exist` });
      }
    }
  }

  for (const diagram of [...bundle.diagrams, ...bundle.wireframes]) {
    for (const ref of diagram.relatedRequirements) {
      if (!ids.requirements.has(ref)) {
        errors.push({ level: "error", where: diagram.id, message: `requirement ${ref} does not exist` });
      }
    }
  }

  // Artefacts nobody points at are usually a rename that was half finished.
  const referencedRules = new Set(bundle.requirements.flatMap((r) => r.relatedRules));
  for (const rule of bundle.businessRules) {
    if (!referencedRules.has(rule.id) && rule.impactedRequirements.length === 0) {
      warnings.push({ level: "warning", where: rule.id, message: "referenced by no requirement" });
    }
  }

  const referencedTests = new Set(bundle.requirements.flatMap((r) => r.relatedTestCases));
  for (const testCase of bundle.testCases) {
    if (!referencedTests.has(testCase.id) && !ids.requirements.has(testCase.linkedRequirement)) {
      warnings.push({
        level: "warning",
        where: testCase.id,
        message: "not reachable from any requirement",
      });
    }
  }

  // Requirement coverage, the same rule the traceability matrix applies.
  let full = 0;
  let partial = 0;
  let gap = 0;
  for (const requirement of bundle.requirements) {
    const hasTests = requirement.relatedTestCases.length > 0;
    const hasRules = requirement.relatedRules.length > 0;
    const hasDesign =
      requirement.relatedApis.length > 0 ||
      bundle.diagrams.some((d) => d.relatedRequirements.includes(requirement.id));
    const hasEvidence =
      requirement.relatedDocuments.length > 0 ||
      bundle.sqlValidations.some((q) => q.relatedRequirements.includes(requirement.id));

    if (!hasTests) gap += 1;
    else if (hasRules && hasDesign && hasEvidence) full += 1;
    else partial += 1;
  }

  const counts: Record<string, number> = {
    Requirements: bundle.requirements.length,
    "Business rules": bundle.businessRules.length,
    Actors: bundle.actors.length,
    "Spec sections": bundle.functionalSpecSections.length,
    "Process flows": bundle.processFlows.length,
    Models: bundle.diagrams.length,
    Wireframes: bundle.wireframes.length,
    Endpoints: bundle.apiServices.flatMap((s) => s.endpoints).length,
    "SQL validations": bundle.sqlValidations.length,
    "Test cases": bundle.testCases.length,
    Documents: bundle.documents.length,
  };

  for (const [name, count] of Object.entries(counts)) {
    if (count === 0) {
      warnings.push({ level: "warning", where: name, message: "nothing here yet" });
    }
  }

  return { errors, warnings, counts, coverage: { full, partial, gap } };
}
