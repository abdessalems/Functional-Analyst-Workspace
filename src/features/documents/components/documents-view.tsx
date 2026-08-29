"use client";

import * as React from "react";
import {
  Download,
  Eye,
  FileCode2,
  FileSpreadsheet,
  FileText,
  FileType2,
  Network,
  GitBranch,
  History,
  Lock,
} from "lucide-react";

import type { DocumentFormat, WorkspaceDocument } from "@/lib/types";
import { cn, formatDate, matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { DefinitionList } from "@/components/common/definition-list";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useHighlight } from "@/hooks/use-highlight";
import { useDownload } from "@/hooks/use-download";

const INITIAL_FILTERS = { format: "all", status: "all", confidentiality: "all" };

const FORMAT_META: Record<
  DocumentFormat,
  { icon: React.ComponentType<{ className?: string }>; className: string; extension: string }
> = {
  PDF: { icon: FileType2, className: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300", extension: "pdf" },
  Word: { icon: FileText, className: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", extension: "docx" },
  Excel: {
    icon: FileSpreadsheet,
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    extension: "xlsx",
  },
  Swagger: {
    icon: FileCode2,
    className: "bg-lime-50 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300",
    extension: "yaml",
  },
  BPMN: {
    icon: Network,
    className: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    extension: "bpmn",
  },
  PlantUML: {
    icon: GitBranch,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    extension: "puml",
  },
};

const CONFIDENTIALITY_TONE = {
  Internal: "neutral",
  Confidential: "warning",
  Restricted: "danger",
} as const;

export function DocumentsView() {
  const { highlight, marker } = useHighlight();
  const download = useDownload();
  const { documents } = useProjectData();
  const [preview, setPreview] = React.useState<WorkspaceDocument | null>(null);

  const predicate = React.useCallback(
    (item: WorkspaceDocument, query: string, filters: typeof INITIAL_FILTERS) => {
      if (filters.format !== "all" && item.format !== filters.format) return false;
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.confidentiality !== "all" && item.confidentiality !== filters.confidentiality)
        return false;
      return matchesQuery(query, item.id, item.name, item.description, item.author, item.category);
    },
    [],
  );

  const { query, setQuery, filters, setFilter, reset, isFiltered, results } = useArtifactFilters({
    items: documents,
    initialFilters: INITIAL_FILTERS,
    predicate,
  });

  const downloadPlaceholder = React.useCallback(
    (item: WorkspaceDocument) => {
      const extension = FORMAT_META[item.format].extension;
      const manifest = [
        `${item.id} — ${item.name}`,
        `Version: ${item.version}`,
        `Author: ${item.author}`,
        `Last updated: ${item.lastUpdated}`,
        `Classification: ${item.confidentiality}`,
        `Related requirements: ${item.relatedRequirements.join(", ")}`,
        "",
        item.description,
        "",
        "This workspace holds document metadata only. The controlled copy is retrieved from the",
        "document management system on download.",
      ].join("\n");

      download(manifest, `${item.id}-${slug(item.name)}.${extension}.txt`);
    },
    [download],
  );

  return (
    <div className="space-y-6">
      {marker}
      <PageHeader
        title="Documents"
        brands={["jira", "confluence"]}
        description="Controlled document register for the release. Every artefact carries its version, owner, classification and the requirements it evidences."
        meta={[
          { label: "Documents", value: documents.length },
          { label: "Register owner", value: "Saadaoui Abdessalem" },
          { label: "Retention", value: "10 years" },
        ]}
        actions={
          <SecureLinkDialog resourceName="IPH document register v2.3" resourcePath="/documents" />
        }
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search documents by name, description, author or category…"
        filters={[
          {
            key: "format",
            label: "Format",
            value: filters.format,
            options: ["PDF", "Word", "Excel", "Swagger", "BPMN", "PlantUML"],
          },
          {
            key: "status",
            label: "Status",
            value: filters.status,
            options: ["Draft", "In Review", "Approved"],
          },
          {
            key: "confidentiality",
            label: "Classification",
            value: filters.confidentiality,
            options: ["Internal", "Confidential", "Restricted"],
          },
        ]}
        onFilterChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={documents.length}
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const meta = FORMAT_META[item.format];
            const Icon = meta.icon;

            return (
              <Card
                key={item.id}
                id={item.id}
                className={cn(
                  "flex scroll-mt-24 flex-col transition-shadow hover:shadow-raised",
                  highlight === item.id && "border-primary/50 ring-1 ring-primary/20",
                )}
              >
                <div className="flex items-start gap-3.5 p-5 pb-4">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-lg",
                      meta.className,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="font-mono">
                        {item.id}
                      </Badge>
                      <Badge variant="neutral">{item.format}</Badge>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="text-sm font-semibold leading-snug">{item.name}</h3>
                  </div>
                </div>

                <div className="flex-1 space-y-3 px-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <Fact label="Version" value={`v${item.version}`} />
                    <Fact label="Size" value={item.size} />
                    <Fact label="Author" value={item.author} />
                    <Fact label="Updated" value={formatDate(item.lastUpdated)} />
                    {item.pages && <Fact label="Pages" value={String(item.pages)} />}
                    <Fact label="Category" value={item.category} />
                  </dl>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={CONFIDENTIALITY_TONE[item.confidentiality]}>
                      <Lock className="size-3" />
                      {item.confidentiality}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                      Evidences
                    </p>
                    <ArtifactLinkList ids={item.relatedRequirements.slice(0, 5)} />
                    {item.relatedRequirements.length > 5 && (
                      <span className="text-micro text-muted-foreground">
                        +{item.relatedRequirements.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-border px-5 py-3">
                  <Button variant="outline" size="sm" onClick={() => setPreview(item)}>
                    <Eye /> Details
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => downloadPlaceholder(item)}>
                    <Download /> Download
                  </Button>
                  <SecureLinkDialog
                    resourceName={item.name}
                    resourcePath={`/documents/${item.id.toLowerCase()}`}
                    trigger={
                      <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Share">
                        <Lock />
                      </Button>
                    }
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          {preview && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {preview.id}
                  </Badge>
                  <Badge variant="neutral">{preview.format}</Badge>
                  <StatusBadge status={preview.status} />
                  <Badge variant={CONFIDENTIALITY_TONE[preview.confidentiality]}>
                    <Lock className="size-3" />
                    {preview.confidentiality}
                  </Badge>
                </div>
                <DialogTitle className="pt-1">{preview.name}</DialogTitle>
                <DialogDescription>{preview.description}</DialogDescription>
              </DialogHeader>

              <DialogBody className="space-y-5">
                <DefinitionList
                  columns={2}
                  items={[
                    { label: "Version", value: `v${preview.version}` },
                    { label: "Author", value: preview.author },
                    { label: "Last updated", value: formatDate(preview.lastUpdated) },
                    { label: "File size", value: preview.size },
                    { label: "Category", value: preview.category },
                    { label: "Pages", value: preview.pages ? String(preview.pages) : "—" },
                  ]}
                />

                <section className="space-y-2">
                  <h4 className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                    Requirements evidenced
                  </h4>
                  <ArtifactLinkList ids={preview.relatedRequirements} />
                </section>

                <section className="space-y-2">
                  <h4 className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                    <History className="size-3.5" /> Version history
                  </h4>
                  <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                    {buildVersionHistory(preview).map((entry) => (
                      <li key={entry.version} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">v{entry.version}</p>
                          <p className="text-xs text-muted-foreground">{entry.note}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{entry.date}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </DialogBody>

              <DialogFooter>
                <Button variant="outline" onClick={() => downloadPlaceholder(preview)}>
                  <Download /> Download
                </Button>
                <SecureLinkDialog
                  resourceName={preview.name}
                  resourcePath={`/documents/${preview.id.toLowerCase()}`}
                  trigger={<Button>Share securely</Button>}
                />
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

/** Derives a plausible revision trail from the document's current version. */
function buildVersionHistory(document: WorkspaceDocument) {
  const current = parseFloat(document.version) || 1;
  const notes = [
    "Current approved baseline",
    "Review comments from Compliance incorporated",
    "Initial draft circulated for review",
  ];

  return [0, 1, 2]
    .map((offset) => {
      const version = (current - offset * 0.1).toFixed(1);
      if (parseFloat(version) <= 0) return null;
      return {
        version,
        note: notes[offset],
        date: formatDate(shiftDate(document.lastUpdated, -offset * 34)),
      };
    })
    .filter((entry): entry is { version: string; note: string; date: string } => entry !== null);
}

function shiftDate(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
