import { actors } from "@/data/actors";
import { apiEndpoints } from "@/data/api";
import { businessRules } from "@/data/business-rules";
import { diagrams, wireframes } from "@/data/diagrams";
import { documents } from "@/data/documents";
import { requirements } from "@/data/requirements";
import { sqlValidations } from "@/data/sql";
import { testCases } from "@/data/test-cases";

export interface ResolvedArtifact {
  id: string;
  label: string;
  href: string;
  kind: string;
}

/**
 * Resolves a business key (REQ-001, BR-004, TC-012 …) to a label and a deep
 * link. Keeping this in one place is what makes every cross-reference in the
 * workspace — cards, tables and the traceability matrix — clickable.
 */
export function resolveArtifact(id: string): ResolvedArtifact | undefined {
  const prefix = id.split("-")[0];

  switch (prefix) {
    case "REQ": {
      const record = requirements.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/requirements?highlight=${id}`, kind: "Requirement" }
        : undefined;
    }
    case "BR": {
      const record = businessRules.find((item) => item.id === id);
      return record
        ? { id, label: record.description, href: `/business-rules?highlight=${id}`, kind: "Business Rule" }
        : undefined;
    }
    case "API": {
      const record = apiEndpoints.find((item) => item.id === id);
      return record
        ? {
            id,
            label: `${record.method} ${record.path}`,
            href: `/swagger-api?highlight=${id}`,
            kind: "API",
          }
        : undefined;
    }
    case "TC": {
      const record = testCases.find((item) => item.id === id);
      return record
        ? { id, label: record.scenario, href: `/test-cases?highlight=${id}`, kind: "Test Case" }
        : undefined;
    }
    case "DOC": {
      const record = documents.find((item) => item.id === id);
      return record
        ? { id, label: record.name, href: `/documents?highlight=${id}`, kind: "Document" }
        : undefined;
    }
    case "UML": {
      const record = diagrams.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/plantuml?highlight=${id}`, kind: "Diagram" }
        : undefined;
    }
    case "WF": {
      const record = wireframes.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/wireframes?highlight=${id}`, kind: "Wireframe" }
        : undefined;
    }
    case "SQL": {
      const record = sqlValidations.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/sql-validation?highlight=${id}`, kind: "SQL Validation" }
        : undefined;
    }
    case "ACT": {
      const record = actors.find((item) => item.id === id);
      return record
        ? { id, label: record.name, href: `/actors?highlight=${id}`, kind: "Actor" }
        : undefined;
    }
    case "FS": {
      return { id, label: id, href: `/functional-specification#${id}`, kind: "Specification" };
    }
    default:
      return undefined;
  }
}
