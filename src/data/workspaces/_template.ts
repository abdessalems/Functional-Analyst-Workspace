import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";

/**
 * TEMPLATE — copy this file to add a project.
 *
 *   1. Copy to `my-project.ts` and rename the export.
 *   2. Add the project's register entry to `src/data/projects.ts`
 *      (name, status, objective, scope, stakeholders, timeline, risks).
 *   3. Register the bundle in `src/data/workspaces/index.ts`.
 *
 * Fill in only what the project actually has. Anything left empty simply does
 * not appear — the sidebar hides the page, and the Analysis Process page drops
 * that stage. A project with requirements and rules only shows two pages, and
 * that is a correct, honest representation of where it stands.
 *
 * ID conventions keep cross-references clickable:
 *   FR-/REQ-  requirement      BR-   business rule    FS-   spec section
 *   ACT-      actor            UML-  diagram          WF-   wireframe
 *   API-      endpoint         SQL-  validation       TC-   test case
 *   DOC-      document
 */
export const templateBundle: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: "PRJ-XXX-000",

  requirements: [
    // {
    //   id: "FR-1",
    //   title: "",
    //   businessNeed: "Why the business needs this — the problem, not the solution.",
    //   description: "What the system must do, precisely enough to build and test.",
    //   priority: "High",           // Critical | High | Medium | Low
    //   status: "Implemented",      // Draft | In Review | Approved | Implemented
    //   category: "",
    //   moscow: "Must",             // Must | Should | Could | Won't
    //   owner: "Saadaoui Abdessalem",
    //   lastUpdated: "2026-01-01",
    //   version: "1.0",
    //   acceptanceCriteria: [
    //     { id: "AC-FR1-1", given: "", when: "", then: "" },
    //   ],
    //   relatedDocuments: [],
    //   relatedApis: [],
    //   relatedTestCases: [],
    //   relatedRules: [],
    // },
  ],

  businessRules: [
    // {
    //   id: "BR-001",
    //   description: "The rule, stated so it can be tested.",
    //   logic: "IF … THEN …",
    //   priority: "Critical",
    //   source: "Where the rule comes from — regulation, scheme rulebook, policy.",
    //   status: "Implemented",
    //   category: "",
    //   owner: "Saadaoui Abdessalem",
    //   effectiveFrom: "2026-01-01",
    //   impactedRequirements: ["FR-1"],
    // },
  ],

  actors: [
    // {
    //   id: "ACT-001",
    //   name: "",
    //   type: "Human",              // Human | System | External
    //   description: "",
    //   responsibilities: [],
    //   permissions: [],
    //   systemsUsed: [],
    //   channel: "",
    // },
  ],

  // Remaining collections follow the same shape — see the Instant Payments
  // bundle for worked examples of every one:
  //   functionalSpecSections, processFlows, bpmnModels, diagrams,
  //   wireframes, apiServices, sqlTables, sqlValidations, testCases, documents

  /** Database objects per requirement — the data column of the traceability matrix. */
  databaseObjectsByRequirement: {
    // "FR-1": ["schema.table"],
  },
};
