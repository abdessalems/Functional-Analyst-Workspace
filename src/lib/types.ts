/**
 * Domain model for the Business Analyst Workspace.
 *
 * These types describe the artefacts an analyst maintains across the delivery
 * lifecycle. They are deliberately transport-agnostic so the mock data layer in
 * `src/data` can later be swapped for a real API without touching the UI.
 */

export type Priority = "Critical" | "High" | "Medium" | "Low";

export type ArtifactStatus =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Implemented"
  | "Deprecated"
  | "Rejected";

export type ProjectStatus =
  | "Completed"
  | "In Progress"
  | "In Review"
  | "Planned"
  | "On Hold";

export type RiskLevel = "Low" | "Medium" | "High";

export type TestStatus = "Passed" | "Failed" | "Blocked" | "Not Run";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type DocumentFormat = "PDF" | "Word" | "Excel" | "Swagger" | "BPMN" | "PlantUML";

export type DiagramType = "Use Case" | "Sequence" | "Component" | "Activity" | "State";

/** Every artefact carries a stable business key (e.g. `BR-014`) used for traceability. */
export interface Artifact {
  id: string;
  title: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
}

export interface Stakeholder extends Person {
  raci: "Responsible" | "Accountable" | "Consulted" | "Informed";
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  status: "Completed" | "In Progress" | "Upcoming" | "At Risk";
  description: string;
}

export interface Dependency {
  id: string;
  name: string;
  type: "Internal System" | "External Party" | "Vendor" | "Regulatory";
  owner: string;
  status: "Resolved" | "On Track" | "At Risk" | "Blocked";
  description: string;
}

export interface RiskItem {
  id: string;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  mitigation: string;
  owner: string;
}

export interface ProjectMetrics {
  requirements: number;
  businessRules: number;
  apis: number;
  documents: number;
  testCases: number;
  actors: number;
  diagrams: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  shortName: string;
  domain: string;
  subDomain: string;
  status: ProjectStatus;
  version: string;
  release: string;
  owner: Person;
  businessOwner: string;
  programme: string;
  summary: string;
  businessObjective: string;
  inScope: string[];
  outOfScope: string[];
  stakeholders: Stakeholder[];
  timeline: Milestone[];
  dependencies: Dependency[];
  risks: RiskItem[];
  tags: string[];
  metrics: ProjectMetrics;
  startDate: string;
  targetDate: string;
  lastUpdated: string;
  completion: number;
  regulatoryDrivers: string[];
}

export interface AcceptanceCriterion {
  id: string;
  given: string;
  when: string;
  then: string;
}

export interface Requirement {
  id: string;
  title: string;
  businessNeed: string;
  description: string;
  priority: Priority;
  status: ArtifactStatus;
  category: string;
  moscow: "Must" | "Should" | "Could" | "Won't";
  owner: string;
  lastUpdated: string;
  version: string;
  acceptanceCriteria: AcceptanceCriterion[];
  relatedDocuments: string[];
  relatedApis: string[];
  relatedTestCases: string[];
  relatedRules: string[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  length: string;
  mandatory: boolean;
  description: string;
  example: string;
}

export interface ValidationRule {
  field: string;
  rule: string;
  errorCode: string;
  severity: "Blocking" | "Warning";
}

export interface ErrorDefinition {
  code: string;
  httpStatus: number;
  message: string;
  handling: string;
}

export interface EdgeCase {
  id: string;
  scenario: string;
  expectedBehaviour: string;
}

export interface FunctionalSpecSection {
  id: string;
  title: string;
  summary: string;
  requirementRefs: string[];
  businessLogic: string[];
  validations: ValidationRule[];
  errors: ErrorDefinition[];
  fields: FieldDefinition[];
  edgeCases: EdgeCase[];
}

export interface BusinessRule {
  id: string;
  description: string;
  logic: string;
  priority: Priority;
  source: string;
  status: ArtifactStatus;
  category: string;
  owner: string;
  effectiveFrom: string;
  impactedRequirements: string[];
}

export interface Actor {
  id: string;
  name: string;
  type: "Human" | "System" | "External";
  description: string;
  responsibilities: string[];
  permissions: string[];
  systemsUsed: string[];
  channel: string;
}

export interface ProcessStep {
  id: string;
  name: string;
  type: "start" | "task" | "decision" | "system" | "end";
  lane: string;
  description: string;
  rules: string[];
  next: string[];
}

export interface ProcessLane {
  id: string;
  name: string;
  actorId: string;
}

export interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  lanes: ProcessLane[];
  steps: ProcessStep[];
  trigger: string;
  outcome: string;
  slaTarget: string;
}

