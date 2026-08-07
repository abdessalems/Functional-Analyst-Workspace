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
const PASSPHRASE = "baraa";

/**
 * The example file. One row per sheet, filled in, so the headings are shown
 * being used rather than described — the fastest way to see what goes where.
 */
const TEMPLATE_SHEETS: { name: string; rows: Record<string, string>[] }[] = [
  {
    name: "Requirements",
    rows: [
      {
        ID: "BR-001",
        Title: "Validate the IBAN before a transfer is accepted",
        "Business Need": "Payments to a malformed account are rejected late and cost a manual repair.",
        Description: "The beneficiary IBAN is checked for country, length and check digits at submission.",
        Priority: "Critical",
        Status: "Approved",
        Category: "Payments",
        MoSCoW: "Must",
        Owner: "Saadaoui Abdessalem",
        "Last Updated": "2026-01-15",
        Version: "1.0",
        Rules: "RULE-001",
        Tests: "TC-001, TC-002",
        APIs: "",
        Documents: "",
      },
    ],
  },
  {
    name: "Business Rules",
    rows: [
      {
        ID: "RULE-001",
        Description: "An IBAN must pass the mod-97 check digit test.",
        Logic: "IF mod97(rearranged_iban) <> 1 THEN reject WITH 'INVALID_IBAN'",
        Priority: "Critical",
        Source: "ISO 13616",
        Status: "Approved",
        Category: "Validation",
        Owner: "Saadaoui Abdessalem",
        "Effective From": "2026-01-01",
        Requirements: "BR-001",
      },
    ],
  },
  {
    name: "Test Cases",
    rows: [
      {
        ID: "TC-001",
        Scenario: "A valid IBAN is accepted",
        Suite: "Payments",
        Preconditions: "A funded account exists; the user is signed in",
        Steps:
          "1. Enter a valid IBAN -> the field shows no error\n2. Submit the transfer -> the transfer is accepted",
        "Expected Result": "The transfer reaches the status Accepted.",
        Status: "Passed",
        Priority: "Critical",
        Type: "Functional",
        Requirement: "BR-001",
        "Last Run": "2026-01-20",
        "Executed By": "Saadaoui Abdessalem",
        Defect: "",
      },
      {
        ID: "TC-002",
        Scenario: "A malformed IBAN is rejected",
        Suite: "Payments",
        Preconditions: "A funded account exists; the user is signed in",
        Steps: "1. Enter an IBAN with a wrong check digit -> the error INVALID_IBAN is shown",
        "Expected Result": "The transfer is refused and no money moves.",
        Status: "Passed",
        Priority: "Critical",
        Type: "Negative",
        Requirement: "BR-001",
        "Last Run": "2026-01-20",
        "Executed By": "Saadaoui Abdessalem",
        Defect: "",
      },
    ],
  },
];

/** Builds the example workbook in the browser — nothing is hosted or fetched. */
async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();

  for (const sheet of TEMPLATE_SHEETS) {
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows);
    worksheet["!cols"] = Object.keys(sheet.rows[0]).map(() => ({ wch: 28 }));
    XLSX.utils.book_append_sheet(book, worksheet, sheet.name);
  }

  XLSX.writeFile(book, "project-template.xlsx");
}

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

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void downloadTemplate()}>
              <FileSpreadsheet /> Download an example file
            </Button>
            <span className="text-xs text-muted-foreground">
              Three sheets with the expected headings and one example row each.
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
