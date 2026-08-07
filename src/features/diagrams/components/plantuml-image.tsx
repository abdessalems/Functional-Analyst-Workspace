"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Renders a PlantUML model as an actual diagram.
 *
 * The picture is generated from the very same `.puml` text shown on the source
 * tab, so it can never drift from the model. The source is deflated and encoded
 * in PlantUML's own base64 alphabet — hex encoding also works but produces URLs
 * the render server rejects for anything larger than a small diagram.
 */

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function encode6(byte: number): string {
  return ALPHABET.charAt(byte & 63);
}

function encode3(c1: number, c2: number, c3: number): string {
  return (
    encode6((c1 >> 2) & 63) +
    encode6(((c1 & 3) << 4) | ((c2 >> 4) & 15)) +
    encode6(((c2 & 15) << 2) | ((c3 >> 6) & 3)) +
    encode6(c3 & 63)
  );
}

function encodePlantUml(data: Uint8Array): string {
  let out = "";
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) out += encode3(data[i], data[i + 1], 0);
    else if (i + 1 === data.length) out += encode3(data[i], 0, 0);
    else out += encode3(data[i], data[i + 1], data[i + 2]);
  }
  return out;
}

async function deflate(source: string): Promise<Uint8Array> {
  const stream = new Blob([source], { type: "text/plain" })
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Hex encoding needs no compression, but only works for short sources. */
function hexUrl(source: string, format: string): string {
  const bytes = new TextEncoder().encode(source);
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return `https://www.plantuml.com/plantuml/${format}/~h${hex}`;
}

/** Resolves the render URL for a model. Null while it is still being computed. */
export function usePlantUmlUrl(source: string, format: "svg" | "png" = "svg"): string | null {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function build() {
      try {
        if (typeof CompressionStream === "undefined") throw new Error("no CompressionStream");
        const encoded = encodePlantUml(await deflate(source));
        if (!cancelled) setUrl(`https://www.plantuml.com/plantuml/${format}/${encoded}`);
      } catch {
        if (!cancelled) setUrl(hexUrl(source, format));
      }
    }

    setUrl(null);
    void build();
    return () => {
      cancelled = true;
    };
  }, [source, format]);

  return url;
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
  const url = usePlantUmlUrl(source);
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");

  React.useEffect(() => setState("loading"), [url]);

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <AlertTriangle className="size-5 text-amber-500" />
        <p className="text-sm font-medium">Diagram could not be rendered</p>
        <p className="max-w-md text-sm text-muted-foreground">
          The PlantUML rendering service is unreachable. The model source is on the next tab and
          renders in any PlantUML tool.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative flex min-h-[12rem] items-center justify-center", className)}>
      {(state === "loading" || !url) && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Rendering diagram…
        </span>
      )}
      {url && (
        // A remote SVG rendered from the model source; next/image would add nothing.
        // eslint-disable-next-line @next/next/no-img-element
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
      )}
    </div>
  );
}

/** Opens the model as a PNG in a new tab. */
export function PlantUmlPngLink({
  source,
  children,
  className,
}: {
  source: string;
  children: React.ReactNode;
  className?: string;
}) {
  const url = usePlantUmlUrl(source, "png");
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}
