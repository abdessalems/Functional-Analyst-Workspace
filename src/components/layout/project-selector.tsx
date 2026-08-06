"use client";

import * as React from "react";
import { Check, ChevronsUpDown, FolderKanban } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/status-badge";

export function ProjectSelector() {
  const { projects, project, openProject } = useWorkspace();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 max-w-[15rem] justify-between gap-2 px-2.5 font-normal sm:max-w-[18rem]"
        >
          <FolderKanban className="text-muted-foreground" />
          <span className="flex min-w-0 flex-col items-start leading-tight">
            <span className="w-full truncate text-[13px] font-medium">{project.shortName}</span>
            <span className="text-[11px] text-muted-foreground">
              {project.code} · v{project.version}
            </span>
          </span>
          <ChevronsUpDown className="ml-1 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[22rem]">
        <DropdownMenuLabel>Payments &amp; Onboarding portfolio</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onSelect={() => openProject(item.id)}
            className="items-start gap-2.5 py-2"
          >
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                item.id === project.id ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-[13px] font-medium">{item.shortName}</span>
                <StatusBadge status={item.status} />
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {item.code} · {item.subDomain} · {item.owner.name}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
