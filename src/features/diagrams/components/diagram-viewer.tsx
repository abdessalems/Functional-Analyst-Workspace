"use client";

import * as React from "react";
import { Loader2, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePlantUmlUrl } from "@/features/diagrams/components/plantuml-image";

/**
 * Full-screen viewer for a rendered model.
 *
 * A sequence diagram of any real length is unreadable at page width, and the
 * usual answer — open the image in a new tab — loses the title, the version and
 * the requirements it covers. So the diagram opens in place, over the page, and
 * keeps its context alongside it.
 *
 * Zoom is by scroll or by button, panning is by drag, and Escape closes. The
 * transform is held in state rather than driven by CSS alone so that the reset
 * button has something to reset.
 */

const MIN_SCALE = 0.25;
const MAX_SCALE = 6;
const STEP = 0.25;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

const clamp = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

export function DiagramViewer({
  source,
  title,
  subtitle,
  onClose,
}: {
  source: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  const url = usePlantUmlUrl(source);
  const [transform, setTransform] = React.useState<Transform>(IDENTITY);
  const [dragging, setDragging] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const origin = React.useRef({ x: 0, y: 0 });

  // Escape closes, and the page behind must not scroll while this is open.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "0") setTransform(IDENTITY);
      if (event.key === "+" || event.key === "=") {
        setTransform((t) => ({ ...t, scale: clamp(t.scale + STEP) }));
      }
      if (event.key === "-") setTransform((t) => ({ ...t, scale: clamp(t.scale - STEP) }));
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /* Zooming towards the pointer keeps whatever is under the cursor under it. */
  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left - rect.width / 2;
    const pointerY = event.clientY - rect.top - rect.height / 2;

    setTransform((current) => {
      const next = clamp(current.scale * (event.deltaY < 0 ? 1.12 : 1 / 1.12));
      const ratio = next / current.scale;
      return {
        scale: next,
        x: pointerX - (pointerX - current.x) * ratio,
        y: pointerY - (pointerY - current.y) * ratio,
      };
    });
  };

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = { x: event.clientX - transform.x, y: event.clientY - transform.y };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    setTransform((current) => ({
      ...current,
      x: event.clientX - origin.current.x,
      y: event.clientY - origin.current.y,
    }));
  };

  const zoom = (delta: number) =>
    setTransform((current) => ({ ...current, scale: clamp(current.scale + delta) }));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => zoom(-STEP)} aria-label="Zoom out">
            <Minus />
          </Button>
          <span className="w-12 text-center font-mono text-xs tabular-nums text-muted-foreground">
            {Math.round(transform.scale * 100)}%
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => zoom(STEP)} aria-label="Zoom in">
            <Plus />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTransform(IDENTITY)}
            aria-label="Reset the view"
          >
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close the viewer">
            <X />
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "relative min-h-0 flex-1 touch-none overflow-hidden",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => setTransform(IDENTITY)}
      >
        {(!url || !loaded) && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Rendering diagram…
          </span>
        )}

        {url && (
          <div className="flex size-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={title}
              draggable={false}
              onLoad={() => setLoaded(true)}
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              }}
              className={cn(
                "max-w-none select-none rounded bg-white p-4 shadow-xl",
                // No transition while dragging, or the image lags the pointer.
                dragging ? "" : "transition-transform duration-150",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        Scroll to zoom · drag to move · double-click or <kbd>0</kbd> to reset ·{" "}
        <kbd>Esc</kbd> to close
      </footer>
    </div>
  );
}

/** Wraps a rendered diagram so that clicking it opens the viewer. */
export function ZoomableDiagram({
  source,
  title,
  subtitle,
  children,
}: {
  source: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="group relative">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in text-left"
          aria-label={`Open ${title} full screen`}
        >
          {children}
        </button>

        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3.5" /> Click to enlarge
        </span>
      </div>

      {open && (
        <DiagramViewer
          source={source}
          title={title}
          subtitle={subtitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
