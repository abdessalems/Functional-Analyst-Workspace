import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { SqlValidationView } from "@/features/sql-validation/components/sql-validation-view";

export const metadata: Metadata = {
  title: "SQL Validation",
};

export default function SqlValidationPage() {
  return (
    <ProjectScope>
      <SqlValidationView />
    </ProjectScope>
  );
}
