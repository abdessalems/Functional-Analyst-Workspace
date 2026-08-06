"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FolderKanban } from "lucide-react";

import type { Project } from "@/lib/types";
import { formatDate, matchesQuery } from "@/lib/utils";
import { projects } from "@/data/projects";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "@/components/common/filter-bar";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { toCsv, useDownload } from "@/hooks/use-download";

const INITIAL_FILTERS = { status: "all", subDomain: "all" };

export function ProjectsView() {
  const router = useRouter();
  const download = useDownload();
  const { project: activeProject, selectProject } = useWorkspace();

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
      selectProject(projectId);
      router.push("/overview");
    },
    [router, selectProject],
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Register of change initiatives owned by the Payments & Onboarding analysis practice. Selecting a project scopes the whole workspace to its documentation set."
        meta={[
          { label: "Portfolio", value: "Payments & Onboarding" },
          { label: "Projects", value: projects.length },
          { label: "Active project", value: activeProject.shortName },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={exportRegister}>
            <Download /> Export register
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="In delivery" value={totals.active} icon={FolderKanban} caption="In progress or in review" />
        <MetricCard
          label="Completed"
          value={totals.completed}
          icon={FolderKanban}
          tone="success"
          caption="Benefits realisation closed"
        />
        <MetricCard
          label="Requirements"
          value={totals.requirements}
          icon={FolderKanban}
          caption="Across the portfolio"
        />
        <MetricCard
          label="Test cases"
          value={totals.testCases}
          icon={FolderKanban}
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
        <SectionCard title="Project register" flush contentClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[26rem]">Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="w-40">Completion</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => open(item.id)}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {item.code}
                        </span>
                        {item.id === activeProject.id && <Badge variant="default">Active</Badge>}
                      </div>
                      <p className="font-medium leading-snug">{item.name}</p>
                      <p className="line-clamp-2 max-w-[24rem] text-xs text-muted-foreground">
                        {item.summary}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-[13px]">{item.subDomain}</TableCell>
                  <TableCell>
                    <p className="whitespace-nowrap text-[13px] font-medium">{item.owner.name}</p>
                    <p className="whitespace-nowrap text-xs text-muted-foreground">
                      {item.owner.role}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">v{item.version}</TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <Progress value={item.completion} className="w-28" />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {item.completion}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums text-[13px]">
                    {formatDate(item.targetDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        open(item.id);
                      }}
                    >
                      Open <ArrowRight />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      <Card className="p-4 text-[13px] text-muted-foreground">
        Projects marked <span className="font-medium text-foreground">On Hold</span> or{" "}
        <span className="font-medium text-foreground">Planned</span> retain their register entry but
        their documentation set is not maintained in the workspace until delivery resumes.
      </Card>
    </div>
  );
}
