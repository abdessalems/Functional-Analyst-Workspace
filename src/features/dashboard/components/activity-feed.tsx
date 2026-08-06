import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FilePlus2,
  Link2,
  MessageSquareText,
  PencilLine,
  PlayCircle,
} from "lucide-react";

import type { ActivityEntry } from "@/lib/types";
import { formatDateTime, initials } from "@/lib/utils";

const TYPE_ICON = {
  created: FilePlus2,
  updated: PencilLine,
  approved: CheckCircle2,
  commented: MessageSquareText,
  linked: Link2,
  executed: PlayCircle,
} as const;

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => {
        const Icon = TYPE_ICON[entry.type];
        return (
          <li key={entry.id} className="flex gap-3 px-5 py-3.5 first:pt-4 last:pb-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-[10px] font-semibold text-muted-foreground">
              {initials(entry.actor)}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[13px] leading-relaxed">
                <span className="font-medium">{entry.actor}</span>{" "}
                <span className="text-muted-foreground">{entry.action}</span>{" "}
                <Link
                  href={entry.targetHref}
                  className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {entry.target}
                </Link>
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Icon className="size-3" />
                {formatDateTime(entry.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
