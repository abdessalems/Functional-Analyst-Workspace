import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  ClipboardCheck,
  Database,
  FileCode2,
  FileText,
  GitCompare,
  FolderKanban,
  Network,
  ListChecks,
  Route,
  Shapes,
  ScrollText,
  ShieldCheck,
  Table2,
  Users,
  Workflow,
} from "lucide-react";

/** Artefact collections a nav item can report a count for. */
export type NavCountKey =
  | "requirements"
  | "businessRules"
  | "actors"
  | "functionalSpecSections"
  | "processFlows"
  | "bpmnModels"
  | "diagrams"
  | "wireframes"
  | "apis"
  | "sqlValidations"
  | "testCases"
  | "documents";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** Static chip, used for portfolio-level entries. */
  badge?: string;
  /**
   * Which collection of the active project this page shows. The sidebar reads
   * the count from the project's data, and hides the page entirely when the
   * project has nothing to show there — so a project only ever displays the
   * pages it actually has.
   */
  countKey?: NavCountKey;
}

export interface NavSection {
  id: string;
  label: string;
  /**
   * Structural colour for the section, as a raw CSS colour. Safe to use
   * decoratively because it marks *where you are*, never *how something is
   * doing* — status and priority keep the semantic palette to themselves.
   */
  accent: string;
  /**
   * `portfolio` sections are always visible; `project` sections appear only
   * once an analyst has entered a project from the landing page.
   */
  scope: "portfolio" | "project";
  items: NavItem[];
}

/**
 * Single source of truth for the sidebar, the breadcrumb trail and the page
 * records in the global search index.
 */
export const navigationSections: NavSection[] = [
  {
    id: "portfolio",
    accent: "hsl(215 16% 60%)",
    label: "Portfolio",
    scope: "portfolio",
    items: [
      {
        label: "All Projects",
        href: "/",
        icon: FolderKanban,
        description: "Portfolio register of banking change initiatives",
      },
    ],
  },
  {
    id: "workspace",
    accent: "hsl(172 66% 50%)",
    label: "Workspace",
    scope: "project",
    items: [
      {
        label: "Analysis Process",
        href: "/journey",
        icon: Route,
        description: "The seven stages of the analysis lifecycle and what each one produced",
      },
    ],
  },
  {
    id: "analysis",
    accent: "hsl(199 89% 60%)",
    label: "Analysis",
    scope: "project",
    items: [
      {
        label: "Overview",
        href: "/overview",
        icon: BookOpen,
        description: "Project summary, objective, scope, stakeholders and timeline",
      },
      {
        label: "Business Requirements",
        href: "/requirements",
        countKey: "requirements",
        icon: ListChecks,
        description: "Baselined business requirements with acceptance criteria",
      },
      {
        label: "Functional Specification",
        href: "/functional-specification",
        countKey: "functionalSpecSections",
        icon: ScrollText,
        description: "Business logic, validations, error handling and field definitions",
      },
      {
        label: "Business Rules",
        href: "/business-rules",
        countKey: "businessRules",
        icon: ShieldCheck,
        description: "Rule catalogue governing the payment decision path",
      },
      {
        label: "Stakeholders",
        href: "/actors",
        countKey: "actors",
        icon: Users,
        description: "Human, system and external actors with permissions",
      },
    ],
  },
  {
    id: "design",
    accent: "hsl(258 90% 70%)",
    label: "Design & Modelling",
    scope: "project",
    items: [
      {
        label: "Process Analysis",
        href: "/process-flow",
        countKey: "processFlows",
        icon: Workflow,
        description: "Swimlane view of the end-to-end payment process",
      },
      {
        label: "BPMN",
        href: "/bpmn",
        countKey: "bpmnModels",
        icon: Network,
        description: "Business process model in BPMN notation with swimlanes and gateways",
      },
      {
        label: "PlantUML",
        href: "/plantuml",
        countKey: "diagrams",
        icon: Shapes,
        description: "Use case, class, ER, sequence and state models kept as PlantUML source",
      },
      {
        label: "Wireframes",
        href: "/wireframes",
        countKey: "wireframes",
        icon: Boxes,
        description: "Screen designs with annotations and version history",
      },
    ],
  },
  {
    id: "build",
    accent: "hsl(38 92% 58%)",
    label: "Build & Validation",
    scope: "project",
    items: [
      {
        label: "API Contracts",
        href: "/swagger-api",
        countKey: "apis",
        icon: FileCode2,
        description: "REST contract documentation for the payment services",
      },
      {
        label: "SQL Validation",
        href: "/sql-validation",
        countKey: "sqlValidations",
        icon: Database,
        description: "Validation queries, result sets and analyst notes",
      },
      {
        label: "Test Cases",
        href: "/test-cases",
        countKey: "testCases",
        icon: ClipboardCheck,
        description: "SIT and UAT catalogue with execution status",
      },
    ],
  },
  {
    id: "governance",
    accent: "hsl(152 60% 52%)",
    label: "Governance",
    scope: "project",
    items: [
      {
        label: "Documents",
        href: "/documents",
        countKey: "documents",
        icon: FileText,
        description: "Controlled document register with versions and owners",
      },
      {
        label: "Traceability",
        href: "/traceability",
        icon: Table2,
        description: "Requirement to rule, design, API, data, test and document chain",
      },
      {
        label: "Compare Projects",
        href: "/compare",
        icon: GitCompare,
        description: "AS-IS against TO-BE: what was added, removed and carried over",
      },
    ],
  },
];

export const navigationItems: NavItem[] = navigationSections.flatMap((section) => section.items);

export function findNavItem(pathname: string): NavItem | undefined {
  return navigationItems.find((item) => item.href === pathname);
}

export function findNavSection(pathname: string): NavSection | undefined {
  return navigationSections.find((section) => section.items.some((item) => item.href === pathname));
}
