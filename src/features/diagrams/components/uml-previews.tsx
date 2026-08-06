"use client";

import * as React from "react";

import type { DiagramType } from "@/lib/types";

/**
 * Rendered previews of the PlantUML models. The `.puml` source in
 * `src/data/diagrams.ts` remains the authoritative artefact; these SVGs are the
 * visual representation shown in the workspace and exported by the viewer.
 */

const stroke = "hsl(var(--border))";
const line = "hsl(var(--muted-foreground))";
const text = "hsl(var(--foreground))";
const muted = "hsl(var(--muted-foreground))";
const surface = "hsl(var(--surface))";
const accent = "hsl(var(--primary))";

function Defs() {
  return (
    <defs>
      <marker
        id="uml-arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={line} />
      </marker>
      <marker
        id="uml-open-arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={line} strokeWidth="1.4" />
      </marker>
    </defs>
  );
}

function Frame({
  width,
  height,
  label,
  children,
}: {
  width: number;
  height: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="select-none"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <Defs />
      <rect x={0} y={0} width={width} height={height} fill={surface} />
      {children}
    </svg>
  );
}

function StickActor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill="none" stroke={line} strokeWidth={1.4} />
      <path
        d={`M ${x} ${y + 8} V ${y + 28} M ${x - 11} ${y + 16} H ${x + 11} M ${x} ${y + 28} L ${x - 9} ${y + 42} M ${x} ${y + 28} L ${x + 9} ${y + 42}`}
        stroke={line}
        strokeWidth={1.4}
        fill="none"
      />
      <text x={x} y={y + 56} textAnchor="middle" fontSize={10} fill={text}>
        {label}
      </text>
    </g>
  );
}

function Box({
  x,
  y,
  w,
  h,
  lines,
  accentTop,
  rx = 5,
  fontSize = 10.5,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  accentTop?: boolean;
  rx?: number;
  fontSize?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={surface} stroke={accentTop ? accent : stroke} strokeWidth={1.3} />
      {accentTop && <rect x={x} y={y} width={w} height={3} rx={1.5} fill={accent} opacity={0.4} />}
      {lines.map((entry, index) => (
        <text
          key={index}
          x={x + w / 2}
          y={y + h / 2 + 4 + (index - (lines.length - 1) / 2) * 12}
          textAnchor="middle"
          fontSize={fontSize}
          fill={text}
        >
          {entry}
        </text>
      ))}
    </g>
  );
}

/* ------------------------------ Use case ------------------------------ */

const USE_CASES = [
  "Initiate Instant Payment",
  "Verify Payee",
  "Check Payment Status",
  "Manage Payment Limits",
  "Raise Recall Request",
  "Adjudicate Compliance Hold",
  "Reconcile Settlement",
  "Receive Inbound Payment",
];

const USE_CASE_ACTORS = [
  { label: "Retail Customer", y: 60, targets: [0, 2, 3] },
  { label: "SME Customer", y: 140, targets: [0, 2] },
  { label: "Contact Centre", y: 220, targets: [2, 4] },
  { label: "Payments Ops", y: 300, targets: [4, 6] },
  { label: "Compliance", y: 380, targets: [5] },
  { label: "TIPS Scheme", y: 455, targets: [7] },
];

function UseCaseDiagram() {
  const ucY = (index: number) => 70 + index * 58;

  return (
    <Frame width={900} height={560} label="Use case diagram">
      <rect x={250} y={30} width={620} height={500} rx={6} fill="none" stroke={stroke} strokeWidth={1.4} />
      <text x={560} y={22} textAnchor="middle" fontSize={11} fontWeight={600} fill={text}>
        Instant Payments Hub
      </text>

      {USE_CASE_ACTORS.map((actor) => (
        <g key={actor.label}>
          <StickActor x={70} y={actor.y} label={actor.label} />
          {actor.targets.map((target) => (
            <path
              key={target}
              d={`M 90 ${actor.y + 16} C 180 ${actor.y + 16}, 340 ${ucY(target)}, 455 ${ucY(target)}`}
              fill="none"
              stroke={line}
              strokeWidth={1.1}
            />
          ))}
        </g>
      ))}

      {USE_CASES.map((useCase, index) => (
        <g key={useCase}>
          <ellipse
            cx={600}
            cy={ucY(index)}
            rx={145}
            ry={24}
            fill={surface}
            stroke={accent}
            strokeWidth={1.3}
          />
          <text x={600} y={ucY(index) + 4} textAnchor="middle" fontSize={11} fill={text}>
            {useCase}
          </text>
        </g>
      ))}

      <path
        d={`M 600 ${ucY(0) + 24} V ${ucY(1) - 24}`}
        stroke={line}
        strokeDasharray="4 3"
        markerEnd="url(#uml-open-arrow)"
        fill="none"
      />
      <text x={615} y={ucY(0) + 42} fontSize={9.5} fill={muted}>
        &lt;&lt;include&gt;&gt;
      </text>

      <path
        d={`M 745 ${ucY(0)} C 830 ${ucY(0)}, 830 ${ucY(5)}, 745 ${ucY(5)}`}
        stroke={line}
        strokeDasharray="4 3"
        fill="none"
        markerEnd="url(#uml-open-arrow)"
      />
      <text x={800} y={ucY(2) + 30} fontSize={9.5} fill={muted}>
        &lt;&lt;extend&gt;&gt;
      </text>
    </Frame>
  );
}

