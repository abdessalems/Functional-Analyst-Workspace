# Adding a project

The workspace is data-driven. Adding a project is **two files and one line** — no component,
route or navigation changes.

Anything you leave out simply does not appear. The sidebar hides pages the project has no data
for, and the Analysis Process page drops that stage. A project with only requirements and rules
shows exactly two pages, which is an honest picture of where it stands.

---

## The three steps

### 1. Register the project

Append an entry to `projects` in [`src/data/projects.ts`](../src/data/projects.ts). This is what
appears on the landing page and the Overview page: name, status, objective, scope in and out,
stakeholders, timeline, dependencies, risks, tags.

```ts
{
  id: "PRJ-ABC-001",
  code: "ABC-1.0",
  name: "Full project name",
  shortName: "Short name",
  domain: "Payments",
  subDomain: "…",
  status: "In Progress",   // Completed | In Progress | In Review | Planned | On Hold
  version: "1.0",
  release: "…",
  owner: { id, name, role, email, department },
  businessOwner: "…",
  programme: "…",
  summary: "One paragraph: what is being built and why.",
  businessObjective: "The measurable outcome.",
  inScope: [], outOfScope: [],
  stakeholders: [], timeline: [], dependencies: [], risks: [],
  tags: [],
  metrics: { requirements: 0, businessRules: 0, apis: 0, documents: 0, testCases: 0, actors: 0, diagrams: 0 },
  startDate: "2026-01-01", targetDate: "2026-06-30", lastUpdated: "2026-01-01",
  completion: 0,
  regulatoryDrivers: [],
}
```

### 2. Create the artefact bundle

Copy [`src/data/workspaces/_template.ts`](../src/data/workspaces/_template.ts) to
`my-project.ts`, rename the export, set `projectId` to match step 1, and fill in what you have.

`EuroPay Hub` is a good reference for a project mid-delivery (requirements, rules and actors
only). `Instant Payments` shows every collection populated.

### 3. Register the bundle

In [`src/data/workspaces/index.ts`](../src/data/workspaces/index.ts):

```ts
import { myProjectBundle } from "@/data/workspaces/my-project";

const BUNDLES: ProjectDataBundle[] = [
  instantPaymentsBundle,
  europayHubBundle,
  myProjectBundle,        // ← the one line
];
```

Done. The project is selectable, searchable, and its pages appear.

---

## ID conventions

Cross-references are clickable because the resolver routes on the prefix. IDs are resolved
**within the open project**, so two projects may both use `BR-001`.

| Prefix | Artefact | Page |
| --- | --- | --- |
| `FR-` / `REQ-` | Requirement | `/requirements` |
| `BR-` | Business rule | `/business-rules` |
| `FS-` | Spec section | `/functional-specification` |
| `ACT-` | Actor | `/actors` |
| `UML-` | Diagram | `/plantuml` |
| `WF-` | Wireframe | `/wireframes` |
| `API-` | Endpoint | `/swagger-api` |
| `SQL-` | Validation query | `/sql-validation` |
| `TC-` | Test case | `/test-cases` |
| `DOC-` | Document | `/documents` |

Put an ID in `relatedRules`, `relatedApis`, `relatedTestCases` or `relatedDocuments` on a
requirement and the traceability matrix picks it up automatically — the matrix is **derived**,
never maintained by hand.

---

## Diagrams and wireframes

Both are SVG components keyed by id, so they need a small amount of code:

- **Wireframe** — add a renderer in
  `src/features/wireframes/components/wireframe-canvas.tsx` and register it in the `SCREENS` map
  under your `screenId`, then add the metadata entry to your bundle's `wireframes`.
- **UML model** — put the `.puml` source in your bundle's `diagrams`. A new diagram *type* needs a
  renderer in `src/features/diagrams/components/uml-previews.tsx`.
- **BPMN** — the layout lives in `src/features/diagrams/components/bpmn-canvas.tsx`; the semantic
  model (lanes, steps, rules) lives in your bundle's `processFlows`.

---

## After any change

```bash
npm run typecheck   # the domain model catches missing or misspelled fields
npm run build       # confirms every page still prerenders
npm run build:fa    # static export for https://www.saadaoui.it.com/FA
```