export interface Diagram {
  id: string;
  title: string;
  type: DiagramType;
  description: string;
  source: string;
  version: string;
  author: string;
  lastUpdated: string;
  relatedRequirements: string[];
}

export interface BpmnModel {
  id: string;
  title: string;
  description: string;
  version: string;
  author: string;
  lastUpdated: string;
  notation: string;
  processFlowId: string;
}

export interface Wireframe {
  id: string;
  title: string;
  screenId: string;
  description: string;
  channel: "Web" | "Mobile" | "Back Office";
  version: string;
  status: ArtifactStatus;
  author: string;
  lastUpdated: string;
  annotations: string[];
  relatedRequirements: string[];
}

export interface ApiParameter {
  name: string;
  in: "header" | "path" | "query";
  type: string;
  required: boolean;
  description: string;
  example: string;
}

export interface ApiResponse {
  status: number;
  description: string;
  body?: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tag: string;
  operationId: string;
  auth: string;
  parameters: ApiParameter[];
  requestBody?: string;
  responses: ApiResponse[];
  relatedRequirements: string[];
}

export interface ApiService {
  id: string;
  name: string;
  basePath: string;
  version: string;
  description: string;
  owner: string;
  status: "Live" | "In Development" | "Deprecated";
  endpoints: ApiEndpoint[];
}

export interface SqlColumn {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
}

export interface SqlTable {
  name: string;
  schema: string;
  description: string;
  columns: SqlColumn[];
}

export interface SqlValidationQuery {
  id: string;
  title: string;
  purpose: string;
  database: string;
  sql: string;
  columns: string[];
  rows: string[][];
  notes: string[];
  status: "Validated" | "Needs Review" | "Failed";
  lastRun: string;
  executedBy: string;
  relatedRequirements: string[];
  relatedRules: string[];
}

export interface TestStep {
  step: number;
  action: string;
  expected: string;
}

export interface TestCase {
  id: string;
  scenario: string;
  suite: string;
  preconditions: string[];
  steps: TestStep[];
  expectedResult: string;
  status: TestStatus;
  priority: Priority;
  type: "Functional" | "Integration" | "Regression" | "Negative" | "Performance";
  linkedRequirement: string;
  lastRun: string;
  executedBy: string;
  defect?: string;
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  format: DocumentFormat;
  description: string;
  category: string;
  version: string;
  author: string;
  lastUpdated: string;
  size: string;
  pages?: number;
  status: ArtifactStatus;
  confidentiality: "Internal" | "Confidential" | "Restricted";
  relatedRequirements: string[];
}

export interface TraceabilityLink {
  requirementId: string;
  businessRuleIds: string[];
  diagramIds: string[];
  apiIds: string[];
  databaseObjects: string[];
  sqlValidationIds: string[];
  testCaseIds: string[];
  documentIds: string[];
  coverage: "Full" | "Partial" | "Gap";
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  targetHref: string;
  timestamp: string;
  type: "created" | "updated" | "approved" | "commented" | "linked" | "executed";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "warning" | "success";
  href: string;
}

/** Entity kinds that participate in global search. */
export type SearchEntityType =
  | "Requirement"
  | "Business Rule"
  | "Actor"
  | "API"
  | "Test Case"
  | "Document"
  | "SQL"
  | "Diagram"
  | "Page";

export interface SearchRecord {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  keywords: string;
  href: string;
}
