"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  ClipboardCheck,
  Database,
  FileCode2,
  FileText,
  ListChecks,
  Search,
  ShieldCheck,
  SquareArrowOutUpRight,
  Users,
} from "lucide-react";

import type { SearchEntityType } from "@/lib/types";
import { buildSearchIndex, searchWorkspace } from "@/data/search-index";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { getProjectBundle } from "@/data/workspaces";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const TYPE_ICON: Record<SearchEntityType, React.ComponentType<{ className?: string }>> = {
  Requirement: ListChecks,
  "Business Rule": ShieldCheck,
  Actor: Users,
  API: FileCode2,
  "Test Case": ClipboardCheck,
  Document: FileText,
  SQL: Database,
  Diagram: Boxes,
  Page: SquareArrowOutUpRight,
};

/** Order groups the way an analyst scans results, not alphabetically. */
const GROUP_ORDER: SearchEntityType[] = [
  "Requirement",
  "Business Rule",
  "Test Case",
  "API",
  "SQL",
  "Document",
  "Diagram",
  "Actor",
  "Page",
];

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const { projects, project, drafts } = useWorkspace();

  /*
   * The whole portfolio, not just the project in hand. A palette that could only
   * find the open project made four projects in five invisible, and on the
   * landing page it searched whichever one had been open last.
   */
  const index = React.useMemo(
    () =>
      projects.flatMap((item) => {
        const bundle =
          drafts.find((draft) => draft.project.id === item.id)?.bundle ?? getProjectBundle(item.id);
        return buildSearchIndex(bundle, item);
      }),
    [projects, drafts],
  );

  const results = React.useMemo(
    () => searchWorkspace(index, query, 40, project.code),
    [index, query, project.code],
  );

  const grouped = React.useMemo(() => {
    return GROUP_ORDER.map((type) => ({
      type,
      records: results.filter((record) => record.type === type),
    })).filter((group) => group.records.length > 0);
  }, [results]);

  const onSelect = React.useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-full justify-start gap-2 px-2.5 font-normal text-muted-foreground md:w-72 lg:w-96"
      >
        <Search className="shrink-0" />
        <span className="truncate text-sm">Search requirements, rules, APIs…</span>
        <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-micro font-medium md:inline-flex">
          Ctrl K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search across requirements, rules, actors, APIs, SQL, tests and documents…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.trim() === "" ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Start typing to search the workspace. Try{" "}
              <span className="font-mono text-xs text-foreground">REQ-005</span>,{" "}
              <span className="font-mono text-xs text-foreground">sanctions</span> or{" "}
              <span className="font-mono text-xs text-foreground">recall</span>.
            </div>
          ) : (
            <CommandEmpty>No artefacts match “{query}”.</CommandEmpty>
          )}

          {grouped.map((group) => {
            const Icon = TYPE_ICON[group.type];
            return (
              <CommandGroup key={group.type} heading={`${group.type} (${group.records.length})`}>
                {group.records.map((record) => (
                  <CommandItem
                    /* Ids repeat across projects — every analysis numbers its
                       requirements from BR-001 — so the key carries the project. */
                    key={`${record.projectCode ?? ""}-${record.id}`}
                    value={`${record.id} ${record.title} ${record.subtitle} ${record.projectName ?? ""}`}
                    onSelect={() => onSelect(record.href)}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{record.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {record.subtitle}
                      </span>
                    </span>
                    {/* Which project this belongs to: without it a result from
                        another project looks like one from this one. */}
                    {record.projectCode && (
                      <span className="ml-auto shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-micro text-muted-foreground">
                        {record.projectCode}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}
