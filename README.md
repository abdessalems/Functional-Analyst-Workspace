<div align="center">

# Functional Analyst Workspace

### How a banking project gets analysed — requirement by requirement, all the way to the test that proves it

**[Open the workspace →](https://www.saadaoui.it.com/fa)**

[![Live](https://img.shields.io/badge/live-saadaoui.it.com%2Ffa-14b8a6?style=for-the-badge)](https://www.saadaoui.it.com/fa)
[![Portfolio](https://img.shields.io/badge/portfolio-saadaoui.it.com-0f766e?style=for-the-badge)](https://www.saadaoui.it.com/)

[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-20232a?style=flat-square&logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=flat-square&logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![PlantUML](https://img.shields.io/badge/PlantUML-1f425f?style=flat-square)](https://plantuml.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

![Static export](https://img.shields.io/badge/static%20export-no%20backend-14b8a6?style=flat-square)
![No auth](https://img.shields.io/badge/no%20auth-no%20database-0f766e?style=flat-square)
![TypeScript strict](https://img.shields.io/badge/typescript-strict-3178c6?style=flat-square)
![Projects](https://img.shields.io/badge/projects-2-64748b?style=flat-square)
![Artefacts](https://img.shields.io/badge/artefacts-250%2B-64748b?style=flat-square)

**Saadaoui Abdessalem** — Functional Analyst & Java Developer

</div>

---

A recruiter reading a CV learns that someone *writes specifications*. They learn nothing about how
those specifications hold together. This workspace shows the work itself: pick a project, follow the
analysis from the business need to the acceptance criteria, the rules, the process model, the
interface contract, the SQL that proves the data behaves, and the tests that close the loop.

Every cross-reference is live. Click `BR-001` anywhere and you land on it. The traceability matrix is
not maintained by hand — it is derived from the links the artefacts already carry, so it cannot drift
from them.

---

## The two projects

| | **EuroPay Hub** | **Instant Payments Hub** |
| --- | --- | --- |
| What | Merchant payment platform | SEPA Instant Credit Transfer onboarding |
| Source | Real project — transcribed from its own `docs/` folder | Sample analysis: a method demonstration, not client work |
| Requirements | 12, with 49 acceptance criteria | 24 |
| Business rules | 8 | 16 |
| Actors | 6 | 8 |
| Specification sections | 7 | 8 |
| Models | 8, one of them BPMN | 6, one of them BPMN |
| Wireframes | — | 6 |
| Endpoints | 26 across 1 service | 5 across 2 services |
| SQL validations | 6 | 6 |
| Test cases | 39 | 39 |
| Documents | 10 | 7 |
| Risks | 12 (R-01 … R-12) | — |

The sample project is labelled as a sample everywhere it appears. Nothing here is presented as client
work that isn't.

---

## What's in it

| Route | What it holds |
| --- | --- |
| `/` | The project register — pick one to open it |
| `/journey` | The analysis process, step by step, in plain language |
| `/overview` | Objective, scope, stakeholders (RACI), timeline, dependencies, risks |
| `/requirements` | Requirements with Given / When / Then acceptance criteria |
| `/functional-specification` | Business logic, field tables, validations, error codes, edge cases |
| `/business-rules` | Rule catalogue with the source of authority and the rule logic |
| `/actors` | Human, system and external actors — responsibilities and permissions |
| `/process-flow` | Swimlane decomposition of the end-to-end process |
| `/bpmn` | BPMN model, rendered — zoom, pan, full screen, PNG export |
| `/plantuml` | Use case, sequence, state, class and ER models with their `.puml` source |
| `/wireframes` | Annotated screen designs with version history |
| `/swagger-api` | Interface contracts, endpoint by endpoint |
| `/sql-validation` | Validation queries with result sets and analyst notes |
| `/test-cases` | Test catalogue with steps, execution status and defect links |
| `/documents` | Controlled document register |
| `/traceability` | Requirement → rule → model → interface → data → SQL → test → document |
| `/document` | The whole project as one printable document — save as PDF |
| `/studio` | Import a project from a spreadsheet (read-only preview when published) |

---

## The studio

Adding a project means writing a spreadsheet, not writing TypeScript.

Sixteen sheets — Requirements, Acceptance Criteria, Business Rules, Actors, Process Steps, five
Spec sheets, Diagrams, Wireframes, API Endpoints, SQL Validations, Test Cases, Documents. Bring only
the ones you have. Column headings are matched loosely, so `Business Need` finds `businessNeed`, and
a sheet whose name says nothing is identified by its columns.

The import is then **checked before it can be added**: duplicate ids, references that resolve to
nothing, artefacts nobody points at, empty collections, and requirement coverage. A project with a
dead link cannot be added — a broken reference renders as an ordinary grey chip, which on a
traceability tool is the worst failure available.

Then one button writes the bundle, registers it and adds it to the project register. Commit, push,
live.

**An example file ships with the workspace** — a complete worked project (card disputes) across all
sixteen sheets, so the layout is shown being used rather than described.

### Authoring is local only, on purpose

The published site is static files. It has no server, no database, no login — and therefore nothing
to attack. Visitors can open the studio, drop in a spreadsheet and watch the checks run; that runs
entirely in their own browser and the file never leaves their machine.

Adding, publishing and deleting need routes named `*.dev.ts`, which `pageExtensions` drops from the
static export. They exist only on the machine that owns the source, behind a password held in
`.env.local` and checked by the server — never compiled into the bundle, so it cannot be read out of
the page.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) · React 19 |
| Language | TypeScript, strict |
| Styling | Tailwind CSS 3 with CSS-variable theming |
| Components | shadcn/ui conventions over Radix primitives |
| Icons | Lucide |
| Command palette | cmdk |
| Theming | next-themes — light, dark, system |
| Spreadsheets | SheetJS, dynamically imported so it never reaches a visitor's bundle |
| Diagrams | PlantUML, rendered from the same source shown on the page |
| Data | TypeScript modules. No backend, no authentication, no API calls |

---

## Running it

```bash
npm install
cp .env.example .env.local     # then set STUDIO_PASSWORD
npm run dev                    # http://localhost:3000
```

```bash
npm run typecheck              # tsc --noEmit
npm run build:static           # static export into ./out
npm run deploy:fa              # build for /fa and copy into the portfolio
npm run check:diagrams         # render every PlantUML model against the server
```

> Don't run a build while `npm run dev` is running. On Windows they interfere and leave the dev
> server serving a page whose JavaScript 404s — which looks like "the CSS stopped working".

---

## Architecture

```
src/
├── app/                  Routes only — thin server components
│   └── api/studio/       *.dev.ts — authoring routes, excluded from the export
├── components/
│   ├── ui/               Radix-based primitives
│   ├── layout/           Shell: sidebar, top bar, breadcrumbs, command palette
│   ├── common/           Page header, filter bar, code block, states, reading nav
│   └── providers/        Theme and workspace (open project) context
├── features/             One folder per capability, each owning its views
├── data/
│   └── workspaces/       One bundle per project + a registry
├── hooks/                Filters, highlight, copy, download, project data
├── config/               Navigation and the reading path, single source of truth
└── lib/                  Types, artefact link resolver, bundle validation
```

### Principles held to

- **Adding a project is two files and one line.** A bundle in `data/workspaces/`, an entry in the
  register, one line in the registry. No component, route or navigation change.
- **Traceability is derived, never stored twice.** The matrix is assembled from links already on the
  artefacts, so it cannot contradict them.
- **One source of truth per concern.** Navigation drives the sidebar, the breadcrumbs and the search
  index. Status colours come from one map, so a word never renders in two tones.
- **States are designed, not omitted.** Loading, empty, no-results and error states exist for every
  list and page.
- **Honesty about what is what.** Sample work is labelled sample. Authored content is not presented
  as transcribed. A test that has not run reads "Not Run", never "Passed".

---

## Details worth knowing

- **Command palette** — `Ctrl K` or `/`, over every artefact in the open project.
- **Diagram viewer** — scroll to zoom toward the cursor, drag to pan, `Esc` to close, `0` to reset.
- **Deep links** — every artefact has one; `?highlight=BR-001` scrolls to it and marks it.
- **Exports** — CSV, `.puml`, `.sql`, OpenAPI JSON, PNG, and the whole project as a PDF.
- **Print** — `/document` drops the chrome, forces black on white, and stops tables splitting across
  pages.
- **Mobile** — `100dvh` rather than `100vh`, and tables restack as cards rather than scrolling
  sideways.
- **Accessibility** — focus rings are never suppressed, the app is keyboard operable throughout, and
  status is always carried by text as well as colour.

---

## Author

<div align="center">

### Saadaoui Abdessalem

**Functional Analyst & Java Developer**

Requirements engineering · process modelling · interface specification · data validation · traceability

[![Portfolio](https://img.shields.io/badge/Portfolio-saadaoui.it.com-0f766e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.saadaoui.it.com/)
[![Workspace](https://img.shields.io/badge/Workspace-%2Ffa-14b8a6?style=for-the-badge)](https://www.saadaoui.it.com/fa)
[![GitHub](https://img.shields.io/badge/GitHub-abdessalems-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abdessalems)
[![Email](https://img.shields.io/badge/Email-abdessalemsaa%40gmail.com-ea4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:abdessalemsaa@gmail.com)

</div>

---

<div align="center">
<sub>Built to be read, not just deployed. Every reference in this workspace resolves, or the build says so.</sub>
</div>
