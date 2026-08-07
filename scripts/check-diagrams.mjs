/**
 * Renders every PlantUML model in the workspace against the render server and
 * reports any that fail. Run before shipping a diagram change:
 *
 *   node scripts/check-diagrams.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
const e6 = (b) => ALPHABET.charAt(b & 63);
const e3 = (a, b, c) =>
  e6((a >> 2) & 63) +
  e6(((a & 3) << 4) | ((b >> 4) & 15)) +
  e6(((b & 15) << 2) | ((c >> 6) & 3)) +
  e6(c & 63);

function encode(data) {
  let out = "";
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) out += e3(data[i], data[i + 1], 0);
    else if (i + 1 === data.length) out += e3(data[i], 0, 0);
    else out += e3(data[i], data[i + 1], data[i + 2]);
  }
  return out;
}

const url = (source) =>
  "https://www.plantuml.com/plantuml/svg/" +
  encode(zlib.deflateRawSync(Buffer.from(source, "utf8"), { level: 9 }));

const FILES = [
  "src/data/workspaces/europay-hub-models.ts",
  "src/data/diagrams.ts",
];

const models = [];
for (const file of FILES) {
  const full = path.resolve(file);
  if (!fs.existsSync(full)) continue;
  const raw = fs.readFileSync(full, "utf8");
  const re = /source: `([\s\S]*?)`,\r?\n/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    // The file stores template-literal escapes; \\ becomes a single backslash.
    const source = match[1].split("\\\\").join("\\");
    const name = (source.match(/@startuml\s+(\S+)/) || [, "(unnamed)"])[1];
    models.push({ file, name, source });
  }
}

console.log(`Checking ${models.length} models…\n`);

let failures = 0;
for (const model of models) {
  try {
    const response = await fetch(url(model.source));
    const body = await response.text();
    const broken = !response.ok || /syntax error|Error line/i.test(body);
    if (broken) {
      failures += 1;
      const detail = (body.match(/Error line \d+[^<]*/i) || [
        `HTTP ${response.status}`,
      ])[0];
      console.log(`FAIL  ${model.name.padEnd(34)} ${detail.trim()}`);
    } else {
      console.log(`ok    ${model.name.padEnd(34)} ${body.length} bytes`);
    }
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${model.name.padEnd(34)} ${error.message}`);
  }
}

console.log(`\n${models.length - failures} rendered, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
