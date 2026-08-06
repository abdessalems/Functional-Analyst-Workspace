"use client";

import * as React from "react";
import { Check, Copy, Link2, Lock, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

const AUDIENCES = [
  { value: "project", label: "Project members only", detail: "14 people with workspace access" },
  { value: "tribe", label: "Payments tribe", detail: "62 people across delivery and operations" },
  { value: "named", label: "Named recipients", detail: "Explicitly invited colleagues only" },
];

const EXPIRIES = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "never", label: "No expiry (requires approval)" },
];

interface SecureLinkDialogProps {
  resourceName: string;
  resourcePath: string;
  trigger?: React.ReactNode;
}

/**
 * Generates an internal, permissioned share link for an artefact. No data
 * leaves the workspace — the link is scoped to existing directory groups.
 */
export function SecureLinkDialog({ resourceName, resourcePath, trigger }: SecureLinkDialogProps) {
  const [audience, setAudience] = React.useState("project");
  const [expiry, setExpiry] = React.useState("7d");
  const [watermark, setWatermark] = React.useState(true);
  const [allowDownload, setAllowDownload] = React.useState(false);
  const { copied, copy } = useCopyToClipboard();

  const token = React.useMemo(
    () => `${audience}-${expiry}-8f3c1a`.replace(/[^a-z0-9-]/g, ""),
    [audience, expiry],
  );

  const link = `https://workspace.saadaoui.it.com/s/${token}${resourcePath}`;
  const selectedAudience = AUDIENCES.find((item) => item.value === audience);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Link2 /> Share securely
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Secure link sharing
          </DialogTitle>
          <DialogDescription>
            Share <span className="font-medium text-foreground">{resourceName}</span> with colleagues
            inside the bank. Access is enforced by the corporate directory and every view is logged.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="share-link">Secure link</Label>
            <div className="flex gap-2">
              <Input id="share-link" readOnly value={link} className="font-mono text-xs" />
              <Button variant="outline" onClick={() => copy(link)} className="shrink-0">
                {copied ? <Check className="text-emerald-600" /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="share-audience">Who can access</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="share-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{selectedAudience?.detail}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-expiry">Link expires</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger id="share-expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {expiry === "never"
                  ? "Requires information security approval"
                  : "Access is revoked automatically on expiry"}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-surface-muted p-3.5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="share-watermark" className="cursor-pointer">
                  Apply dynamic watermark
                </Label>
                <p className="text-xs text-muted-foreground">
                  Stamps the viewer&apos;s name and timestamp on every page.
                </p>
              </div>
              <Switch id="share-watermark" checked={watermark} onCheckedChange={setWatermark} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="share-download" className="cursor-pointer">
                  Allow download
                </Label>
                <p className="text-xs text-muted-foreground">
                  Disabled by default for Confidential and Restricted artefacts.
                </p>
              </div>
              <Switch id="share-download" checked={allowDownload} onCheckedChange={setAllowDownload} />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-primary/[0.04] p-3 text-xs leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <p>
              Links never leave the corporate network. Recipients authenticate with single sign-on and
              each access is written to the workspace audit log with the viewer identity and IP.
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <div className="mr-auto flex items-center gap-2">
            <Badge variant="info">Internal</Badge>
            <span className="text-xs text-muted-foreground">Audit logging enabled</span>
          </div>
          <Button variant="outline">Manage existing links</Button>
          <Button onClick={() => copy(link)}>
            <Link2 /> Create link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
