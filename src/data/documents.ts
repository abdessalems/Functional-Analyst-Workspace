import type { WorkspaceDocument } from "@/lib/types";

/** Document register for IPH release 2.3 (7 controlled documents). */
export const documents: WorkspaceDocument[] = [
  {
    id: "DOC-001",
    name: "IPH — Business Requirements Document v2.3",
    format: "PDF",
    description:
      "Baselined business requirements covering payment initiation, verification, limits and servicing, signed off by Payments Operations and Compliance.",
    category: "Requirements",
    version: "2.3",
    author: "Amelia Fontaine",
    lastUpdated: "2025-05-16",
    size: "3.8 MB",
    pages: 96,
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["REQ-001", "REQ-002", "REQ-009", "REQ-010", "REQ-011", "REQ-015", "REQ-016"],
  },
  {
    id: "DOC-002",
    name: "IPH — Functional Specification v2.3",
    format: "Word",
    description:
      "Detailed functional design: orchestration sequence, field definitions, validation rules, error catalogue and edge case handling.",
    category: "Specification",
    version: "2.3",
    author: "Amelia Fontaine",
    lastUpdated: "2025-05-14",
    size: "5.2 MB",
    pages: 148,
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["REQ-001", "REQ-005", "REQ-006", "REQ-007", "REQ-008", "REQ-012", "REQ-013"],
  },
  {
    id: "DOC-003",
    name: "Financial Crime Control Design — Instant Payments",
    format: "PDF",
    description:
      "Design of the in-path fraud and sanctions controls, decision thresholds, tip-off constraints and degraded-mode behaviour.",
    category: "Compliance",
    version: "1.6",
    author: "Tobias Lindqvist",
    lastUpdated: "2025-05-02",
    size: "2.1 MB",
    pages: 54,
    status: "Approved",
    confidentiality: "Restricted",
    relatedRequirements: ["REQ-002", "REQ-003", "REQ-004", "REQ-017", "REQ-018"],
  },
  {
    id: "DOC-004",
    name: "TIPS Integration & Message Mapping",
    format: "Excel",
    description:
      "Field-level mapping between the internal payment model and pacs.008, pacs.002, camt.056, camt.029 and camt.053, including reason code translation.",
    category: "Integration",
    version: "2.3",
    author: "Priya Raghunathan",
    lastUpdated: "2025-03-14",
    size: "1.4 MB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["REQ-005", "REQ-006", "REQ-008", "REQ-019", "REQ-020", "REQ-022"],
  },
  {
    id: "DOC-005",
    name: "Instant Payments API — OpenAPI 3.0 Specification",
    format: "Swagger",
    description:
      "Machine-readable contract for the payment initiation, status and recall operations published to the internal developer portal.",
    category: "Interface",
    version: "2.3.0",
    author: "Priya Raghunathan",
    lastUpdated: "2025-05-11",
    size: "412 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["REQ-001", "REQ-003", "REQ-012", "REQ-013", "REQ-014", "REQ-017", "REQ-021"],
  },
  {
    id: "DOC-006",
    name: "Outbound Instant Payment — BPMN 2.0 Model",
    format: "BPMN",
    description:
      "Executable collaboration model of the outbound payment process including compensating release and exception paths.",
    category: "Process",
    version: "2.3",
    author: "Amelia Fontaine",
    lastUpdated: "2025-05-14",
    size: "186 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["REQ-010", "REQ-015", "REQ-023", "REQ-024"],
  },
  {
    id: "DOC-007",
    name: "UAT Evidence Pack & Traceability Report",
    format: "Excel",
    description:
      "Consolidated test evidence: execution results for all 39 cases, SQL validation output, defect log and the requirement-to-test coverage matrix.",
    category: "Quality",
    version: "1.0",
    author: "Sofia Marchetti",
    lastUpdated: "2025-05-16",
    size: "6.7 MB",
    status: "Approved",
    confidentiality: "Confidential",
    relatedRequirements: ["REQ-020", "REQ-021", "REQ-022"],
  },
];

export function getDocumentById(id: string): WorkspaceDocument | undefined {
  return documents.find((document) => document.id === id);
}
