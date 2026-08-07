"use client";

import * as React from "react";
import { Boxes, Maximize2, Monitor, Smartphone } from "lucide-react";

import type { Wireframe } from "@/lib/types";
import { cn, formatDate, matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { DiagramViewer } from "@/components/common/diagram-viewer";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { WireframeCanvas } from "@/features/wireframes/components/wireframe-canvas";

const INITIAL_FILTERS = { channel: "all", status: "all" };

export function WireframesView() {
  const { highlight, marker } = useHighlight();
  const { wireframes } = useProjectData();
  const [selected, setSelected] = React.useState<Wireframe | null>(null);

  const predicate = React.useCallback(
    (item: Wireframe, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.channel !== "all" && item.channel !== filters.channel) return false;
      if (filters.status !== "all" && item.status !== filters.status) return false;
      return matchesQuery(query, item.id, item.title, item.screenId, item.description);
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: wireframes,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  React.useEffect(() => {
    if (!highlight) return;
    const match = wireframes.find((item) => item.id === highlight);
    if (match) setSelected(match);
  }, [highlight, wireframes]);

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Wireframes"
        description="Screen designs supporting the customer and back-office journeys. Select a screen to view it full size together with its annotations and requirement links."
        meta={[
          { label: "Screens", value: wireframes.length },
          { label: "Design owner", value: "Hannah Okafor" },
          { label: "Baseline", value: "v2.3" },
        ]}
        actions={<SecureLinkDialog resourceName="Wireframe set v2.3" resourcePath="/wireframes" />}
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by screen name, ID or description…"
        filters={[
          {
            key: "channel",
            label: "Channel",
            value: filters.channel,
            options: ["Web", "Mobile", "Back Office"],
          },
          {
            key: "status",
            label: "Status",
            value: filters.status,
            options: ["Draft", "In Review", "Approved"],
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={wireframes.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((wireframe) => (
            <Card
              key={wireframe.id}
              id={wireframe.id}
              className={cn(
                "group flex scroll-mt-24 flex-col overflow-hidden transition-shadow hover:shadow-raised",
                highlight === wireframe.id && "border-primary/50 ring-1 ring-primary/20",
              )}
            >
              <button
                type="button"
                onClick={() => setSelected(wireframe)}
                aria-label={`Open ${wireframe.title} full size`}
                className="relative flex h-56 items-center justify-center overflow-hidden border-b border-border bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <div
                  className="pointer-events-none origin-center"
                  style={{ transform: wireframe.channel === "Back Office" ? "scale(0.36)" : "scale(0.34)" }}
                >
                  <WireframeCanvas screenId={wireframe.screenId} />
                </div>
                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition-all group-hover:bg-slate-950/30 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1.5 text-xs font-medium shadow-raised">
                    <Maximize2 className="size-3.5" /> Open preview
                  </span>
                </span>
              </button>

              <div className="flex flex-1 flex-col gap-2.5 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {wireframe.id}
                  </Badge>
                  <StatusBadge status={wireframe.status} />
                  <Badge variant="neutral" className="gap-1">
                    {wireframe.channel === "Back Office" ? (
                      <Monitor className="size-3" />
                    ) : (
                      <Smartphone className="size-3" />
                    )}
                    {wireframe.channel}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[14px] font-semibold leading-snug">{wireframe.title}</h3>
                  <p className="font-mono text-[11px] text-muted-foreground">{wireframe.screenId}</p>
                </div>

                <p className="flex-1 text-[13px] leading-relaxed text-muted-foreground">
                  {wireframe.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
                  <ArtifactLinkList ids={wireframe.relatedRequirements} />
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    v{wireframe.version} · {formatDate(wireframe.lastUpdated)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="h-[92dvh] max-w-[96vw]">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {selected.id}
                  </Badge>
                  {selected.title}
                  <StatusBadge status={selected.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="app-scrollbar grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr_20rem]">
                <DiagramViewer
                  title={`${selected.screenId} — ${selected.channel}`}
                  exportName={`${selected.id}-${selected.screenId.toLowerCase()}`}
                >
                  <WireframeCanvas screenId={selected.screenId} />
                </DiagramViewer>

                <div className="space-y-5">
                  <section className="space-y-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Description
                    </h4>
                    <p className="text-[13px] leading-relaxed">{selected.description}</p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Design annotations
                    </h4>
                    <ol className="space-y-2.5">
                      {selected.annotations.map((annotation, index) => (
                        <li key={annotation} className="flex gap-2.5 text-[13px] leading-relaxed">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {index + 1}
                          </span>
                          {annotation}
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Requirements
                    </h4>
                    <ArtifactLinkList ids={selected.relatedRequirements} />
                  </section>

                  <section className="space-y-1.5 border-t border-border pt-4 text-[13px]">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">v{selected.version}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Author</span>
                      <span className="font-medium">{selected.author}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Last updated</span>
                      <span className="font-medium">{formatDate(selected.lastUpdated)}</span>
                    </p>
                  </section>

                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="#" onClick={(event) => event.preventDefault()}>
                      <Boxes /> Open in design tool
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
