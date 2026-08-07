"use client";

import * as React from "react";
import { Download, ShieldCheck } from "lucide-react";

import type { BusinessRule } from "@/lib/types";
import { cn, formatDate, matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
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
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { CodeBlock } from "@/components/common/code-block";
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

const INITIAL_FILTERS = { status: "all", priority: "all", category: "all" };

export function BusinessRulesView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const { businessRules } = useProjectData();
  const [selected, setSelected] = React.useState<BusinessRule | null>(null);

  const businessRuleCategories = React.useMemo(
    () => Array.from(new Set(businessRules.map((rule) => rule.category))).sort(),
    [businessRules],
  );

  const predicate = React.useCallback(
    (item: BusinessRule, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.priority !== "all" && item.priority !== filters.priority) return false;
      if (filters.category !== "all" && item.category !== filters.category) return false;
      return matchesQuery(query, item.id, item.description, item.logic, item.source, item.owner);
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: businessRules,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  const exportCsv = React.useCallback(() => {
    const csv = toCsv(
      ["Rule ID", "Description", "Logic", "Priority", "Source", "Status", "Impacted requirements"],
      businessRules.map((rule) => [
        rule.id,
        rule.description,
        rule.logic,
        rule.priority,
        rule.source,
        rule.status,
        rule.impactedRequirements.join(" | "),
      ]),
    );
    download(csv, "business-rules.csv", "text/csv");
  }, [download, businessRules]);

  const counts = React.useMemo(
    () => ({
      total: businessRules.length,
      critical: businessRules.filter((rule) => rule.priority === "Critical").length,
      regulatory: businessRules.filter(
        (rule) =>
          rule.source.includes("Rulebook") ||
          rule.source.includes("Regulation") ||
          rule.source.includes("PSD2"),
      ).length,
      implemented: businessRules.filter((rule) => rule.status === "Implemented").length,
    }),
    [businessRules],
  );

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Business Rules"
        description="Catalogue of the rules governing the payment decision path. Every rule states its source of authority and the requirements it constrains."
        meta={[
          { label: "Catalogue", value: "v2.3" },
          { label: "Effective from", value: "02 Jun 2025" },
          { label: "Owner", value: "Payments Change Delivery" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
            <SecureLinkDialog resourceName="Business Rules catalogue v2.3" resourcePath="/business-rules" />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total rules" value={counts.total} icon={ShieldCheck} />
        <MetricCard
          label="Critical"
          value={counts.critical}
          icon={ShieldCheck}
          tone="danger"
          caption="Block execution when breached"
        />
        <MetricCard
          label="Regulatory source"
          value={counts.regulatory}
          icon={ShieldCheck}
          caption="Derived from scheme or law"
        />
        <MetricCard
          label="Implemented"
          value={counts.implemented}
          icon={ShieldCheck}
          tone="success"
          caption="Live in production"
        />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by rule ID, description, logic or source…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: filters.status,
            options: ["Draft", "In Review", "Approved", "Implemented"],
          },
          {
            key: "priority",
            label: "Priority",
            value: filters.priority,
            options: ["Critical", "High", "Medium", "Low"],
          },
          {
            key: "category",
            label: "Category",
            value: filters.category,
            options: businessRuleCategories,
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={businessRules.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <SectionCard title="Rule catalogue" flush contentClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Rule ID</TableHead>
                <TableHead className="min-w-[22rem]">Description</TableHead>
                <TableHead className="w-28">Priority</TableHead>
                <TableHead className="w-56">Source</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-44">Impacted requirements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((rule) => (
                <TableRow
                  key={rule.id}
                  id={rule.id}
                  className={cn(
                    "cursor-pointer scroll-mt-24",
                    highlight === rule.id && "bg-primary/[0.06]",
                  )}
                  onClick={() => setSelected(rule)}
                >
                  <TableCell data-label="Rule" className="font-mono text-[12px] font-medium text-primary">
                    {rule.id}
                  </TableCell>
                  <TableCell data-label="Description" className="max-md:flex-col max-md:items-start">
                    <p className="text-[13px] leading-relaxed">{rule.description}</p>
                    <p className="mt-1.5 font-mono text-[11px] text-muted-foreground line-clamp-1">
                      {rule.logic}
                    </p>
                  </TableCell>
                  <TableCell data-label="Priority">
                    <PriorityBadge priority={rule.priority} />
                  </TableCell>
                  <TableCell data-label="Source" className="text-[13px] text-muted-foreground">{rule.source}</TableCell>
                  <TableCell data-label="Status">
                    <StatusBadge status={rule.status} />
                  </TableCell>
                  <TableCell data-label="Requirements" onClick={(event) => event.stopPropagation()}>
                    <ArtifactLinkList ids={rule.impactedRequirements} />
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
                  <Badge variant="neutral">{selected.category}</Badge>
                </div>
                <DialogTitle className="pt-1">{selected.description}</DialogTitle>
                <DialogDescription>Source of authority · {selected.source}</DialogDescription>
              </DialogHeader>
              <DialogBody className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Rule logic
                  </p>
                  <CodeBlock code={selected.logic} language="text" maxHeightClass="max-h-40" />
                </div>

                <DefinitionList
                  columns={2}
                  items={[
                    { label: "Owner", value: selected.owner },
                    { label: "Effective from", value: formatDate(selected.effectiveFrom) },
                    { label: "Category", value: selected.category },
                    { label: "Status", value: <StatusBadge status={selected.status} /> },
                  ]}
                />

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Impacted requirements
                  </p>
                  <ArtifactLinkList ids={selected.impactedRequirements} />
                </div>
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
