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

import type { Project } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";
import { validateBundle } from "@/lib/validate-bundle";
import { projects } from "@/data/projects";
import { getProjectBundle, hasProjectBundle } from "@/data/workspaces";
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
  buildProjectMeta,
  buildSpecSections,
  EMPTY_PARSED,
  EMPTY_PROJECT_SHEETS,
  EMPTY_SPEC_SHEETS,
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
  type ProjectSheets,
  type SpecSheets,
} from "@/features/studio/lib/parse-workbook";
import {
  generateBundleFile,
  bundleNames,
  generateProjectRecord,
  suggestProjectId,
  tidyProjectName,
  registrySnippet,
} from "@/features/studio/lib/generate-bundle";
import {
  deleteDraft,
  draftProjectRecord,
  saveDraft,
  type DraftProject,
} from "@/features/studio/lib/draft-store";
import { useWorkspace } from "@/components/providers/workspace-provider";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/**
 * Authoring needs the routes under /api/studio, and those only exist while the
 * app runs locally — `pageExtensions` drops every `.dev.ts` file from the
 * static export. On the published site the studio is a read-only preview: the
 * import and the checks run in the browser, and nothing can be written.
 */
const CAN_AUTHOR = process.env.NODE_ENV === "development";
/** Kept for the tab only. A closed tab should ask again. */
const SESSION_KEY = "baw.studio-password";

function readPassword(): string {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

function storePassword(value: string): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, value);
  } catch {
    /* Storage unavailable; the password simply is not remembered. */
  }
}

export function StudioView() {
  return <Studio />;
}

/**
 * Unlocks authoring. The password is checked by the dev server, never here —
 * so there is nothing in this file, or in the shipped bundle, to read.
 */
function Unlock({ onUnlocked }: { onUnlocked: (password: string) => void }) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    void fetch("/api/studio/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: value }),
    })
      .then(async (response) => {
        const body = (await response.json()) as { ok: boolean; message?: string };
        if (!body.ok) throw new Error(body.message ?? "Wrong password.");
        storePassword(value);
        onUnlocked(value);
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setBusy(false));
  };

  return (
    <SectionCard
      title="Authoring is locked"
      description="Adding, publishing and deleting need the studio password."
      icon={Lock}
    >
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="studio-password">Password</Label>
          <Input
            id="studio-password"
            type="password"
            className="w-56"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
          />
        </div>
        <Button type="submit" disabled={busy || !value}>
          {busy ? "Checking…" : "Unlock authoring"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      <p className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        The password is held in .env.local and checked by the server. It is not
        part of the page, so it cannot be read out of the source.
      </p>
    </SectionCard>
  );
}

/** Shown on the published site, where there is no server to author with. */
function ReadOnlyNote() {
  return (
    <SectionCard
      title="This is a preview"
      description="Import a file and watch the checks run — nothing here changes the site."
      icon={Info}
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        The studio reads a spreadsheet in your browser and reports what it finds:
        counts, unresolved references, duplicate ids, coverage. That much works
        for anyone, and the file never leaves your machine.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Adding a project to the workspace, publishing it and deleting one write
        files into the source, so they only run where the source is — on the
        analyst's own machine, behind a password the server checks.
      </p>
    </SectionCard>
  );
}

