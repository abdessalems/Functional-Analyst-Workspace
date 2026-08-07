/**
 * The reading path through the workspace.
 *
 * Two problems this solves. First, every page assumed the reader already knows
 * what a business rule or an acceptance criterion is — `plainLanguage` says it
 * in one sentence, without jargon. Second, the pages were a flat menu with no
 * order, so a visitor had to invent their own route; `READING_PATH` gives each
 * page a next and previous step, and the whole story can be read by pressing
 * Next.
 */
export interface ReadingStep {
  href: string;
  label: string;
  /** What this artefact is, for someone who has never worked with one. */
  plainLanguage: string;
}

export const READING_PATH: ReadingStep[] = [
  {
    href: "/journey",
    label: "Analysis Process",
    plainLanguage:
      "The order the work happens in. Each stage below produced a real document, and every one of them links to it.",
  },
  {
    href: "/overview",
    label: "Overview",
    plainLanguage:
      "What the project is for, what it will and will not do, who decides, and what could go wrong. Agreed before any code is written.",
  },
  {
    href: "/requirements",
    label: "Business Requirements",
    plainLanguage:
      "What the business needs, one statement at a time. Each one says why it matters and how you would prove it was delivered.",
  },
  {
    href: "/functional-specification",
    label: "Functional Specification",
    plainLanguage:
      "How the system must behave in detail — field by field, error by error. This is what a developer builds from.",
  },
  {
    href: "/business-rules",
    label: "Business Rules",
    plainLanguage:
      "The decisions the system must take, and the authority behind each one. Change a rule and you change what the software is allowed to do.",
  },
  {
    href: "/actors",
    label: "Actors",
    plainLanguage:
      "Everyone and everything that takes part — customers, staff, other systems — and exactly what each is allowed to do.",
  },
  {
    href: "/process-flow",
    label: "Process Flow",
    plainLanguage:
      "The journey from start to finish, split into lanes so you can see who does what at each step.",
  },
  {
    href: "/bpmn",
    label: "BPMN",
    plainLanguage:
      "The same journey drawn in BPMN, the standard notation businesses and developers both read.",
  },
  {
    href: "/plantuml",
    label: "UML Models",
    plainLanguage:
      "Diagrams of the system: who uses it, how the pieces talk to each other, and the states a payment can be in.",
  },
  {
    href: "/wireframes",
    label: "Wireframes",
    plainLanguage:
      "What the user actually sees on screen, annotated with the rules behind each element.",
  },
  {
    href: "/swagger-api",
    label: "API Contract",
    plainLanguage:
      "The agreement between systems: what you send, what comes back, and what every error means.",
  },
  {
    href: "/sql-validation",
    label: "SQL Validation",
    plainLanguage:
      "Queries run against the real database to prove the rules actually hold. An empty result is the passing answer.",
  },
  {
    href: "/test-cases",
    label: "Test Cases",
    plainLanguage:
      "Step-by-step checks that the system does what was agreed, each one tied back to the requirement it proves.",
  },
  {
    href: "/documents",
    label: "Documents",
    plainLanguage:
      "The controlled document set — who wrote each one, which version is current, and who may read it.",
  },
  {
    href: "/traceability",
    label: "Traceability Matrix",
    plainLanguage:
      "The thread that ties it all together: every requirement followed through to the rule, the design, the interface, the data and the test that proves it.",
  },
];

const BY_HREF = new Map(READING_PATH.map((step, index) => [step.href, index]));

export function getReadingStep(href: string): ReadingStep | undefined {
  const index = BY_HREF.get(href);
  return index === undefined ? undefined : READING_PATH[index];
}

export function getNeighbours(href: string): {
  previous?: ReadingStep;
  next?: ReadingStep;
  position?: { step: number; total: number };
} {
  const index = BY_HREF.get(href);
  if (index === undefined) return {};
  return {
    previous: index > 0 ? READING_PATH[index - 1] : undefined,
    next: index < READING_PATH.length - 1 ? READING_PATH[index + 1] : undefined,
    position: { step: index + 1, total: READING_PATH.length },
  };
}
