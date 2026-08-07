import type {
  Actor,
  ApiService,
  BusinessRule,
  Diagram,
  DiagramType,
  ProcessFlow,
  ProcessStep,
  Requirement,
  SqlValidationQuery,
  TestCase,
  Wireframe,
  WorkspaceDocument,
} from "@/lib/types";

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
  actors: Actor[];
  diagrams: Diagram[];
  wireframes: Wireframe[];
  apiServices: ApiService[];
  sqlValidations: SqlValidationQuery[];
  documents: WorkspaceDocument[];
  processFlows: ProcessFlow[];
  /** Sheets found in the file that were not recognised. */
  ignoredSheets: string[];
}

export type ParsedCollection = keyof Omit<ParsedProject, "ignoredSheets">;

export const EMPTY_PARSED: ParsedProject = {
  requirements: [],
  businessRules: [],
  testCases: [],
  actors: [],
  diagrams: [],
  wireframes: [],
  apiServices: [],
  sqlValidations: [],
  documents: [],
  processFlows: [],
  ignoredSheets: [],
};

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

/**
 * Acceptance criteria live on their own sheet — one row per criterion, keyed by
 * requirement — because Given / When / Then does not fit one cell readably.
 */
export function applyAcceptanceCriteria(requirements: Requirement[], rows: SheetRow[]): Requirement[] {
  const byRequirement = new Map<string, Requirement["acceptanceCriteria"]>();

  for (const row of rows) {
    const owner = field(row, "requirement", "requirementId", "req", "parent");
    if (!owner) continue;
    const criterion = {
      id: field(row, "id", "ref") || `${owner}.${(byRequirement.get(owner)?.length ?? 0) + 1}`,
      given: field(row, "given", "context"),
      when: field(row, "when", "action"),
      then: field(row, "then", "outcome", "expected"),
    };
    byRequirement.set(owner, [...(byRequirement.get(owner) ?? []), criterion]);
  }

  return requirements.map((requirement) => ({
    ...requirement,
    acceptanceCriteria: byRequirement.get(requirement.id) ?? requirement.acceptanceCriteria,
  }));
}

const ACTOR_TYPES = ["Human", "System", "External"] as const;

export function rowsToActors(rows: SheetRow[]): Actor[] {
  return rows
    .filter((row) => field(row, "id", "ref"))
    .map((row) => ({
      id: field(row, "id", "ref"),
      name: field(row, "name", "actor", "title"),
      type: oneOf(field(row, "type", "kind"), ACTOR_TYPES, "Human"),
      description: field(row, "description", "detail"),
      responsibilities: list(field(row, "responsibilities", "duties")),
      permissions: list(field(row, "permissions", "rights")),
      systemsUsed: list(field(row, "systems", "systemsUsed", "tools")),
      channel: field(row, "channel", "access") || "Web",
    }));
}

const DIAGRAM_TYPES = [
  "Use Case",
  "Sequence",
  "Component",
  "Activity",
  "State",
  "Class",
  "ER",
  "BPMN",
] as const satisfies readonly DiagramType[];

/** Carries PlantUML — and BPMN, which is simply a diagram whose type says BPMN. */
export function rowsToDiagrams(rows: SheetRow[], owner: string): Diagram[] {
  return rows
    .filter((row) => field(row, "id", "ref"))
    .map((row) => ({
      id: field(row, "id", "ref"),
      title: field(row, "title", "name"),
      type: oneOf(field(row, "type", "kind"), DIAGRAM_TYPES, "Sequence"),
      description: field(row, "description", "purpose"),
      source: field(row, "source", "plantuml", "puml", "code", "diagram"),
      version: field(row, "version") || "1.0",
      author: field(row, "author", "owner") || owner,
      lastUpdated: field(row, "lastUpdated", "updated", "date"),
      relatedRequirements: list(field(row, "requirements", "relatedRequirements", "coverage")),
    }));
}

const CHANNELS = ["Web", "Mobile", "Back Office"] as const;

