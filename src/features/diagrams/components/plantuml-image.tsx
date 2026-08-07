"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Renders a PlantUML model as an actual diagram.
 *
 * The public PlantUML server accepts the source hex-encoded behind `~h`, so the
 * picture is generated from the very same `.puml` text shown on the source tab
 * — the diagram can never drift from the model. If the server is unreachable
 * the component says so and the source tab remains the fallback.
 */
export function plantUmlUrl(source: string, format: "svg" | "png" = "svg"): string {
  const bytes = new TextEncoder().encode(source);
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return `https://www.plantuml.com/plantuml/${format}/~h${hex}`;
}

export function PlantUmlImage({
  source,
  alt,
  className,
}: {
  source: string;
  alt: string;
  className?: string;
}) {
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");
  const url = React.useMemo(() => plantUmlUrl(source), [source]);

  React.useEffect(() => setState("loading"), [url]);

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <AlertTriangle className="size-5 text-amber-500" />
        <p className="text-[13px] font-medium">Diagram could not be rendered</p>
        <p className="max-w-md text-[13px] text-muted-foreground">
          The PlantUML rendering service is unreachable. The model source is on the next tab and
          renders in any PlantUML tool.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative flex min-h-[10rem] items-center justify-center", className)}>
      {state === "loading" && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Rendering diagram…
        </span>
      )}
      {/* A remote SVG, so next/image would add nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        loading="lazy"
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        className={cn(
          "max-w-none rounded bg-white p-3 transition-opacity",
          state === "ready" ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
