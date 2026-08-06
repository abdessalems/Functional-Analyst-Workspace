"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  Check,
  Keyboard,
  Monitor,
  Moon,
  Plug,
  Palette,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";

const INTEGRATIONS = [
  {
    name: "Azure DevOps",
    description: "Sync requirements and test cases with work items in the Payments project.",
    status: "Connected",
    detail: "Last sync 08 Sep 2025 · 14:20",
  },
  {
    name: "Confluence",
    description: "Publish approved specifications to the Payments Modernisation space.",
    status: "Connected",
    detail: "Auto-publish on approval",
  },
  {
    name: "SharePoint — Document Management",
    description: "Controlled document library storing the register's source files.",
    status: "Connected",
    detail: "Retention policy: 10 years",
  },
  {
    name: "Camunda Modeler",
    description: "Round-trip editing of BPMN collaboration models.",
    status: "Not connected",
    detail: "Requires platform team approval",
  },
  {
    name: "Jira Service Management",
    description: "Raise defects directly from a failed test case.",
    status: "Not connected",
    detail: "Available in workspace 2.4",
  },
];

const SHORTCUTS = [
  { keys: "Ctrl K", action: "Open global search" },
  { keys: "/", action: "Focus global search" },
  { keys: "Esc", action: "Close dialog or search" },
  { keys: "Tab", action: "Move between interactive elements" },
  { keys: "Enter", action: "Open the focused record" },
];

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { project, projects, selectProject } = useWorkspace();
  const [mounted, setMounted] = React.useState(false);

  const [notifications, setNotifications] = React.useState({
    reviewRequests: true,
    statusChanges: true,
    testFailures: true,
    weeklyDigest: false,
  });

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Workspace preferences for your account. Changes apply to your session only and do not affect other members of the delivery team."
        meta={[
          { label: "Signed in as", value: "Saadaoui Abdessalem" },
          { label: "Role", value: "Lead Business Analyst" },
          { label: "Workspace", value: "v2.3.0" },
        ]}
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <UserRound /> General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell /> Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug /> Integrations
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Keyboard /> Accessibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-5">
          <SectionCard
            title="Profile"
            description="Details are managed by the corporate directory and cannot be edited here."
            icon={UserRound}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value="Saadaoui Abdessalem" />
              <Field label="Email" value="abdessalem.saadaoui@retail-bank.example" />
              <Field label="Department" value="Payments Change Delivery" />
              <Field label="Line manager" value="Marcus Delacroix" />
            </div>
          </SectionCard>

          <SectionCard
            title="Default project"
            description="The project the workspace opens on when you sign in."
            icon={ShieldCheck}
          >
            <div className="max-w-md space-y-2">
              <Label htmlFor="default-project">Project</Label>
              <Select value={project.id} onValueChange={selectProject}>
                <SelectTrigger id="default-project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} — {item.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Currently scoped to{" "}
                <span className="font-medium text-foreground">{project.name}</span>.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Access & permissions"
            description="Granted through your directory group membership."
            icon={ShieldCheck}
            flush
            contentClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {[
                { name: "Read all artefacts", group: "GRP-BAW-READERS", granted: true },
                { name: "Edit requirements and specifications", group: "GRP-BAW-AUTHORS", granted: true },
                { name: "Approve baselines", group: "GRP-BAW-APPROVERS", granted: true },
                { name: "Release compliance holds", group: "GRP-OPS-COMPLIANCE", granted: false },
                { name: "Manage workspace settings", group: "GRP-BAW-ADMINS", granted: false },
              ].map((permission) => (
                <li key={permission.name} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{permission.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{permission.group}</p>
                  </div>
                  <Badge variant={permission.granted ? "success" : "neutral"}>
                    {permission.granted ? (
                      <>
                        <Check className="size-3" /> Granted
                      </>
                    ) : (
                      "Not granted"
                    )}
                  </Badge>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-5">
          <SectionCard
            title="Theme"
            description="Applies to this browser only. The workspace follows your operating system setting by default."
            icon={Palette}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "light", label: "Light", icon: Sun, description: "Default enterprise theme" },
                { value: "dark", label: "Dark", icon: Moon, description: "Reduced luminance" },
                { value: "system", label: "System", icon: Monitor, description: "Match OS setting" },
              ].map((option) => {
                const Icon = option.icon;
                const active = mounted && theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-start gap-1.5 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-primary bg-primary/[0.04]"
                        : "border-border hover:border-primary/40 hover:bg-accent/40",
                    )}
                  >
                    <span className="flex w-full items-center justify-between">
                      <Icon className={cn("size-4", active && "text-primary")} />
                      {active && <Check className="size-4 text-primary" />}
                    </span>
                    <span className="text-[13px] font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Density & layout" description="Presentation preferences for long tables and lists.">
            <div className="space-y-4">
              <ToggleRow
                label="Compact table rows"
                description="Reduce vertical padding to fit more records on screen."
                checked={false}
                onCheckedChange={() => undefined}
              />
              <Separator />
              <ToggleRow
                label="Remember collapsed sidebar"
                description="Keep the navigation collapsed between sessions."
                checked
                onCheckedChange={() => undefined}
              />
              <Separator />
              <ToggleRow
                label="Show artefact IDs in lists"
                description="Always display business keys such as REQ-001 alongside titles."
                checked
                onCheckedChange={() => undefined}
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-5">
          <SectionCard
            title="Workspace notifications"
            description="Delivered in-app and to your corporate mailbox."
            icon={Bell}
          >
            <div className="space-y-4">
              <ToggleRow
                label="Review requests"
                description="Someone asks you to review a requirement or specification."
                checked={notifications.reviewRequests}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, reviewRequests: checked }))
                }
              />
              <Separator />
              <ToggleRow
                label="Status changes on my artefacts"
                description="An artefact you own moves between Draft, In Review and Approved."
                checked={notifications.statusChanges}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, statusChanges: checked }))
                }
              />
              <Separator />
              <ToggleRow
                label="Test failures and defects"
                description="A test case linked to your requirement fails or is blocked."
                checked={notifications.testFailures}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, testFailures: checked }))
                }
              />
              <Separator />
              <ToggleRow
                label="Weekly delivery digest"
                description="Summary of artefact changes across your projects, sent each Monday."
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, weeklyDigest: checked }))
                }
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-5">
          <SectionCard
            title="Connected systems"
            description="Integrations are provisioned by the platform team; connection requests follow the standard change process."
            icon={Plug}
            flush
            contentClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {INTEGRATIONS.map((integration) => (
                <li key={integration.name} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[13px] font-medium">{integration.name}</p>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {integration.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{integration.detail}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={integration.status === "Connected" ? "success" : "neutral"}>
                      {integration.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {integration.status === "Connected" ? "Configure" : "Request"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-5">
          <SectionCard
            title="Keyboard shortcuts"
            description="The workspace is fully operable without a pointing device."
            icon={Keyboard}
            flush
            contentClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.keys} className="flex items-center justify-between gap-4 px-5 py-3">
                  <span className="text-[13px]">{shortcut.action}</span>
                  <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-medium">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Accessibility statement"
            description="Conformance and support arrangements."
            icon={ShieldCheck}
          >
            <div className="space-y-3 text-[13px] leading-relaxed">
              <p>
                This workspace targets WCAG 2.2 level AA. Focus indicators are never suppressed, all
                interactive controls are reachable by keyboard, and colour is never the sole carrier
                of meaning — every status badge pairs its colour with a text label.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="Approved" />
                <span className="text-muted-foreground">
                  Last accessibility audit · 14 Apr 2025 by the Digital Accessibility team
                </span>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-[13px] text-muted-foreground">
          Preferences are stored in this browser. Nothing on this page changes shared project data.
        </p>
        <Button size="sm">Save preferences</Button>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} readOnly className="bg-surface-muted" />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
