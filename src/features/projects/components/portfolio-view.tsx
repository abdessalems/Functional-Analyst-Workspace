"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Download,
  FolderKanban,
  ListChecks,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import type { Project } from "@/lib/types";
import { cn, formatDate, matchesQuery } from "@/lib/utils";
import { projects } from "@/data/projects";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FilterBar } from "@/components/common/filter-bar";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { toCsv, useDownload } from "@/hooks/use-download";

const INITIAL_FILTERS = { status: "all", subDomain: "all" };

export function PortfolioView() {
  const router = useRouter();
  const download = useDownload();
  const { openProject, project: lastProject, isProjectOpen } = useWorkspace();

  const predicate = React.useCallback(
    (item: Project, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.subDomain !== "all" && item.subDomain !== filters.subDomain) return false;
      return matchesQuery(query, item.name, item.code, item.owner.name, item.programme, item.summary);
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: projects,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  const open = React.useCallback(
    (projectId: string) => {
      openProject(projectId);
      // Land on the analysis process, not the dashboard — it explains the work.
      router.push("/journey");
    },
    [openProject, router],
  );

  const exportRegister = React.useCallback(() => {
    const csv = toCsv(
      ["Code", "Project", "Status", "Domain", "Version", "Owner", "Target date", "Completion %"],
      projects.map((item) => [
        item.code,
        item.name,
        item.status,
        item.subDomain,
        item.version,
        item.owner.name,
        item.targetDate,
        item.completion,
      ]),
    );
    download(csv, "project-register.csv", "text/csv");
  }, [download]);

  const totals = React.useMemo(
    () => ({
      active: projects.filter((item) => item.status === "In Progress" || item.status === "In Review")
        .length,
      completed: projects.filter((item) => item.status === "Completed").length,
      requirements: projects.reduce((sum, item) => sum + item.metrics.requirements, 0),
      testCases: projects.reduce((sum, item) => sum + item.metrics.testCases, 0),
    }),
    [],
  );

  const walkthroughProject =
    projects.find((item) => item.id === "PRJ-EPH-001") ?? projects[0];

  return (
    <div className="space-y-6">
      {/*
        A visitor arriving here had to choose from seven cards before anything
        was explained. The hero says who this is and offers one obvious way in.
      */}
      <Card className="brand-wash overflow-hidden border-primary/25">
        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
              <Sparkles className="size-3" /> Functional analysis portfolio
            </span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Saadaoui Abdessalem — Functional Analyst
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Real project documentation, from the first business conversation through to the test
              that proves it was delivered. Follow the fifteen steps of one project and you will
              have seen how the whole discipline fits together.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <Button size="lg" onClick={() => open(walkthroughProject.id)}>
              Start the walkthrough <ArrowRight />
            </Button>
            <span className="text-center text-[11px] text-muted-foreground lg:text-right">
              {walkthroughProject.shortName} · 15 steps
            </span>
          </div>
        </div>
      </Card>

      <PageHeader
        title="All Projects"
        description="Every project is documented the same way. Open one to see its requirements, rules, models, interfaces, validation evidence and traceability."
        meta={[
          { label: "Portfolio", value: "Payments, Compliance & Lending" },
          { label: "Projects", value: projects.length },
          { label: "Analyst", value: "Saadaoui Abdessalem" },
        ]}
        actions={
          <>
            {isProjectOpen && (
              <Button variant="outline" size="sm" onClick={() => open(lastProject.id)}>
                Resume {lastProject.shortName} <ArrowRight />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={exportRegister}>
              <Download /> Export register
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="In delivery"
          value={totals.active}
          icon={FolderKanban}
          caption="In progress or in review"
        />
        <MetricCard
          label="Completed"
          value={totals.completed}
          icon={ShieldCheck}
          tone="success"
          caption="Benefits realisation closed"
        />
        <MetricCard
          label="Requirements"
          value={totals.requirements}
          icon={ListChecks}
          caption="Across the portfolio"
        />
        <MetricCard
          label="Test cases"
          value={totals.testCases}
          icon={ClipboardCheck}
          caption="Across the portfolio"
        />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by project, code, owner or programme…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status,
            options: ["Completed", "In Progress", "In Review", "Planned", "On Hold"],
          },
          {
            key: "subDomain",
            label: "Area",
            value: filters.subDomain,
            options: Array.from(new Set(projects.map((item) => item.subDomain))).sort(),
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={projects.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {results.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "group lift flex flex-col overflow-hidden hover:border-primary/45 hover:shadow-flyout",
                item.metrics.testCases > 0 && item.status === "Completed" && "border-primary/25",
              )}
            >
              <button
                type="button"
                onClick={() => open(item.id)}
                className="flex flex-1 flex-col gap-3 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {item.code}
                  </Badge>
                  <StatusBadge status={item.status} />
                  <Badge variant="neutral">{item.subDomain}</Badge>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-[15px] font-semibold leading-snug tracking-tight">
                    {item.name}
                  </h2>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                </div>

                <dl className="grid grid-cols-3 gap-2 border-y border-border py-3">
                  <Stat label="Requirements" value={item.metrics.requirements} />
                  <Stat label="Rules" value={item.metrics.businessRules} />
                  <Stat label="Test cases" value={item.metrics.testCases} />
                </dl>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium tabular-nums">{item.completion}%</span>
                  </div>
                  <Progress value={item.completion} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <UserRound className="size-3.5" />
                    {item.owner.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {formatDate(item.targetDate)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </button>

              <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  v{item.version} · {item.release}
                </span>
                <Button size="sm" variant="ghost" onClick={() => open(item.id)}>
                  Open workspace <ArrowRight />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 text-sm leading-relaxed text-muted-foreground">
        Opening a project scopes the entire workspace — the sidebar, breadcrumbs and global search
        all narrow to that project&apos;s documentation set. Projects marked{" "}
        <span className="font-medium text-foreground">Planned</span> or{" "}
        <span className="font-medium text-foreground">On Hold</span> keep their register entry but
        their artefacts are not maintained in the workspace until delivery resumes.
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
