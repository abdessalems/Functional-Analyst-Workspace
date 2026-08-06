import type { SearchRecord } from "@/lib/types";

import { actors } from "@/data/actors";
import { apiEndpoints } from "@/data/api";
import { businessRules } from "@/data/business-rules";
import { diagrams } from "@/data/diagrams";
import { documents } from "@/data/documents";
import { requirements } from "@/data/requirements";
import { sqlValidations } from "@/data/sql";
import { testCases } from "@/data/test-cases";
import { navigationSections } from "@/config/navigation";

/**
 * Flattened index powering the global search palette. Built once from the mock
 * data modules so a record can never drift from the artefact it points at.
 */
export const searchIndex: SearchRecord[] = [
  ...requirements.map<SearchRecord>((requirement) => ({
    id: requirement.id,
    type: "Requirement",
    title: `${requirement.id} — ${requirement.title}`,
    subtitle: `${requirement.category} · ${requirement.priority} · ${requirement.status}`,
    keywords: `${requirement.businessNeed} ${requirement.description} ${requirement.owner}`,
    href: `/requirements?highlight=${requirement.id}`,
  })),
  ...businessRules.map<SearchRecord>((rule) => ({
    id: rule.id,
    type: "Business Rule",
    title: `${rule.id} — ${rule.description}`,
    subtitle: `${rule.category} · ${rule.priority} · ${rule.source}`,
    keywords: `${rule.logic} ${rule.owner} ${rule.impactedRequirements.join(" ")}`,
    href: `/business-rules?highlight=${rule.id}`,
  })),
  ...actors.map<SearchRecord>((actor) => ({
    id: actor.id,
    type: "Actor",
    title: `${actor.id} — ${actor.name}`,
    subtitle: `${actor.type} · ${actor.channel}`,
    keywords: `${actor.description} ${actor.responsibilities.join(" ")} ${actor.systemsUsed.join(" ")}`,
    href: `/actors?highlight=${actor.id}`,
  })),
  ...apiEndpoints.map<SearchRecord>((endpoint) => ({
    id: endpoint.id,
    type: "API",
    title: `${endpoint.method} ${endpoint.path}`,
    subtitle: `${endpoint.id} · ${endpoint.summary}`,
    keywords: `${endpoint.description} ${endpoint.operationId} ${endpoint.tag}`,
    href: `/swagger-api?highlight=${endpoint.id}`,
  })),
  ...testCases.map<SearchRecord>((testCase) => ({
    id: testCase.id,
    type: "Test Case",
    title: `${testCase.id} — ${testCase.scenario}`,
    subtitle: `${testCase.suite} · ${testCase.status} · ${testCase.linkedRequirement}`,
    keywords: `${testCase.expectedResult} ${testCase.type} ${testCase.executedBy}`,
    href: `/test-cases?highlight=${testCase.id}`,
  })),
  ...documents.map<SearchRecord>((document) => ({
    id: document.id,
    type: "Document",
    title: `${document.id} — ${document.name}`,
    subtitle: `${document.format} · v${document.version} · ${document.author}`,
    keywords: `${document.description} ${document.category} ${document.confidentiality}`,
    href: `/documents?highlight=${document.id}`,
  })),
  ...sqlValidations.map<SearchRecord>((query) => ({
    id: query.id,
    type: "SQL",
    title: `${query.id} — ${query.title}`,
    subtitle: `${query.database} · ${query.status}`,
    keywords: `${query.purpose} ${query.sql} ${query.executedBy}`,
    href: `/sql-validation?highlight=${query.id}`,
  })),
  ...diagrams.map<SearchRecord>((diagram) => ({
    id: diagram.id,
    type: "Diagram",
    title: `${diagram.id} — ${diagram.title}`,
    subtitle: `${diagram.type} · v${diagram.version} · ${diagram.author}`,
    keywords: `${diagram.description} ${diagram.source}`,
    href: `/plantuml?highlight=${diagram.id}`,
  })),
  ...navigationSections
    .flatMap((section) => section.items)
    .map<SearchRecord>((item) => ({
      id: `PAGE-${item.href}`,
      type: "Page",
      title: item.label,
      subtitle: item.description,
      keywords: item.description,
      href: item.href,
    })),
];

/** Simple relevance search: exact id first, then title, then keyword body. */
export function searchWorkspace(query: string, limit = 40): SearchRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = searchIndex
    .map((record) => {
      const id = record.id.toLowerCase();
      const title = record.title.toLowerCase();
      let score = 0;

      if (id === q) score = 100;
      else if (id.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else if (record.subtitle.toLowerCase().includes(q)) score = 40;
      else if (record.keywords.toLowerCase().includes(q)) score = 20;

      return { record, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.record);
}
