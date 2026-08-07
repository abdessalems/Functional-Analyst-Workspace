"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FolderPlus,
  Info,
  Lock,
  Trash2,
  Upload,
} from "lucide-react";

import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";
import { validateBundle } from "@/lib/validate-bundle";
import { readSetting, writeSetting } from "@/lib/safe-storage";
import { projects } from "@/data/projects";
import { getProjectBundle } from "@/data/workspaces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { CodeBlock } from "@/components/common/code-block";
import { useDownload } from "@/hooks/use-download";
import {
  applyAcceptanceCriteria,
  EMPTY_PARSED,
  matchSheet,
  rowsToActors,
  rowsToApiServices,
  rowsToDiagrams,
  rowsToDocuments,
  rowsToProcessFlows,
  rowsToRequirements,
  rowsToRules,
  rowsToSqlValidations,
  rowsToTestCases,
  rowsToWireframes,
  sniffSheet,
  type ParsedProject,
  type SheetRow,
} from "@/features/studio/lib/parse-workbook";
import {
  generateBundleFile,
  generateProjectRecord,
  registrySnippet,
} from "@/features/studio/lib/generate-bundle";
import { deleteDraft, draftProjectRecord, saveDraft } from "@/features/studio/lib/draft-store";
import { useWorkspace } from "@/components/providers/workspace-provider";

const GATE_KEY = "baw.studio-open";
const PASSPHRASE = "baraa";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** The publish route only exists while the app runs on a developer's machine. */
const IS_DEV = process.env.NODE_ENV === "development";


export function StudioView() {
  const [unlocked, setUnlocked] = React.useState(false);

  React.useEffect(() => {
    setUnlocked(readSetting(GATE_KEY) === "true");
  }, []);

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;
  return <Studio />;
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = React.useState("");
  const [wrong, setWrong] = React.useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value.trim().toLowerCase() === PASSPHRASE) {
      writeSetting(GATE_KEY, "true");
      onUnlock();
    } else {
      setWrong(true);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 py-16">
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2.5">
          <Lock className="size-4 text-muted-foreground" />
          <h1 className="text-base font-semibold">Authoring studio</h1>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Label htmlFor="passphrase">Passphrase</Label>
          <Input
            id="passphrase"
            type="password"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setWrong(false);
            }}
            autoFocus
          />
          {wrong && <p className="text-sm text-destructive">That is not the passphrase.</p>}
          <Button type="submit" className="w-full">
            Open studio
          </Button>
        </form>

        {/*
          Said plainly on the page itself: this is a static site, so any
          passphrase ships inside the JavaScript. It keeps the page out of the
          way of visitors — it does not protect anything, and nothing behind it
          needs protecting, because the studio only reads a file you choose and
          hands one back.
        */}
        <p className="flex items-start gap-2 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          This hides the page from visitors. It is not security — the site is
          static, so the passphrase is in the page source. Nothing here touches
          the published site: the studio reads a file you pick and gives you one
          back to commit.
        </p>
      </Card>
    </div>
  );
}

