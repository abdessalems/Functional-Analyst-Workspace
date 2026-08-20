import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { SwaggerView } from "@/features/api-docs/components/swagger-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/swagger-api",
  title: "API Contracts",
  description:
    "Interface contracts endpoint by endpoint: request and response schemas, status codes, error handling and the requirements each endpoint serves.",
});

export default function SwaggerApiPage() {
  return (
    <ProjectScope>
      <SwaggerView />
    </ProjectScope>
  );
}
