import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { DocumentsView } from "@/features/documents/components/documents-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/documents",
  title: "Document Register",
  description:
    "Controlled document register: owner, version, approval status and distribution for every deliverable the project produced.",
});

export default function DocumentsPage() {
  return (
    <ProjectScope>
      <DocumentsView />
    </ProjectScope>
  );
}
