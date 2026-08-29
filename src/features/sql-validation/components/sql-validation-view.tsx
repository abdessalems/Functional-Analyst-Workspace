"use client";

import * as React from "react";
import { Database, Info, Play, Table2 } from "lucide-react";

import type { SqlValidationQuery } from "@/lib/types";
import { cn, formatDate, matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { CodeBlock } from "@/components/common/code-block";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState, NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";

const INITIAL_FILTERS = { status: "all" };

export function SqlValidationView() {
  const { highlight, marker } = useHighlight();
  const { sqlTables, sqlValidations } = useProjectData();

  const predicate = React.useCallback(
    (item: SqlValidationQuery, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      return matchesQuery(query, item.id, item.title, item.purpose, item.sql, item.executedBy);
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: sqlValidations,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="SQL Validation"
        description="Validation queries used to evidence that the delivered solution behaves as specified. Each query records its purpose, result set and the analyst's conclusions."
        meta={[
          { label: "Queries", value: sqlValidations.length },
          { label: "Environment", value: "IPH_UAT (Oracle 19c)" },
          { label: "Evidence pack", value: "DOC-007" },
        ]}
        actions={
          <SecureLinkDialog resourceName="SQL validation evidence" resourcePath="/sql-validation" />
        }
      />

      <Tabs defaultValue="queries">
        <TabsList>
          <TabsTrigger value="queries">
            <Play /> Validation queries
          </TabsTrigger>
          <TabsTrigger value="model">
            <Table2 /> Data model
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queries" className="space-y-5">
          <FilterBar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search by query ID, title, purpose or SQL text…"
            filters={[
              {
                key: "status",
                label: "Status",
                value: filters.status,
                options: ["Validated", "Needs Review", "Failed"],
              },
            ]}
            onFilterChange={setFilter}
            onReset={reset}
            isFiltered={isFiltered}
            resultCount={results.length}
            totalCount={sqlValidations.length}
          />

          {results.length === 0 ? (
            <NoResultsState query={query} onReset={reset} />
          ) : (
            results.map((validation) => (
              <Card
                key={validation.id}
                id={validation.id}
                className={cn(
                  "scroll-mt-24 overflow-hidden",
                  highlight === validation.id && "border-primary/50 ring-1 ring-primary/20",
                )}
              >
                <div className="space-y-3 border-b border-border p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {validation.id}
                    </Badge>
                    <StatusBadge status={validation.status} />
                    <Badge variant="neutral">{validation.database}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Last run {formatDate(validation.lastRun)} by {validation.executedBy}
                    </span>
                  </div>
                  <h3 className="text-title font-semibold tracking-tight">{validation.title}</h3>
                  <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
                    {validation.purpose}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                    <span className="flex items-center gap-2">
                      <span className="text-micro uppercase tracking-wide text-muted-foreground">
                        Requirements
                      </span>
                      <ArtifactLinkList ids={validation.relatedRequirements} />
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-micro uppercase tracking-wide text-muted-foreground">
                        Rules
                      </span>
                      <ArtifactLinkList ids={validation.relatedRules} />
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <CodeBlock
                    code={validation.sql}
                    language="sql"
                    title={`${validation.id}.sql`}
                    downloadName={`${validation.id}.sql`}
                    showLineNumbers
                  />

                  <section className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                        Result set
                      </h4>
                      <Badge variant={validation.rows.length === 0 ? "success" : "warning"}>
                        {validation.rows.length === 0
                          ? "0 rows — expected"
                          : `${validation.rows.length} row${validation.rows.length === 1 ? "" : "s"} returned`}
                      </Badge>
                    </div>

                    {validation.rows.length === 0 ? (
                      <EmptyState
                        icon={Database}
                        title="No rows returned"
                        description="An empty result set is the passing outcome for this control query — no records breached the rule under test."
                        className="py-8"
                      />
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {validation.columns.map((column) => (
                                <TableHead key={column} className="font-mono">
                                  {column}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {validation.rows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell key={cellIndex} className="font-mono text-xs">
                                    {cell}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                      Validation notes
                    </h4>
                    <ul className="space-y-2">
                      {validation.notes.map((note) => (
                        <li
                          key={note}
                          className="flex gap-2.5 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm leading-relaxed"
                        >
                          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="model" className="space-y-5">
          {sqlTables.map((table) => (
            <SectionCard
              key={table.name}
              title={`${table.schema}.${table.name}`}
              description={table.description}
              icon={Table2}
              actions={<Badge variant="neutral">{table.columns.length} columns</Badge>}
              flush
              contentClassName="p-0"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-64">Column</TableHead>
                    <TableHead className="w-44">Type</TableHead>
                    <TableHead className="w-28">Nullable</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.columns.map((column) => (
                    <TableRow key={column.name}>
                      <TableCell className="font-mono text-xs font-medium">
                        {column.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {column.type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={column.nullable ? "neutral" : "danger"}>
                          {column.nullable ? "NULL" : "NOT NULL"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{column.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          ))}

          <Card className="p-4 text-sm leading-relaxed text-muted-foreground">
            Physical model shown for the tables referenced by the validation queries. The full
            logical model is maintained in the data dictionary and is out of scope for this
            workspace.
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          <Play /> Run in UAT (read-only access required)
        </Button>
        <span className="text-xs text-muted-foreground">
          Execution is disabled in the workspace — queries are run through the approved database
          client with a personal read-only account.
        </span>
      </div>
    </div>
  );
}
