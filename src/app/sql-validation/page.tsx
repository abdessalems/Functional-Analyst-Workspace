import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { SqlValidationView } from "@/features/sql-validation/components/sql-validation-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/sql-validation",
  title: "SQL Validation",
  description:
    "Validation queries run against the delivered data, each with its result set and the analyst's reading of what the result proves or disproves.",
});

export default function SqlValidationPage() {
  return (
    <ProjectScope>
      <SqlValidationView />
    </ProjectScope>
  );
}
