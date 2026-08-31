import type { SearchRecord } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { navigationSections } from "@/config/navigation";

/**
 * Flattened index powering the global search palette.
 *
 * Built per project and then concatenated, so a search reaches the whole
 * portfolio: with five projects, indexing only the open one left four fifths of
 * the work unsearchable, and a query typed on the landing page searched
 * whichever project happened to have been open last.
 *
 * Passing the project stamps each record with its code and rewrites the link to
 * carry it, so choosing a result from another project opens that project rather
 * than showing its artefact under the current one.
 */
export function buildSearchIndex(
  bundle: ProjectDataBundle,
  project?: { code: string; shortName: string },
): SearchRecord[] {
  const records: SearchRecord[] = [
    ...bundle.requirements.map<SearchRecord>((requirement) => ({
      id: requirement.id,
      type: "Requirement",
      title: `${requirement.id} — ${requirement.title}`,
      subtitle: `${requirement.category} · ${requirement.priority} · ${requirement.status}`,
      keywords: `${requirement.businessNeed} ${requirement.description} ${requirement.owner}`,
      href: `/requirements?highlight=${requirement.id}`,
    })),
    /*
     * Acceptance criteria are indexed in their own right, not folded into the
     * requirement that owns them.
     *
     * They are the most exacting thing in the workspace — a hundred and three
     * Given/When/Then statements — and none of them could be found: they live
     * inside a requirement, so searching "AC-006", "risk manager permission" or
     * the wording of a condition returned nothing at all. The result carries
     * the parent requirement so a criterion is never read out of context, and
     * the link opens that requirement.
     */
    ...bundle.requirements.flatMap<SearchRecord>((requirement) =>
      requirement.acceptanceCriteria.map((criterion) => ({
        id: criterion.id,
        type: "Acceptance Criterion" as const,
        title: `${criterion.id} — ${criterion.then}`,
        subtitle: `${requirement.id} ${requirement.title}`,
        keywords: `${criterion.given} ${criterion.when} ${criterion.then} ${requirement.title} ${requirement.category}`,
        href: `/requirements?highlight=${requirement.id}`,
      })),
    ),
    ...bundle.businessRules.map<SearchRecord>((rule) => ({
      id: rule.id,
      type: "Business Rule",
      title: `${rule.id} — ${rule.description}`,
      subtitle: `${rule.category} · ${rule.priority} · ${rule.source}`,
      keywords: `${rule.logic} ${rule.owner} ${rule.impactedRequirements.join(" ")}`,
      href: `/business-rules?highlight=${rule.id}`,
    })),
    ...bundle.actors.map<SearchRecord>((actor) => ({
      id: actor.id,
      type: "Actor",
      title: `${actor.id} — ${actor.name}`,
      subtitle: `${actor.type} · ${actor.channel}`,
      keywords: `${actor.description} ${actor.responsibilities.join(" ")} ${actor.systemsUsed.join(" ")}`,
      href: `/actors?highlight=${actor.id}`,
    })),
    /*
     * The functional specification, which the index did not reach at all.
     *
     * A section's validations, error codes and field names are folded into its
     * keywords rather than indexed apart: an error code is looked up to find
     * the rule that raises it, so it should return the section, not a bare
     * code with nowhere to go.
     */
    ...bundle.functionalSpecSections.map<SearchRecord>((section) => ({
      id: section.id,
      type: "Spec Section",
      title: `${section.id} — ${section.title}`,
      subtitle: section.summary,
      keywords: [
        section.businessLogic.join(" "),
        section.requirementRefs.join(" "),
        section.validations.map((rule) => `${rule.field} ${rule.rule} ${rule.errorCode}`).join(" "),
        section.errors.map((error) => `${error.code} ${error.message} ${error.handling}`).join(" "),
        section.fields.map((field) => `${field.name} ${field.description}`).join(" "),
      ].join(" "),
      href: `/functional-specification?highlight=${section.id}`,
    })),
    /*
     * Edge cases, which is where an analyst's thinking actually shows: the
     * awkward path nobody asked about. Twenty-three of them were reachable
     * only by opening the section that happened to hold them, so "EC-004"
     * found nothing anywhere in the workspace.
     */
    ...bundle.functionalSpecSections.flatMap<SearchRecord>((section) =>
      section.edgeCases.map((edgeCase) => ({
        id: edgeCase.id,
        type: "Edge Case" as const,
        title: `${edgeCase.id} — ${edgeCase.scenario}`,
        subtitle: `${section.id} ${section.title}`,
        keywords: `${edgeCase.expectedBehaviour} ${section.title}`,
        // The criterion itself, not the section holding it: landing on a page
        // of six collapsed sections and hunting for EC-004 is not finding it.
        href: `/functional-specification?highlight=${edgeCase.id}`,
      })),
    ),
    ...bundle.processFlows.map<SearchRecord>((flow) => ({
      id: flow.id,
      type: "Process Flow",
      title: `${flow.id} — ${flow.name}`,
      subtitle: `${flow.trigger} → ${flow.outcome}`,
      keywords: `${flow.description} ${flow.slaTarget} ${flow.steps.map((step) => `${step.name} ${step.description}`).join(" ")} ${flow.lanes.map((lane) => lane.name).join(" ")}`,
      href: `/process-flow?highlight=${flow.id}`,
    })),
    ...bundle.bpmnModels.map<SearchRecord>((model) => ({
      id: model.id,
      type: "BPMN Model",
      title: `${model.id} — ${model.title}`,
      subtitle: `${model.notation} · ${model.version}`,
      keywords: `${model.description} ${model.author} ${model.processFlowId}`,
      href: `/bpmn?highlight=${model.id}`,
    })),
    ...bundle.wireframes.map<SearchRecord>((wireframe) => ({
      id: wireframe.id,
      type: "Wireframe",
      title: `${wireframe.id} — ${wireframe.title}`,
      subtitle: `${wireframe.channel} · ${wireframe.screenId} · ${wireframe.status}`,
      keywords: `${wireframe.description} ${wireframe.annotations.join(" ")} ${wireframe.relatedRequirements.join(" ")}`,
      href: `/wireframes?highlight=${wireframe.id}`,
    })),
    /*
     * The service, not only its endpoints. "SVC-1" and "Declaration API" found
     * nothing while every operation inside them was indexed.
     */
    ...bundle.apiServices.map<SearchRecord>((service) => ({
      id: service.id,
      type: "API Service",
      title: `${service.id} — ${service.name}`,
      subtitle: `${service.basePath} · v${service.version} · ${service.status}`,
      keywords: `${service.description} ${service.owner} ${service.endpoints.map((endpoint) => endpoint.path).join(" ")}`,
      href: `/swagger-api?highlight=${service.id}`,
    })),
    /*
     * Tables are named, not numbered, so the name is the identifier: someone
     * looking for where a column lives searches "DECLARATION" or the column.
     */
    ...bundle.sqlTables.map<SearchRecord>((table) => ({
      id: table.name,
      type: "Data Table",
      title: `${table.schema}.${table.name}`,
      subtitle: table.description,
      keywords: table.columns.map((column) => `${column.name} ${column.type}`).join(" "),
      href: `/sql-validation?highlight=${table.name}`,
    })),
    ...bundle.apiServices
      .flatMap((service) => service.endpoints)
      .map<SearchRecord>((endpoint) => ({
        id: endpoint.id,
        type: "API",
        title: `${endpoint.method} ${endpoint.path}`,
        subtitle: `${endpoint.id} · ${endpoint.summary}`,
        keywords: `${endpoint.description} ${endpoint.operationId} ${endpoint.tag}`,
        href: `/swagger-api?highlight=${endpoint.id}`,
      })),
    ...bundle.testCases.map<SearchRecord>((testCase) => ({
      id: testCase.id,
      type: "Test Case",
      title: `${testCase.id} — ${testCase.scenario}`,
      subtitle: `${testCase.suite} · ${testCase.status} · ${testCase.linkedRequirement}`,
      keywords: `${testCase.expectedResult} ${testCase.type} ${testCase.executedBy}`,
      href: `/test-cases?highlight=${testCase.id}`,
    })),
    ...bundle.documents.map<SearchRecord>((document) => ({
      id: document.id,
      type: "Document",
      title: `${document.id} — ${document.name}`,
      subtitle: `${document.format} · v${document.version} · ${document.author}`,
      keywords: `${document.description} ${document.category} ${document.confidentiality}`,
      href: `/documents?highlight=${document.id}`,
    })),
    ...bundle.sqlValidations.map<SearchRecord>((query) => ({
      id: query.id,
      type: "SQL",
      title: `${query.id} — ${query.title}`,
      subtitle: `${query.database} · ${query.status}`,
      keywords: `${query.purpose} ${query.sql} ${query.executedBy}`,
      href: `/sql-validation?highlight=${query.id}`,
    })),
    ...bundle.diagrams.map<SearchRecord>((diagram) => ({
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

  if (!project) return records;

  return records.map((record) => ({
    ...record,
    projectCode: project.code,
    projectName: project.shortName,
    href: record.href + (record.href.includes("?") ? "&" : "?") + "project=" + project.code,
  }));
}

/**
 * Relevance search over the whole portfolio.
 *
 * Every word of the query has to appear somewhere in the record, in any order —
 * the previous rule needed the query to be one contiguous run of characters, so
 * "exposure breach" found a requirement that "breach exposure" did not. Nobody
 * types the words in the order the title happens to use them.
 */
export function searchWorkspace(
  index: SearchRecord[],
  query: string,
  limit = 40,
  /** Results from the project being read come first. */
  currentProject?: string,
): SearchRecord[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  return index
    .map((record) => {
      const id = record.id.toLowerCase();
      const title = record.title.toLowerCase();
      const subtitle = record.subtitle.toLowerCase();
      const keywords = record.keywords.toLowerCase();

      let score = 0;
      for (const word of words) {
        // An id typed in full is the strongest signal there is.
        if (id === word) score += 100;
        else if (id.startsWith(word)) score += 60;
        else if (title.includes(word)) score += 30;
        else if (subtitle.includes(word)) score += 15;
        else if (keywords.includes(word)) score += 8;
        // A word that appears nowhere disqualifies the record: a search for two
        // words means both, not either.
        else return { record, score: 0 };
      }

      // Whole query as one phrase, and the project in hand, both rank higher.
      if (title.includes(query.trim().toLowerCase())) score += 25;
      if (currentProject && record.projectCode === currentProject) score += 20;

      return { record, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.record);
}
