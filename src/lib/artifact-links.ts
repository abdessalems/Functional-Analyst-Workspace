import type { ProjectDataBundle } from "@/data/workspaces/types";

export interface ResolvedArtifact {
  id: string;
  label: string;
  href: string;
  kind: string;
}

/**
 * Resolves a business key (FR-1, BR-005, TC-012 …) to a label and a deep link.
 *
 * Resolution is scoped to the open project on purpose: two projects may both
 * number their rules BR-001, and a reference always means the one in the
 * project you are reading.
 */
export function resolveArtifact(
  id: string,
  bundle: ProjectDataBundle,
): ResolvedArtifact | undefined {
  const prefix = id.split("-")[0];

  switch (prefix) {
    case "REQ":
    case "FR": {
      const record = bundle.requirements.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/requirements?highlight=${id}`, kind: "Requirement" }
        : undefined;
    }
    case "BR": {
      const record = bundle.businessRules.find((item) => item.id === id);
      return record
        ? {
            id,
            label: record.description,
            href: `/business-rules?highlight=${id}`,
            kind: "Business Rule",
          }
        : undefined;
    }
    case "API": {
      const record = bundle.apiServices
        .flatMap((service) => service.endpoints)
        .find((item) => item.id === id);
      return record
        ? { id, label: `${record.method} ${record.path}`, href: `/swagger-api?highlight=${id}`, kind: "API" }
        : undefined;
    }
    case "TC": {
      const record = bundle.testCases.find((item) => item.id === id);
      return record
        ? { id, label: record.scenario, href: `/test-cases?highlight=${id}`, kind: "Test Case" }
        : undefined;
    }
    case "DOC": {
      const record = bundle.documents.find((item) => item.id === id);
      return record
        ? { id, label: record.name, href: `/documents?highlight=${id}`, kind: "Document" }
        : undefined;
    }
    case "UML": {
      const record = bundle.diagrams.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/plantuml?highlight=${id}`, kind: "Diagram" }
        : undefined;
    }
    case "WF": {
      const record = bundle.wireframes.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/wireframes?highlight=${id}`, kind: "Wireframe" }
        : undefined;
    }
    case "SQL": {
      const record = bundle.sqlValidations.find((item) => item.id === id);
      return record
        ? { id, label: record.title, href: `/sql-validation?highlight=${id}`, kind: "SQL Validation" }
        : undefined;
    }
    case "ACT": {
      const record = bundle.actors.find((item) => item.id === id);
      return record
        ? { id, label: record.name, href: `/actors?highlight=${id}`, kind: "Actor" }
        : undefined;
    }
    case "FS": {
      const record = bundle.functionalSpecSections.find((item) => item.id === id);
      return record
        ? {
            id,
            label: record.title,
            href: `/functional-specification#${id}`,
            kind: "Specification",
          }
        : undefined;
    }
    default:
      return undefined;
  }
}
