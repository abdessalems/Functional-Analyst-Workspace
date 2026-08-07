"use client";

import * as React from "react";
import { ChevronDown, KeyRound, Link2 } from "lucide-react";

import type { ApiEndpoint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArtifactLinkList } from "@/components/common/artifact-link";
import { CodeBlock } from "@/components/common/code-block";
import { MethodBadge } from "@/components/common/status-badge";

const STATUS_TONE = (status: number) => {
  if (status < 300) return "success" as const;
  if (status < 400) return "info" as const;
  if (status < 500) return "warning" as const;
  return "danger" as const;
};

export function EndpointPanel({
  endpoint,
  basePath,
  defaultOpen = false,
  highlighted = false,
}: {
  endpoint: ApiEndpoint;
  basePath: string;
  defaultOpen?: boolean;
  highlighted?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen || highlighted);

  React.useEffect(() => {
    if (highlighted) setOpen(true);
  }, [highlighted]);

  const headers = endpoint.parameters.filter((parameter) => parameter.in === "header");
  const pathParams = endpoint.parameters.filter((parameter) => parameter.in !== "header");

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      id={endpoint.id}
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-lg border bg-surface",
        highlighted ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
      )}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <MethodBadge method={endpoint.method} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-sm font-medium">{endpoint.path}</span>
          <span className="block truncate text-xs text-muted-foreground">{endpoint.summary}</span>
        </span>
        <Badge variant="outline" className="hidden font-mono sm:inline-flex">
          {endpoint.id}
        </Badge>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-5 border-t border-border p-5">
          <div className="space-y-2">
            <p className="text-sm leading-relaxed">{endpoint.description}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <KeyRound className="size-3.5" />
                {endpoint.auth}
              </span>
              <span>
                Operation ID · <span className="font-mono">{endpoint.operationId}</span>
              </span>
              <span>Tag · {endpoint.tag}</span>
            </div>
            <div className="rounded-md border border-border bg-surface-muted px-3 py-2 font-mono text-[12px]">
              <span className="text-muted-foreground">{basePath}</span>
              <span className="font-semibold">{endpoint.path}</span>
            </div>
          </div>

          <Section title="Headers">
            <ParameterTable parameters={headers} />
          </Section>

          {pathParams.length > 0 && (
            <Section title="Path & query parameters">
              <ParameterTable parameters={pathParams} />
            </Section>
          )}

          {endpoint.requestBody && (
            <Section title="Request body">
              <CodeBlock
                code={endpoint.requestBody}
                language="json"
                title="application/json"
                maxHeightClass="max-h-96"
              />
            </Section>
          )}

          <Section title="Responses">
            <div className="space-y-3">
              {endpoint.responses.map((response) => (
                <div
                  key={response.status}
                  className="overflow-hidden rounded-md border border-border"
                >
                  <div className="flex items-center gap-2.5 bg-surface-muted px-3 py-2">
                    <Badge variant={STATUS_TONE(response.status)}>{response.status}</Badge>
                    <span className="text-sm">{response.description}</span>
                  </div>
                  {response.body && (
                    <CodeBlock
                      code={response.body}
                      language="json"
                      className="rounded-none border-0 border-t"
                      maxHeightClass="max-h-80"
                    />
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Traceability">
            <div className="flex flex-wrap items-center gap-2">
              <Link2 className="size-3.5 text-muted-foreground" />
              <ArtifactLinkList ids={endpoint.relatedRequirements} />
            </div>
          </Section>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

function ParameterTable({ parameters }: { parameters: ApiEndpoint["parameters"] }) {
  if (parameters.length === 0) {
    return <p className="text-sm text-muted-foreground">None</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-52">Name</TableHead>
            <TableHead className="w-24">In</TableHead>
            <TableHead className="w-36">Type</TableHead>
            <TableHead className="w-24">Required</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-56">Example</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parameters.map((parameter) => (
            <TableRow key={parameter.name}>
              <TableCell className="font-mono text-[12px]">{parameter.name}</TableCell>
              <TableCell className="text-sm">{parameter.in}</TableCell>
              <TableCell className="font-mono text-[12px] text-muted-foreground">
                {parameter.type}
              </TableCell>
              <TableCell>
                <Badge variant={parameter.required ? "danger" : "neutral"}>
                  {parameter.required ? "Required" : "Optional"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{parameter.description}</TableCell>
              <TableCell className="max-w-[16rem] truncate font-mono text-[11px] text-muted-foreground">
                {parameter.example}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
