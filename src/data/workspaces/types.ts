import type {
  Actor,
  ApiService,
  BpmnModel,
  BusinessRule,
  Diagram,
  FunctionalSpecSection,
  ProcessFlow,
  Requirement,
  SqlTable,
  SqlValidationQuery,
  TestCase,
  Wireframe,
  WorkspaceDocument,
} from "@/lib/types";

/**
 * Everything the workspace knows about one project's documentation set.
 *
 * A project may legitimately supply only part of it — a project that has not
 * reached the build phase has no test cases yet — so every collection is
 * required but may be empty. The UI renders a documented empty state per
 * module rather than hiding the page.
 */
export interface ProjectDataBundle {
  projectId: string;
  requirements: Requirement[];
  businessRules: BusinessRule[];
  actors: Actor[];
  functionalSpecSections: FunctionalSpecSection[];
  processFlows: ProcessFlow[];
  bpmnModels: BpmnModel[];
  diagrams: Diagram[];
  wireframes: Wireframe[];
  apiServices: ApiService[];
  sqlTables: SqlTable[];
  sqlValidations: SqlValidationQuery[];
  testCases: TestCase[];
  documents: WorkspaceDocument[];
  /** Database objects per requirement, used to build the traceability matrix. */
  databaseObjectsByRequirement: Record<string, string[]>;
}

export const EMPTY_BUNDLE: Omit<ProjectDataBundle, "projectId"> = {
  requirements: [],
  businessRules: [],
  actors: [],
  functionalSpecSections: [],
  processFlows: [],
  bpmnModels: [],
  diagrams: [],
  wireframes: [],
  apiServices: [],
  sqlTables: [],
  sqlValidations: [],
  testCases: [],
  documents: [],
  databaseObjectsByRequirement: {},
};
