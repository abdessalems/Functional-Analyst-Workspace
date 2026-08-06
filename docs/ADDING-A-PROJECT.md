# Adding a new project to the workspace

The workspace is data-driven. Adding a project is an edit to `src/data/` — no component
changes, no routing changes. This guide walks the full path, from a register entry you can
demo in two minutes to a complete second case study.

---

## Level 1 — a register entry (2 minutes)

This is enough for the project to appear in the **project selector**, the **Projects register**
and the **Dashboard**, with real metrics, timeline, stakeholders, risks and dependencies.

Open `src/data/projects.ts` and append an object to the `projects` array. Copy an existing entry
and change the values — TypeScript will tell you immediately if a field is missing.

```ts
{
  id: "PRJ-TRD-031",                       // unique key
  code: "TRD-1.0",                         // short code shown in the selector
  name: "Trade Finance Guarantee Digitisation",
  shortName: "Trade Finance",
  domain: "Banking",
  subDomain: "Corporate & Trade",
  status: "In Progress",                   // Completed | In Progress | In Review | Planned | On Hold
  version: "1.0",
  release: "R2026.03 — Corporate Wave 1",
  owner: {
    id: "USR-001",
    name: "Saadaoui Abdessalem",
    role: "Lead Business Analyst",
    email: "abdessalem.saadaoui@northbridge-bank.com",
    department: "Corporate Change Delivery",
  },
  businessOwner: "Head of Trade Finance",
  programme: "Corporate Banking Programme",
  summary: "…one paragraph: what is being built and why…",
  businessObjective: "…the measurable outcome, with numbers…",
  inScope: ["…", "…"],
  outOfScope: ["…", "…"],
  stakeholders: [ /* { id, name, role, email, department, raci } */ ],
  timeline:     [ /* { id, label, date, status, description } */ ],
  dependencies: [ /* { id, name, type, owner, status, description } */ ],
  risks:        [ /* { id, description, likelihood, impact, mitigation, owner } */ ],
  tags: ["Trade Finance", "SWIFT MT798", "Digitisation"],
  metrics: {
    requirements: 19, businessRules: 14, apis: 4,
    documents: 6, testCases: 28, actors: 7, diagrams: 4,
  },
  startDate: "2025-10-06",
  targetDate: "2026-06-30",
  lastUpdated: "2026-01-15",
  completion: 22,
  regulatoryDrivers: ["ICC URDG 758", "UCP 600"],
}
```

Update the sidebar count in `src/config/navigation.ts` (`Projects` → `badge`) so it matches.

**Result:** the project is selectable everywhere. Because its artefacts are not migrated, every
artefact page shows the documented empty state — which is honest behaviour, not a broken page.

---

## Level 2 — a full second case study

To make the new project's artefact pages render real content, you need to make the data modules
project-aware. Today each module exports a flat array scoped to the flagship project.

### Step 1 — key the data by project

In each data module, change the flat export into a lookup:

```ts
// src/data/requirements.ts
const requirementsByProject: Record<string, Requirement[]> = {
  "PRJ-IPH-023": [ /* the existing 24 */ ],
  "PRJ-TRD-031": [ /* your new set */ ],
};

export function getRequirements(projectId: string): Requirement[] {
  return requirementsByProject[projectId] ?? [];
}
```

Do the same for `business-rules.ts`, `actors.ts`, `test-cases.ts`, `documents.ts`, `api.ts`,
`sql.ts`, `diagrams.ts`, `functional-spec.ts` and `process-flow.ts`.

### Step 2 — read the active project in the views

Each view already knows the active project:

```ts
const { project } = useWorkspace();
const requirements = React.useMemo(() => getRequirements(project.id), [project.id]);
```

### Step 3 — relax the scope guard

`src/components/common/project-scope.tsx` currently gates every artefact page on
`hasArtifacts`. Change `workspace-provider.tsx` so `hasArtifacts` checks whether the project has
data rather than hard-coding one id:

```ts
hasArtifacts: getRequirements(project.id).length > 0,
```

### Step 4 — keep traceability honest

`src/data/traceability.ts` derives the matrix from requirement links, so it follows automatically
once `getRequirements` is project-aware. Only `databaseObjectsByRequirement` needs new entries.

---

## Artefact ID conventions

The link resolver (`src/lib/artifact-links.ts`) routes chips by prefix. Reuse these so every
cross-reference stays clickable:

| Prefix | Artefact          | Page                        |
| ------ | ----------------- | --------------------------- |
| `REQ-` | Requirement       | `/requirements`             |
| `BR-`  | Business rule     | `/business-rules`           |
| `FS-`  | Spec section      | `/functional-specification` |
| `ACT-` | Actor             | `/actors`                   |
| `UML-` | PlantUML model    | `/plantuml`                 |
| `WF-`  | Wireframe         | `/wireframes`               |
| `API-` | Endpoint          | `/swagger-api`              |
| `SQL-` | Validation query  | `/sql-validation`           |
| `TC-`  | Test case         | `/test-cases`               |
| `DOC-` | Document          | `/documents`                |

Adding a new artefact type means one `case` in the resolver and one block in
`src/data/search-index.ts` — then it is searchable and linkable everywhere.

---

## Adding a wireframe or UML model

Both are SVG renderers keyed by id:

- **Wireframe** — add a renderer function in `src/features/wireframes/components/wireframe-canvas.tsx`
  and register it in the `SCREENS` map under your `screenId`, then add the metadata entry to
  `wireframes` in `src/data/diagrams.ts`.
- **UML model** — add the `.puml` source to `diagrams` in `src/data/diagrams.ts`. If you introduce a
  new diagram *type*, add a renderer to the `RENDERERS` map in
  `src/features/diagrams/components/uml-previews.tsx`.

---

## After any change

```bash
npm run typecheck   # the domain model catches missing or misspelled fields
npm run build       # confirms every page still prerenders
```
