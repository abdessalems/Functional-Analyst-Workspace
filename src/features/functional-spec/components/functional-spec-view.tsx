"use client";

import * as React from "react";
import {
  AlertOctagon,
  Braces,
  Download,
  GitBranch,
  ListTree,
  ShieldAlert,
} from "lucide-react";

import type { FunctionalSpecSection } from "@/lib/types";
import { cn, matchesQuery } from "@/lib/utils";
import { useProjectData } from "@/hooks/use-project-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";
import { NoResultsState } from "@/components/common/states";
import { useArtifactFilters } from "@/hooks/use-artifact-filters";
import { useDownload } from "@/hooks/use-download";

export function FunctionalSpecView() {
  const download = useDownload();
  const { functionalSpecSections } = useProjectData();
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  // Open the first section whenever the active project changes.
  React.useEffect(() => {
    setOpenSections(functionalSpecSections[0] ? [functionalSpecSections[0].id] : []);
  }, [functionalSpecSections]);

  const predicate = React.useCallback((item: FunctionalSpecSection, query: string) => {
    return matchesQuery(
      query,
      item.id,
      item.title,
      item.summary,
      item.businessLogic.join(" "),
      item.fields.map((field) => field.name).join(" "),
      item.errors.map((error) => `${error.code} ${error.message}`).join(" "),
    );
  }, []);

  const { query, setQuery, reset, isFiltered, results } = useArtifactFilters({
    items: functionalSpecSections,
    initialFilters: {},
    predicate,
  });

  const expandAll = () => setOpenSections(functionalSpecSections.map((section) => section.id));
  const collapseAll = () => setOpenSections([]);

  const exportSpec = React.useCallback(() => {
    const text = functionalSpecSections
      .map((section) =>
        [
          `${section.id} — ${section.title}`,
          section.summary,
          "",
          "Business logic:",
          ...section.businessLogic.map((line) => `  - ${line}`),
          "",
          "Validations:",
          ...section.validations.map(
            (rule) => `  - [${rule.errorCode}] ${rule.field}: ${rule.rule} (${rule.severity})`,
          ),
          "",
          "Errors:",
          ...section.errors.map(
            (error) => `  - ${error.code} (HTTP ${error.httpStatus}): ${error.message}`,
          ),
          "",
          "Edge cases:",
          ...section.edgeCases.map((edge) => `  - ${edge.scenario} → ${edge.expectedBehaviour}`),
          "",
          "".padEnd(72, "-"),
          "",
        ].join("\n"),
      )
      .join("\n");

    download(text, "functional-specification.txt");
  }, [download, functionalSpecSections]);

  const totals = React.useMemo(
    () => ({
      validations: functionalSpecSections.reduce((sum, s) => sum + s.validations.length, 0),
      errors: functionalSpecSections.reduce((sum, s) => sum + s.errors.length, 0),
      fields: functionalSpecSections.reduce((sum, s) => sum + s.fields.length, 0),
      edgeCases: functionalSpecSections.reduce((sum, s) => sum + s.edgeCases.length, 0),
    }),
    [functionalSpecSections],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Functional Specification"
        description="Detailed functional design for the release: orchestration logic, validation rules, error handling, field definitions and edge cases. Each section traces back to the requirements it satisfies."
        meta={[
          { label: "Document", value: "FS v2.3" },
          { label: "Status", value: "Approved" },
          { label: "Sections", value: functionalSpecSections.length },
          { label: "Author", value: "Saadaoui Abdessalem" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportSpec}>
              <Download /> Export
            </Button>
            <SecureLinkDialog
              resourceName="Functional Specification v2.3"
              resourcePath="/functional-specification"
            />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Validation rules" value={totals.validations} icon={ShieldAlert} />
        <SummaryTile label="Error definitions" value={totals.errors} icon={AlertOctagon} />
        <SummaryTile label="Field definitions" value={totals.fields} icon={Braces} />
        <SummaryTile label="Edge cases" value={totals.edgeCases} icon={GitBranch} />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search sections, fields, error codes or business logic…"
        onReset={reset}
        isFiltered={isFiltered}
        resultCount={results.length}
        totalCount={functionalSpecSections.length}
        actions={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand all
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse all
            </Button>
          </div>
        }
      />

      {results.length === 0 ? (
        <NoResultsState query={query} onReset={reset} />
      ) : (
        <Card className="overflow-hidden">
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="w-full"
          >
            {results.map((section) => (
              <AccordionItem key={section.id} value={section.id} id={section.id} className="scroll-mt-24">
                <AccordionTrigger>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-4 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {section.id}
                      </Badge>
                      <span className="text-[15px] font-semibold">{section.title}</span>
                    </div>
                    <p className="text-[13px] font-normal leading-relaxed text-muted-foreground">
                      {section.summary}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SectionDetail section={section} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}
    </div>
  );
}

function SectionDetail({ section }: { section: FunctionalSpecSection }) {
  return (
    <div className="space-y-6 border-t border-border pt-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Satisfies
        </span>
        <ArtifactLinkList ids={section.requirementRefs} />
      </div>

      <Block title="Business logic" icon={ListTree}>
        <ol className="space-y-2.5">
          {section.businessLogic.map((line, index) => (
            <li key={index} className="flex gap-3 text-[13px] leading-relaxed">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </Block>

      <Block title="Validation rules" icon={ShieldAlert}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-56">Field</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead className="w-40">Error code</TableHead>
              <TableHead className="w-28">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.validations.map((rule) => (
              <TableRow key={`${rule.field}-${rule.errorCode}`}>
                <TableCell className="font-mono text-[12px]">{rule.field}</TableCell>
                <TableCell className="text-[13px]">{rule.rule}</TableCell>
                <TableCell className="font-mono text-[12px] text-primary">{rule.errorCode}</TableCell>
                <TableCell>
                  <Badge variant={rule.severity === "Blocking" ? "danger" : "warning"}>
                    {rule.severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Block>

      <Block title="Error handling" icon={AlertOctagon}>
        <div className="space-y-3">
          {section.errors.map((error) => (
            <div key={error.code} className="rounded-lg border border-border bg-surface-muted p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[12px] font-semibold text-primary">{error.code}</span>
                <Badge variant={error.httpStatus >= 500 ? "danger" : "warning"}>
                  HTTP {error.httpStatus}
                </Badge>
              </div>
              <p className="mt-2 text-[13px] font-medium">{error.message}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Handling: </span>
                {error.handling}
              </p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Field definitions" icon={Braces}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-52">Field</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-20">Length</TableHead>
              <TableHead className="w-24">Mandatory</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-56">Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.fields.map((field) => (
              <TableRow key={field.name}>
                <TableCell className="font-mono text-[12px]">{field.name}</TableCell>
                <TableCell className="text-[13px]">{field.type}</TableCell>
                <TableCell className="tabular-nums text-[13px]">{field.length}</TableCell>
                <TableCell>
                  <Badge variant={field.mandatory ? "danger" : "neutral"}>
                    {field.mandatory ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-[13px]">{field.description}</TableCell>
                <TableCell className="font-mono text-[12px] text-muted-foreground">
                  {field.example}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Block>

      <Block title="Edge cases" icon={GitBranch}>
        <div className="grid gap-3 lg:grid-cols-2">
          {section.edgeCases.map((edge) => (
            <div key={edge.id} className="rounded-lg border border-border p-3.5">
              <p className="font-mono text-[11px] text-muted-foreground">{edge.id}</p>
              <p className="mt-1.5 text-[13px] font-medium leading-relaxed">{edge.scenario}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {edge.expectedBehaviour}
              </p>
            </div>
          ))}
        </div>
      </Block>
    </div>
  );
}

function Block({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h4 className="flex items-center gap-2 text-[13px] font-semibold">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h4>
      <div className="overflow-hidden rounded-lg border border-border">{children}</div>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold tabular-nums">{value}</p>
        <p className="truncate text-[13px] text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