function Studio() {
  const download = useDownload();
  const [password, setPassword] = React.useState("");
  const [parsed, setParsed] = React.useState<ParsedProject | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [projectId, setProjectId] = React.useState("PRJ-NEW-001");
  const [owner, setOwner] = React.useState("Saadaoui Abdessalem");
  const [projectName, setProjectName] = React.useState("My imported project");
  // Once either field is typed in, it stops following the other.
  const [idTouched, setIdTouched] = React.useState(false);
  const [nameTouched, setNameTouched] = React.useState(false);
  // The project's own description, read from the Project / Scope / Stakeholders
  // / Timeline / Dependencies / Risks sheets when the file carries them.
  const [projectMeta, setProjectMeta] = React.useState<Partial<Project>>({});
  const [added, setAdded] = React.useState<string | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState<string[] | null>(null);
  const [removingDraft, setRemovingDraft] = React.useState<string | null>(null);
  const [publishingDraft, setPublishingDraft] = React.useState<string | null>(null);
  const [draftPublished, setDraftPublished] = React.useState<string | null>(null);
  const { drafts, refreshDrafts, openProject } = useWorkspace();

  // The password is remembered for the tab, so it is asked for once.
  React.useEffect(() => setPassword(readPassword()), []);
  const authorised = CAN_AUTHOR && password !== "";

  /**
   * The id follows the name until the analyst types one of their own.
   *
   * It is checked against every project that already exists — committed or
   * still a draft — so importing a second file can never quietly overwrite
   * the first, which is what a shared default id used to do.
   */
  const takenIds = React.useMemo(
    () => [...projects.map((item) => item.id), ...drafts.map((draft) => draft.project.id)],
    [drafts],
  );

  React.useEffect(() => {
    if (idTouched) return;
    setProjectId(suggestProjectId(projectName, takenIds));
  }, [projectName, takenIds, idTouched]);

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
        // The spec is assembled from five sheets, so it is collected then built.
        const spec: SpecSheets = { ...EMPTY_SPEC_SHEETS };
        // The project's own description: scope, stakeholders, timeline, risks.
        const projectSheets: ProjectSheets = { ...EMPTY_PROJECT_SHEETS };

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
          else if (kind?.startsWith("spec.")) {
            spec[kind.slice("spec.".length) as keyof SpecSheets] = rows;
          } else if (kind?.startsWith("project.")) {
            projectSheets[kind.slice("project.".length) as keyof ProjectSheets] = rows;
          } else result.ignoredSheets.push(name);
        }

        result.requirements = applyAcceptanceCriteria(result.requirements, criteriaRows);
        result.functionalSpecSections = buildSpecSections(spec);
        const meta = buildProjectMeta(projectSheets, owner);
        setProjectMeta(meta);

        // Name the project from what the file says, not from a leftover
        // default — importing twice without renaming produced two projects
        // called the same thing.
        if (!nameTouched) {
          setProjectName(tidyProjectName(meta.name) || tidyProjectName(file.name));
        }

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

  /**
   * Publishes a project straight from the stored list.
   *
   * The draft already holds the whole bundle, so publishing does not need the
   * spreadsheet again — which is what made it unreachable before: section 4
   * only exists while a file is loaded, so coming back to the studio later
   * left no way to publish what had been added.
   */
  const publishDraft = React.useCallback(
    (draft: DraftProject) => {
      const { fileName, exportName } = bundleNames(draft.project.id);
      setPublishingDraft(draft.project.id);
      setError(null);
      setDraftPublished(null);

      void fetch("/api/studio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          fileName,
          exportName,
          projectId: draft.project.id,
          projectName: draft.project.name,
          // The bundle carries the same collections the parser produces, so it
          // can be written out directly.
          bundleSource: generateBundleFile(
            draft.project.id,
            exportName,
            draft.bundle as unknown as ParsedProject,
          ),
          projectSource: generateProjectRecord(draft.project),
        }),
      })
        .then(async (response) => {
          const result = (await response.json()) as {
            ok: boolean;
            written?: string[];
            committed?: string | null;
            commitError?: string;
            message?: string;
          };
          if (!result.ok) throw new Error(result.message ?? "Publishing failed.");

          /*
           * The draft has become a real project, so it stops being a draft.
           * Leaving it in storage showed the project twice — once from the
           * source and once from this browser — under the same id.
           */
          deleteDraft(draft.project.id);
          refreshDrafts();

          setDraftPublished(
            result.committed
              ? `${draft.project.name} published and committed as ${result.committed}. Push to put it on the site.`
              : `${draft.project.name} written to ${(result.written ?? []).join(", ")}.${
                  result.commitError ? ` Not committed: ${result.commitError}` : ""
                }`,
          );
        })
        .catch((cause: Error) => setError(cause.message))
        .finally(() => setPublishingDraft(null));
    },
    [password, refreshDrafts],
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
      functionalSpecSections: parsed.functionalSpecSections,
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
        description="Sheets for the project itself — Project, Scope, Stakeholders, Timeline, Dependencies, Risks — and one per artefact type: Requirements, Acceptance Criteria, Business Rules, Actors, Process Steps, the five Spec sheets, Diagrams, Wireframes, API Endpoints, SQL Validations, Test Cases, Documents. Bring only the sheets you have; column headings are matched loosely."
        icon={FileSpreadsheet}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(event) => {
                  setNameTouched(true);
                  setProjectName(event.target.value);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-id">Project id</Label>
              <Input
                id="project-id"
                value={projectId}
                onChange={(event) => {
                  setIdTouched(true);
                  setProjectId(event.target.value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Proposed from the name, and never one that is already taken. Edit it if you
                would rather choose.
              </p>
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

      {!CAN_AUTHOR && <ReadOnlyNote />}
      {CAN_AUTHOR && !authorised && <Unlock onUnlocked={setPassword} />}

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

          {authorised && (
          <SectionCard
            title="3 · Add it to the workspace"
            description="It appears in the project list straight away, in this browser."
            icon={FolderPlus}
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adding <span className="font-medium text-foreground">{projectName}</span> as{" "}
                <span className="font-mono text-xs">{projectId}</span>. Change either in step 1.
              </p>

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
                      const record = draftProjectRecord(projectId, projectName, owner, previewBundle, projectMeta);
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
          )}

          <SectionCard
            title="4 · Publish it, when you are ready"
            description="A draft lives in this browser only. Publishing writes it into the source, where a commit puts it on the site for everyone."
            icon={Download}
          >
            <div className="space-y-4">
              {authorised && (
                <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/[0.04] p-3">
                  <Button
                    disabled={report.errors.length > 0 || publishing}
                    onClick={() => {
                      setPublishing(true);
                      setPublished(null);
                      setError(null);
                      const { fileName, exportName } = bundleNames(projectId);
                      void fetch("/api/studio/publish", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          password,
                          fileName,
                          exportName,
                          projectId,
                          bundleSource: generateBundleFile(projectId, bundleNames(projectId).exportName, parsed),
                          projectSource: generateProjectRecord(
                            draftProjectRecord(projectId, projectName, owner, previewBundle, projectMeta),
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
                          // Same reason as the drafts list: once published, it
                          // is a project, not a draft, and must not be both.
                          deleteDraft(projectId);
                          refreshDrafts();
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
                    generateBundleFile(projectId, bundleNames(projectId).exportName, parsed),
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
                  bundleNames(projectId).exportName,
                  bundleNames(projectId).fileName,
                )}
              />
            </div>
          </SectionCard>
        </>
      )}

      {/* Always rendered, even with nothing in it: a section that disappears
          cannot tell you whether the last Add actually worked. */}
      {CAN_AUTHOR && (
        <SectionCard
          title="Projects added in this browser"
          description="Visible to you, on this machine. Nobody else sees them until the file is committed."
          icon={FolderPlus}
        >
          <div className="space-y-3">
            {draftPublished && (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {draftPublished}
              </p>
            )}
            {drafts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing stored yet. Import a file above, then use Add … to the workspace — the
                project appears here and in the project list straight away.
              </p>
            )}
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
                    size="sm"
                    disabled={publishingDraft !== null}
                    onClick={() => publishDraft(draft)}
                  >
                    <Download /> {publishingDraft === draft.project.id ? "Publishing…" : "Publish"}
                  </Button>
                  {removingDraft === draft.project.id ? (
                    // Confirmation, not a second password: the studio was
                    // already unlocked, and asking twice teaches people to type
                    // the password without reading what they are agreeing to.
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Remove it?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          deleteDraft(draft.project.id);
                          refreshDrafts();
                          setRemovingDraft(null);
                        }}
                      >
                        Yes, remove
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setRemovingDraft(null)}>
                        Keep it
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemovingDraft(draft.project.id)}
                      aria-label={`Remove ${draft.project.name}`}
                    >
                      <Trash2 /> Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {authorised && <PublishedProjects password={password} />}

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

/**
 * Removing a published project, locally. Deleting is two clicks rather than
 * one: the first names what will happen, because this rewrites source files
 * and the undo is a git command, not a button.
 */
function PublishedProjects({ password }: { password: string }) {
  const [confirming, setConfirming] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState<string | null>(null);

  const published = projects.filter((project) => hasProjectBundle(project.id));

  const remove = (projectId: string) => {
    const { fileName, exportName } = bundleNames(projectId);
    setBusy(true);
    setFailed(null);
    void fetch("/api/studio/publish", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      // The export name is not knowable from the id alone, so the generated
      // convention is assumed and the server reports it if that is wrong.
      body: JSON.stringify({ projectId, fileName, exportName, password }),
    })
      .then(async (response) => {
        const body = (await response.json()) as {
          ok: boolean;
          removed?: string[];
          message?: string;
        };
        if (!body.ok) throw new Error(body.message ?? "Deleting failed.");
        setResult(`Removed ${projectId} from ${(body.removed ?? []).join(", ")}.`);
        setConfirming(null);
      })
      .catch((cause: Error) => setFailed(cause.message))
      .finally(() => setBusy(false));
  };

  return (
    <SectionCard
      title="Remove a published project"
      description="Deletes its bundle and its entries in the source. Only on this machine — commit the change to remove it from the site."
      icon={Trash2}
    >
      <div className="space-y-3">
        {published.map((project) => (
          <div
            key={project.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.id}</p>
            </div>

            {confirming === project.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Delete its files? This rewrites the source.
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={busy}
                  onClick={() => remove(project.id)}
                >
                  {busy ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                  Keep it
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirming(project.id)}>
                <Trash2 /> Remove
              </Button>
            )}
          </div>
        ))}

        {result && (
          <p className="flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {result} Reload the page to see it
            gone.
          </p>
        )}
        {failed && (
          <p className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {failed}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          To undo: <span className="font-mono">git checkout -- src/data</span>
        </p>
      </div>
    </SectionCard>
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
