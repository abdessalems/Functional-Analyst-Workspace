import { execFile } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

/**
 * Writes an imported project into the source tree — the step that turns a draft
 * held in one browser into a project the site will serve to everyone.
 *
 * This route exists only on a developer's machine: `pageExtensions` excludes
 * `.dev.ts` from the static export, so the published site has no server side.
 * It refuses to run outside development as a second lock, because a route that
 * writes source files must never be reachable from anywhere else.
 */

const ROOT = process.cwd();
const BUNDLE_DIR = path.join(ROOT, "src", "data", "workspaces");
const REGISTRY = path.join(BUNDLE_DIR, "index.ts");
const REGISTER = path.join(ROOT, "src", "data", "projects.ts");

interface PublishRequest {
  fileName: string;
  exportName: string;
  bundleSource: string;
  projectSource: string;
  projectId: string;
  /** Checked against STUDIO_PASSWORD. */
  password: string;
  /** Used in the commit message, so the history reads like a changelog. */
  projectName?: string;
}

function bad(message: string, status = 400) {
  return Response.json({ ok: false, message }, { status });
}

/**
 * Removes a published project: its bundle file, its registry lines and its
 * entry in the register. Only entries the studio generated can be removed —
 * they are JSON-shaped, so their extent can be found by matching braces. A
 * hand-written project is left alone and reported, rather than half-deleted.
 */
