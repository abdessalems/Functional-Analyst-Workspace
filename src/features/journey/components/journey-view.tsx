"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  ClipboardCheck,
  Database,
  FileCode2,
  FileText,
  GitBranch,
  ListChecks,
  Network,
  ScrollText,
  ShieldCheck,
  Table2,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavCountKey } from "@/config/navigation";
import { useProjectCounts } from "@/hooks/use-project-data";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

interface Deliverable {
  label: string;
  href: string;
  icon: LucideIcon;
  countKey?: NavCountKey;
  produced: string;
}

interface Phase {
  step: number;
  title: string;
  question: string;
  deliverables: Deliverable[];
}

/**
 * The analysis lifecycle, in the order the work actually happens. This is the
 * page a project opens on: it explains what was produced at each stage and
 * links straight to the artefact, so a reader can follow the whole story
 * without knowing the navigation.
 */
const PHASES: Phase[] = [
  {
    step: 1,
    title: "Understand the business",
    question: "What problem are we solving, for whom, and what does success look like?",
    deliverables: [
      {
        label: "Project Overview",
        href: "/overview",
        icon: BookOpen,
        produced: "Objective, scope in and out, stakeholders with RACI, timeline, dependencies and risks",
      },
      {
        label: "Business Requirements",
        href: "/requirements",
        countKey: "requirements",
        icon: ListChecks,
        produced: "Each requirement states the business need and its Given/When/Then acceptance criteria",
      },
    ],
  },
  {
    step: 2,
    title: "Capture the rules and the people",
    question: "What decisions must the system take, and who takes part?",
    deliverables: [
      {
        label: "Business Rules",
        href: "/business-rules",
        countKey: "businessRules",
        icon: ShieldCheck,
        produced: "Rule logic with its source of authority — scheme rulebook, regulation or internal policy",
      },
      {
        label: "Actors",
        href: "/actors",
        countKey: "actors",
        icon: Users,
        produced: "Human, system and external actors with their responsibilities and permissions",
      },
    ],
  },
  {
    step: 3,
    title: "Specify the behaviour",
    question: "Exactly how must it work, field by field, error by error?",
    deliverables: [
      {
        label: "Functional Specification",
        href: "/functional-specification",
        countKey: "functionalSpecSections",
        icon: ScrollText,
        produced: "Business logic, validation rules, error catalogue, field definitions and edge cases",
      },
    ],
  },
  {
    step: 4,
    title: "Model the process",
    question: "What is the end-to-end flow, and who does what at each step?",
    deliverables: [
      {
        label: "Process Flow",
        href: "/process-flow",
        countKey: "processFlows",
        icon: Workflow,
        produced: "Swimlane decomposition of the process, each step linked to the rules that govern it",
      },
      {
        label: "BPMN Model",
        href: "/bpmn",
        countKey: "bpmnModels",
        icon: Network,
        produced: "Swimlane process model with gateways, exception paths and the rules at each step",
      },
      {
        label: "UML Models",
        href: "/plantuml",
        countKey: "diagrams",
        icon: GitBranch,
        produced: "Use case, sequence, component, activity and state models kept as PlantUML source",
      },
    ],
  },
  {
    step: 5,
    title: "Design the experience",
    question: "What does the user actually see and do?",
    deliverables: [
      {
        label: "Wireframes",
        href: "/wireframes",
        countKey: "wireframes",
        icon: Boxes,
        produced: "Annotated screens for the customer journey and the back-office console",
      },
    ],
  },
  {
    step: 6,
    title: "Specify interfaces and data",
    question: "What contract do the systems agree on, and where does the data live?",
    deliverables: [
      {
        label: "API Contract",
        href: "/swagger-api",
        countKey: "apis",
        icon: FileCode2,
        produced: "Request, response, headers and status codes per operation, exportable as OpenAPI",
      },
      {
        label: "SQL Validation",
        href: "/sql-validation",
        countKey: "sqlValidations",
        icon: Database,
        produced: "Queries that prove the rules hold in the database, with results and conclusions",
      },
    ],
  },
  {
    step: 7,
    title: "Prove it works",
    question: "How do we evidence that what was asked for was actually delivered?",
    deliverables: [
      {
        label: "Test Cases",
        href: "/test-cases",
        countKey: "testCases",
        icon: ClipboardCheck,
        produced: "Preconditions, steps, expected results and execution status, each linked to a requirement",
      },
      {
        label: "Documents",
        href: "/documents",
        countKey: "documents",
        icon: FileText,
        produced: "Controlled register with versions, owners and classification",
      },
      {
        label: "Traceability Matrix",
        href: "/traceability",
        icon: Table2,
        produced: "Requirement → rule → model → API → database → SQL → test → document, end to end",
      },
    ],
  },
];

export function JourneyView() {
  const { project } = useWorkspace();
  const counts = useProjectCounts();

  // Every stage of the lifecycle is shown for every project. A stage the
  // project has not reached yet is marked rather than hidden — the process is
  // the story, and the gaps are part of it.
  const phases = PHASES;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis Process"
        description={`How ${project.shortName} was analysed, in the order the work happened. Every stage links to the artefact produced at that point.`}
        meta={[
          { label: "Project", value: project.name },
          { label: "Version", value: project.version },
          { label: "Analyst", value: project.owner.name },
        ]}
      />

      <Card className="border-primary/25 bg-primary/[0.04] p-5">
        <p className="text-[13px] leading-relaxed">
          <span className="font-semibold">Start here.</span> Follow the seven stages below to see the
          full lifecycle of this project, from the first conversation with the business to the
          evidence that the delivered system does what was agreed. Each card opens the real artefact
          — not a description of it.
        </p>
      </Card>

      <ol className="space-y-4">
        {phases.map((phase, index) => (
          <li key={phase.step} className="relative flex gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-primary/40 bg-surface text-sm font-semibold text-primary">
                {phase.step}
              </span>
              {index < phases.length - 1 && (
                <span aria-hidden className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3 pb-4">
              <div className="space-y-1">
                <h2 className="text-[15px] font-semibold tracking-tight">{phase.title}</h2>
                <p className="text-[13px] italic leading-relaxed text-muted-foreground">
                  {phase.question}
                </p>
              </div>

              <div
                className={cn(
                  "grid gap-3",
                  phase.deliverables.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "",
                )}
              >
                {phase.deliverables.map((deliverable) => {
                  const Icon = deliverable.icon;
                  return (
                    <Link
                      key={deliverable.href}
                      href={deliverable.href}
                      className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Card className="flex h-full flex-col gap-2 p-4 transition-shadow hover:border-primary/40 hover:shadow-raised">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                            {deliverable.label}
                          </span>
                          {deliverable.countKey &&
                            (counts[deliverable.countKey] > 0 ? (
                              <Badge variant="neutral">{counts[deliverable.countKey]}</Badge>
                            ) : (
                              <Badge variant="outline" className="font-normal">
                                Not yet
                              </Badge>
                            ))}
                        </div>
                        <p className="flex-1 text-[13px] leading-relaxed text-muted-foreground">
                          {deliverable.produced}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Open <ArrowRight className="size-3" />
                        </span>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          The traceability matrix is the page that ties all seven stages together — it shows every
          requirement and the complete chain of artefacts that implement and evidence it.
        </p>
        <Button size="sm" asChild>
          <Link href="/traceability">
            Open the traceability matrix <ArrowRight />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
