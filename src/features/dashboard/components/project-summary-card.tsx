"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, GitCommitVertical, UserRound } from "lucide-react";

import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/status-badge";
import { SecureLinkDialog } from "@/components/common/secure-link-dialog";

export function ProjectSummaryCard({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {project.code}
            </Badge>
            <StatusBadge status={project.status} />
            <Badge variant="neutral">{project.domain}</Badge>
            <Badge variant="neutral">{project.subDomain}</Badge>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight">{project.name}</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {project.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              {project.owner.name} · {project.owner.role}
            </span>
            <span className="flex items-center gap-1.5">
              <GitCommitVertical className="size-3.5" />
              {project.release}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatDate(project.startDate)} — {formatDate(project.targetDate)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64">
          <div className="space-y-2 rounded-lg border border-border bg-surface-muted p-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-muted-foreground">Delivery completion</span>
              <span className="text-lg font-semibold tabular-nums">{project.completion}%</span>
            </div>
            <Progress
              value={project.completion}
              aria-label={`Delivery completion ${project.completion}%`}
            />
            <p className="text-xs text-muted-foreground">
              Version {project.version} · updated {formatDate(project.lastUpdated)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <SecureLinkDialog
              resourceName={project.name}
              resourcePath={`/projects/${project.id.toLowerCase()}`}
            />
            <Button variant="ghost" size="sm" asChild className="justify-between">
              <Link href="/overview">
                Open project overview <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
