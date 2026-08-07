import type { ParsedProject } from "@/features/studio/lib/parse-workbook";

/**
 * Emits the TypeScript bundle file for an imported project.
 *
 * The file is written to be committed and then edited by hand — prose and
 * detail that no spreadsheet carries are analyst work, so the generated file
 * says which of them are missing rather than leaving silent gaps.
 */
export function generateBundleFile(projectId: string, exportName: string, parsed: ParsedProject) {
  const json = (value: unknown) => JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");

  /** Only collections with content are emitted; the rest fall back to EMPTY_BUNDLE. */
  const sections: [string, string, unknown[]][] = [
    ["requirements", "Requirement", parsed.requirements],
    ["businessRules", "BusinessRule", parsed.businessRules],
    ["testCases", "TestCase", parsed.testCases],
    ["actors", "Actor", parsed.actors],
    ["diagrams", "Diagram", parsed.diagrams],
    ["wireframes", "Wireframe", parsed.wireframes],
    ["apiServices", "ApiService", parsed.apiServices],
    ["sqlValidations", "SqlValidationQuery", parsed.sqlValidations],
    ["documents", "WorkspaceDocument", parsed.documents],
    ["processFlows", "ProcessFlow", parsed.processFlows],
  ];

  const present = sections.filter(([, , rows]) => rows.length > 0);
  const missing = sections.filter(([, , rows]) => rows.length === 0).map(([name]) => name);

  const imports = [...new Set(present.map(([, type]) => type))].sort().join(", ");
  const declarations = present
    .map(([name, type, rows]) => `const ${name}: ${type}[] = ${json(rows)};`)
    .join("\n\n");
  const assignments = present.map(([name]) => `  ${name},`).join("\n");

  const todo = missing.length
    ? ` *   - ${missing.join(", ")}\n`
    : " *   - nothing: every collection arrived with content\n";

  return `import type { ${imports || "Requirement"} } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";

/**
 * Generated from a spreadsheet in the workspace studio.
 *
 * Empty and still to add by hand:
${todo} *
 * A spreadsheet also cannot carry the detail inside a functional specification —
 * field tables, validations, error codes and edge cases — nor the result rows
 * that make a SQL check evidence rather than an intention.
 *
 * Anything left empty simply does not appear; the page shows "Not yet".
 */

${declarations}

export const ${exportName}: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: ${JSON.stringify(projectId)},
${assignments}
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
