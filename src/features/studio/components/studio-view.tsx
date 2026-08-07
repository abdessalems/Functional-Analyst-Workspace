"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
  Lock,
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
  matchSheet,
  rowsToRequirements,
  rowsToRules,
  rowsToTestCases,
  type ParsedProject,
  type SheetRow,
} from "@/features/studio/lib/parse-workbook";
import { generateBundleFile, registrySnippet } from "@/features/studio/lib/generate-bundle";

const GATE_KEY = "baw.studio-open";
const PASSPHRASE = "analyst";

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

  const handleFile = React.useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        // Loaded only here, so no visitor downloads a spreadsheet parser.
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: true });

        const result: ParsedProject = {
          requirements: [],
          businessRules: [],
          testCases: [],
          ignoredSheets: [],
        };

        for (const name of workbook.SheetNames) {
          const rows = XLSX.utils.sheet_to_json<SheetRow>(workbook.Sheets[name], { defval: "" });
          const kind = matchSheet(name);
          if (kind === "requirements") result.requirements = rowsToRequirements(rows, owner);
          else if (kind === "businessRules") result.businessRules = rowsToRules(rows, owner);
          else if (kind === "testCases") result.testCases = rowsToTestCases(rows, owner);
          else result.ignoredSheets.push(name);
        }

        if (
          result.requirements.length === 0 &&
          result.businessRules.length === 0 &&
          result.testCases.length === 0
        ) {
          setError(
            "No recognised sheets. Name them Requirements, Business Rules and Test Cases — a CSV file counts as one sheet, so name the file itself.",
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
        description="One sheet per artefact type, named Requirements, Business Rules and Test Cases. Column headings are matched loosely — “Business Need” finds businessNeed."
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

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/[0.05] p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              {error}
            </p>
          )}
        </div>
      </SectionCard>

      {parsed && report && (
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
            title="3 · Take the file and commit it"
            description="Save it into src/data/workspaces, add the project to the register, and register the bundle."
            icon={Download}
          >
            <div className="space-y-4">
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
