import type { Metadata } from "next";

import { ProjectScope } from "@/components/common/project-scope";
import { SwaggerView } from "@/features/api-docs/components/swagger-view";

export const metadata: Metadata = {
  title: "Swagger API",
};

export default function SwaggerApiPage() {
  return (
    <ProjectScope>
      <SwaggerView />
    </ProjectScope>
  );
}
