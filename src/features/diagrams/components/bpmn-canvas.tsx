"use client";

import * as React from "react";

import type { ProcessFlow } from "@/lib/types";

/**
 * BPMN 2.0 collaboration rendering of the outbound payment process.
 *
 * The semantic model lives in `src/data/process-flow.ts`; this file owns only
 * the diagram layout, so renaming a step or changing its description updates
 * the picture without touching coordinates.
 */

const LANES = [
  { id: "LN-1", name: "Customer", y: 20, height: 110 },
  { id: "LN-2", name: "Digital Channel", y: 130, height: 110 },
  { id: "LN-3", name: "Instant Payments Hub", y: 240, height: 150 },
  { id: "LN-4", name: "Financial Crime Controls", y: 390, height: 150 },
  { id: "LN-5", name: "Core Ledger & Scheme", y: 540, height: 190 },
] as const;

const TASK_W = 124;
const TASK_H = 56;

type Shape =
  | { kind: "event"; id: string; cx: number; cy: number; variant: "start" | "end" | "end-reject" }
  | { kind: "task"; id: string; x: number; y: number; icon: "user" | "service" }
  | { kind: "gateway"; id: string; cx: number; cy: number };

const SHAPES: Shape[] = [
  { kind: "event", id: "S1", cx: 110, cy: 75, variant: "start" },
  { kind: "task", id: "S2", x: 170, y: 157, icon: "user" },
  { kind: "task", id: "S3", x: 330, y: 287, icon: "service" },
  { kind: "gateway", id: "S4", cx: 510, cy: 315 },
  { kind: "task", id: "S5", x: 570, y: 287, icon: "service" },
  { kind: "task", id: "S6", x: 740, y: 437, icon: "service" },
  { kind: "gateway", id: "S7", cx: 920, cy: 465 },
  { kind: "task", id: "S8", x: 980, y: 437, icon: "service" },
  { kind: "task", id: "S9", x: 1150, y: 560, icon: "service" },
  { kind: "task", id: "S10", x: 1310, y: 560, icon: "service" },
  { kind: "gateway", id: "S11", cx: 1490, cy: 588 },
  { kind: "task", id: "S12", x: 1550, y: 560, icon: "service" },
  { kind: "task", id: "S13", x: 1550, y: 650, icon: "service" },
  { kind: "event", id: "S15", cx: 1760, cy: 55, variant: "end" },
  { kind: "event", id: "S14", cx: 1760, cy: 105, variant: "end-reject" },
];

interface Flow {
  d: string;
  label?: string;
  labelAt?: [number, number];
  dashed?: boolean;
}

const FLOWS: Flow[] = [
  { d: "M 128 75 H 232 V 157" },
  { d: "M 294 185 H 312 V 287 H 330" },
  { d: "M 454 315 H 484" },
  { d: "M 536 315 H 570", label: "MATCH", labelAt: [553, 305] },
  {
    d: "M 510 289 V 38 H 1760 V 87",
    label: "NO_MATCH / blocked",
    labelAt: [700, 30],
    dashed: true,
  },
  { d: "M 694 315 H 716 V 465 H 740" },
  { d: "M 864 465 H 894" },
  { d: "M 946 465 H 980", label: "score < 85", labelAt: [963, 455] },
  {
    d: "M 920 439 V 38",
    label: "score ≥ 85",
    labelAt: [930, 250],
    dashed: true,
  },
  { d: "M 1104 465 H 1126 V 588 H 1150" },
  { d: "M 1274 588 H 1310" },
  { d: "M 1434 588 H 1464" },
  { d: "M 1516 588 H 1550", label: "ACCP", labelAt: [1533, 578] },
  { d: "M 1490 614 V 678 H 1550", label: "RJCT / timeout", labelAt: [1497, 700], dashed: true },
  { d: "M 1674 588 H 1700 V 55 H 1742" },
  { d: "M 1674 678 H 1720 V 105 H 1742", dashed: true },
];

const ANNOTATIONS = [
  {
    x: 1150,
    y: 736,
    text: "Reservation expires automatically after 25 s (BR-011)",
  },
  {
    x: 330,
    y: 262,
    text: "Scheme deadline: 10 s end to end (REQ-020)",
  },
];

