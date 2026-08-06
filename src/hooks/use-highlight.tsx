"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

/**
 * Deep-link highlighting (`?highlight=REQ-005`) used by global search and by
 * every cross-reference chip.
 *
 * `useSearchParams` forces a route out of static prerendering, so the read is
 * isolated in a leaf component behind its own Suspense boundary. The list page
 * itself still prerenders with real content; only this null-rendering reader is
 * resolved on the client.
 */
export function useHighlight() {
  const [highlight, setHighlight] = React.useState<string | null>(null);

  const marker = (
    <React.Suspense fallback={null}>
      <HighlightReader onResolve={setHighlight} />
    </React.Suspense>
  );

  return { highlight, marker };
}

function HighlightReader({ onResolve }: { onResolve: (id: string | null) => void }) {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");

  React.useEffect(() => {
    onResolve(highlight);
    if (!highlight) return;

    // The target may render a frame later; scroll once it exists.
    const frame = requestAnimationFrame(() => {
      document.getElementById(highlight)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [highlight, onResolve]);

  return null;
}
