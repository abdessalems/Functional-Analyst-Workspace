"use client";

import * as React from "react";
import { ArrowRight, GitCompare, Info, Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { projects } from "@/data/projects";
import { getProjectBundle, hasProjectBundle } from "@/data/workspaces";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { EmptyState } from "@/components/common/states";
import { compareBundles, tally, type ComparedSection } from "@/features/compare/lib/compare-projects";

/**
 * Two projects, side by side.
 *
 * An AS-IS and a TO-BE analysis of the same process is the clearest evidence a
 * functional analyst can show, and until now the workspace held both without
 * ever putting them next to each other. This page answers the only question
 * that matters about a migration: what changed, and what stayed.
 */
export function CompareView() {
  const { projects: allProjects, drafts } = useWorkspace();

  // Only projects with a documentation set can be compared; the rest have
  // nothing to put in a column.
  const comparable = React.useMemo(
    () =>
      allProjects.filter(
        (project) =>
          hasProjectBundle(project.id) || drafts.some((d) => d.project.id === project.id),
      ),
    [allProjects, drafts],
  );

  const bundleFor = React.useCallback(
    (projectId: string) =>
      drafts.find((draft) => draft.project.id === projectId)?.bundle ??
      getProjectBundle(projectId),
    [drafts],
  );

  const [leftId, setLeftId] = React.useState("");
  const [rightId, setRightId] = React.useState("");

  // Default to the first pair that looks like a before and an after.
  React.useEffect(() => {
    if (leftId && rightId) return;
    const asIs = comparable.find((p) => /as[-\s]?is/i.test(p.name));
    const toBe = comparable.find((p) => /to[-\s]?be/i.test(p.name));
    setLeftId(asIs?.id ?? comparable[0]?.id ?? "");
    setRightId(toBe?.id ?? comparable[1]?.id ?? comparable[0]?.id ?? "");
  }, [comparable, leftId, rightId]);

  const left = comparable.find((p) => p.id === leftId);
  const right = comparable.find((p) => p.id === rightId);

  const sections = React.useMemo(
    () => (left && right ? compareBundles(bundleFor(left.id), bundleFor(right.id)) : []),
    [left, right, bundleFor],
  );

  if (comparable.length < 2) {
    return (
      <div className="space-y-6">
        <PageHeader title="Compare" description="Two projects, side by side." />
        <EmptyState
          icon={GitCompare}
          title="Two projects are needed"
          description="Comparison needs two projects that each have a documentation set. Import a second one in the studio."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare"
        description="What changed between two analyses of the same process — added, removed, and carried over."
        meta={[
          { label: "Projects", value: comparable.length },
          { label: "Sections", value: sections.length },
        ]}
      />

      <SectionCard
        title="Choose the pair"
        description="The left column is the baseline; the right is what it became."
        icon={GitCompare}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="compare-left">Baseline</Label>
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger id="compare-left">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {comparable.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.code} — {project.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ArrowRight className="mx-auto hidden size-4 shrink-0 text-muted-foreground sm:mb-2.5 sm:block" />

          <div className="space-y-1.5">
            <Label htmlFor="compare-right">Compared with</Label>
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger id="compare-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {comparable.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.code} — {project.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Artefacts are matched on what identifies them to a reader — an endpoint
          by its method and path, an actor by its name — never on their id, because
          both analyses number their requirements from BR-001. A renamed artefact
          therefore reads as one removal and one addition.
        </p>
      </SectionCard>

      {leftId === rightId ? (
        <EmptyState
          icon={GitCompare}
          title="Same project on both sides"
          description="Choose two different projects to see what changed between them."
        />
      ) : (
        sections.map((section) => (
          <ComparisonSection
            key={section.title}
            section={section}
            leftLabel={left?.shortName ?? "Baseline"}
            rightLabel={right?.shortName ?? "Compared"}
          />
        ))
      )}
    </div>
  );
}

function ComparisonSection({
  section,
  leftLabel,
  rightLabel,
}: {
  section: ComparedSection;
  leftLabel: string;
  rightLabel: string;
}) {
  const counts = tally(section);
  if (section.leftCount === 0 && section.rightCount === 0) return null;

  return (
    <SectionCard
      title={section.title}
      description={`${section.leftCount} on the left, ${section.rightCount} on the right — matched on ${section.matchedOn}.`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">{counts.onlyRight} added</Badge>
          <Badge variant="danger">{counts.onlyLeft} removed</Badge>
          <Badge variant="warning">{counts.changed} reworked</Badge>
          <Badge variant="neutral">{counts.both} unchanged</Badge>
        </div>

        <div className="space-y-1.5">
          {section.items.map((item) => (
            <Card
              key={`${item.side}-${item.key}`}
              className={cn(
                "flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 p-3",
                item.side === "right" && "border-l-emerald-500/70 bg-emerald-500/[0.04]",
                item.side === "left" && "border-l-destructive/60 bg-destructive/[0.04]",
                item.side === "changed" && "border-l-amber-500/70 bg-amber-500/[0.05]",
                item.side === "both" && "border-l-border",
              )}
            >
              <span className="shrink-0" aria-hidden>
                {item.side === "right" ? (
                  <Plus className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : item.side === "left" ? (
                  <Minus className="size-3.5 text-destructive" />
                ) : item.side === "changed" ? (
                  <ArrowRight className="size-3.5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <span className="block size-3.5" />
                )}
              </span>

              <span className="min-w-0 flex-1 text-sm leading-relaxed">
                {item.label}
                {/* The reworded pair, so the change reads as one line rather
                    than as a removal and an addition on opposite sides. */}
                {item.counterpart && (
                  <span className="mt-0.5 flex items-baseline gap-1.5 text-muted-foreground">
                    <ArrowRight className="size-3 shrink-0" aria-hidden />
                    {item.counterpart}
                  </span>
                )}
              </span>

              <span className="font-mono text-xs text-muted-foreground">{item.detail}</span>

              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {item.side === "both"
                  ? "unchanged"
                  : item.side === "changed"
                    ? "reworked"
                    : item.side === "left"
                      ? `only in ${leftLabel}`
                      : `only in ${rightLabel}`}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