export function BpmnCanvas({ flow }: { flow: ProcessFlow }) {
  const stepById = React.useMemo(
    () => new Map(flow.steps.map((step) => [step.id, step])),
    [flow.steps],
  );

  return (
    <svg
      viewBox="0 0 1830 760"
      width={1830}
      height={760}
      role="img"
      aria-label={`BPMN collaboration diagram — ${flow.name}`}
      className="select-none"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <defs>
        <marker id="bpmn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
        </marker>
      </defs>

      {/* Pool */}
      <rect
        x={0}
        y={20}
        width={1820}
        height={710}
        fill="hsl(var(--surface))"
        stroke="hsl(var(--border))"
        strokeWidth={1.5}
        rx={2}
      />
      <rect x={0} y={20} width={34} height={710} fill="hsl(var(--surface-muted))" stroke="hsl(var(--border))" />
      <text
        x={17}
        y={375}
        transform="rotate(-90 17 375)"
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="hsl(var(--foreground))"
      >
        Retail Bank — Instant Payments
      </text>

      {/* Lanes */}
      {LANES.map((lane) => (
        <g key={lane.id}>
          <rect
            x={34}
            y={lane.y}
            width={1786}
            height={lane.height}
            fill="none"
            stroke="hsl(var(--border))"
          />
          <rect
            x={34}
            y={lane.y}
            width={30}
            height={lane.height}
            fill="hsl(var(--surface-muted))"
            stroke="hsl(var(--border))"
          />
          <text
            x={49}
            y={lane.y + lane.height / 2}
            transform={`rotate(-90 49 ${lane.y + lane.height / 2})`}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="hsl(var(--muted-foreground))"
          >
            {lane.name}
          </text>
        </g>
      ))}

      {/* Sequence flows */}
      {FLOWS.map((connector, index) => (
        <g key={index}>
          <path
            d={connector.d}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.4}
            strokeDasharray={connector.dashed ? "5 4" : undefined}
            markerEnd="url(#bpmn-arrow)"
          />
          {connector.label && connector.labelAt && (
            <text
              x={connector.labelAt[0]}
              y={connector.labelAt[1]}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
            >
              {connector.label}
            </text>
          )}
        </g>
      ))}

      {/* Annotations */}
      {ANNOTATIONS.map((annotation) => (
        <text
          key={annotation.text}
          x={annotation.x}
          y={annotation.y}
          fontSize={10}
          fontStyle="italic"
          fill="hsl(var(--muted-foreground))"
        >
          {annotation.text}
        </text>
      ))}

      {/* Shapes */}
      {SHAPES.map((shape) => {
        const step = stepById.get(shape.id);
        if (!step) return null;

        if (shape.kind === "event") {
          const isEnd = shape.variant !== "start";
          return (
            <g key={shape.id}>
              <circle
                cx={shape.cx}
                cy={shape.cy}
                r={17}
                fill="hsl(var(--surface))"
                stroke={
                  shape.variant === "end-reject"
                    ? "hsl(var(--destructive))"
                    : shape.variant === "end"
                      ? "hsl(142 70% 32%)"
                      : "hsl(var(--muted-foreground))"
                }
                strokeWidth={isEnd ? 3 : 1.6}
              />
              {wrapLabel(step.name.replace(/^(Start|End) — /, ""), 18).map((line, index, lines) => (
                <text
                  key={index}
                  x={shape.cx}
                  y={shape.cy + 32 + index * 11 - (lines.length - 1) * 0}
                  textAnchor="middle"
                  fontSize={10}
                  fill="hsl(var(--foreground))"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        }

        if (shape.kind === "gateway") {
          return (
            <g key={shape.id}>
              <path
                d={`M ${shape.cx} ${shape.cy - 26} L ${shape.cx + 26} ${shape.cy} L ${shape.cx} ${shape.cy + 26} L ${shape.cx - 26} ${shape.cy} Z`}
                fill="hsl(var(--surface))"
                stroke="hsl(38 92% 45%)"
                strokeWidth={1.8}
              />
              <path
                d={`M ${shape.cx - 9} ${shape.cy - 9} L ${shape.cx + 9} ${shape.cy + 9} M ${shape.cx + 9} ${shape.cy - 9} L ${shape.cx - 9} ${shape.cy + 9}`}
                stroke="hsl(38 92% 45%)"
                strokeWidth={2}
              />
              {wrapLabel(step.name, 18).map((line, index) => (
                <text
                  key={index}
                  x={shape.cx}
                  y={shape.cy + 42 + index * 11}
                  textAnchor="middle"
                  fontSize={10}
                  fill="hsl(var(--foreground))"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        }

        return (
          <g key={shape.id}>
            <rect
              x={shape.x}
              y={shape.y}
              width={TASK_W}
              height={TASK_H}
              rx={6}
              fill="hsl(var(--surface))"
              stroke="hsl(var(--primary))"
              strokeWidth={1.4}
            />
            <rect
              x={shape.x}
              y={shape.y}
              width={TASK_W}
              height={4}
              rx={2}
              fill="hsl(var(--primary))"
              opacity={0.35}
            />
            {shape.icon === "service" ? (
              <circle
                cx={shape.x + 12}
                cy={shape.y + 16}
                r={4.5}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.4}
              />
            ) : (
              <path
                d={`M ${shape.x + 8} ${shape.y + 20} a 4 4 0 0 1 8 0 M ${shape.x + 12} ${shape.y + 12} m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.3}
              />
            )}
            {wrapLabel(step.name, 17).map((line, index) => (
              <text
                key={index}
                x={shape.x + TASK_W / 2}
                y={shape.y + 32 + index * 12}
                textAnchor="middle"
                fontSize={10.5}
                fill="hsl(var(--foreground))"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/** Greedy word wrap for SVG text, which has no automatic wrapping. */
function wrapLabel(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}
