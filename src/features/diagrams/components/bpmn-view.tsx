"use client";

import * as React from "react";
import { Code2, Download, Maximize2, Network } from "lucide-react";

import type { Diagram } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { CodeBlock } from "@/components/common/code-block";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/states";
import { useDownload } from "@/hooks/use-download";
import { PlantUmlImage, PlantUmlPngLink } from "@/features/diagrams/components/plantuml-image";
import { DiagramViewer, ZoomableDiagram } from "@/features/diagrams/components/diagram-viewer";

/** Business process models, kept as BPMN-notation sources and rendered as diagrams. */
export function BpmnView() {
  const download = useDownload();
  const { diagrams, processFlows } = useProjectData();
  const { project } = useWorkspace();
  const [fullscreen, setFullscreen] = React.useState<Diagram | null>(null);

  const models = React.useMemo(
    () => diagrams.filter((diagram) => diagram.type === "BPMN"),
    [diagrams],
  );

  if (models.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="BPMN" description="Business process models in BPMN notation." />
        <EmptyState
          icon={Network}
          title="No BPMN model yet"
          description="This project has no BPMN model in the workspace. It is produced once the end-to-end process has been agreed with the business."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="BPMN"
        description="Business process models in BPMN notation — swimlanes, gateways and exception paths. The same process is broken down step by step on the Process Flow page."
        meta={[
          { label: "Models", value: models.length },
          { label: "Project", value: project.shortName },
          { label: "Process steps", value: processFlows[0]?.steps.length ?? "—" },
        ]}
      />

      {models.map((model) => (
        <Card key={model.id} id={model.id} className="scroll-mt-24 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {model.id}
                </Badge>
                <Badge variant="violet">BPMN</Badge>
                <span className="text-xs text-muted-foreground">
                  v{model.version} · {model.author} · {formatDate(model.lastUpdated)}
                </span>
              </div>
              <h2 className="text-title font-semibold tracking-tight">{model.title}</h2>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {model.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-micro uppercase tracking-wide text-muted-foreground">
                  Supports
                </span>
                <ArtifactLinkList ids={model.relatedRequirements} />
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => download(model.source, `${model.id}.puml`)}
              >
                <Download /> .puml
              </Button>
              <Button variant="outline" size="sm" asChild>
                <PlantUmlPngLink source={model.source}>
                  <Download /> PNG
                </PlantUmlPngLink>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFullscreen(model)}>
                <Maximize2 /> Full screen
              </Button>
            </div>
          </div>

          <Tabs defaultValue="diagram" className="p-5">
            <TabsList>
              <TabsTrigger value="diagram">
                <Network /> Diagram
              </TabsTrigger>
              <TabsTrigger value="source">
                <Code2 /> Source
              </TabsTrigger>
            </TabsList>

            <TabsContent value="diagram">
              <ZoomableDiagram
                source={model.source}
                title={`${model.id} — ${model.title}`}
                subtitle={`BPMN · v${model.version}`}
              >
                <div className="app-scrollbar overflow-auto rounded-lg border border-border bg-surface-muted p-5">
                  <PlantUmlImage source={model.source} alt={`BPMN model — ${model.title}`} />
                </div>
              </ZoomableDiagram>
            </TabsContent>

            <TabsContent value="source">
              <CodeBlock
                code={model.source}
                language="plantuml"
                title={`${model.id}.puml`}
                downloadName={`${model.id}.puml`}
                showLineNumbers
              />
            </TabsContent>
          </Tabs>
        </Card>
      ))}

      {fullscreen && (
        <DiagramViewer
          source={fullscreen.source}
          title={`${fullscreen.id} — ${fullscreen.title}`}
          subtitle={`BPMN · v${fullscreen.version} · ${fullscreen.description}`}
          onClose={() => setFullscreen(null)}
        />
      )}
    </div>
  );
}
