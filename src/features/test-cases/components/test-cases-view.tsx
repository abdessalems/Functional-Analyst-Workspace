"use client";

import * as React from "react";
import { Bug, ClipboardCheck, Download } from "lucide-react";

import type { TestCase } from "@/lib/types";
import { cn, formatDate, matchesQuery } from "@/lib/utils";
import { testCases, testSuites } from "@/data/test-cases";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArtifactLink, ArtifactLinkList } from "@/components/common/artifact-link";
import { DefinitionList } from "@/components/common/definition-list";
import { FilterBar } from "@/components/common/filter-bar";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { PriorityBadge, StatusBadge } from "@/components/common/status-badge";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { toCsv, useDownload } from "@/hooks/use-download";

const INITIAL_FILTERS = { status: "all", suite: "all", priority: "all", type: "all" };

export function TestCasesView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const [selected, setSelected] = React.useState<TestCase | null>(null);

  const predicate = React.useCallback(
    (item: TestCase, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.suite !== "all" && item.suite !== filters.suite) return false;
      if (filters.priority !== "all" && item.priority !== filters.priority) return false;
      if (filters.type !== "all" && item.type !== filters.type) return false;
      return matchesQuery(
        query,
        item.id,
        item.scenario,
        item.expectedResult,
        item.linkedRequirement,
        item.executedBy,
      );
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: testCases,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  React.useEffect(() => {
    if (!highlight) return;
    const match = testCases.find((item) => item.id === highlight);
    if (match) setSelected(match);
  }, [highlight]);

  const exportCsv = React.useCallback(() => {
    const csv = toCsv(
      [
        "ID",
        "Scenario",
        "Suite",
        "Type",
        "Priority",
        "Status",
        "Linked requirement",
        "Expected result",
        "Last run",
        "Executed by",
        "Defect",
      ],
      testCases.map((item) => [
        item.id,
        item.scenario,
        item.suite,
        item.type,
        item.priority,
        item.status,
        item.linkedRequirement,
        item.expectedResult,
        item.lastRun,
        item.executedBy,
        item.defect ?? "",
      ]),
    );
    download(csv, "test-cases-uat-2.3.csv", "text/csv");
  }, [download]);

  const counts = React.useMemo(() => {
    const passed = testCases.filter((item) => item.status === "Passed").length;
    return {
      total: testCases.length,
      passed,
      failed: testCases.filter((item) => item.status === "Failed").length,
      blocked: testCases.filter((item) => item.status === "Blocked").length,
      passRate: Math.round((passed / testCases.length) * 100),
    };
  }, []);

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Test Cases"
        description="SIT and UAT catalogue for the release. Every case is linked to the requirement it verifies and records its latest execution result."
        meta={[
          { label: "Cycle", value: "UAT — closed 16 May 2025" },
          { label: "QA owner", value: "Sofia Marchetti" },
          { label: "Evidence", value: "DOC-007" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
            <SecureLinkDialog resourceName="UAT test catalogue v2.3" resourcePath="/test-cases" />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pass rate"
          value={`${counts.passRate}%`}
          icon={ClipboardCheck}
          tone="success"
          caption={`${counts.passed} of ${counts.total} cases passed`}
        />
        <MetricCard label="Total cases" value={counts.total} icon={ClipboardCheck} />
        <MetricCard
          label="Failed"
          value={counts.failed}
          icon={Bug}
          tone={counts.failed > 0 ? "danger" : "success"}
          caption={counts.failed > 0 ? "Open defect raised" : "No open failures"}
        />
        <MetricCard
          label="Blocked"
          value={counts.blocked}
          icon={Bug}
          tone={counts.blocked > 0 ? "warning" : "success"}
          caption="Awaiting environment or dependency"
        />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by ID, scenario, expected result or requirement…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status,
            options: ["Passed", "Failed", "Blocked", "Not Run"],
          },
          { key: "suite", label: "Suite", value: filters.suite, options: testSuites },
          {
            key: "priority",
            label: "Priority",
            value: filters.priority,
            options: ["Critical", "High", "Medium", "Low"],
          },
          {
            key: "type",
            label: "Type",
            value: filters.type,
            options: ["Functional", "Integration", "Regression", "Negative", "Performance"],
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={testCases.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <SectionCard title="Test catalogue" flush contentClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead className="min-w-[20rem]">Scenario</TableHead>
                <TableHead className="w-56">Preconditions</TableHead>
                <TableHead className="w-20 text-center">Steps</TableHead>
                <TableHead className="min-w-[16rem]">Expected result</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-28">Priority</TableHead>
                <TableHead className="w-32">Requirement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((testCase) => (
                <TableRow
                  key={testCase.id}
                  id={testCase.id}
                  className={cn(
                    "cursor-pointer scroll-mt-24",
                    highlight === testCase.id && "bg-primary/[0.06]",
                  )}
                  onClick={() => setSelected(testCase)}
                >
                  <TableCell className="font-mono text-[12px] font-medium text-primary">
                    {testCase.id}
                  </TableCell>
                  <TableCell>
                    <p className="text-[13px] font-medium leading-snug">{testCase.scenario}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {testCase.suite} · {testCase.type}
                    </p>
                    {testCase.defect && (
                      <Badge variant="danger" className="mt-1.5">
                        <Bug className="size-3" /> {testCase.defect}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {testCase.preconditions.map((precondition) => (
                        <li key={precondition} className="flex gap-1.5">
                          <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                          {precondition}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    <Badge variant="neutral">{testCase.steps.length}</Badge>
                  </TableCell>
                  <TableCell className="text-[13px] leading-relaxed">
                    {testCase.expectedResult}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={testCase.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={testCase.priority} />
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <ArtifactLink id={testCase.linkedRequirement} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {selected.id}
                  </Badge>
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                  <Badge variant="neutral">{selected.type}</Badge>
                  {selected.defect && (
                    <Badge variant="danger">
                      <Bug className="size-3" /> {selected.defect}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="pt-1">{selected.scenario}</DialogTitle>
                <DialogDescription>
                  {selected.suite} · verifies{" "}
                  <span className="font-mono">{selected.linkedRequirement}</span>
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="space-y-5">
                <section className="space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Preconditions
                  </h4>
                  <ul className="space-y-1.5">
                    {selected.preconditions.map((precondition) => (
                      <li key={precondition} className="flex gap-2 text-[13px] leading-relaxed">
                        <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
                        {precondition}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Test steps
                  </h4>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-14">#</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Expected</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.steps.map((step) => (
                          <TableRow key={step.step}>
                            <TableCell className="tabular-nums text-muted-foreground">
                              {step.step}
                            </TableCell>
                            <TableCell className="text-[13px]">{step.action}</TableCell>
                            <TableCell className="text-[13px]">{step.expected}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Expected result
                  </h4>
                  <p className="rounded-lg border border-border bg-surface-muted p-3.5 text-[13px] leading-relaxed">
                    {selected.expectedResult}
                  </p>
                </section>

                <DefinitionList
                  columns={2}
                  items={[
                    { label: "Last run", value: formatDate(selected.lastRun) },
                    { label: "Executed by", value: selected.executedBy },
                    {
                      label: "Linked requirement",
                      value: <ArtifactLinkList ids={[selected.linkedRequirement]} />,
                    },
                    { label: "Defect", value: selected.defect ?? "None" },
                  ]}
                />
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
