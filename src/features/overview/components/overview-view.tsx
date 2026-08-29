"use client";

import * as React from "react";
import {
  CalendarClock,
  CircleCheck,
  CircleSlash,
  FileText,
  GitFork,
  Scale,
  ScrollText,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";

import Link from "next/link";

import { formatDate, initials } from "@/lib/utils";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DefinitionList } from "@/components/common/definition-list";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { RiskBadge, StatusBadge } from "@/components/common/status-badge";
import { Timeline } from "@/components/common/timeline";

const RACI_TONE = {
  Responsible: "default",
  Accountable: "violet",
  Consulted: "info",
  Informed: "neutral",
} as const;

export function OverviewView() {
  const { project } = useWorkspace();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Overview"
        brands={["jira", "confluence"]}
        description={project.name}
        meta={[
          { label: "Code", value: project.code },
          { label: "Version", value: project.version },
          { label: "Release", value: project.release },
          { label: "Owner", value: project.owner.name },
          { label: "Last updated", value: formatDate(project.lastUpdated) },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/document">
                <FileText /> Read as a document
              </Link>
            </Button>
            <SecureLinkDialog
              resourceName={`${project.name} — project overview`}
              resourcePath="/overview"
            />
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          title="Project summary"
          icon={ScrollText}
          className="xl:col-span-2"
          description="Scope, purpose and delivery context as agreed at business case approval."
        >
          <div className="space-y-5">
            <p className="text-sm leading-relaxed">{project.summary}</p>
            <Separator />
            <DefinitionList
              columns={3}
              items={[
                { label: "Status", value: <StatusBadge status={project.status} /> },
                { label: "Domain", value: project.domain },
                { label: "Sub-domain", value: project.subDomain },
                { label: "Programme", value: project.programme },
                { label: "Business owner", value: project.businessOwner },
                {
                  label: "Delivery window",
                  value: `${formatDate(project.startDate)} — ${formatDate(project.targetDate)}`,
                },
              ]}
            />
            <div className="space-y-2">
              <p className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard
            title="Business objective"
            icon={Target}
            description="The measurable outcome this project is accountable for."
          >
            <p className="text-sm leading-relaxed">{project.businessObjective}</p>
          </SectionCard>

          <SectionCard
            title="Regulatory drivers"
            icon={Scale}
            description="External obligations shaping the scope."
          >
            <ul className="space-y-2">
              {project.regulatoryDrivers.map((driver) => (
                <li key={driver} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {driver}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="In scope"
          icon={CircleCheck}
          description={`${project.inScope.length} capabilities included in this release.`}
        >
          <ul className="space-y-2.5">
            {project.inScope.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Out of scope"
          icon={CircleSlash}
          description="Explicitly excluded to prevent scope ambiguity during delivery."
        >
          <ul className="space-y-2.5">
            {project.outOfScope.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <CircleSlash className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Stakeholders"
        icon={Users}
        description="RACI assignment agreed at project initiation."
        flush
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stakeholder</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>RACI</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.stakeholders.map((stakeholder) => (
              <TableRow key={stakeholder.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-micro font-semibold text-muted-foreground">
                      {initials(stakeholder.name)}
                    </span>
                    <span className="font-medium">{stakeholder.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{stakeholder.role}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {stakeholder.department}
                </TableCell>
                <TableCell>
                  <Badge variant={RACI_TONE[stakeholder.raci]}>{stakeholder.raci}</Badge>
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${stakeholder.email}`}
                    className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {stakeholder.email}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          title="Timeline"
          icon={CalendarClock}
          description="Delivery milestones and their current status."
        >
          <Timeline entries={project.timeline} />
        </SectionCard>

        <div className="space-y-5">
          <SectionCard
            title="Dependencies"
            icon={GitFork}
            description="Internal systems, vendors and external parties this delivery relies on."
            flush
            contentClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {project.dependencies.map((dependency) => (
                <li key={dependency.id} className="space-y-1.5 px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{dependency.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dependency.type} · owned by {dependency.owner}
                      </p>
                    </div>
                    <StatusBadge status={dependency.status} />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {dependency.description}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Risks"
            icon={ShieldAlert}
            description="Open delivery and operational risks with agreed mitigations."
            flush
            contentClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {project.risks.map((risk) => (
                <li key={risk.id} className="space-y-2 px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-relaxed">{risk.description}</p>
                    <span className="flex shrink-0 gap-1">
                      <RiskBadge level={risk.likelihood} />
                      <RiskBadge level={risk.impact} />
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Mitigation: </span>
                    {risk.mitigation}
                  </p>
                  <p className="text-xs text-muted-foreground">Owner · {risk.owner}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm text-muted-foreground">
        <span>
          Likelihood and impact badges are shown in that order. Risk scoring follows the bank&apos;s
          operational risk taxonomy.
        </span>
      </Card>
    </div>
  );
}
