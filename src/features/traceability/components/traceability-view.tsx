"use client";

import * as React from "react";
import { Download, Network, ShieldCheck, TriangleAlert } from "lucide-react";

import type { TraceabilityLink } from "@/lib/types";
import { cn, matchesQuery } from "@/lib/utils";
import { getRequirementById, requirementCategories } from "@/data/requirements";
import { traceabilityLinks, traceabilitySummary } from "@/data/traceability";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { FilterBar } from "@/components/common/filter-bar";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { toCsv, useDownload } from "@/hooks/use-download";
import { TraceChain } from "@/features/traceability/components/trace-chain";

const INITIAL_FILTERS = { coverage: "all", category: "all" };

export function TraceabilityView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const [selected, setSelected] = React.useState<TraceabilityLink | null>(null);

  const predicate = React.useCallback(
    (item: TraceabilityLink, query: string, filters: typeof INITIAL_FILTERS) => {
      const requirement = getRequirementById(item.requirementId);
      if (filters.coverage !== "all" && item.coverage !== filters.coverage) return false;
      if (filters.category !== "all" && requirement?.category !== filters.category) return false;

      return matchesQuery(
        query,
        item.requirementId,
        requirement?.title,
        item.businessRuleIds.join(" "),
        item.apiIds.join(" "),
        item.testCaseIds.join(" "),
        item.documentIds.join(" "),
        item.databaseObjects.join(" "),
        item.sqlValidationIds.join(" "),
        item.diagramIds.join(" "),
      );
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: traceabilityLinks,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  React.useEffect(() => {
    if (!highlight) return;
    const match = traceabilityLinks.find((item) => item.requirementId === highlight);
    if (match) setSelected(match);
  }, [highlight]);

  const exportMatrix = React.useCallback(() => {
    const csv = toCsv(
      [
        "Requirement",
        "Title",
        "Business rules",
        "UML models",
        "APIs",
        "Database objects",
        "SQL validation",
        "Test cases",
        "Documents",
        "Coverage",
      ],
      traceabilityLinks.map((link) => [
        link.requirementId,
        getRequirementById(link.requirementId)?.title ?? "",
        link.businessRuleIds.join(" | "),
        link.diagramIds.join(" | "),
        link.apiIds.join(" | "),
        link.databaseObjects.join(" | "),
        link.sqlValidationIds.join(" | "),
        link.testCaseIds.join(" | "),
        link.documentIds.join(" | "),
        link.coverage,
      ]),
    );
    download(csv, "traceability-matrix-v2.3.csv", "text/csv");
  }, [download]);

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Traceability Matrix"
        description="End-to-end chain from business requirement through rules, design, interfaces, data, validation evidence, tests and documents. Every reference is clickable and resolves to the artefact it points at."
        meta={[
          { label: "Requirements", value: traceabilitySummary.total },
          { label: "Baseline", value: "v2.3" },
          { label: "Reviewed by", value: "Internal Audit" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportMatrix}>
              <Download /> Export matrix
            </Button>
            <SecureLinkDialog
              resourceName="Traceability matrix v2.3"
              resourcePath="/traceability"
            />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Requirements traced"
          value={traceabilitySummary.total}
          icon={Network}
          caption="Rows in the matrix"
        />
        <MetricCard
          label="Full coverage"
          value={traceabilitySummary.full}
          icon={ShieldCheck}
          tone="success"
          caption="Rules, design, evidence and tests"
        />
        <MetricCard
          label="Partial coverage"
          value={traceabilitySummary.partial}
          icon={TriangleAlert}
          tone="warning"
          caption="Tested, some links missing"
        />
        <MetricCard
          label="Coverage gaps"
          value={traceabilitySummary.gap}
          icon={TriangleAlert}
          tone={traceabilitySummary.gap > 0 ? "danger" : "success"}
          caption="No linked test case"
        />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by any artefact ID — REQ, BR, API, UML, SQL, TC or DOC…"
        filters={[
          {
            key: "coverage",
            label: "Coverage",
            value: filters.coverage,
            options: ["Full", "Partial", "Gap"],
          },
          {
            key: "category",
            label: "Category",
            value: filters.category,
            options: requirementCategories,
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={traceabilityLinks.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <SectionCard
          title="Requirement traceability"
          description="Select a row to open the full chain for that requirement."
          flush
          contentClassName="p-0"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18rem]">Requirement</TableHead>
                <TableHead className="w-36">Business rules</TableHead>
                <TableHead className="w-32">UML models</TableHead>
                <TableHead className="w-32">APIs</TableHead>
                <TableHead className="w-52">Database</TableHead>
                <TableHead className="w-32">SQL validation</TableHead>
                <TableHead className="w-40">Test cases</TableHead>
                <TableHead className="w-32">Documents</TableHead>
                <TableHead className="w-28">Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((link) => {
                const requirement = getRequirementById(link.requirementId);
                return (
                  <TableRow
                    key={link.requirementId}
                    id={link.requirementId}
                    className={cn(
                      "cursor-pointer scroll-mt-24",
                      highlight === link.requirementId && "bg-primary/[0.06]",
                    )}
                    onClick={() => setSelected(link)}
                  >
                    <TableCell>
                      <div className="space-y-1" onClick={(event) => event.stopPropagation()}>
                        <ArtifactLink id={link.requirementId} />
                        <p className="text-[13px] font-medium leading-snug">{requirement?.title}</p>
                        <p className="text-xs text-muted-foreground">{requirement?.category}</p>
                      </div>
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <ArtifactLinkList ids={link.businessRuleIds} emptyLabel="—" />
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <ArtifactLinkList ids={link.diagramIds} emptyLabel="—" />
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <ArtifactLinkList ids={link.apiIds} emptyLabel="—" />
                    </TableCell>
                    <TableCell>
                      {link.databaseObjects.length === 0 ? (
                        <span className="text-[13px] text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {link.databaseObjects.map((object) => (
                            <span
                              key={object}
                              className="inline-flex rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground"
                            >
                              {object}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <ArtifactLinkList ids={link.sqlValidationIds} emptyLabel="—" />
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <ArtifactLinkList ids={link.testCaseIds} emptyLabel="—" />
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <ArtifactLinkList ids={link.documentIds} emptyLabel="—" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={link.coverage} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      <Card className="flex flex-col gap-2 p-4 text-[13px] leading-relaxed text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Coverage rules · </span>
          <span className="font-medium text-foreground">Full</span> — the requirement has business
          rules, a design artefact (UML or API), validation evidence and at least one test case.{" "}
          <span className="font-medium text-foreground">Partial</span> — tested, but one or more
          upstream links are missing. <span className="font-medium text-foreground">Gap</span> — no
          test case is linked; the requirement cannot be evidenced as delivered.
        </p>
      </Card>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {selected.requirementId}
                  </Badge>
                  <StatusBadge status={selected.coverage} />
                </div>
                <DialogTitle className="pt-1">
                  {getRequirementById(selected.requirementId)?.title}
                </DialogTitle>
                <DialogDescription>
                  Full downstream chain for this requirement. Every chip is a link to the artefact.
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <TraceChain link={selected} />
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