/* ------------------------------ Sequence ------------------------------ */

const PARTICIPANTS = [
  { id: "APP", label: "Mobile App", x: 80 },
  { id: "IPH", label: "Payments Hub", x: 240 },
  { id: "VOP", label: "VoP Service", x: 400 },
  { id: "FRD", label: "Fraud Engine", x: 550 },
  { id: "SAN", label: "Sanctions", x: 690 },
  { id: "LDG", label: "Core Ledger", x: 820 },
  { id: "TIPS", label: "TIPS Gateway", x: 960 },
];

const MESSAGES: { from: string; to: string; y: number; label: string; dashed?: boolean }[] = [
  { from: "APP", to: "IPH", y: 120, label: "1 POST /payments" },
  { from: "IPH", to: "VOP", y: 178, label: "3 verifyPayee(iban, name)" },
  { from: "VOP", to: "IPH", y: 204, label: "4 CLOSE_MATCH", dashed: true },
  { from: "IPH", to: "APP", y: 232, label: "5 confirmation required", dashed: true },
  { from: "APP", to: "IPH", y: 258, label: "6 customer confirmed" },
  { from: "IPH", to: "FRD", y: 292, label: "7 score(paymentContext)" },
  { from: "FRD", to: "IPH", y: 318, label: "8 score = 41", dashed: true },
  { from: "IPH", to: "SAN", y: 352, label: "9 screen(parties)" },
  { from: "SAN", to: "IPH", y: 378, label: "10 CLEAR", dashed: true },
  { from: "IPH", to: "LDG", y: 412, label: "11 reserveFunds(amount, ttl=25s)" },
  { from: "LDG", to: "IPH", y: 438, label: "12 reservationId", dashed: true },
  { from: "IPH", to: "TIPS", y: 472, label: "13 pacs.008" },
  { from: "TIPS", to: "IPH", y: 498, label: "14 pacs.002 ACCP", dashed: true },
  { from: "IPH", to: "LDG", y: 532, label: "15 convertReservation()" },
  { from: "IPH", to: "APP", y: 566, label: "16 201 ACCP + schemeReference", dashed: true },
];

function SequenceDiagram() {
  const xOf = (id: string) => PARTICIPANTS.find((participant) => participant.id === id)!.x;

  return (
    <Frame width={1060} height={620} label="Sequence diagram">
      {PARTICIPANTS.map((participant) => (
        <g key={participant.id}>
          <Box x={participant.x - 62} y={26} w={124} h={38} lines={[participant.label]} accentTop />
          <path
            d={`M ${participant.x} 64 V 600`}
            stroke={stroke}
            strokeDasharray="5 5"
            strokeWidth={1.2}
          />
        </g>
      ))}

      {/* Activation bar on the hub */}
      <rect x={234} y={120} width={12} height={450} fill={accent} opacity={0.18} stroke={accent} strokeWidth={0.8} />

      {/* Self-call: structural validation */}
      <path
        d="M 246 146 H 292 V 166 H 250"
        fill="none"
        stroke={line}
        strokeWidth={1.2}
        markerEnd="url(#uml-arrow)"
      />
      <text x={300} y={150} fontSize={9.5} fill={muted}>
        2 validate structure (300 ms)
      </text>

      {MESSAGES.map((message, index) => {
        const from = xOf(message.from);
        const to = xOf(message.to);
        const forward = to > from;
        return (
          <g key={index}>
            <path
              d={`M ${from + (forward ? 7 : -7)} ${message.y} H ${to + (forward ? -6 : 6)}`}
              stroke={line}
              strokeWidth={1.2}
              strokeDasharray={message.dashed ? "5 4" : undefined}
              markerEnd="url(#uml-arrow)"
            />
            <text
              x={(from + to) / 2}
              y={message.y - 6}
              textAnchor="middle"
              fontSize={9.5}
              fill={muted}
            >
              {message.label}
            </text>
          </g>
        );
      })}

      <text x={20} y={606} fontSize={9.5} fontStyle="italic" fill={muted}>
        Total orchestration budget: 10 s (REQ-020)
      </text>
    </Frame>
  );
}

