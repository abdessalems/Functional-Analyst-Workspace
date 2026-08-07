import type { BusinessRule, Requirement, TestCase } from "@/lib/types";

/**
 * Turns a spreadsheet into typed artefacts.
 *
 * Sheets are matched by name, columns by heading — both case-insensitively and
 * ignoring spaces, because a real spreadsheet says "Business Need" where the
 * model says `businessNeed`. Anything the sheet does not carry is left empty
 * rather than invented.
 */

export type SheetRow = Record<string, unknown>;

export interface ParsedProject {
  requirements: Requirement[];
  businessRules: BusinessRule[];
  testCases: TestCase[];
  /** Sheets found in the file that were not recognised. */
  ignoredSheets: string[];
}

const normalise = (value: string) => value.toLowerCase().replace(/[\s_-]/g, "");

/** Reads a column by any of its accepted headings. */
function field(row: SheetRow, ...names: string[]): string {
  for (const name of names) {
    const key = Object.keys(row).find((column) => normalise(column) === normalise(name));
    if (key === undefined) continue;
    const value = row[key];
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

/** Splits a cell holding several ids: "TC-001, TC-002" or newline separated. */
function list(value: string): string[] {
  return value
    .split(/[,;\n|]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  const match = allowed.find((option) => normalise(option) === normalise(value));
  return match ?? fallback;
}

const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
const STATUSES = ["Draft", "In Review", "Approved", "Implemented", "Deprecated", "Rejected"] as const;
const TEST_STATUSES = ["Passed", "Failed", "Blocked", "Not Run"] as const;
const TEST_TYPES = ["Functional", "Integration", "Regression", "Negative", "Performance"] as const;
const MOSCOW = ["Must", "Should", "Could", "Won't"] as const;

/** "1. do this -> expect that" per line, or "do this -> expect that; ..." */
function parseSteps(value: string): { step: number; action: string; expected: string }[] {
  return value
    .split(/\r?\n|;/)
    .map((entry) => entry.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean)
    .map((entry, index) => {
      const [action, expected = ""] = entry.split(/->|→|\|/);
      return { step: index + 1, action: action.trim(), expected: expected.trim() };
    });
}

export function rowsToRequirements(rows: SheetRow[], owner: string): Requirement[] {
  return rows
    .filter((row) => field(row, "id", "requirement", "ref"))
    .map((row) => ({
      id: field(row, "id", "requirement", "ref"),
      title: field(row, "title", "name", "summary"),
      businessNeed: field(row, "businessNeed", "need", "why", "rationale"),
      description: field(row, "description", "detail"),
      priority: oneOf(field(row, "priority"), PRIORITIES, "Medium"),
      status: oneOf(field(row, "status"), STATUSES, "Draft"),
      category: field(row, "category", "area", "theme") || "General",
      moscow: oneOf(field(row, "moscow"), MOSCOW, "Must"),
      owner: field(row, "owner", "analyst") || owner,
      lastUpdated: field(row, "lastUpdated", "updated", "date"),
      version: field(row, "version") || "1.0",
      acceptanceCriteria: [],
      relatedDocuments: list(field(row, "documents", "relatedDocuments", "docs")),
      relatedApis: list(field(row, "apis", "relatedApis", "endpoints")),
      relatedTestCases: list(field(row, "tests", "testCases", "relatedTestCases")),
      relatedRules: list(field(row, "rules", "businessRules", "relatedRules")),
    }));
}

export function rowsToRules(rows: SheetRow[], owner: string): BusinessRule[] {
  return rows
    .filter((row) => field(row, "id", "rule", "ref"))
    .map((row) => ({
      id: field(row, "id", "rule", "ref"),
      description: field(row, "description", "rule", "statement"),
      logic: field(row, "logic", "expression", "condition"),
      priority: oneOf(field(row, "priority"), PRIORITIES, "Medium"),
      source: field(row, "source", "authority", "origin"),
      status: oneOf(field(row, "status"), STATUSES, "Draft"),
      category: field(row, "category", "area") || "General",
      owner: field(row, "owner") || owner,
      effectiveFrom: field(row, "effectiveFrom", "from", "date"),
      impactedRequirements: list(field(row, "requirements", "impactedRequirements", "impacts")),
    }));
}

export function rowsToTestCases(rows: SheetRow[], owner: string): TestCase[] {
  return rows
    .filter((row) => field(row, "id", "test", "ref"))
    .map((row) => ({
      id: field(row, "id", "test", "ref"),
      scenario: field(row, "scenario", "title", "name"),
      suite: field(row, "suite", "group", "area") || "General",
      preconditions: list(field(row, "preconditions", "given", "setup")),
      steps: parseSteps(field(row, "steps", "actions")),
      expectedResult: field(row, "expectedResult", "expected", "then"),
      status: oneOf(field(row, "status", "result"), TEST_STATUSES, "Not Run"),
      priority: oneOf(field(row, "priority"), PRIORITIES, "Medium"),
      type: oneOf(field(row, "type", "kind"), TEST_TYPES, "Functional"),
      linkedRequirement: field(row, "requirement", "linkedRequirement", "coverage"),
      lastRun: field(row, "lastRun", "executed", "date"),
      executedBy: field(row, "executedBy", "tester") || owner,
      defect: field(row, "defect", "bug") || undefined,
    }));
}

const SHEET_MATCHERS: { key: keyof Omit<ParsedProject, "ignoredSheets">; names: string[] }[] = [
  { key: "requirements", names: ["requirements", "requirement", "reqs", "fr", "brd"] },
  { key: "businessRules", names: ["businessrules", "rules", "br"] },
  { key: "testCases", names: ["testcases", "tests", "tc", "testcatalogue"] },
];

export function matchSheet(name: string): keyof Omit<ParsedProject, "ignoredSheets"> | null {
  const normalised = normalise(name);
  for (const matcher of SHEET_MATCHERS) {
    if (matcher.names.some((candidate) => normalised.includes(normalise(candidate)))) {
      return matcher.key;
    }
  }
  return null;
}
