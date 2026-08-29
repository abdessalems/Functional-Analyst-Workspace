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
    ["functionalSpecSections", "FunctionalSpecSection", parsed.functionalSpecSections],
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

/**
 * The project's entry for the register, as source ready to be appended to the
 * `projects` array. JSON is a valid TypeScript object literal, which keeps this
 * a formatting job rather than a code generator.
 */
export function generateProjectRecord(project: unknown) {
  return `  ${JSON.stringify(project, null, 2).replace(/\n/g, "\n  ")},`;
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

/**
 * The file and export name a project is published under.
 *
 * Derived from the project id so two projects can never collide in the
 * registry — `myProjectBundle` twice is a duplicate identifier and the build
 * stops. It also means deleting a project can find the same names again
 * without being told them.
 */
export function bundleNames(projectId: string) {
  const fileName = projectId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const exportName =
    fileName
      .split("-")
      .filter(Boolean)
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join("") + "Bundle";

  return { fileName, exportName };
}

/**
 * Proposes the next free project id.
 *
 * The code comes from the project's own name — "Tax Declaration & Refund"
 * becomes TAX — because an id is read far more often than it is typed: it sits
 * in the URL, the file name and the card. Falling back to NEW only when the
 * name gives nothing to work with.
 *
 * The number is the lowest that is not already taken, so ids stay dense even
 * after a project is removed.
 */
export function suggestProjectId(name: string, taken: readonly string[]): string {
  const words = name
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean)
    // A leading "1." or "2." numbers the file, it does not name the project —
    // without this, "1. Tax Declaration" became PRJ-1TA-001.
    .filter((word) => !/^\d+$/.test(word))
    // "The", "of" and friends carry no meaning in a three-letter code, and
    // "AS-IS" / "TO-BE" describe the variant rather than the subject.
    .filter(
      (word) => !["THE", "AND", "OF", "FOR", "TO", "BE", "AS", "IS", "A", "AN"].includes(word),
    );

  // The first word long enough to stand on its own, otherwise the words run
  // together — "IT Ops" gives ITO rather than ITX.
  const first = words.find((word) => word.length >= 3) ?? "";
  const code = (first ? first.slice(0, 3) : words.join("").slice(0, 3) || "NEW").padEnd(3, "X");

  const used = new Set(taken.map((id) => id.toUpperCase()));
  for (let n = 1; n < 1000; n += 1) {
    const candidate = `PRJ-${code}-${String(n).padStart(3, "0")}`;
    if (!used.has(candidate)) return candidate;
  }

  return `PRJ-${code}-${Date.now()}`;
}
