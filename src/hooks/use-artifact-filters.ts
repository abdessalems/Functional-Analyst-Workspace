"use client";

import * as React from "react";

/**
 * Shared list-page behaviour: a free-text query, an arbitrary set of facet
 * filters, and the `?highlight=` deep link used by global search and the
 * traceability matrix.
 */
export function useArtifactFilters<T, F extends Record<string, string>>(options: {
  items: T[];
  initialFilters: F;
  /** Return true when the item should survive the current query and facets. */
  predicate: (item: T, query: string, filters: F) => boolean;
}) {
  const { items, initialFilters, predicate } = options;

  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<F>(initialFilters);

  // Keyed by string so the generic filter bar can drive any facet set.
  const setFilter = React.useCallback((key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const reset = React.useCallback(() => {
    setQuery("");
    setFilters(initialFilters);
  }, [initialFilters]);

  const isFiltered =
    query.trim() !== "" ||
    (Object.keys(filters) as (keyof F)[]).some((key) => filters[key] !== initialFilters[key]);

  const results = React.useMemo(
    () => items.filter((item) => predicate(item, query, filters)),
    [items, query, filters, predicate],
  );

  return { query, setQuery, filters, setFilter, reset, isFiltered, results };
}
