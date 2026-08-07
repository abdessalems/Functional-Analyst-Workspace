import type { Metadata } from "next";

import { StudioView } from "@/features/studio/components/studio-view";

export const metadata: Metadata = {
  title: "Studio",
  // Not linked from the navigation and not worth indexing.
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <StudioView />;
}
