"use client";

import * as React from "react";
import { Check, Copy, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { highlightJson, highlightPlantUml, highlightSql } from "@/lib/highlight";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useDownload } from "@/hooks/use-download";

type Language = "sql" | "json" | "plantuml" | "text";

interface CodeBlockProps {
  code: string;
  language?: Language;
  title?: string;
  /** File name offered when the download action is used. */
  downloadName?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeightClass?: string;
}

export function CodeBlock({
  code,
  language = "text",
  title,
  downloadName,
  showLineNumbers = false,
  className,
  maxHeightClass = "max-h-[28rem]",
}: CodeBlockProps) {
  const { copied, copy } = useCopyToClipboard();
  const download = useDownload();

  const highlighted = React.useMemo(() => {
    if (language === "sql") return highlightSql(code);
    if (language === "json") return highlightJson(code);
    if (language === "plantuml") return highlightPlantUml(code);
    return code;
  }, [code, language]);

  const lines = React.useMemo(() => code.split("\n").length, [code]);

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-surface-muted", className)}>
      {(title || downloadName) && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            {title && <span className="truncate text-sm font-medium">{title}</span>}
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
              {language}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="xs" onClick={() => copy(code)}>
              {copied ? <Check className="text-emerald-600" /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
            {downloadName && (
              <Button variant="ghost" size="xs" onClick={() => download(code, downloadName)}>
                <Download /> Download
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={cn("app-scrollbar overflow-auto", maxHeightClass)}>
        <pre className="flex min-w-full text-sm leading-[1.65]">
          {showLineNumbers && (
            <span
              aria-hidden
              className="sticky left-0 select-none border-r border-border bg-surface-muted px-3 py-3 text-right font-mono text-muted-foreground"
            >
              {Array.from({ length: lines }, (_, index) => (
                <span key={index} className="block">
                  {index + 1}
                </span>
              ))}
            </span>
          )}
          <code className="block flex-1 px-4 py-3 font-mono">{highlighted}</code>
        </pre>
      </div>

      {!title && !downloadName && (
        <div className="flex justify-end border-t border-border bg-surface px-2 py-1.5">
          <Button variant="ghost" size="xs" onClick={() => copy(code)}>
            {copied ? <Check className="text-emerald-600" /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}
