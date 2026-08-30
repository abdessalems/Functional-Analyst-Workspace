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
  const { project, projects, isProjectOpen, openProject, restored } = useWorkspace();

  const requested = searchParams.get("project");

  /*
   * The link wins on arrival; the selector wins from then on.
   *
   * Both directions ran as plain effects at first, and they fought: the reader
   * applied the id from the URL, the provider then restored the id from the last
   * visit — child effects run before their parent's — and finally the mirror
   * wrote that stale id back over the link. Following a link to the TO-BE
   * project landed on whichever project had been open before.
   *
   * So the reader waits for `restored`, applies the requested id exactly once,
   * and only after that does the mirror start writing.
   */
  const claimed = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!restored || claimed.current !== null) return;

    /*
     * A link may name the project by its id or by its code — PRJ-EVE-003 or
     * EVE-1.0. The code is the one written on the card and the one an analyst
     * says out loud, so a link built from it has to work.
     */
    const wanted = requested?.trim().toLowerCase();
    const match = wanted
      ? projects.find(
          (item) => item.id.toLowerCase() === wanted || item.code.toLowerCase() === wanted,
        )
      : undefined;

    // Claimed either way: an unknown id must not leave the mirror waiting.
    claimed.current = match ? match.id : "";

    if (match && match.id !== project.id) openProject(match.id);
  }, [restored, requested, projects, project.id, openProject]);

  React.useEffect(() => {
    if (!restored || claimed.current === null) return;
    if (!isProjectOpen) return;
    if (searchParams.get("project") === project.id) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("project", project.id);
    // `replace`, so the back button means "the previous page" rather than
    // "the previous project".
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [restored, isProjectOpen, project.id, pathname, router, searchParams]);

  return null;
}
