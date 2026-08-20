import type { Metadata } from "next";

import { StudioView } from "@/features/studio/components/studio-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/studio",
  title: "Import Studio",
  description:
    "Import a project from a spreadsheet and watch the checks run: duplicate identifiers, references that resolve to nothing, orphan artefacts and requirement coverage.",
});

export default function StudioPage() {
  return <StudioView />;
}
