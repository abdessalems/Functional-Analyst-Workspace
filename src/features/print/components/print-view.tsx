"use client";

import * as React from "react";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

import { useProjectData, useTraceability } from "@/hooks/use-project-data";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

/**
 * The whole project as one document, for printing or saving as PDF.
 *
 * A workspace is read by clicking; a specification is read in order. This page
 * is the second reading: every artefact laid out end to end, with the chrome
 * removed, so it can be sent to someone who will never open the site.
 *
 * Nothing here is a separate copy of the data — it reads the same bundle as
 * every other page, so a document printed today matches the workspace today.
 */
export function PrintView() {
  const { project } = useWorkspace();
  const bundle = useProjectData();
  const { links, summary } = useTraceability();

  const generated = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl space-y-8 print:max-w-none print:space-y-6">
      {/* Screen-only controls; the printed page starts at the title. */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href="/overview">
            <ArrowLeft /> Back to the workspace
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer /> Print or save as PDF
        </Button>
      </div>

      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {project.code} · {project.domain} · {project.subDomain}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
        <dl className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          <Pair label="Analyst" value={project.owner.name} />
          <Pair label="Version" value={project.version} />
          <Pair label="Status" value={project.status} />
          <Pair label="Document generated" value={generated} />
        </dl>
      </header>

      <Section title="1 · Business requirements" count={bundle.requirements.length}>
        {bundle.requirements.map((requirement) => (
          <article key={requirement.id} className="space-y-2 break-inside-avoid">
            <h3 className="text-sm font-semibold">
              <span className="font-mono text-muted-foreground">{requirement.id}</span>{" "}
              {requirement.title}
            </h3>
            <p className="text-sm leading-relaxed">{requirement.description}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">Why:</strong> {requirement.businessNeed}
            </p>
            <p className="text-xs text-muted-foreground">
              {requirement.priority} · {requirement.moscow} · {requirement.status} ·{" "}
              {requirement.category} · v{requirement.version} ·{" "}
              {formatDate(requirement.lastUpdated)}
            </p>

            {requirement.acceptanceCriteria.length > 0 && (
              <ul className="space-y-1 border-l-2 border-border pl-4 text-sm">
                {requirement.acceptanceCriteria.map((criterion) => (
                  <li key={criterion.id}>
                    <span className="font-mono text-xs text-muted-foreground">{criterion.id}</span>{" "}
                    <strong className="font-medium">Given</strong> {criterion.given},{" "}
                    <strong className="font-medium">when</strong> {criterion.when},{" "}
                    <strong className="font-medium">then</strong> {criterion.then}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </Section>

      <Section title="2 · Business rules" count={bundle.businessRules.length}>
        {bundle.businessRules.map((rule) => (
          <article key={rule.id} className="space-y-1 break-inside-avoid">
            <h3 className="text-sm font-semibold">
              <span className="font-mono text-muted-foreground">{rule.id}</span> {rule.description}
            </h3>
            <pre className="overflow-x-auto rounded bg-surface-muted p-2 font-mono text-xs">
              {rule.logic}
            </pre>
            <p className="text-xs text-muted-foreground">
              {rule.priority} · {rule.status} · source: {rule.source} · affects{" "}
              {rule.impactedRequirements.join(", ") || "—"}
            </p>
          </article>
        ))}
      </Section>

      <Section title="3 · Actors" count={bundle.actors.length}>
        {bundle.actors.map((actor) => (
          <article key={actor.id} className="space-y-1 break-inside-avoid">
            <h3 className="text-sm font-semibold">
              <span className="font-mono text-muted-foreground">{actor.id}</span> {actor.name}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {actor.type} · {actor.channel}
              </span>
            </h3>
            <p className="text-sm leading-relaxed">{actor.description}</p>
            {actor.responsibilities.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Responsible for: {actor.responsibilities.join("; ")}
              </p>
            )}
          </article>
        ))}
      </Section>

      <Section title="4 · Functional specification" count={bundle.functionalSpecSections.length}>
        {bundle.functionalSpecSections.map((section) => (
          <article key={section.id} className="space-y-3">
            <h3 className="text-sm font-semibold">
              <span className="font-mono text-muted-foreground">{section.id}</span> {section.title}
            </h3>
            <p className="text-sm leading-relaxed">{section.summary}</p>

            {section.businessLogic.length > 0 && (
              <ol className="list-decimal space-y-0.5 pl-5 text-sm">
                {section.businessLogic.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            )}

            {section.fields.length > 0 && (
              <PrintTable
                caption="Fields"
                head={["Name", "Type", "Length", "Mandatory", "Description"]}
                rows={section.fields.map((field) => [
                  field.name,
                  field.type,
                  field.length,
                  field.mandatory ? "Yes" : "No",
                  field.description,
                ])}
              />
            )}

            {section.validations.length > 0 && (
              <PrintTable
                caption="Validations"
                head={["Field", "Rule", "Error", "Severity"]}
                rows={section.validations.map((rule) => [
                  rule.field,
                  rule.rule,
                  rule.errorCode,
                  rule.severity,
                ])}
              />
            )}

            {section.errors.length > 0 && (
              <PrintTable
                caption="Errors"
                head={["Code", "HTTP", "Message", "Handling"]}
                rows={section.errors.map((error) => [
                  error.code,
                  String(error.httpStatus),
                  error.message,
                  error.handling,
                ])}
              />
            )}

            {section.edgeCases.length > 0 && (
              <PrintTable
                caption="Edge cases"
                head={["Scenario", "Expected behaviour"]}
                rows={section.edgeCases.map((edge) => [edge.scenario, edge.expectedBehaviour])}
              />
            )}
          </article>
        ))}
      </Section>

      <Section
        title="5 · Interfaces"
        count={bundle.apiServices.reduce((sum, service) => sum + service.endpoints.length, 0)}
      >
        {bundle.apiServices.map((service) => (
          <div key={service.id} className="space-y-2">
            <h3 className="text-sm font-semibold">
              {service.name}{" "}
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {service.basePath}
              </span>
            </h3>
            <PrintTable
              head={["Method", "Path", "Summary", "Covers"]}
              rows={service.endpoints.map((endpoint) => [
                endpoint.method,
                endpoint.path,
                endpoint.summary,
                endpoint.relatedRequirements.join(", ") || "—",
              ])}
            />
          </div>
        ))}
      </Section>

      <Section title="6 · Test cases" count={bundle.testCases.length}>
        <PrintTable
          head={["Id", "Scenario", "Type", "Status", "Covers"]}
          rows={bundle.testCases.map((testCase) => [
            testCase.id,
            testCase.scenario,
            testCase.type,
            testCase.defect ? `${testCase.status} (${testCase.defect})` : testCase.status,
            testCase.linkedRequirement || "—",
          ])}
        />
      </Section>

      <Section title="7 · Traceability" count={links.length}>
        <p className="text-sm text-muted-foreground">
          {summary.full} fully covered · {summary.partial} partial · {summary.gap} with gaps.
        </p>
        <PrintTable
          head={["Requirement", "Rules", "Models", "Interfaces", "Evidence", "Tests", "Coverage"]}
          rows={links.map((link) => [
            link.requirementId,
            link.businessRuleIds.join(", ") || "—",
            link.diagramIds.join(", ") || "—",
            link.apiIds.join(", ") || "—",
            [...link.sqlValidationIds, ...link.documentIds].join(", ") || "—",
            link.testCaseIds.join(", ") || "—",
            link.coverage,
          ])}
        />
      </Section>

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
        {project.name} · {project.code} v{project.version} · prepared by {project.owner.name} ·
        generated {generated}
      </footer>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  // A section with nothing in it is left out rather than printed empty — a
  // heading over a blank space reads as something missing from the document.
  if (count === 0) return null;

  return (
    <section className="space-y-4 break-before-auto">
      <h2 className="border-b border-border pb-1 text-base font-semibold tracking-tight">
        {title}
        <span className="ml-2 text-xs font-normal text-muted-foreground">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function PrintTable({
  caption,
  head,
  rows,
}: {
  caption?: string;
  head: string[];
  rows: string[][];
}) {
  return (
    <div className="space-y-1">
      {caption && <p className="text-xs font-medium uppercase tracking-wide">{caption}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              {head.map((cell) => (
                <th key={cell} className="py-1.5 pr-3 font-medium">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="break-inside-avoid border-b border-border/60 align-top">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-1.5 pr-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
