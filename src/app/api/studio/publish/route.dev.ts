import { readFile, rm, writeFile } from "node:fs/promises";
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
  /** Required to delete; checked against STUDIO_DELETE_PASSWORD. */
  password: string;
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

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return bad("Publishing is only available on a development machine.", 403);
  }

  const body = (await request.json()) as Partial<PublishRequest>;
  const { fileName, exportName, bundleSource, projectSource, projectId, password } = body;

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
    if (!register.includes(`id: "${projectId}"`)) {
      // Anchored on the declaration, not on the file's last "];" — anything
      // added below the register would otherwise capture the insert.
      const declaration = register.indexOf("export const projects: Project[] = [");
      const closing = declaration === -1 ? -1 : register.indexOf("\n];", declaration);
      if (closing === -1) {
        return bad("Could not find the end of the projects list — add the project by hand.", 500);
      }
      const updated = `${register.slice(0, closing)}\n${projectSource}${register.slice(closing)}`;
      await writeFile(REGISTER, updated, "utf8");
      written.push(path.relative(ROOT, REGISTER));
    }

    return Response.json({ ok: true, written });
  } catch (cause) {
    return bad(cause instanceof Error ? cause.message : "The files could not be written.", 500);
  }
}
