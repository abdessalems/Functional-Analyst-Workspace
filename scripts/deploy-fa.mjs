/**
 * Build the workspace and copy it into the portfolio, ready to push.
 *
 *   npm run deploy:fa
 *
 * Two mistakes this removes. The export output directory moved when the build
 * stopped sharing `.next` with the dev server, and copying by hand meant
 * remembering which directory was current. And there are two clones of the
 * portfolio on this machine — copying into the stale one silently produces a
 * deploy that never reaches the site, so the target is checked before writing.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BASE_PATH = "/fa";
const TARGET =
  process.env.PORTFOLIO_PATH ??
  "C:/Users/User/ghwork/Saadaoui-Personal-Portfolio-ReactJs-Template";

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true, env });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))));
  });
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const destination = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, destination);
    else fs.copyFileSync(source, destination);
  }
}

function countFiles(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return total;
}

// The portfolio must be a git repo with a public folder, or we are about to
// write 2 MB into the wrong place.
const publicDir = path.join(TARGET, "public");
if (!fs.existsSync(path.join(TARGET, ".git")) || !fs.existsSync(publicDir)) {
  console.error(`Not a portfolio checkout: ${TARGET}`);
  console.error("Set PORTFOLIO_PATH to the clone that is connected to GitHub.");
  process.exit(1);
}

await run("next", ["build"], {
  ...process.env,
  STATIC_EXPORT: "true",
  NEXT_PUBLIC_BASE_PATH: BASE_PATH,
});

const candidates = ["out", ".next-export"].map((dir) => path.resolve(dir));
const source = candidates.find(
  (dir) => fs.existsSync(dir) && fs.existsSync(path.join(dir, "index.html")),
);

if (!source) {
  console.error("No export found. Looked in: " + candidates.join(", "));
  process.exit(1);
}

const destination = path.join(publicDir, "fa");
fs.rmSync(destination, { recursive: true, force: true });
copyDir(source, destination);

const html = fs.readFileSync(path.join(destination, "index.html"), "utf8");
if (!html.includes(`${BASE_PATH}/_next/`)) {
  console.error(`Base path ${BASE_PATH} missing from the export — assets would 404.`);
  process.exit(1);
}

console.log(`\nCopied ${countFiles(destination)} files from ${path.basename(source)} to ${destination}`);
console.log("Base path verified. Now commit and push the portfolio:\n");
console.log(`  cd ${TARGET}`);
console.log("  git add public/fa && git commit -m \"Update workspace\" && git push origin main");
