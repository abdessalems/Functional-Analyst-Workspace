import type { ProjectDataBundle } from "@/data/workspaces/types";

/**
 * Compares two projects' documentation sets.
 *
 * Artefacts are matched on what identifies them to a reader — an endpoint is
 * its method and path, an actor is its name — never on their id. Two analyses
 * of the same process both number their requirements from BR-001, so matching
 * on id would pair unrelated things and report every difference as a change.
 *
 * The consequence is stated on the page: renaming an artefact reads as one
 * removal and one addition. That is honest, and it is also usually true — a
 * requirement whose title changed is a requirement that changed.
 */

export type Side = "left" | "right" | "both" | "changed";

export interface ComparedItem {
  key: string;
  label: string;
  detail: string;
  side: Side;
  /** For a changed pair, what it was called on the other side. */
  counterpart?: string;
}

export interface ComparedSection {
  title: string;
  /** What identity was matched on, said plainly under the heading. */
  matchedOn: string;
  leftCount: number;
  rightCount: number;
  items: ComparedItem[];
}

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const NOISE = new Set([
  "a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "with", "via",
  "by", "from", "is", "be", "as", "at", "into", "per", "its", "it",
]);

const tokens = (value: string) =>
  new Set(normalise(value).split(" ").filter((word) => word && !NOISE.has(word)));

/** Share of words two labels have in common, ignoring filler. */
function similarity(a: string, b: string): number {
  const left = tokens(a);
  const right = tokens(b);
  if (left.size === 0 || right.size === 0) return 0;

  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  return shared / Math.min(left.size, right.size);
}

/**
 * A pair below this share of common words is two different artefacts; above it,
 * the same one reworded. "Submit a tax declaration" against "Submit a
 * declaration via REST API" shares two of three meaningful words — which is the
 * whole point of a TO-BE, and reporting it as one removal plus one addition
 * would hide the only interesting thing on the page.
 */
const SAME_THING = 0.6;

function compare(
  title: string,
  matchedOn: string,
  left: { key: string; label: string; detail: string }[],
  right: { key: string; label: string; detail: string }[],
): ComparedSection {
  const items: ComparedItem[] = [];
  const takenRight = new Set<number>();

  for (const item of left) {
    const exact = right.findIndex(
      (other, index) => !takenRight.has(index) && normalise(other.key) === normalise(item.key),
    );

    if (exact !== -1) {
      takenRight.add(exact);
      items.push({ ...item, side: "both" });
      continue;
    }

    // No exact match, so look for the same artefact under a new name.
    let bestIndex = -1;
    let bestScore = SAME_THING;
    right.forEach((other, index) => {
      if (takenRight.has(index)) return;
      const score = similarity(item.key, other.key);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestIndex !== -1) {
      takenRight.add(bestIndex);
      items.push({ ...item, side: "changed", counterpart: right[bestIndex].label });
    } else {
      items.push({ ...item, side: "left" });
    }
  }

  right.forEach((item, index) => {
    if (!takenRight.has(index)) items.push({ ...item, side: "right" });
  });

  // Differences first: what changed is the reason anyone opened the page.
  const order: Record<Side, number> = { changed: 0, right: 1, left: 2, both: 3 };
  items.sort((a, b) => order[a.side] - order[b.side] || a.label.localeCompare(b.label));

  return { title, matchedOn, leftCount: left.length, rightCount: right.length, items };
}

export function compareBundles(left: ProjectDataBundle, right: ProjectDataBundle): ComparedSection[] {
  const endpoints = (bundle: ProjectDataBundle) =>
    bundle.apiServices.flatMap((service) =>
      service.endpoints.map((endpoint) => ({
        key: `${endpoint.method} ${endpoint.path}`,
        label: `${endpoint.method} ${endpoint.path}`,
        detail: endpoint.summary,
      })),
    );

  const steps = (bundle: ProjectDataBundle) =>
    bundle.processFlows.flatMap((flow) =>
      flow.steps.map((step) => ({
        key: step.name,
        label: step.name,
        detail: `${step.lane} · ${step.type}`,
      })),
    );

  return [
    compare(
      "Requirements",
      "requirement title",
      left.requirements.map((r) => ({ key: r.title, label: r.title, detail: `${r.id} · ${r.priority}` })),
      right.requirements.map((r) => ({ key: r.title, label: r.title, detail: `${r.id} · ${r.priority}` })),
    ),
    compare(
      "Business rules",
      "rule description",
      left.businessRules.map((r) => ({ key: r.description, label: r.description, detail: `${r.id} · ${r.source}` })),
      right.businessRules.map((r) => ({ key: r.description, label: r.description, detail: `${r.id} · ${r.source}` })),
    ),
    compare(
      "Actors",
      "actor name",
      left.actors.map((a) => ({ key: a.name, label: a.name, detail: `${a.type} · ${a.channel}` })),
      right.actors.map((a) => ({ key: a.name, label: a.name, detail: `${a.type} · ${a.channel}` })),
    ),
    compare("Interfaces", "method and path", endpoints(left), endpoints(right)),
    compare("Process steps", "step name", steps(left), steps(right)),
    compare(
      "Test cases",
      "scenario",
      left.testCases.map((t) => ({ key: t.scenario, label: t.scenario, detail: `${t.id} · ${t.status}` })),
      right.testCases.map((t) => ({ key: t.scenario, label: t.scenario, detail: `${t.id} · ${t.status}` })),
    ),
  ];
}

export function tally(section: ComparedSection) {
  const count = (side: Side) => section.items.filter((item) => item.side === side).length;
  return {
    both: count("both"),
    changed: count("changed"),
    onlyLeft: count("left"),
    onlyRight: count("right"),
  };
}
