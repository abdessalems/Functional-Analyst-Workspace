"use client";

import * as React from "react";
import { Download, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDownload } from "@/hooks/use-download";

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.6;

interface DiagramViewerProps {
  title: string;
  /** File name used by the SVG export, without extension. */
  exportName: string;
  children: React.ReactNode;
  className?: string;
  frameClassName?: string;
  toolbarExtras?: React.ReactNode;
}

/**
 * Zoomable frame for the workspace's SVG models (BPMN, UML, wireframes).
 * Export serialises the live SVG node, so what is downloaded is what is shown.
 */
export function DiagramViewer({
  title,
  exportName,
  children,
  className,
  frameClassName,
  toolbarExtras,
}: DiagramViewerProps) {
  const [zoom, setZoom] = React.useState(1);
  const [fullscreen, setFullscreen] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const download = useDownload();

  const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, +(value + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, +(value - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => setZoom(1);

  const exportSvg = React.useCallback(() => {
    const svg = frameRef.current?.querySelector("svg");
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const markup = `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`;
    download(markup, `${exportName}.svg`, "image/svg+xml");
  }, [download, exportName]);

  const toolbar = (
    <div className="flex items-center gap-1">
      {toolbarExtras}
      <div className="flex items-center rounded-md border border-border bg-surface">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={zoomOut} aria-label="Zoom out">
              <Minus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>
        <span className="w-12 select-none text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={zoomIn} aria-label="Zoom in">
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={resetZoom} aria-label="Reset zoom">
              <RotateCcw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to 100%</TooltipContent>
        </Tooltip>
      </div>

      <Button variant="outline" size="sm" onClick={exportSvg}>
        <Download /> SVG
      </Button>
      <Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
        <Maximize2 /> Full screen
      </Button>
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] font-medium">{title}</p>
        {toolbar}
      </div>

      <div
        ref={frameRef}
        className={cn(
          "app-scrollbar overflow-auto rounded-lg border border-border bg-[hsl(var(--surface-muted))] p-6",
          frameClassName,
        )}
      >
        <div
          className="mx-auto origin-top transition-transform duration-150"
          style={{ transform: `scale(${zoom})`, width: "fit-content" }}
        >
          {children}
        </div>
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="h-[92dvh] max-w-[96vw]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="app-scrollbar flex-1 overflow-auto bg-[hsl(var(--surface-muted))] p-8">
            <div className="mx-auto w-fit">{children}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
