"use client";

import * as React from "react";

/**
 * Client-side file export. The workspace has no backend, so exports are
 * generated from the in-memory artefact and streamed through a blob URL.
 */
export function useDownload() {
  return React.useCallback((content: string | Blob, filename: string, mimeType = "text/plain") => {
    const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Revoke on the next tick so Safari has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, []);
}

/** Serialises rows to CSV with correct quoting for exports from tables. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (value: string | number) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  return [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");
}
