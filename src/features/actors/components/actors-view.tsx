"use client";

import * as React from "react";
import { Building2, Download, Monitor, Users } from "lucide-react";

import type { Actor } from "@/lib/types";
import { cn, matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/common/filter-bar";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { toCsv, useDownload } from "@/hooks/use-download";

const INITIAL_FILTERS = { type: "all", channel: "all" };

const TYPE_TONE = {
  Human: "default",
  System: "violet",
  External: "info",
} as const;

export function ActorsView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const { actors } = useProjectData();

  const predicate = React.useCallback(
    (item: Actor, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.type !== "all" && item.type !== filters.type) return false;
      if (filters.channel !== "all" && item.channel !== filters.channel) return false;
      return matchesQuery(
        query,
        item.id,
        item.name,
        item.description,
        item.responsibilities.join(" "),
        item.systemsUsed.join(" "),
      );
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: actors,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  const exportCsv = React.useCallback(() => {
    const csv = toCsv(
      ["Actor ID", "Actor", "Type", "Channel", "Responsibilities", "Permissions", "Systems used"],
      actors.map((actor) => [
        actor.id,
        actor.name,
        actor.type,
        actor.channel,
        actor.responsibilities.join(" | "),
        actor.permissions.join(" | "),
        actor.systemsUsed.join(" | "),
      ]),
    );
    download(csv, "actors.csv", "text/csv");
  }, [download, actors]);

  const counts = React.useMemo(
    () => ({
      human: actors.filter((actor) => actor.type === "Human").length,
      system: actors.filter((actor) => actor.type === "System").length,
      external: actors.filter((actor) => actor.type === "External").length,
    }),
    [actors],
  );

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Stakeholders & Actors"
        brands={["confluence"]}
        description="Human, internal system and external actors participating in the process, with their responsibilities, permissions and the systems they operate."
        meta={[
          { label: "Actors", value: actors.length },
          { label: "Model", value: "UML-001 Use Case" },
          { label: "Owner", value: "Saadaoui Abdessalem" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
            <SecureLinkDialog resourceName="Actor catalogue v2.3" resourcePath="/actors" />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Human actors" value={counts.human} icon={Users} caption="Customers and staff" />
        <MetricCard
          label="Internal systems"
          value={counts.system}
          icon={Monitor}
          caption="Platforms in the payment path"
        />
        <MetricCard
          label="External parties"
          value={counts.external}
          icon={Building2}
          caption="Scheme and third parties"
        />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by actor, responsibility or system…"
        filters={[
          { key: "type", label: "Type", value: filters.type, options: ["Human", "System", "External"] },
          {
            key: "channel",
            label: "Channel",
            value: filters.channel,
            options: Array.from(new Set(actors.map((actor) => actor.channel))).sort(),
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={actors.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">Table view</TabsTrigger>
            <TabsTrigger value="cards">Detail view</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <SectionCard title="Actor register" flush contentClassName="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-56">Actor</TableHead>
                    <TableHead className="min-w-[20rem]">Responsibilities</TableHead>
                    <TableHead className="min-w-[18rem]">Permissions</TableHead>
                    <TableHead className="w-56">Systems used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((actor) => (
                    <TableRow
                      key={actor.id}
                      id={actor.id}
                      className={cn(
                        "scroll-mt-24",
                        highlight === actor.id && "bg-primary/[0.06]",
                      )}
                    >
                      <TableCell>
                        <div className="space-y-1.5">
                          <p className="font-mono text-micro text-muted-foreground">{actor.id}</p>
                          <p className="font-medium leading-snug">{actor.name}</p>
                          <Badge variant={TYPE_TONE[actor.type]}>{actor.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ul className="space-y-1.5">
                          {actor.responsibilities.map((item) => (
                            <li key={item} className="flex gap-2 text-sm leading-relaxed">
                              <span
                                aria-hidden
                                className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <ul className="space-y-1.5">
                          {actor.permissions.map((item) => (
                            <li key={item} className="flex gap-2 text-sm leading-relaxed">
                              <span
                                aria-hidden
                                className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {actor.systemsUsed.map((system) => (
                            <Badge key={system} variant="outline" className="font-normal">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </TabsContent>

          <TabsContent value="cards">
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((actor) => (
                <Card key={actor.id} id={`${actor.id}-card`} className="space-y-4 p-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {actor.id}
                      </Badge>
                      <Badge variant={TYPE_TONE[actor.type]}>{actor.type}</Badge>
                      <Badge variant="neutral">{actor.channel}</Badge>
                    </div>
                    <h3 className="text-title font-semibold tracking-tight">{actor.name}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {actor.description}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ListBlock title="Responsibilities" items={actor.responsibilities} />
                    <ListBlock title="Permissions" items={actor.permissions} />
                  </div>

                  <div className="space-y-1.5 border-t border-border pt-3">
                    <p className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                      Systems used
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {actor.systemsUsed.map((system) => (
                        <Badge key={system} variant="outline" className="font-normal">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed">
            <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
