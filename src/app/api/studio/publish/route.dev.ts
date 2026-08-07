import { readFile, writeFile } from "node:fs/promises";
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
}

function bad(message: string, status = 400) {
  return Response.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return bad("Publishing is only available on a development machine.", 403);
  }

  const body = (await request.json()) as Partial<PublishRequest>;
  const { fileName, exportName, bundleSource, projectSource, projectId } = body;

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
