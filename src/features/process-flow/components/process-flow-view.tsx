"use client";

import * as React from "react";
import Link from "next/link";
import {
  CircleDot,
  Cog,
  Flag,
  GitFork,
  SquareUser,
  Timer,
  Workflow,
} from "lucide-react";

import type { ProcessStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { DefinitionList } from "@/components/common/definition-list";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { EmptyState } from "@/components/common/states";

const STEP_STYLE: Record<
  ProcessStep["type"],
  { icon: React.ComponentType<{ className?: string }>; label: string; className: string }
> = {
  start: {
    icon: CircleDot,
    label: "Start event",
    className: "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-500/10",
  },
  task: {
    icon: SquareUser,
    label: "User task",
    className: "border-primary/40 bg-primary/[0.04]",
  },
  system: {
    icon: Cog,
    label: "Service task",
    className: "border-violet-500/40 bg-violet-50/60 dark:bg-violet-500/10",
  },
  decision: {
    icon: GitFork,
    label: "Gateway",
    className: "border-amber-500/50 bg-amber-50/60 dark:bg-amber-500/10",
  },
  end: {
    icon: Flag,
    label: "End event",
    className: "border-slate-400/50 bg-surface-muted",
  },
};

export function ProcessFlowView() {
  const { processFlows, actors } = useProjectData();
  const flow = processFlows[0];

  const stepsByLane = React.useMemo(
    () =>
      (flow?.lanes ?? []).map((lane) => ({
        lane,
        actor: actors.find((actor) => actor.id === lane.actorId),
        steps: flow!.steps.filter((step) => step.lane === lane.id),
      })),
    [flow, actors],
  );

  if (!flow) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Process Flow"
        brands={["bpmn"]}
          description="Swimlane decomposition of the end-to-end process."
        />
        <EmptyState
          icon={Workflow}
          title="No process model yet"
          description="This project has no process flow in the workspace. It is added once the end-to-end journey has been agreed with the business."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Process Flow"
        description="Swimlane decomposition of the end-to-end payment process. Each step names the participant that performs it and the business rules it must satisfy."
        meta={[
          { label: "Process", value: flow.id },
          { label: "Steps", value: flow.steps.length },
          { label: "Participants", value: flow.lanes.length },
          { label: "Service level", value: flow.slaTarget },
        ]}
        actions={
          <>
            <SecureLinkDialog resourceName={flow.name} resourcePath="/process-flow" />
          </>
        }
      />

      <SectionCard title={flow.name} description={flow.description} icon={Workflow}>
        <DefinitionList
          columns={3}
          items={[
            { label: "Trigger", value: flow.trigger },
            { label: "Outcome", value: flow.outcome },
            {
              label: "Service level",
              value: (
                <span className="inline-flex items-center gap-1.5">
                  <Timer className="size-3.5 text-muted-foreground" />
                  {flow.slaTarget}
                </span>
              ),
            },
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Process sequence"
        description="Steps in execution order, coloured by node type."
        icon={Workflow}
      >
        <ol className="flex flex-wrap items-stretch gap-2">
          {flow.steps.map((step, index) => {
            const style = STEP_STYLE[step.type];
            const Icon = style.icon;
            return (
              <li key={step.id} className="flex items-stretch gap-2">
                <div
                  className={cn(
                    "flex w-44 flex-col gap-1.5 rounded-lg border p-2.5",
                    style.className,
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-micro text-muted-foreground">{step.id}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{step.name}</p>
                </div>
                {index < flow.steps.length - 1 && (
                  <span aria-hidden className="self-center text-muted-foreground">
                    →
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </SectionCard>

      <div className="space-y-5">
        {stepsByLane.map(({ lane, actor, steps }) => (
          <SectionCard
            key={lane.id}
            title={lane.name}
            description={actor ? `${actor.type} actor · ${actor.channel}` : undefined}
            icon={Workflow}
            actions={<Badge variant="neutral">{steps.length} steps</Badge>}
            flush
            contentClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {steps.map((step) => {
                const style = STEP_STYLE[step.type];
                const Icon = style.icon;
                return (
                  <li key={step.id} className="flex gap-3.5 px-5 py-4">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                        style.className,
                      )}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-micro text-muted-foreground">
                          {step.id}
                        </span>
                        <span className="text-sm font-medium">{step.name}</span>
                        <Badge variant="outline" className="font-normal">
                          {style.label}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5">
                        {step.rules.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-micro uppercase tracking-wide text-muted-foreground">
                              Rules
                            </span>
                            <ArtifactLinkList ids={step.rules} />
                          </span>
                        )}
                        {step.next.length > 0 && (
                          <span className="text-micro text-muted-foreground">
                            Next · {step.next.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        ))}
      </div>

      <Card className="p-4 text-sm leading-relaxed text-muted-foreground">
        Lanes correspond one-to-one with entries in the{" "}
        <Link
          href="/actors"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          actor catalogue
        </Link>
        . Changing a participant there is a change to this process and requires re-approval by the
        process owner.
      </Card>
    </div>
  );
}
