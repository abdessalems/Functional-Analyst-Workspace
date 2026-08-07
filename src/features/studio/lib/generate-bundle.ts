import type { ParsedProject } from "@/features/studio/lib/parse-workbook";

/**
 * Emits the TypeScript bundle file for an imported project.
 *
 * The file is written to be committed and then edited by hand — prose,
 * acceptance criteria and diagrams are analyst work that no spreadsheet
 * carries, so the generated file says so rather than leaving silent gaps.
 */
export function generateBundleFile(projectId: string, exportName: string, parsed: ParsedProject) {
  const json = (value: unknown) => JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");

  return `import type { BusinessRule, Requirement, TestCase } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";

/**
 * Generated from a spreadsheet in the workspace studio.
 *
 * Still to add by hand — a spreadsheet cannot carry them:
 *   - acceptanceCriteria on each requirement (Given / When / Then)
 *   - functionalSpecSections, processFlows, diagrams, wireframes
 *   - apiServices, sqlTables, sqlValidations, documents
 *   - databaseObjectsByRequirement, for the data column of the matrix
 *
 * Anything left empty simply does not appear; the page shows "Not yet".
 */

const requirements: Requirement[] = ${json(parsed.requirements)};

const businessRules: BusinessRule[] = ${json(parsed.businessRules)};

const testCases: TestCase[] = ${json(parsed.testCases)};

export const ${exportName}: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: ${JSON.stringify(projectId)},
  requirements,
  businessRules,
  testCases,
  databaseObjectsByRequirement: {},
};
`;
}

/** The one line to add to the registry, shown next to the download. */
export function registrySnippet(exportName: string, fileName: string) {
  return `import { ${exportName} } from "@/data/workspaces/${fileName}";

const BUNDLES: ProjectDataBundle[] = [
  instantPaymentsBundle,
  europayHubBundle,
  ${exportName},
];`;
}