/* ------------------------------ Component ------------------------------ */

function ComponentDiagram() {
  return (
    <Frame width={960} height={520} label="Component diagram">
      {/* Packages */}
      <PackageBox x={20} y={40} w={200} h={150} label="Digital Channels" />
      <Box x={40} y={80} w={160} h={40} lines={["Mobile Banking App"]} />
      <Box x={40} y={132} w={160} h={40} lines={["Internet Banking"]} />

      <PackageBox x={270} y={20} w={360} h={330} label="Instant Payments Hub" />
      <Box x={290} y={60} w={150} h={40} lines={["Payment API Gateway"]} accentTop />
      <Box x={460} y={60} w={150} h={40} lines={["Orchestration Engine"]} accentTop />
      <Box x={290} y={120} w={150} h={40} lines={["Validation Service"]} />
      <Box x={460} y={120} w={150} h={40} lines={["Limit Service"]} />
      <Box x={290} y={180} w={150} h={40} lines={["Scheme Adapter"]} />
      <Box x={460} y={180} w={150} h={40} lines={["Reconciliation Svc"]} />
      <g>
        <path
          d="M 350 250 a 60 12 0 0 1 120 0 v 46 a 60 12 0 0 1 -120 0 z"
          fill={surface}
          stroke={stroke}
          strokeWidth={1.3}
        />
        <path d="M 350 250 a 60 12 0 0 0 120 0" fill="none" stroke={stroke} strokeWidth={1.3} />
        <text x={410} y={288} textAnchor="middle" fontSize={10.5} fill={text}>
          Payment Store
        </text>
      </g>

      <PackageBox x={690} y={40} w={230} h={130} label="Financial Crime" />
      <Box x={710} y={80} w={190} h={36} lines={["Fraud Decision Engine"]} />
      <Box x={710} y={124} w={190} h={36} lines={["Sanctions Screening"]} />

      <PackageBox x={690} y={200} w={230} h={180} label="Core Platforms" />
      <Box x={710} y={240} w={190} h={36} lines={["Core Banking T24"]} />
      <Box x={710} y={284} w={190} h={36} lines={["Notification Service"]} />
      <Box x={710} y={328} w={190} h={36} lines={["Audit Store"]} />

      {/* Cloud: scheme */}
      <g>
        <path
          d="M 330 430 a 26 26 0 0 1 26 -26 a 34 34 0 0 1 64 -8 a 28 28 0 0 1 40 34 a 24 24 0 0 1 -22 30 H 352 a 24 24 0 0 1 -22 -30 z"
          fill={surface}
          stroke={stroke}
          strokeWidth={1.3}
        />
        <text x={412} y={442} textAnchor="middle" fontSize={10.5} fill={text}>
          TIPS / ESMIG
        </text>
      </g>

      {/* Connections */}
      <Connector d="M 200 100 H 240 V 80 H 290" label="HTTPS / OAuth2" labelAt={[228, 74]} />
      <Connector d="M 200 152 H 250 V 80 H 290" />
      <Connector d="M 440 80 H 460" />
      <Connector d="M 535 100 V 120" />
      <Connector d="M 460 140 H 440" />
      <Connector d="M 535 160 V 180" />
      <Connector d="M 610 80 H 660 V 98 H 710" label="REST" labelAt={[662, 92]} />
      <Connector d="M 610 90 H 650 V 142 H 710" />
      <Connector d="M 610 70 H 670 V 258 H 710" label="reservation API" labelAt={[672, 250]} />
      <Connector d="M 610 200 H 660 V 302 H 710" label="events" labelAt={[662, 296]} />
      <Connector d="M 620 210 H 680 V 346 H 710" label="append-only" labelAt={[665, 340]} />
      <Connector d="M 365 220 V 240" />
      <Connector d="M 365 296 V 404" label="ISO 20022" labelAt={[318, 350]} />
      <Connector d="M 500 220 V 300 H 470" label="camt.053" labelAt={[512, 262]} />
    </Frame>
  );
}

