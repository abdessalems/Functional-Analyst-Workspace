"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useWorkspace } from "@/components/providers/workspace-provider";

/**
 * Puts the open project in the address bar.
 *
 * Every artefact page — /requirements, /process-flow, /traceability — showed
 * whichever project happened to be open in that browser, so a URL identified a
 * page but never a project. Nobody could send someone a link to the AS-IS
 * process flow; they had to send a link and an instruction.
 *
 * The id travels as `?project=PRJ-TAX-001`, which keeps every route statically
 * exported: a path segment would mean pre-rendering every project against every
 * page, and a new project could then only reach the web through a rebuild.
 *
 * `useSearchParams` opts a route out of prerendering, so the read lives in a
 * leaf behind its own Suspense boundary — the same arrangement the highlight
 * deep link uses. The page still prerenders with real content; only this
 * null-rendering reader resolves on the client.
 */
export function ProjectUrl() {
  return (
    <React.Suspense fallback={null}>
      <ProjectUrlSync />
    </React.Suspense>
  );
}

function ProjectUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { project, projects, isProjectOpen, openProject } = useWorkspace();

  const requested = searchParams.get("project");

  // A link that names a project opens it, so the page a visitor lands on is the
  // page the sender meant. An unknown id is ignored rather than obeyed.
  React.useEffect(() => {
    if (!requested || requested === project.id) return;
    if (!projects.some((item) => item.id === requested)) return;
    openProject(requested);
  }, [requested, project.id, projects, openProject]);

  // Switching project rewrites the address, so the link in the bar is always
  // the link to what is on screen. `replace` keeps the back button meaning
  // "the previous page" rather than "the previous project".
  React.useEffect(() => {
    if (!isProjectOpen || requested === project.id) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("project", project.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isProjectOpen, project.id, requested, pathname, router, searchParams]);

  return null;
}
