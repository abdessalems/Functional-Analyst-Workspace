import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { DocumentsView } from "@/features/documents/components/documents-view";

export const metadata: Metadata = {
  title: "Documents",
};

export default function DocumentsPage() {
  return (
    <ProjectScope>
      <DocumentsView />
    </ProjectScope>
  );
}
