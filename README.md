# Business Analyst Workspace

Internal enterprise workspace used by Business Analysts and Functional Analysts to create, review,
maintain and navigate banking project documentation across the delivery lifecycle.

The workspace is populated with a realistic banking delivery: **Instant Payments Hub — SCT Inst
Onboarding (IPH 2.3)**, covering SEPA Instant Credit Transfer initiation, verification of payee,
in-path financial crime controls, scheme settlement and recall handling.

---

## Stack

| Concern      | Choice                                            |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 15 (App Router) · React 19                |
| Language     | TypeScript (strict)                               |
| Styling      | Tailwind CSS 3 with CSS-variable theming          |
| Components   | shadcn/ui conventions over Radix primitives       |
| Icons        | Lucide                                            |
| Command menu | cmdk                                              |
| Theming      | next-themes (light / dark / system)               |
| Data         | Local TypeScript mock modules — no backend, no auth, no API calls |

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build (all routes prerender statically)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

---

## Modules

| Route                       | Purpose                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| `/`                         | Dashboard — delivery status, artefact inventory, open items, activity, timeline |
| `/projects`                 | Portfolio register of six banking change initiatives                            |
| `/overview`                 | Summary, objective, scope, stakeholders (RACI), timeline, dependencies, risks    |
| `/requirements`             | 24 baselined requirements with Given/When/Then acceptance criteria               |
| `/functional-specification` | 8 collapsible sections: business logic, validations, errors, fields, edge cases  |
| `/business-rules`           | 16-rule catalogue with source of authority and rule logic                        |
| `/actors`                   | 8 human, system and external actors with responsibilities and permissions        |
| `/process-flow`             | Swimlane decomposition of the end-to-end payment process                         |
| `/bpmn`                     | BPMN 2.0 collaboration model — zoom, full screen, SVG and `.bpmn` export         |
| `/plantuml`                 | Use case, sequence, component, activity and state models with `.puml` source     |
| `/wireframes`               | 6 annotated screen designs with version history                                  |
| `/swagger-api`              | Swagger-style contract docs for 5 endpoints across 2 services                    |
| `/sql-validation`           | 6 validation queries with result sets, analyst notes and the physical data model |
| `/test-cases`               | 39 SIT/UAT cases with steps, execution status and defect links                   |
| `/documents`                | Controlled document register with classification and version history             |
| `/traceability`             | Requirement → rule → model → API → database → SQL → test → document chain        |
| `/settings`                 | Profile, appearance, notifications, integrations, accessibility                  |

---

## Architecture

```
src/
├── app/                  Route definitions only — thin server components
├── components/
│   ├── ui/               Radix-based primitives (button, table, dialog, tabs, …)
│   ├── layout/           App shell: sidebar, topbar, breadcrumbs, global search
│   ├── common/           Cross-feature building blocks (page header, filter bar,
│   │                     metric card, code block, diagram viewer, states, …)
│   └── providers/        Theme and workspace (project scope) context
├── features/             One folder per business capability, each owning its views
│   ├── dashboard/  projects/  overview/  requirements/  functional-spec/
│   ├── business-rules/  actors/  process-flow/  diagrams/  wireframes/
│   └── api-docs/  sql-validation/  test-cases/  documents/  traceability/  settings/
├── data/                 Mock data modules — the only place artefact content lives
├── hooks/                Reusable behaviour (filters, highlight, copy, download)
├── config/               Navigation as a single source of truth
└── lib/                  Types, utilities, syntax highlighting, artefact link resolver
```

### Principles applied

- **UI is separated from data.** Every page reads from `src/data/*`. Swapping those modules for
  API calls is a contained change that does not touch a single view.
- **One source of truth per concern.** Navigation drives the sidebar, the breadcrumb trail and the
  page entries in global search. Status colours come from one map, so a word never renders in two
  different tones. The traceability matrix is *derived* from the links already held on each artefact
  rather than duplicated.
- **Cross-references are live.** Any business key (`REQ-005`, `BR-011`, `TC-017`, `API-001`, …)
  resolves through `lib/artifact-links.ts` into a tooltipped, clickable deep link.
- **Reusable hooks.** `useArtifactFilters` powers every list page; `useHighlight` isolates the
  `?highlight=` query read into a leaf boundary so pages still prerender with real content.
- **States are designed, not omitted.** Loading skeletons, empty states, no-result states and error
  boundaries exist for every list and page.

---

## Interaction notes

- **Global search** — `Ctrl K` or `/` opens a command palette over requirements, rules, actors,
  APIs, test cases, documents, SQL, diagrams and pages. Selecting a result deep-links to the
  artefact and highlights it.
- **Project selector** — scopes the workspace. Only the flagship project has a migrated artefact
  set; every other selection resolves to a documented empty state.
- **Exports** — CSV for registers, `.sql`, `.puml`, `.bpmn`, OpenAPI JSON and SVG for diagrams, all
  generated client-side from the in-memory artefact.
- **Accessibility** — focus rings are never suppressed, the app is fully keyboard operable, a skip
  link precedes the shell, and status is always carried by text as well as colour.

---

## Scope

No backend, no authentication, no external API calls, no analytics or marketing surfaces. All
content is mock data written to resemble a real banking delivery, ready for backend integration.
