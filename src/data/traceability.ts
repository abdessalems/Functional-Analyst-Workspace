import type { TraceabilityLink } from "@/lib/types";

import { diagrams } from "@/data/diagrams";
import { requirements } from "@/data/requirements";
import { sqlValidations } from "@/data/sql";

/**
 * Database objects touched by each requirement. Maintained by the analyst
 * alongside the data model; everything else in the matrix is derived from the
 * artefact links already captured on the individual records.
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

function resolveCoverage(link: Omit<TraceabilityLink, "coverage">): TraceabilityLink["coverage"] {
  const hasTests = link.testCaseIds.length > 0;
  const hasRules = link.businessRuleIds.length > 0;
  const hasDesign = link.diagramIds.length > 0 || link.apiIds.length > 0;
  const hasEvidence = link.sqlValidationIds.length > 0 || link.documentIds.length > 0;

  if (!hasTests) return "Gap";
  if (hasRules && hasDesign && hasEvidence) return "Full";
  return "Partial";
}

/** Requirement-anchored traceability chain used by the matrix page. */
export const traceabilityLinks: TraceabilityLink[] = requirements.map((requirement) => {
  const base = {
    requirementId: requirement.id,
    businessRuleIds: requirement.relatedRules,
    diagramIds: diagrams
      .filter((diagram) => diagram.relatedRequirements.includes(requirement.id))
      .map((diagram) => diagram.id),
    apiIds: requirement.relatedApis,
    databaseObjects: databaseObjectsByRequirement[requirement.id] ?? [],
    sqlValidationIds: sqlValidations
      .filter((query) => query.relatedRequirements.includes(requirement.id))
      .map((query) => query.id),
    testCaseIds: requirement.relatedTestCases,
    documentIds: requirement.relatedDocuments,
  };

  return { ...base, coverage: resolveCoverage(base) };
});

export function getTraceabilityLink(requirementId: string): TraceabilityLink | undefined {
  return traceabilityLinks.find((link) => link.requirementId === requirementId);
}

export const traceabilitySummary = {
  total: traceabilityLinks.length,
  full: traceabilityLinks.filter((link) => link.coverage === "Full").length,
  partial: traceabilityLinks.filter((link) => link.coverage === "Partial").length,
  gap: traceabilityLinks.filter((link) => link.coverage === "Gap").length,
};