export function rowsToWireframes(rows: SheetRow[], owner: string): Wireframe[] {
  return rows
    .filter((row) => field(row, "id", "ref"))
    .map((row) => ({
      id: field(row, "id", "ref"),
      title: field(row, "title", "name", "screen"),
      screenId: field(row, "screenId", "screen", "code") || field(row, "id", "ref"),
      description: field(row, "description", "purpose"),
      channel: oneOf(field(row, "channel"), CHANNELS, "Web"),
      version: field(row, "version") || "1.0",
      status: oneOf(field(row, "status"), STATUSES, "Draft"),
      author: field(row, "author", "owner") || owner,
      lastUpdated: field(row, "lastUpdated", "updated", "date"),
      annotations: list(field(row, "annotations", "notes")),
      relatedRequirements: list(field(row, "requirements", "relatedRequirements")),
    }));
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

/**
 * One row per endpoint; the service columns repeat, and endpoints are grouped by
 * service name. That keeps the sheet flat, which is how a spreadsheet is usable.
 */
export function rowsToApiServices(rows: SheetRow[], owner: string): ApiService[] {
  const services = new Map<string, ApiService>();

  for (const row of rows) {
    const id = field(row, "id", "ref", "operationId");
    if (!id) continue;

    const serviceName = field(row, "service", "api", "serviceName") || "API";
    let service = services.get(serviceName);
    if (!service) {
      service = {
        id: `SVC-${services.size + 1}`,
        name: serviceName,
        basePath: field(row, "basePath", "base") || "/api/v1",
        version: field(row, "serviceVersion", "version") || "1.0.0",
        description: field(row, "serviceDescription") || `Endpoints exposed by ${serviceName}.`,
        owner,
        status: "In Development",
        endpoints: [],
      };
      services.set(serviceName, service);
    }

    service.endpoints.push({
      id,
      method: oneOf(field(row, "method", "verb"), METHODS, "GET"),
      path: field(row, "path", "endpoint", "url"),
      summary: field(row, "summary", "title"),
      description: field(row, "description", "detail"),
      tag: field(row, "tag", "group") || serviceName,
      operationId: field(row, "operationId", "operation") || id,
      auth: field(row, "auth", "security") || "Bearer token",
      parameters: [],
      responses: [],
      relatedRequirements: list(field(row, "requirements", "relatedRequirements")),
    });
  }

  return [...services.values()];
}

const SQL_STATUSES = ["Validated", "Needs Review", "Failed"] as const;

export function rowsToSqlValidations(rows: SheetRow[], owner: string): SqlValidationQuery[] {
  return rows
    .filter((row) => field(row, "id", "ref"))
    .map((row) => ({
      id: field(row, "id", "ref"),
      title: field(row, "title", "name"),
      purpose: field(row, "purpose", "why", "description"),
      database: field(row, "database", "schema", "db") || "core",
      sql: field(row, "sql", "query", "statement"),
      columns: list(field(row, "columns", "resultColumns")),
      // Result rows are evidence of a run; a sheet rarely carries them.
      rows: [],
      notes: list(field(row, "notes", "comment")),
      status: oneOf(field(row, "status", "result"), SQL_STATUSES, "Needs Review"),
      lastRun: field(row, "lastRun", "executed", "date"),
      executedBy: field(row, "executedBy", "analyst") || owner,
      relatedRequirements: list(field(row, "requirements", "relatedRequirements")),
      relatedRules: list(field(row, "rules", "relatedRules")),
    }));
}

const FORMATS = ["PDF", "Word", "Excel", "Swagger", "BPMN", "PlantUML"] as const;
const CONFIDENTIALITY = ["Internal", "Confidential", "Restricted"] as const;

export function rowsToDocuments(rows: SheetRow[], owner: string): WorkspaceDocument[] {
  return rows
    .filter((row) => field(row, "id", "ref"))
    .map((row) => ({
      id: field(row, "id", "ref"),
      name: field(row, "name", "title", "document"),
      format: oneOf(field(row, "format", "type"), FORMATS, "Word"),
      description: field(row, "description", "purpose"),
      category: field(row, "category", "area") || "General",
      version: field(row, "version") || "1.0",
      author: field(row, "author", "owner") || owner,
      lastUpdated: field(row, "lastUpdated", "updated", "date"),
      size: field(row, "size") || "—",
      status: oneOf(field(row, "status"), STATUSES, "Draft"),
      confidentiality: oneOf(field(row, "confidentiality"), CONFIDENTIALITY, "Internal"),
      relatedRequirements: list(field(row, "requirements", "relatedRequirements")),
    }));
}

const STEP_TYPES = ["start", "task", "decision", "system", "end"] as const;

/**
 * One row per step; the flow columns repeat. Lanes are the distinct lane names
 * in the order they first appear, which is the order a reader meets them.
 */
export function rowsToProcessFlows(rows: SheetRow[]): ProcessFlow[] {
  const flows = new Map<string, ProcessFlow>();

  for (const row of rows) {
    const stepId = field(row, "stepId", "step", "id");
    if (!stepId) continue;

    const flowId = field(row, "flow", "flowId", "process") || "PF-001";
    let flow = flows.get(flowId);
    if (!flow) {
      flow = {
        id: flowId,
        name: field(row, "flowName", "processName", "name") || flowId,
        description: field(row, "flowDescription", "processDescription") || "",
        lanes: [],
        steps: [],
        trigger: field(row, "trigger") || "",
        outcome: field(row, "outcome") || "",
        slaTarget: field(row, "sla", "slaTarget") || "",
      };
      flows.set(flowId, flow);
    }

    const laneName = field(row, "lane", "swimlane", "actor") || "Process";
    if (!flow.lanes.some((lane) => lane.name === laneName)) {
      flow.lanes.push({
        id: `${flowId}-L${flow.lanes.length + 1}`,
        name: laneName,
        actorId: field(row, "actorId", "actor") || "",
      });
    }

    const step: ProcessStep = {
      id: stepId,
      name: field(row, "stepName", "name", "activity"),
      type: oneOf(field(row, "type", "kind"), STEP_TYPES, "task"),
      lane: laneName,
      description: field(row, "description", "detail"),
      rules: list(field(row, "rules", "businessRules")),
      next: list(field(row, "next", "goesTo", "successor")),
    };
    flow.steps.push(step);
  }

  return [...flows.values()];
}

const SHEET_MATCHERS: { key: ParsedCollection | "acceptanceCriteria"; names: string[] }[] = [
  // Longest, most specific names first — "acceptance criteria" contains neither
  // "requirements" nor "tests", but "test cases" must not win over "test data".
  { key: "acceptanceCriteria", names: ["acceptancecriteria", "criteria", "gwt", "ac"] },
  { key: "processFlows", names: ["processsteps", "processflow", "process", "workflow", "steps"] },
  { key: "apiServices", names: ["apiendpoints", "endpoints", "api", "swagger"] },
  { key: "sqlValidations", names: ["sqlvalidations", "sql", "queries", "datachecks"] },
  { key: "wireframes", names: ["wireframes", "screens", "mockups"] },
  { key: "diagrams", names: ["diagrams", "plantuml", "models", "bpmn", "uml"] },
  { key: "documents", names: ["documents", "deliverables", "docs"] },
  { key: "actors", names: ["actors", "roles", "personas", "stakeholders"] },
  { key: "requirements", names: ["requirements", "requirement", "reqs", "brd"] },
  { key: "businessRules", names: ["businessrules", "rules"] },
  { key: "testCases", names: ["testcases", "tests", "testcatalogue"] },
];

export function matchSheet(name: string): ParsedCollection | "acceptanceCriteria" | null {
  const normalised = normalise(name);

  // Short aliases must match the whole name: "Actors" contains "ac", and a
  // substring rule would file the actors under acceptance criteria.
  const matches = (alias: string) => {
    const candidate = normalise(alias);
    return candidate.length < 5 ? normalised === candidate : normalised.includes(candidate);
  };

  for (const matcher of SHEET_MATCHERS) {
    if (matcher.names.some(matches)) return matcher.key;
  }
  return null;
}

/**
 * Last resort when the sheet name says nothing — a CSV carries no sheet name
 * but "Scenario, Steps, Expected Result" is unmistakably a test catalogue.
 * Only used after `matchSheet` declines, and only when the columns are decisive.
 */
export function sniffSheet(rows: SheetRow[]): ParsedCollection | "acceptanceCriteria" | null {
  const first = rows[0];
  if (!first) return null;

  const columns = new Set(Object.keys(first).map(normalise));
  const has = (...names: string[]) => names.some((name) => columns.has(normalise(name)));

  if (has("given", "when", "then")) return "acceptanceCriteria";
  if (has("plantuml", "puml")) return "diagrams";
  if (has("sql", "query")) return "sqlValidations";
  if (has("method", "verb") && has("path", "endpoint")) return "apiServices";
  if (has("stepId") || (has("lane", "swimlane") && has("next"))) return "processFlows";
  if (has("scenario", "expectedResult", "steps")) return "testCases";
  if (has("logic", "expression")) return "businessRules";
  if (has("responsibilities", "permissions")) return "actors";
  if (has("businessNeed", "moscow", "acceptanceCriteria")) return "requirements";

  // A bare id + title + description sheet is a requirements list far more often
  // than anything else, but only claim it when there is an id to hang on to.
  if (has("id", "ref") && has("title", "name", "summary")) return "requirements";

  return null;
}
