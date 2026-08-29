import * as React from "react";

import { cn } from "@/lib/utils";
import { PlainLanguageNote, SectionEyebrow, SectionRule } from "@/components/common/reading-nav";
import { BrandMarks, type BrandName } from "@/components/common/brand-mark";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Small labelled facts rendered under the title (owner, version, last updated…). */
  meta?: { label: string; value: React.ReactNode }[];
  actions?: React.ReactNode;
  /** Vendor marks for the formats this page’s artefacts are written in. */
  brands?: BrandName[];
  className?: string;
}

export function PageHeader({ title, description, meta, actions, brands, className }: PageHeaderProps) {
  return (
    <div className={cn("relative flex flex-col gap-4 pb-6", className)}>
      {/* A hairline in the colour of the section this page belongs to, so the
          sidebar grouping carries through into the page itself. */}
      <SectionRule />
      <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <SectionEyebrow className="mb-1" />
          <h1 className="text-heading font-semibold sm:text-display">{title}</h1>
          {description && (
            <p className="max-w-measure text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {/* Renders only for pages that are part of the reading path. */}
          <PlainLanguageNote className="mt-3 max-w-measure" />
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {(meta?.length || brands?.length) && (
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-3 text-sm">
          {meta?.map((entry) => (
            <div key={entry.label} className="flex items-center gap-1.5">
              <dt className="text-muted-foreground">{entry.label}</dt>
              <dd className="font-medium">{entry.value}</dd>
            </div>
          ))}
          {/*
            The tools this page's artefacts are actually written in. Sat beside
            the metadata rather than beside the title, because it is the same
            kind of fact — who owns it, when it changed, what it is written in.
          */}
          {brands && brands.length > 0 && (
            <BrandMarks names={brands} className="flex flex-wrap items-center gap-x-4 gap-y-1.5" />
          )}
        </dl>
      )}
    </div>
  );
}
