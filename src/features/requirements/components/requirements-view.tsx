"use client";

import * as React from "react";
import { Download, ListChecks } from "lucide-react";

import type { Requirement } from "@/lib/types";
import { matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/common/filter-bar";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { NoResultsState } from "@/components/common/states";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { toCsv, useDownload } from "@/hooks/use-download";
import { RequirementCard } from "@/features/requirements/components/requirement-card";

const INITIAL_FILTERS = { status: "all", priority: "all", category: "all" };

export function RequirementsView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const { requirements } = useProjectData();

  const requirementCategories = React.useMemo(
    () => Array.from(new Set(requirements.map((item) => item.category))).sort(),
    [requirements],
  );

  const predicate = React.useCallback(
    (item: Requirement, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.priority !== "all" && item.priority !== filters.priority) return false;
      if (filters.category !== "all" && item.category !== filters.category) return false;
      return matchesQuery(
        query,
        item.id,
        item.title,
        item.businessNeed,
        item.description,
        item.owner,
      );
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: requirements,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  const exportCsv = React.useCallback(() => {
    const csv = toCsv(
      ["ID", "Title", "Category", "Priority", "Status", "MoSCoW", "Owner", "Version", "Updated"],
      requirements.map((item) => [
        item.id,
        item.title,
        item.category,
        item.priority,
        item.status,
        item.moscow,
        item.owner,
        item.version,
        item.lastUpdated,
      ]),
    );
    download(csv, "business-requirements.csv", "text/csv");
  }, [download, requirements]);

  const counts = React.useMemo(
    () => ({
      total: requirements.length,
      must: requirements.filter((item) => item.moscow === "Must").length,
      implemented: requirements.filter((item) => item.status === "Implemented").length,
      open: requirements.filter(
        (item) => item.status === "Draft" || item.status === "In Review",
      ).length,
    }),
    [requirements],
  );

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Business Requirements"
        brands={["jira", "confluence"]}
        description="Baselined business requirements for the current release. Each requirement carries its business need, acceptance criteria and traceability links to rules, APIs, tests and documents."
        meta={[
          { label: "Baseline", value: "v2.3" },
          { label: "Signed off", value: "08 Nov 2024" },
          { label: "Owner", value: "Saadaoui Abdessalem" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
            <SecureLinkDialog
              resourceName="Business Requirements v2.3"
              resourcePath="/requirements"
            />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total requirements" value={counts.total} icon={ListChecks} />
        <MetricCard
          label="Must have"
          value={counts.must}
          icon={ListChecks}
          caption="Mandatory for release"
        />
        <MetricCard
          label="Implemented"
          value={counts.implemented}
          icon={ListChecks}
          tone="success"
          caption="Delivered and evidenced"
        />
        <MetricCard
          label="Open for analysis"
          value={counts.open}
          icon={ListChecks}
          tone={counts.open > 0 ? "warning" : "success"}
          caption="Draft or in review"
        />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by ID, title, business need or description…"
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
            options: requirementCategories,
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={requirements.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <div className="grid gap-4 2xl:grid-cols-2">
          {results.map((requirement) => (
            <RequirementCard
              key={requirement.id}
              requirement={requirement}
              highlighted={highlight === requirement.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
