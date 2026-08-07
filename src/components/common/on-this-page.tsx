"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface JumpTarget {
  id: string;
  label: string;
  count?: number;
}

/**
 * Jump links for the pages long enough to get lost in — a specification of
 * seven sections, twenty-six endpoints, thirty-nine test cases. Scrolling is
 * fine for finding something you have already seen; it is a poor way to find
 * something you have not.
 */
export function OnThisPage({
  targets,
  className,
}: {
  targets: JumpTarget[];
  className?: string;
}) {
  const [active, setActive] = React.useState<string | null>(targets[0]?.id ?? null);

  React.useEffect(() => {
    const elements = targets
      .map((target) => document.getElementById(target.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // Bias towards the top of the viewport so the highlight follows reading.
      { rootMargin: "-72px 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [targets]);

  if (targets.length < 3) return null;

  return (
    <nav
      aria-label="On this page"
      className={cn("hidden xl:block", className)}
    >
      <div className="sticky top-20 space-y-2">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <ul className="space-y-0.5 border-l border-border">
          {targets.map((target) => (
            <li key={target.id}>
              <a
                href={`#${target.id}`}
                className={cn(
                  "-ml-px flex items-center gap-2 border-l-2 px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active === target.id
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{target.label}</span>
                {target.count !== undefined && (
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {target.count}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
