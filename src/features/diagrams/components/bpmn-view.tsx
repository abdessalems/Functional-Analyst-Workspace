"use client";

import * as React from "react";
import { FileDown, Info, Network } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { bpmnModels, processFlows } from "@/data/process-flow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DefinitionList } from "@/components/common/definition-list";
import { DiagramViewer } from "@/components/common/diagram-viewer";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { useDownload } from "@/hooks/use-download";
import { BpmnCanvas } from "@/features/diagrams/components/bpmn-canvas";

export function BpmnView() {
  const download = useDownload();
  const model = bpmnModels[0];
  const flow = processFlows.find((item) => item.id === model.processFlowId)!;

  const exportXml = React.useCallback(() => {
    const xml = buildBpmnXml(flow.id, flow.name, flow.steps.map((step) => step.name));
    download(xml, `${model.id}-${model.title.replace(/\s+/g, "-").toLowerCase()}.bpmn`, "application/xml");
  }, [download, flow, model]);

  const rules = React.useMemo(
    () => Array.from(new Set(flow.steps.flatMap((step) => step.rules))).sort(),
    [flow.steps],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="BPMN"
        description="Executable process model of the outbound instant payment collaboration. Lanes map to the actor catalogue and every decision node references the business rule that governs it."
        meta={[
          { label: "Model", value: model.id },
          { label: "Notation", value: model.notation },
          { label: "Version", value: model.version },
          { label: "Author", value: model.author },
          { label: "Updated", value: formatDate(model.lastUpdated) },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportXml}>
              <FileDown /> Export .bpmn
            </Button>
            <SecureLinkDialog resourceName={model.title} resourcePath="/bpmn" />
          </>
        }
      />

      <SectionCard
        title={model.title}
        description={model.description}
        icon={Network}
        actions={<Badge variant="info">{model.notation}</Badge>}
      >
        <DiagramViewer
          title="Collaboration diagram — outbound instant payment"
          exportName={`${model.id}-outbound-instant-payment`}
          frameClassName="max-h-[70vh]"
        >
          <BpmnCanvas flow={flow} />
        </DiagramViewer>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Process facts" icon={Info} className="lg:col-span-2">
          <DefinitionList
            columns={2}
            items={[
              { label: "Trigger", value: flow.trigger },
              { label: "Outcome", value: flow.outcome },
              { label: "Service level", value: flow.slaTarget },
              { label: "Lanes", value: `${flow.lanes.length} participants` },
              { label: "Activities", value: `${flow.steps.filter((s) => s.type !== "decision").length}` },
              { label: "Decision gateways", value: `${flow.steps.filter((s) => s.type === "decision").length}` },
            ]}
          />
        </SectionCard>

        <SectionCard title="Governing rules" description="Rules referenced by nodes in this model.">
          <ArtifactLinkList ids={rules} />
        </SectionCard>
      </div>

      <Card className="flex items-start gap-2.5 p-4 text-[13px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          Dashed connectors represent exception paths. The model is kept in sync with the deployed
          process definition; the exported <span className="font-mono text-xs">.bpmn</span> file is
          importable into Camunda Modeler for editing.
        </span>
      </Card>
    </div>
  );
}

/** Minimal BPMN 2.0 XML export so the model can be opened in a modelling tool. */
function buildBpmnXml(processId: string, processName: string, tasks: string[]): string {
  const elements = tasks
    .map((task, index) => `      <bpmn:task id="Task_${index + 1}" name="${escapeXml(task)}" />`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  id="Definitions_${processId}"
                  targetNamespace="http://retail-bank.example/bpmn/payments">
  <bpmn:collaboration id="Collaboration_${processId}">
    <bpmn:participant id="Participant_Bank" name="Retail Bank — Instant Payments" processRef="${processId}" />
  </bpmn:collaboration>
  <bpmn:process id="${processId}" name="${escapeXml(processName)}" isExecutable="true">
${elements}
  </bpmn:process>
</bpmn:definitions>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
