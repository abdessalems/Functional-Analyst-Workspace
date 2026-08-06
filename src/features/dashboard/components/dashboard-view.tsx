"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Boxes,
  ClipboardCheck,
  Database,
  FileCode2,
  FileText,
  Landmark,
  ListChecks,
  ShieldCheck,
  Tag,
  TriangleAlert,
  Users,
} from "lucide-react";

import { formatDate } from "@/lib/utils";
import { activityFeed } from "@/data/activity";
import { businessRules } from "@/data/business-rules";
import { requirements } from "@/data/requirements";
import { sqlValidations } from "@/data/sql";
import { testCases } from "@/data/test-cases";
import { traceabilitySummary } from "@/data/traceability";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Timeline } from "@/components/common/timeline";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { DistributionList } from "@/features/dashboard/components/distribution-list";
import { ProjectSummaryCard } from "@/features/dashboard/components/project-summary-card";

export function DashboardView() {
  const { project, hasArtifacts } = useWorkspace();

  const requirementRows = React.useMemo(
    () => [
      {
        label: "Implemented",
        count: requirements.filter((item) => item.status === "Implemented").length,
        tone: "success" as const,
      },
      {
        label: "Approved",
        count: requirements.filter((item) => item.status === "Approved").length,
        tone: "primary" as const,
      },
      {
        label: "In Review",
        count: requirements.filter((item) => item.status === "In Review").length,
        tone: "warning" as const,
      },
      {
        label: "Draft",
        count: requirements.filter((item) => item.status === "Draft").length,
        tone: "neutral" as const,
      },
    ],
    [],
  );

  const testRows = React.useMemo(
    () => [
      {
        label: "Passed",
        count: testCases.filter((item) => item.status === "Passed").length,
        tone: "success" as const,
      },
      {
        label: "Failed",
        count: testCases.filter((item) => item.status === "Failed").length,
        tone: "danger" as const,
      },
      {
        label: "Blocked",
        count: testCases.filter((item) => item.status === "Blocked").length,
        tone: "warning" as const,
      },
      {
        label: "Not Run",
        count: testCases.filter((item) => item.status === "Not Run").length,
        tone: "neutral" as const,
      },
    ],
    [],
  );

  const attention = React.useMemo(
    () => [
      ...testCases
        .filter((item) => item.status === "Failed" || item.status === "Blocked")
        .map((item) => ({
          id: item.id,
          title: `${item.id} — ${item.scenario}`,
          detail: item.defect ? `Defect ${item.defect} · ${item.suite}` : item.suite,
          status: item.status,
          href: `/test-cases?highlight=${item.id}`,
        })),
      ...sqlValidations
        .filter((item) => item.status !== "Validated")
        .map((item) => ({
          id: item.id,
          title: `${item.id} — ${item.title}`,
          detail: `${item.database} · last run ${formatDate(item.lastRun)}`,
          status: item.status,
          href: `/sql-validation?highlight=${item.id}`,
        })),
      ...requirements
        .filter((item) => item.status === "In Review" || item.status === "Draft")
        .map((item) => ({
          id: item.id,
          title: `${item.id} — ${item.title}`,
          detail: `${item.category} · owner ${item.owner}`,
          status: item.status,
          href: `/requirements?highlight=${item.id}`,
        })),
    ],
    [],
  );

  const metrics = project.metrics;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Delivery status, artefact inventory and outstanding analysis items for the project you are working on."
        meta={[
          { label: "Programme", value: project.programme },
          { label: "Business owner", value: project.businessOwner },
          { label: "Last updated", value: formatDate(project.lastUpdated) },
        ]}
        actions={
          <>
            <SecureLinkDialog
              resourceName={`${project.name} — delivery dashboard`}
              resourcePath="/dashboard"
            />
            <Button size="sm" asChild>
              <Link href="/traceability">Open traceability matrix</Link>
            </Button>
          </>
        }
      />

      <ProjectSummaryCard project={project} />

      <section aria-labelledby="project-facts" className="space-y-3">
        <h2 id="project-facts" className="text-sm font-semibold text-muted-foreground">
          Project at a glance
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Status"
            value={<span className="text-lg">{project.status}</span>}
            caption={`Completion ${project.completion}%`}
            icon={BadgeCheck}
            tone={project.status === "Completed" ? "success" : "default"}
          />
          <MetricCard
            label="Domain"
            value={<span className="text-lg">{project.domain}</span>}
            caption={project.subDomain}
            icon={Landmark}
          />
          <MetricCard
            label="Version"
            value={project.version}
            caption={project.release}
            icon={Tag}
          />
          <MetricCard
            label="Traceability coverage"
            value={`${traceabilitySummary.full}/${traceabilitySummary.total}`}
            caption={`${traceabilitySummary.gap} requirements without test coverage`}
            icon={ShieldCheck}
            href="/traceability"
            tone={traceabilitySummary.gap > 0 ? "warning" : "success"}
          />
        </div>
      </section>

      <section aria-labelledby="artefact-inventory" className="space-y-3">
        <h2 id="artefact-inventory" className="text-sm font-semibold text-muted-foreground">
          Artefact inventory
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard
            label="Requirements"
            value={metrics.requirements}
            caption="Baselined at v2.3"
            icon={ListChecks}
            href="/requirements"
          />
          <MetricCard
            label="Business Rules"
            value={metrics.businessRules}
            caption="Decision path catalogue"
            icon={ShieldCheck}
            href="/business-rules"
          />
          <MetricCard
            label="APIs"
            value={metrics.apis}
            caption="Across 2 services"
            icon={FileCode2}
            href="/swagger-api"
          />
          <MetricCard
            label="Documents"
            value={metrics.documents}
            caption="Controlled register"
            icon={FileText}
            href="/documents"
          />
          <MetricCard
            label="Test Cases"
            value={metrics.testCases}
            caption="SIT and UAT catalogue"
            icon={ClipboardCheck}
            href="/test-cases"
          />
          <MetricCard
            label="Actors"
            value={metrics.actors}
            caption={`${metrics.diagrams} UML models`}
            icon={Users}
            href="/actors"
          />
        </div>
      </section>

      {!hasArtifacts && (
        <Card className="border-amber-300/60 bg-amber-50/60 p-4 text-[13px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Counts above come from the project register. Detailed documentation for {project.code} is
          still held in the legacy requirements repository, so the artefact breakdowns below are not
          available for this project yet.
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-3" hidden={!hasArtifacts}>
        <SectionCard
          title="Requirement status"
          description={`${requirements.length} baselined requirements across ${
            new Set(requirements.map((item) => item.category)).size
          } categories.`}
          icon={ListChecks}
          actions={
            <Button variant="ghost" size="xs" asChild>
              <Link href="/requirements">View all</Link>
            </Button>
          }
        >
          <DistributionList rows={requirementRows} />
        </SectionCard>

        <SectionCard
          title="Test execution"
          description={`${testCases.length} cases executed in the UAT cycle closed on 16 May 2025.`}
          icon={ClipboardCheck}
          actions={
            <Button variant="ghost" size="xs" asChild>
              <Link href="/test-cases">View all</Link>
            </Button>
          }
        >
          <DistributionList rows={testRows} />
        </SectionCard>

        <SectionCard
          title="Rule coverage"
          description={`${businessRules.length} business rules mapped to requirements and validation queries.`}
          icon={Database}
          actions={
            <Button variant="ghost" size="xs" asChild>
              <Link href="/business-rules">View all</Link>
            </Button>
          }
        >
          <DistributionList
            rows={[
              {
                label: "Implemented",
                count: businessRules.filter((item) => item.status === "Implemented").length,
                tone: "success",
              },
              {
                label: "Approved",
                count: businessRules.filter((item) => item.status === "Approved").length,
                tone: "primary",
              },
              {
                label: "Validated by SQL evidence",
                count: sqlValidations.filter((item) => item.status === "Validated").length,
                tone: "success",
              },
              {
                label: "Validation needing review",
                count: sqlValidations.filter((item) => item.status !== "Validated").length,
                tone: "warning",
              },
            ]}
          />
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-5" hidden={!hasArtifacts}>
        <SectionCard
          title="Needs your attention"
          description="Open analysis items assigned to this project."
          icon={TriangleAlert}
          className="xl:col-span-2"
          flush
          contentClassName="p-0"
        >
          {attention.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Nothing outstanding. All artefacts are approved and evidenced.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {attention.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="min-w-0 space-y-0.5">
                      <span className="block truncate text-[13px] font-medium">{item.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Changes made by the delivery team across the workspace."
          icon={Boxes}
          className="xl:col-span-3"
          flush
          contentClassName="p-0"
        >
          <ActivityFeed entries={activityFeed} />
        </SectionCard>
      </div>

      <SectionCard
        title="Delivery timeline"
        description={`Milestones for ${project.release}.`}
        icon={BadgeCheck}
        actions={
          <Badge variant="neutral">
            {project.timeline.filter((milestone) => milestone.status === "Completed").length} of{" "}
            {project.timeline.length} complete
          </Badge>
        }
      >
        <Timeline entries={project.timeline} />
      </SectionCard>
    </div>
  );
}
