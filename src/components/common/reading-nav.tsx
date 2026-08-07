"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { getNeighbours, getReadingStep } from "@/config/reading-path";
import { findNavSection } from "@/config/navigation";
import { Card } from "@/components/ui/card";

/** A hairline in the colour of the section the current page belongs to. */
export function SectionRule() {
  const pathname = usePathname();
  const section = findNavSection(pathname);
  const colour = section?.accent ?? "hsl(var(--primary))";

  return (
    <span
      aria-hidden
      className="absolute -top-1 left-0 h-px w-full"
      style={{
        backgroundImage: `linear-gradient(90deg, ${colour}, ${colour} 6rem, transparent 62%)`,
        opacity: 0.75,
      }}
    />
  );
}

/**
 * How far through the fifteen steps the reader is. A walkthrough that shows its
 * own length is one people finish.
 */
export function ReadingProgress() {
  const pathname = usePathname();
  const { position } = getNeighbours(pathname);
  const section = findNavSection(pathname);
  if (!position) return null;

  const percent = Math.round((position.step / position.total) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
        <span className="uppercase tracking-wide">{section?.label ?? "Analysis"}</span>
        <span className="tabular-nums">
          Step {position.step} of {position.total}
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={position.step}
        aria-valuemin={1}
        aria-valuemax={position.total}
        aria-label="Progress through the analysis process"
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%`, backgroundColor: section?.accent ?? "hsl(var(--primary))" }}
        />
      </div>
    </div>
  );
}

/**
 * One sentence explaining what this page is, in plain language. Placed under
 * the page title so a reader who has never seen an acceptance criterion still
 * knows what they are looking at.
 */
export function PlainLanguageNote({ className }: { className?: string }) {
  const pathname = usePathname();
  const step = getReadingStep(pathname);
  if (!step) return null;

  return (
    <Card
      className={cn(
        "flex items-start gap-2.5 border-primary/20 bg-primary/[0.04] p-3.5",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="text-sm leading-relaxed">{step.plainLanguage}</p>
    </Card>
  );
}

/**
 * Previous and next step in the analysis story. Turns a flat menu into a path
 * a visitor can follow end to end without touching the sidebar.
 */
export function ReadingNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { previous, next, position } = getNeighbours(pathname);
  if (!position) return null;

  return (
    <nav
      aria-label="Analysis process navigation"
      className={cn("flex flex-col gap-3 border-t border-border pt-5 sm:flex-row", className)}
    >
      {previous ? (
        <Link
          href={previous.href}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
              Previous
            </span>
            <span className="block truncate text-sm font-medium">{previous.label}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}

      <span className="flex shrink-0 items-center justify-center px-2 text-xs tabular-nums text-muted-foreground">
        Step {position.step} of {position.total}
      </span>

      {next ? (
        <Link
          href={next.href}
          className="group flex min-w-0 flex-1 items-center justify-end gap-3 rounded-xl border border-primary/30 bg-primary/[0.05] p-3.5 text-right transition-colors hover:border-primary/50 hover:bg-primary/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
              Next
            </span>
            <span className="block truncate text-sm font-medium">{next.label}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
    </nav>
  );
}