function Studio() {
  const download = useDownload();
  const [parsed, setParsed] = React.useState<ParsedProject | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [projectId, setProjectId] = React.useState("PRJ-NEW-001");
  const [exportName, setExportName] = React.useState("myProjectBundle");
  const [owner, setOwner] = React.useState("Saadaoui Abdessalem");
  const [projectName, setProjectName] = React.useState("My imported project");
  const [added, setAdded] = React.useState<string | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState<string[] | null>(null);
  const { drafts, refreshDrafts, openProject } = useWorkspace();

  const handleFile = React.useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        // Loaded only here, so no visitor downloads a spreadsheet parser.
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: true });

        const result: ParsedProject = { ...EMPTY_PARSED, ignoredSheets: [] };
        // Held back until the requirements exist, whatever order the sheets come in.
        let criteriaRows: SheetRow[] = [];

        for (const name of workbook.SheetNames) {
          const rows = XLSX.utils.sheet_to_json<SheetRow>(workbook.Sheets[name], { defval: "" });
          // The name is trusted first; the columns only speak when it stays silent.
          const kind = matchSheet(name) ?? sniffSheet(rows);
          if (kind === "requirements") result.requirements = rowsToRequirements(rows, owner);
          else if (kind === "businessRules") result.businessRules = rowsToRules(rows, owner);
          else if (kind === "testCases") result.testCases = rowsToTestCases(rows, owner);
          else if (kind === "actors") result.actors = rowsToActors(rows);
          else if (kind === "diagrams") result.diagrams = rowsToDiagrams(rows, owner);
          else if (kind === "wireframes") result.wireframes = rowsToWireframes(rows, owner);
          else if (kind === "apiServices") result.apiServices = rowsToApiServices(rows, owner);
          else if (kind === "sqlValidations") result.sqlValidations = rowsToSqlValidations(rows, owner);
          else if (kind === "documents") result.documents = rowsToDocuments(rows, owner);
          else if (kind === "processFlows") result.processFlows = rowsToProcessFlows(rows);
          else if (kind === "acceptanceCriteria") criteriaRows = rows;
          else result.ignoredSheets.push(name);
        }

        result.requirements = applyAcceptanceCriteria(result.requirements, criteriaRows);

        const imported = Object.entries(result).reduce(
          (total, [key, value]) =>
            key === "ignoredSheets" || !Array.isArray(value) ? total : total + value.length,
          0,
        );

        if (imported === 0) {
          // Naming the sheets found is the difference between "it did not work"
          // and "I gave it the wrong file" — usually it is the wrong file.
          setError(
            `Nothing to import from ${file.name}. Found ${result.ignoredSheets
              .map((sheet) => `“${sheet}”`)
              .join(", ")} — no requirements, rules or test cases in there. Name the sheets Requirements, Business Rules and Test Cases, or use the example file below to see the layout.`,
          );
        }

        setFileName(file.name);
        setParsed(result);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "That file could not be read.");
      } finally {
        setBusy(false);
      }
    },
    [owner],
  );

  const previewBundle: ProjectDataBundle | null = React.useMemo(() => {
    if (!parsed) return null;
    return {
      ...EMPTY_BUNDLE,
      projectId,
      requirements: parsed.requirements,
      businessRules: parsed.businessRules,
      testCases: parsed.testCases,
      actors: parsed.actors,
      diagrams: parsed.diagrams,
      wireframes: parsed.wireframes,
      apiServices: parsed.apiServices,
      sqlValidations: parsed.sqlValidations,
      documents: parsed.documents,
      processFlows: parsed.processFlows,
    };
  }, [parsed, projectId]);

  const report = previewBundle ? validateBundle(previewBundle) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authoring studio"
        description="Import a project from a spreadsheet, check it, and download the file to commit. Nothing here changes the published site until you push."
      />

      <SectionCard
        title="1 · Import a spreadsheet"
        description="One sheet per artefact type: Requirements, Acceptance Criteria, Business Rules, Actors, Process Steps, Diagrams, Wireframes, API Endpoints, SQL Validations, Test Cases, Documents. Bring only the sheets you have. Column headings are matched loosely — “Business Need” finds businessNeed."
        icon={FileSpreadsheet}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="project-id">Project id</Label>
              <Input
                id="project-id"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="export-name">Export name</Label>
              <Input
                id="export-name"
                value={exportName}
                onChange={(event) => setExportName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner">Default owner</Label>
              <Input id="owner" value={owner} onChange={(event) => setOwner(event.target.value)} />
            </div>
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-muted px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-accent/40">
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {busy ? "Reading…" : "Choose an .xlsx, .xls or .csv file"}
            </span>
            <span className="text-xs text-muted-foreground">
              The file is read in your browser and never uploaded anywhere.
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              {/* A static asset, so the base path has to be applied by hand. */}
              <a href={`${BASE_PATH}/example-project.xlsx`} download>
                <FileSpreadsheet /> Download an example file
              </a>
            </Button>
            <span className="text-xs text-muted-foreground">
              A complete worked project — eleven sheets, filled in.
            </span>
          </div>

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/[0.05] p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              {error}
            </p>
          )}
        </div>
      </SectionCard>

      {parsed && report && previewBundle && (
        <>
          <SectionCard
            title="2 · Check what came through"
            description={`Read from ${fileName}.`}
            icon={CheckCircle2}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.counts)
                  .filter(([, count]) => count > 0)
                  .map(([label, count]) => (
                    <Badge key={label} variant="neutral">
                      {label} · {count}
                    </Badge>
                  ))}
              </div>

              {parsed.ignoredSheets.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Sheets not recognised and skipped: {parsed.ignoredSheets.join(", ")}
                </p>
              )}

              <IssueList report={report} />
            </div>
          </SectionCard>

          <SectionCard
            title="3 · Add it to the workspace"
            description="It appears in the project list straight away, in this browser."
            icon={FolderPlus}
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="project-name">Project name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                  />
                </div>
              </div>

              {report.errors.length > 0 ? (
                // The check is the gate: a project with dead links looks
                // finished and reads as broken, which is worse than absent.
                <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/[0.05] p-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="size-4 text-destructive" />
                    Fix {report.errors.length}{" "}
                    {report.errors.length === 1 ? "error" : "errors"} first
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {report.errors.slice(0, 8).map((issue, index) => (
                      <li key={index}>
                        <span className="font-mono text-xs">{issue.where}</span> — {issue.message}
                      </li>
                    ))}
                    {report.errors.length > 8 && (
                      <li>and {report.errors.length - 8} more, listed above.</li>
                    )}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Correct the spreadsheet and choose the file again. Warnings do not block
                    anything — they are gaps worth knowing about, not mistakes.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => {
                      const record = draftProjectRecord(
                        projectId,
                        projectName,
                        owner,
                        previewBundle,
                      );
                      const stored = saveDraft({
                        project: record,
                        bundle: previewBundle,
                        importedAt: new Date().toISOString(),
                        sourceFile: fileName,
                      });
                      if (!stored) {
                        setError(
                          "The browser refused to store the project — it is probably too large for local storage, or storage is turned off. The download below always works.",
                        );
                        return;
                      }
                      refreshDrafts();
                      setAdded(record.id);
                    }}
                  >
                    <FolderPlus /> Add {projectName} to the workspace
                  </Button>
                  {added === projectId && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-4" /> Added — open it from the project list.
                    </span>
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="4 · Publish it, when you are ready"
            description="A draft lives in this browser only. Publishing writes it into the source, where a commit puts it on the site for everyone."
            icon={Download}
          >
            <div className="space-y-4">
              {IS_DEV && (
                <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/[0.04] p-3">
                  <Button
                    disabled={report.errors.length > 0 || publishing}
                    onClick={() => {
                      setPublishing(true);
                      setPublished(null);
                      setError(null);
                      const fileName = projectId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      void fetch("/api/studio/publish", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fileName,
                          exportName,
                          projectId,
                          bundleSource: generateBundleFile(projectId, exportName, parsed),
                          projectSource: generateProjectRecord(
                            draftProjectRecord(projectId, projectName, owner, previewBundle),
                          ),
                        }),
                      })
                        .then(async (response) => {
                          const result = (await response.json()) as {
                            ok: boolean;
                            written?: string[];
                            message?: string;
                          };
                          if (!result.ok) throw new Error(result.message ?? "Publishing failed.");
                          setPublished(result.written ?? []);
                        })
                        .catch((cause: Error) => setError(cause.message))
                        .finally(() => setPublishing(false));
                    }}
                  >
                    <FolderPlus /> {publishing ? "Writing…" : "Write it into the project"}
                  </Button>

                  {published && (
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" /> Written — the page will reload itself.
                      </p>
                      <ul className="font-mono text-xs text-muted-foreground">
                        {published.map((file) => (
                          <li key={file}>{file}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        Now commit those files and push. Remove the draft above — the project is
                        real now, and keeping both would show it twice.
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Available because you are running the app locally. The published site has no
                    server, so this button is not part of it.
                  </p>
                </div>
              )}

              <Button
                onClick={() =>
                  download(
                    generateBundleFile(projectId, exportName, parsed),
                    `${projectId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ts`,
                    "text/plain",
                  )
                }
              >
                <Download /> Download the project file
              </Button>

              <CodeBlock
                language="text"
                title="Then add this to src/data/workspaces/index.ts"
                code={registrySnippet(
                  exportName,
                  projectId.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                )}
              />
            </div>
          </SectionCard>
        </>
      )}

      {drafts.length > 0 && (
        <SectionCard
          title="Projects added in this browser"
          description="Visible to you, on this machine. Nobody else sees them until the file is committed."
          icon={FolderPlus}
        >
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.project.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{draft.project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {draft.project.id} · from {draft.sourceFile} ·{" "}
                    {draft.importedAt.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openProject(draft.project.id)}>
                    Open it
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteDraft(draft.project.id);
                      refreshDrafts();
                    }}
                    aria-label={`Remove ${draft.project.name}`}
                  >
                    <Trash2 /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Health of the projects already published"
        description="The same checks, run against what is on the site now."
        icon={CheckCircle2}
      >
        <div className="space-y-5">
          {projects
            .map((project) => ({ project, bundle: getProjectBundle(project.id) }))
            .filter(({ bundle }) => bundle.requirements.length > 0)
            .map(({ project, bundle }) => {
              const projectReport = validateBundle(bundle);
              return (
                <div key={project.id} className="space-y-2 border-b border-border pb-4 last:border-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{project.shortName}</span>
                    <Badge variant={projectReport.errors.length === 0 ? "success" : "danger"}>
                      {projectReport.errors.length} errors
                    </Badge>
                    <Badge variant="neutral">{projectReport.warnings.length} warnings</Badge>
                    <span className="text-xs text-muted-foreground">
                      coverage {projectReport.coverage.full} full · {projectReport.coverage.partial}{" "}
                      partial · {projectReport.coverage.gap} gaps
                    </span>
                  </div>
                  <IssueList report={projectReport} compact />
                </div>
              );
            })}
        </div>
      </SectionCard>
    </div>
  );
}

function IssueList({
  report,
  compact,
}: {
  report: ReturnType<typeof validateBundle>;
  compact?: boolean;
}) {
  const issues = [...report.errors, ...report.warnings];

  if (issues.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4" /> Every reference resolves and no ids clash.
      </p>
    );
  }

  const shown = compact ? issues.slice(0, 6) : issues;

  return (
    <ul className="space-y-1.5">
      {shown.map((issue, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <AlertTriangle
            className={
              issue.level === "error"
                ? "mt-0.5 size-3.5 shrink-0 text-destructive"
                : "mt-0.5 size-3.5 shrink-0 text-amber-500"
            }
          />
          <span>
            <span className="font-mono text-xs text-muted-foreground">{issue.where}</span>{" "}
            {issue.message}
          </span>
        </li>
      ))}
      {compact && issues.length > shown.length && (
        <li className="text-xs text-muted-foreground">…and {issues.length - shown.length} more</li>
      )}
    </ul>
  );
}