export async function DELETE(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return bad("Deleting is only available on a development machine.", 403);
  }

  const { projectId, fileName, exportName, password } = (await
    request.json()) as Partial<PublishRequest>;

  // The same password that opened the studio, sent back with the request —
  // one password for the whole tool, checked here where it cannot be read.
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) {
    return bad("No STUDIO_PASSWORD is set. Add one to .env.local and restart the dev server.", 403);
  }
  if (password !== expected) {
    return bad("Wrong password.", 401);
  }

  if (!projectId || !fileName || !exportName) {
    return bad("The request is missing a field.");
  }
  if (!/^[a-z0-9-]+$/.test(fileName)) {
    return bad(`"${fileName}" is not a usable file name.`);
  }

  const removed: string[] = [];

  try {
    // 1 — the register entry, found by brace matching from its "id" line.
    const register = await readFile(REGISTER, "utf8");
    const idAt = register.indexOf(`"id": "${projectId}"`);
    if (idAt !== -1) {
      const start = register.lastIndexOf("{", idAt);
      let depth = 0;
      let end = -1;
      for (let i = start; i < register.length; i += 1) {
        if (register[i] === "{") depth += 1;
        else if (register[i] === "}") {
          depth -= 1;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
      if (end === -1) {
        return bad("Could not find the end of that project's entry — remove it by hand.", 500);
      }
      const after = register[end] === "," ? end + 1 : end;
      const updated = register.slice(0, start).replace(/[ \t]*$/, "") + register.slice(after);
      await writeFile(REGISTER, updated.replace(/\n{3,}/g, "\n\n"), "utf8");
      removed.push(path.relative(ROOT, REGISTER));
    } else if (register.includes(`id: "${projectId}"`)) {
      return bad(
        `${projectId} was written by hand, not by the studio. Remove it from projects.ts yourself.`,
      );
    }

    // 2 — the registry: the import line and the entry in the BUNDLES array.
    const registry = await readFile(REGISTRY, "utf8");
    const withoutImport = registry.replace(
      new RegExp(`^import \\{ ${exportName} \\} from "@/data/workspaces/${fileName}";\\n`, "m"),
      "",
    );
    const updatedRegistry = withoutImport.replace(
      new RegExp(`(,\\s*)?\\b${exportName}\\b(\\s*,)?`),
      (match, before: string | undefined, afterComma: string | undefined) =>
        before && afterComma ? "," : "",
    );
    if (updatedRegistry !== registry) {
      await writeFile(REGISTRY, updatedRegistry, "utf8");
      removed.push(path.relative(ROOT, REGISTRY));
    }

    // 3 — the bundle itself.
    const bundlePath = path.join(BUNDLE_DIR, `${fileName}.ts`);
    try {
      await rm(bundlePath);
      removed.push(path.relative(ROOT, bundlePath));
    } catch {
      // Already gone; the registry cleanup above was the part that mattered.
    }

    return Response.json({ ok: true, removed });
  } catch (cause) {
    return bad(cause instanceof Error ? cause.message : "The files could not be changed.", 500);
  }
}


/**
 * Commits the files publishing just wrote.
 *
 * Only those paths are staged, never everything, so whatever else is in
 * progress in the working tree is left alone. Pushing is deliberately not done
 * here: it needs credentials and a network, and a failed push halfway through a
 * publish is far more confusing than a commit sitting locally.
 *
 * A failure to commit is reported, not thrown: the files are already written and
 * correct, and committing by hand is a one-liner.
 */
async function commitFiles(paths: string[], message: string) {
  const run = promisify(execFile);

  try {
    await run("git", ["add", "--", ...paths], { cwd: ROOT });

    // Nothing staged means the publish changed nothing — not an error.
    const { stdout: staged } = await run("git", ["diff", "--cached", "--name-only"], {
      cwd: ROOT,
    });
    if (!staged.trim()) return { committed: null as string | null };

    await run("git", ["commit", "-m", message], { cwd: ROOT });
    const { stdout: hash } = await run("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT });

    return { committed: hash.trim() };
  } catch (cause) {
    return {
      committed: null as string | null,
      commitError: cause instanceof Error ? cause.message.split(String.fromCharCode(10))[0] : "git failed",
    };
  }
}

/**
 * Locates a project inside the register.
 *
 * A generated record writes `"id": "X"`, a hand-written one `id: "X"` — the two
 * look alike but do not match as substrings, which is how publishing the same
 * project three times appended it three times.
 *
 * Returns the entry's extent so it can be replaced, "handwritten" for an entry
 * this route must not touch, or null when the project is new.
 */
function findRecord(
  register: string,
  projectId: string,
): { start: number; end: number } | "handwritten" | null {
  const generated = register.indexOf(`"id": "${projectId}"`);
  if (generated === -1) {
    return register.includes(`id: "${projectId}"`) ? "handwritten" : null;
  }

  const start = register.lastIndexOf("{", generated);
  let depth = 0;
  for (let i = start; i < register.length; i += 1) {
    if (register[i] === "{") depth += 1;
    else if (register[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        const end = register[i + 1] === "," ? i + 2 : i + 1;
        return { start, end };
      }
    }
  }
  return null;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return bad("Publishing is only available on a development machine.", 403);
  }

  const body = (await request.json()) as Partial<PublishRequest>;
  const { fileName, exportName, bundleSource, projectSource, projectId, password } = body;
  const projectName = typeof body.projectName === "string" ? body.projectName : projectId;

  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) {
    return bad("No STUDIO_PASSWORD is set. Add one to .env.local and restart the dev server.", 403);
  }
  if (password !== expected) {
    return bad("Wrong password.", 401);
  }

  if (!fileName || !exportName || !bundleSource || !projectSource || !projectId) {
    return bad("The request is missing a field.");
  }

  // The file name reaches the filesystem, so it may only be what it claims.
  if (!/^[a-z0-9-]+$/.test(fileName)) {
    return bad(`"${fileName}" is not a usable file name — lower case, digits and hyphens only.`);
  }
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(exportName)) {
    return bad(`"${exportName}" is not a usable export name.`);
  }


  const written: string[] = [];

  try {
    // 1 — the bundle itself.
    const bundlePath = path.join(BUNDLE_DIR, `${fileName}.ts`);
    await writeFile(bundlePath, bundleSource, "utf8");
    written.push(path.relative(ROOT, bundlePath));

    // 2 — the registry, so the workspace can find it.
    const registry = await readFile(REGISTRY, "utf8");
    if (!registry.includes(`from "@/data/workspaces/${fileName}"`)) {
      const marker = "const BUNDLES: ProjectDataBundle[] = [";
      const closing = registry.indexOf("];", registry.indexOf(marker));
      if (!registry.includes(marker) || closing === -1) {
        return bad("Could not find the BUNDLES list in index.ts — add the project by hand.", 500);
      }

      const lastImport = registry.lastIndexOf('import { ', registry.indexOf(marker));
      const importEnd = registry.indexOf("\n", registry.indexOf(";", lastImport)) + 1;

      const withImport =
        registry.slice(0, importEnd) +
        `import { ${exportName} } from "@/data/workspaces/${fileName}";\n` +
        registry.slice(importEnd);

      const listStart = withImport.indexOf(marker) + marker.length;
      const listEnd = withImport.indexOf("]", listStart);
      const existing = withImport.slice(listStart, listEnd).trim();

      const updated =
        withImport.slice(0, listStart) +
        (existing ? `${existing}, ${exportName}` : exportName) +
        withImport.slice(listEnd);

      await writeFile(REGISTRY, updated, "utf8");
      written.push(path.relative(ROOT, REGISTRY));
    }

    // 3 — the project register, so it appears in the portfolio.
    const register = await readFile(REGISTER, "utf8");
    const declaration = register.indexOf("export const projects: Project[] = [");
    // The array's own closing bracket, at the start of a line — anything added
    // below the register would otherwise capture the insert.
    const closing = declaration === -1 ? -1 : register.indexOf("\n];", declaration);
    if (closing === -1) {
      return bad("Could not find the end of the projects list — add the project by hand.", 500);
    }

    const existing = findRecord(register, projectId);
    if (existing === "handwritten") {
      return bad(
        `${projectId} already exists and was written by hand. Give the project a different id, or remove that entry yourself.`,
      );
    }

    // Publishing the same project again replaces its entry rather than adding
    // a second one — correcting a spreadsheet and re-publishing is normal, and
    // appending would leave two projects sharing an id.
    const updated =
      existing === null
        ? `${register.slice(0, closing)}
${projectSource}${register.slice(closing)}`
        : register.slice(0, existing.start) + projectSource.replace(/^s+/, "  ") + register.slice(existing.end);

    await writeFile(REGISTER, updated, "utf8");
    written.push(path.relative(ROOT, REGISTER));
    // Committing here is the point of the button: the analyst never opens a
    // terminal, and the history records the project rather than a file list.
    const git = await commitFiles(written, `Add ${projectName} to the workspace`);

    return Response.json({ ok: true, written, ...git });
  } catch (cause) {
    return bad(cause instanceof Error ? cause.message : "The files could not be written.", 500);
  }
}