function PackageBox({
  x,
  y,
  w,
  h,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} fill="none" stroke={stroke} strokeDasharray="4 3" />
      <rect x={x} y={y - 16} width={Math.min(w * 0.7, label.length * 7 + 16)} height={16} rx={3} fill="hsl(var(--surface-muted))" stroke={stroke} />
      <text x={x + 8} y={y - 4} fontSize={10} fontWeight={600} fill={muted}>
        {label}
      </text>
    </g>
  );
}

function Connector({
  d,
  label,
  labelAt,
}: {
  d: string;
  label?: string;
  labelAt?: [number, number];
}) {
  return (
    <g>
      <path d={d} fill="none" stroke={line} strokeWidth={1.2} markerEnd="url(#uml-arrow)" />
      {label && labelAt && (
        <text x={labelAt[0]} y={labelAt[1]} fontSize={9} fill={muted}>
          {label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------ Activity ------------------------------ */

function ActivityDiagram() {
  return (
    <Frame width={720} height={860} label="Activity diagram">
      <circle cx={240} cy={30} r={11} fill={line} />
      <Box x={150} y={62} w={180} h={40} lines={["Receive payment request"]} rx={18} accentTop />
      <Connector d="M 240 41 V 62" />

      <Diamond cx={240} cy={150} label="Amount & currency valid?" />
      <Connector d="M 240 102 V 116" />

      <Connector d="M 274 150 H 470" label="no" labelAt={[370, 143]} />
      <Box x={470} y={130} w={190} h={40} lines={["Reject IPH-VAL-001", "offer standard SCT"]} rx={18} />
      <Connector d="M 565 170 V 200" />
      <EndNode cx={565} cy={214} />

      <Connector d="M 240 184 V 208" label="yes" labelAt={[252, 200]} />
      <Box x={150} y={208} w={180} h={40} lines={["Verify payee"]} rx={18} accentTop />

      <Diamond cx={240} cy={300} label="VoP result?" />
      <Connector d="M 240 248 V 266" />
      <Connector d="M 274 300 H 470" label="NO_MATCH" labelAt={[365, 293]} />
      <Box x={470} y={280} w={190} h={40} lines={["Block IPH-VOP-022"]} rx={18} />
      <Connector d="M 565 320 V 344" />
      <EndNode cx={565} cy={358} />

      <Connector d="M 240 334 V 358" label="MATCH" labelAt={[254, 350]} />
      <Box x={150} y={358} w={180} h={40} lines={["Evaluate limits"]} rx={18} accentTop />

      <Diamond cx={240} cy={450} label="Within 24h limit?" />
      <Connector d="M 240 398 V 416" />
      <Connector d="M 274 450 H 470" label="no" labelAt={[370, 443]} />
      <Box x={470} y={430} w={190} h={40} lines={["Reject IPH-LIM-002"]} rx={18} />
      <Connector d="M 565 470 V 494" />
      <EndNode cx={565} cy={508} />

      <Connector d="M 240 484 V 508" label="yes" labelAt={[252, 500]} />
      <Box x={150} y={508} w={180} h={40} lines={["Score fraud risk"]} rx={18} accentTop />

      <Diamond cx={240} cy={600} label="Score >= 85?" />
      <Connector d="M 240 548 V 566" />
      <Connector d="M 274 600 H 470" label="yes" labelAt={[370, 593]} />
      <Box x={470} y={580} w={190} h={40} lines={["Block, create fraud case"]} rx={18} />
      <Connector d="M 565 620 V 644" />
      <EndNode cx={565} cy={658} />

      <Connector d="M 240 634 V 658" label="no" labelAt={[252, 650]} />
      <Box x={150} y={658} w={180} h={40} lines={["Screen sanctions"]} rx={18} accentTop />
      <Connector d="M 240 698 V 722" />
      <Box x={150} y={722} w={180} h={40} lines={["Reserve funds", "submit pacs.008"]} rx={18} accentTop />
      <Connector d="M 240 762 V 788" />
      <Box x={100} y={788} w={280} h={40} lines={["Convert reservation, notify customer"]} rx={18} accentTop />
      <Connector d="M 400 808 H 440" />
      <EndNode cx={454} cy={808} />
    </Frame>
  );
}

function Diamond({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <path
        d={`M ${cx} ${cy - 34} L ${cx + 34} ${cy} L ${cx} ${cy + 34} L ${cx - 34} ${cy} Z`}
        fill={surface}
        stroke="hsl(38 92% 45%)"
        strokeWidth={1.4}
      />
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize={9} fill={text}>
        {label.length > 16 ? label.slice(0, 15) + "…" : label}
      </text>
      {label.length > 16 && (
        <text x={cx} y={cy + 48} textAnchor="middle" fontSize={9} fill={muted}>
          {label}
        </text>
      )}
    </g>
  );
}

function EndNode({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="none" stroke={line} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={6} fill={line} />
    </g>
  );
}

/* ------------------------------ State ------------------------------ */

const STATES = [
  { id: "RCVD", x: 130, y: 60 },
  { id: "VALD", x: 300, y: 60 },
  { id: "COOLING_OFF", x: 300, y: 150 },
  { id: "SCRN", x: 480, y: 60 },
  { id: "RSVD", x: 650, y: 60 },
  { id: "SUBM", x: 820, y: 60 },
  { id: "HELD", x: 480, y: 160 },
  { id: "ACCP", x: 820, y: 250 },
  { id: "RJCT", x: 650, y: 340 },
  { id: "CANC", x: 300, y: 250 },
  { id: "RECALLED", x: 820, y: 340 },
];

const TRANSITIONS: { d: string; label: string; labelAt: [number, number] }[] = [
  { d: "M 60 82 H 130", label: "created", labelAt: [72, 74] },
  { d: "M 250 82 H 300", label: "validated", labelAt: [258, 74] },
  { d: "M 370 104 V 150", label: "first use > 5k", labelAt: [378, 132] },
  { d: "M 420 172 H 480 V 104", label: "30 min elapsed", labelAt: [424, 166] },
  { d: "M 370 194 V 250", label: "cancelled", labelAt: [378, 228] },
  { d: "M 420 82 H 480", label: "controls run", labelAt: [426, 74] },
  { d: "M 600 82 H 650", label: "cleared", labelAt: [606, 74] },
  { d: "M 540 104 V 160", label: "sanctions hit", labelAt: [400, 140] },
  { d: "M 770 82 H 820", label: "submitted", labelAt: [774, 74] },
  { d: "M 880 104 V 250", label: "pacs.002 ACCP", labelAt: [888, 190] },
  { d: "M 820 272 H 770 V 340", label: "RJCT / timeout", labelAt: [676, 300] },
  { d: "M 600 182 H 650 V 340", label: "compliance rejected", labelAt: [604, 220] },
  { d: "M 940 272 V 340", label: "recall accepted", labelAt: [948, 310] },
];

function StateDiagram() {
  return (
    <Frame width={1060} height={420} label="State machine diagram">
      <circle cx={44} cy={82} r={10} fill={line} />

      {STATES.map((state) => (
        <g key={state.id}>
          <rect
            x={state.x}
            y={state.y}
            width={120}
            height={44}
            rx={10}
            fill={surface}
            stroke={
              state.id === "ACCP"
                ? "hsl(142 70% 34%)"
                : state.id === "RJCT" || state.id === "CANC"
                  ? "hsl(var(--destructive))"
                  : accent
            }
            strokeWidth={1.4}
          />
          <text
            x={state.x + 60}
            y={state.y + 27}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={text}
          >
            {state.id}
          </text>
        </g>
      ))}

      {TRANSITIONS.map((transition, index) => (
        <g key={index}>
          <path
            d={transition.d}
            fill="none"
            stroke={line}
            strokeWidth={1.2}
            markerEnd="url(#uml-arrow)"
          />
          <text x={transition.labelAt[0]} y={transition.labelAt[1]} fontSize={9} fill={muted}>
            {transition.label}
          </text>
        </g>
      ))}

      <g>
        <circle cx={1000} cy={362} r={11} fill="none" stroke={line} strokeWidth={2} />
        <circle cx={1000} cy={362} r={5.5} fill={line} />
        <path d="M 940 362 H 986" stroke={line} strokeWidth={1.2} markerEnd="url(#uml-arrow)" />
      </g>

      <text x={20} y={406} fontSize={9.5} fontStyle="italic" fill={muted}>
        Terminal states are immutable — late scheme messages create linked exception records (FS-005).
      </text>
    </Frame>
  );
}

const RENDERERS: Record<DiagramType, () => React.JSX.Element> = {
  "Use Case": UseCaseDiagram,
  Sequence: SequenceDiagram,
  Component: ComponentDiagram,
  Activity: ActivityDiagram,
  State: StateDiagram,
};

export function UmlPreview({ type }: { type: DiagramType }) {
  const Renderer = RENDERERS[type];
  return <Renderer />;
}
