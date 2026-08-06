"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";

export default function NotFound() {
  return (
    <div>
      <PageHeader
        title="Page not found"
        description="The workspace section you requested does not exist, or you do not have access to it."
      />
      <EmptyState
        icon={FileQuestion}
        title="Nothing here"
        description="Check the address, or use global search (Ctrl K) to find the artefact you were looking for."
        action={
          <Button size="sm" asChild>
            <Link href="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
