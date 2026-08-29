"use client";

import * as React from "react";
import { Code2, Download, GitBranch, Maximize2 } from "lucide-react";

import type { Diagram } from "@/lib/types";
import { cn, formatDate, matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { CodeBlock } from "@/components/common/code-block";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { useDownload } from "@/hooks/use-download";
import { PlantUmlImage, PlantUmlPngLink } from "@/features/diagrams/components/plantuml-image";
import { DiagramViewer, ZoomableDiagram } from "@/features/diagrams/components/diagram-viewer";

const INITIAL_FILTERS = { type: "all" };

export function PlantUmlView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const { diagrams: allDiagrams } = useProjectData();
  const diagrams = React.useMemo(
    () => allDiagrams.filter((diagram) => diagram.type !== "BPMN"),
    [allDiagrams],
  );
  const { project } = useWorkspace();
  const [fullscreen, setFullscreen] = React.useState<Diagram | null>(null);

  const predicate = React.useCallback(
    (item: Diagram, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.type !== "all" && item.type !== filters.type) return false;
      return matchesQuery(query, item.id, item.title, item.description, item.source, item.author);
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: diagrams,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="PlantUML"
        brands={["uml"]}
        description="UML models kept as PlantUML source alongside the specification. Each card shows the source, and a rendered preview where one is maintained."
        meta={[
          { label: "Models", value: diagrams.length },
          { label: "Baseline", value: `v${project.version}` },
          { label: "Owner", value: project.owner.name },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                download(
                  diagrams.map((diagram) => diagram.source).join("\n\n"),
                  `${project.code.toLowerCase()}-uml-models.puml`,
                )
              }
            >
              <Download /> Export all .puml
            </Button>
            <SecureLinkDialog resourceName={`${project.shortName} — UML model set`} resourcePath="/plantuml" />
          </>
        }
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search models by title, description or source…"
        filters={[
          {
            key: "type",
            label: "Type",
            value: filters.type,
            options: ["Use Case", "Sequence", "Component", "Activity", "State", "Class", "ER", "BPMN"],
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={diagrams.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <div className="space-y-5">
          {results.map((diagram) => (
            <Card
              key={diagram.id}
              id={diagram.id}
              className={cn(
                "scroll-mt-24 overflow-hidden",
                highlight === diagram.id && "border-primary/50 ring-1 ring-primary/20",
              )}
            >
              <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {diagram.id}
                    </Badge>
                    <Badge variant="violet">{diagram.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      v{diagram.version} · {diagram.author} · {formatDate(diagram.lastUpdated)}
                    </span>
                  </div>
                  <h3 className="text-title font-semibold tracking-tight">{diagram.title}</h3>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {diagram.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-micro uppercase tracking-wide text-muted-foreground">
                      Supports
                    </span>
                    <ArtifactLinkList ids={diagram.relatedRequirements} />
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      download(diagram.source, `${diagram.id}-${slug(diagram.title)}.puml`)
                    }
                  >
                    <Download /> .puml
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <PlantUmlPngLink source={diagram.source}>
                      <Download /> PNG
                    </PlantUmlPngLink>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setFullscreen(diagram)}>
                    <Maximize2 /> Full screen
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="preview" className="p-5">
                <TabsList>
                  <TabsTrigger value="preview">
                    <GitBranch /> Diagram
                  </TabsTrigger>
                  <TabsTrigger value="source">
                    <Code2 /> PlantUML source
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                  <ZoomableDiagram
                    source={diagram.source}
                    title={`${diagram.id} — ${diagram.title}`}
                    subtitle={`${diagram.type} · v${diagram.version}`}
                  >
                    <div className="app-scrollbar overflow-auto rounded-lg border border-border bg-surface-muted p-5">
                      <PlantUmlImage
                        source={diagram.source}
                        alt={`${diagram.type} diagram — ${diagram.title}`}
                      />
                    </div>
                  </ZoomableDiagram>
                </TabsContent>

                <TabsContent value="source">
                  <CodeBlock
                    code={diagram.source}
                    language="plantuml"
                    title={`${diagram.id}.puml`}
                    downloadName={`${diagram.id}-${slug(diagram.title)}.puml`}
                    showLineNumbers
                  />
                </TabsContent>
              </Tabs>
            </Card>
          ))}
        </div>
      )}

      {fullscreen && (
        <DiagramViewer
          source={fullscreen.source}
          title={`${fullscreen.id} — ${fullscreen.title}`}
          subtitle={`${fullscreen.type} · v${fullscreen.version} · covers ${
            fullscreen.relatedRequirements.join(", ") || "no requirement yet"
          }`}
          onClose={() => setFullscreen(null)}
        />
      )}
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
