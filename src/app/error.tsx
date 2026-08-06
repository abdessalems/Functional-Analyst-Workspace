"use client";

import * as React from "react";

import { ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // In the real workspace this reports to the bank's front-end telemetry sink.
    console.error("Workspace page error", error);
  }, [error]);

  return (
    <div>
      <PageHeader
        title="This page could not be displayed"
        description="The artefact you requested failed to load. No data has been changed."
      />
      <ErrorState
        title="Unable to load this workspace page"
        description={
          error.digest
            ? `Quote reference ${error.digest} when contacting the workspace administrator.`
            : "Retry the page. If the problem persists, contact the workspace administrator."
        }
        onRetry={reset}
      />
    </div>
  );
}
