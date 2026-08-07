import { actors } from "@/data/actors";
import { apiServices } from "@/data/api";
import { businessRules } from "@/data/business-rules";
import { diagrams, wireframes } from "@/data/diagrams";
import { documents } from "@/data/documents";
import { functionalSpecSections } from "@/data/functional-spec";
import { bpmnModels, processFlows } from "@/data/process-flow";
import { requirements } from "@/data/requirements";
import { sqlTables, sqlValidations } from "@/data/sql";
import { testCases } from "@/data/test-cases";
import type { ProjectDataBundle } from "@/data/workspaces/types";

/**
 * Database objects touched by each requirement. Maintained by the analyst
 * alongside the data model; every other link in the matrix is derived from the
 * references already held on the artefacts themselves.
 */
const databaseObjectsByRequirement: Record<string, string[]> = {
  "REQ-001": ["IPH.PAYMENT_INSTRUCTION", "IPH.PAYMENT_STATUS_HISTORY"],
  "REQ-002": ["IPH.PAYMENT_CONTROL_RESULT", "IPH.BENEFICIARY_VERIFICATION_CACHE"],
  "REQ-003": ["IPH.PAYMENT_CONTROL_RESULT", "IPH.COMPLIANCE_ALERT"],
  "REQ-004": ["IPH.PAYMENT_CONTROL_RESULT", "IPH.FRAUD_CASE"],
  "REQ-005": ["IPH.FUNDS_RESERVATION", "IPH.PAYMENT_INSTRUCTION"],
  "REQ-006": ["IPH.SCHEME_MESSAGE_LOG", "IPH.PAYMENT_INSTRUCTION"],
  "REQ-007": ["IPH.PAYMENT_STATUS_HISTORY", "IPH.SCHEME_REASON_MAPPING"],
  "REQ-008": ["IPH.INBOUND_PAYMENT", "IPH.PAYMENT_INSTRUCTION"],
  "REQ-009": ["IPH.REACHABILITY_DIRECTORY"],
  "REQ-010": ["IPH.SEGMENT_LIMIT", "IPH.CUSTOMER_LIMIT_USAGE"],
  "REQ-011": ["IPH.PAYMENT_INSTRUCTION"],
  "REQ-012": ["IPH.PAYMENT_STATUS_HISTORY"],
  "REQ-013": ["IPH.RECALL_CASE", "IPH.SCHEME_MESSAGE_LOG"],
  "REQ-014": ["IPH.RECALL_CASE", "IPH.INBOUND_PAYMENT"],
  "REQ-015": ["IPH.NOTIFICATION_EVENT"],
  "REQ-016": ["IPH.PAYMENT_INSTRUCTION", "SCT.STANDARD_TRANSFER"],
  "REQ-017": ["IPH.SCA_AUTHORISATION", "IPH.SCA_EXEMPTION_USAGE"],
  "REQ-018": ["IPH.PAYMENT_INSTRUCTION", "IPH.BENEFICIARY_REGISTER"],
  "REQ-019": [],
  "REQ-020": ["IPH.PAYMENT_STAGE_TIMING"],
  "REQ-021": ["IPH.AUDIT_EVENT"],
  "REQ-022": ["IPH.SCHEME_SETTLEMENT", "IPH.RECONCILIATION_BREAK"],
  "REQ-023": ["IPH.OPERATIONS_QUEUE_ITEM", "IPH.AUDIT_EVENT"],
  "REQ-024": [],
};

export const instantPaymentsBundle: ProjectDataBundle = {
  projectId: "PRJ-IPH-023",
  requirements,
  businessRules,
  actors,
  functionalSpecSections,
  processFlows,
  bpmnModels,
  diagrams,
  wireframes,
  apiServices,
  sqlTables,
  sqlValidations,
  testCases,
  documents,
  databaseObjectsByRequirement,
};
