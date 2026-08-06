import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Boxes,
  ClipboardCheck,
  Database,
  FileCode2,
  FileText,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Network,
  ScrollText,
  Settings,
  ShieldCheck,
  Table2,
  Users,
  Workflow,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** Shown as a count chip in the sidebar. */
  badge?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Single source of truth for the sidebar, the breadcrumb trail and the page
 * records in the global search index.
 */
export const navigationSections: NavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        description: "Delivery status, artefact counts and recent workspace activity",
      },
      {
        label: "Projects",
        href: "/projects",
        icon: FolderKanban,
        description: "Portfolio register of banking change initiatives",
        badge: "6",
      },
    ],
  },
  {
    id: "analysis",
    label: "Analysis",
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
        icon: ListChecks,
        description: "Baselined business requirements with acceptance criteria",
        badge: "24",
      },
      {
        label: "Functional Specification",
        href: "/functional-specification",
        icon: ScrollText,
        description: "Business logic, validations, error handling and field definitions",
        badge: "8",
      },
      {
        label: "Business Rules",
        href: "/business-rules",
        icon: ShieldCheck,
        description: "Rule catalogue governing the payment decision path",
        badge: "16",
      },
      {
        label: "Actors",
        href: "/actors",
        icon: Users,
        description: "Human, system and external actors with permissions",
        badge: "8",
      },
    ],
  },
  {
    id: "design",
    label: "Design & Modelling",
    items: [
      {
        label: "Process Flow",
        href: "/process-flow",
        icon: Workflow,
        description: "Swimlane view of the end-to-end payment process",
      },
      {
        label: "BPMN",
        href: "/bpmn",
        icon: Network,
        description: "BPMN 2.0 collaboration model with zoom and export",
      },
      {
        label: "PlantUML",
        href: "/plantuml",
        icon: GitBranch,
        description: "Use case, sequence, component, activity and state models",
        badge: "5",
      },
      {
        label: "Wireframes",
        href: "/wireframes",
        icon: Boxes,
        description: "Screen designs with annotations and version history",
        badge: "6",
      },
    ],
  },
  {
    id: "build",
    label: "Build & Validation",
    items: [
      {
        label: "Swagger API",
        href: "/swagger-api",
        icon: FileCode2,
        description: "REST contract documentation for the payment services",
        badge: "5",
      },
      {
        label: "SQL Validation",
        href: "/sql-validation",
        icon: Database,
        description: "Validation queries, result sets and analyst notes",
        badge: "6",
      },
      {
        label: "Test Cases",
        href: "/test-cases",
        icon: ClipboardCheck,
        description: "SIT and UAT catalogue with execution status",
        badge: "39",
      },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    items: [
      {
        label: "Documents",
        href: "/documents",
        icon: FileText,
        description: "Controlled document register with versions and owners",
        badge: "7",
      },
      {
        label: "Traceability Matrix",
        href: "/traceability",
        icon: Table2,
        description: "Requirement to rule, design, API, data, test and document chain",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Workspace preferences, appearance and integrations",
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

export const activityIcon = Activity;
