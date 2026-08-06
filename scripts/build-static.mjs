/**
 * Cross-platform wrapper for the static export.
 *
 * Sets STATIC_EXPORT so next.config.mjs switches to `output: "export"`, then
 * runs the normal build. Produces ./out — a folder of plain HTML/CSS/JS that
 * can be dropped onto any web host.
 *
 *   node scripts/build-static.mjs                 → hosted at the domain root
 *   node scripts/build-static.mjs --base=/FA      → hosted at example.com/FA
 *
 * The base path must match the subfolder the site is served from, otherwise
 * CSS, JS and internal links resolve to the wrong URLs.
 */
import { spawn } from "node:child_process";

const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
const basePath = baseArg ? baseArg.slice("--base=".length) : (process.env.NEXT_PUBLIC_BASE_PATH ?? "");

if (basePath && !basePath.startsWith("/")) {
  console.error(`Base path must start with "/" — received "${basePath}"`);
  process.exit(1);
}

console.log(
  basePath
    ? `Building static export for base path ${basePath}`
    : "Building static export for the domain root",
);

const child = spawn("next", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, STATIC_EXPORT: "true", NEXT_PUBLIC_BASE_PATH: basePath },
});

child.on("exit", (code) => process.exit(code ?? 1));
