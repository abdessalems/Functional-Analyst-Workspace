"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterDefinition {
  key: string;
  label: string;
  value: string;
  options: string[];
  /** Label used for the "no filter" option. Defaults to `All <label>`. */
  allLabel?: string;
}

interface FilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterDefinition[];
  onFilterChange?: (key: string, value: string) => void;
  onReset?: () => void;
  isFiltered?: boolean;
  resultCount?: number;
  totalCount?: number;
  actions?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  query,
  onQueryChange,
  placeholder = "Search…",
  filters = [],
  onFilterChange,
  onReset,
  isFiltered,
  resultCount,
  totalCount,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-8 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filter.value}
            onValueChange={(value) => onFilterChange?.(filter.key, value)}
          >
            <SelectTrigger className="h-9 w-auto min-w-[9.5rem] gap-2" aria-label={filter.label}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.allLabel ?? `All ${filter.label}`}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {isFiltered && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X /> Clear
          </Button>
        )}

        {typeof resultCount === "number" && (
          <span className="whitespace-nowrap px-1 text-sm text-muted-foreground">
            {resultCount}
            {typeof totalCount === "number" && ` of ${totalCount}`} shown
          </span>
        )}

        {actions}
      </div>
    </div>
  );
}
