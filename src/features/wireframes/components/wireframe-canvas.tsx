"use client";

import * as React from "react";

/**
 * Low-fidelity screen mockups drawn as SVG so they stay crisp at any zoom and
 * follow the workspace theme. One renderer per screen identifier.
 */

const surface = "hsl(var(--surface))";
const muted = "hsl(var(--surface-muted))";
const stroke = "hsl(var(--border))";
const text = "hsl(var(--foreground))";
const subtle = "hsl(var(--muted-foreground))";
const accent = "hsl(var(--primary))";

function Phone({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg
      viewBox="0 0 320 640"
      width={320}
      height={640}
      role="img"
      aria-label={label}
      className="select-none"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <rect x={0} y={0} width={320} height={640} rx={26} fill={muted} stroke={stroke} strokeWidth={1.5} />
      <rect x={10} y={10} width={300} height={620} rx={18} fill={surface} stroke={stroke} />
      <rect x={120} y={18} width={80} height={7} rx={3.5} fill={stroke} />
      {children}
    </svg>
  );
}

function Field({
  x,
  y,
  w,
  label,
  value,
  active,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <g>
      <text x={x} y={y} fontSize={9} fill={subtle}>
        {label}
      </text>
      <rect
        x={x}
        y={y + 6}
        width={w}
        height={30}
        rx={5}
        fill={surface}
        stroke={active ? accent : stroke}
        strokeWidth={active ? 1.6 : 1.2}
      />
      <text x={x + 9} y={y + 25} fontSize={10.5} fill={text}>
        {value}
      </text>
    </g>
  );
}

function PrimaryButton({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={36} rx={6} fill={accent} />
      <text x={x + w / 2} y={y + 23} textAnchor="middle" fontSize={11} fontWeight={600} fill="white">
        {label}
      </text>
    </g>
  );
}

function SecondaryButton({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={36} rx={6} fill={surface} stroke={stroke} strokeWidth={1.3} />
      <text x={x + w / 2} y={y + 23} textAnchor="middle" fontSize={11} fontWeight={500} fill={text}>
        {label}
      </text>
    </g>
  );
}

function AppBar({ title }: { title: string }) {
  return (
    <g>
      <rect x={10} y={34} width={300} height={44} fill={muted} />
      <path d="M 34 56 l -8 -7 M 34 56 l -8 7 M 26 56 h 16" stroke={subtle} strokeWidth={1.4} fill="none" />
      <text x={160} y={60} textAnchor="middle" fontSize={12} fontWeight={600} fill={text}>
        {title}
      </text>
      <line x1={10} y1={78} x2={310} y2={78} stroke={stroke} />
    </g>
  );
}

function Banner({
  y,
  tone,
  title,
  body,
}: {
  y: number;
  tone: "info" | "warning" | "success" | "danger";
  title: string;
  body: string[];
}) {
  const colours = {
    info: ["hsl(200 90% 96%)", "hsl(200 80% 40%)"],
    warning: ["hsl(38 92% 95%)", "hsl(38 92% 42%)"],
    success: ["hsl(150 60% 95%)", "hsl(150 60% 32%)"],
    danger: ["hsl(0 80% 96%)", "hsl(0 70% 45%)"],
  }[tone];

  return (
    <g>
      <rect x={26} y={y} width={268} height={26 + body.length * 13} rx={6} fill={colours[0]} stroke={colours[1]} strokeWidth={1.1} />
      <text x={38} y={y + 17} fontSize={10.5} fontWeight={600} fill={colours[1]}>
        {title}
      </text>
      {body.map((entry, index) => (
        <text key={index} x={38} y={y + 32 + index * 13} fontSize={9.5} fill={text}>
          {entry}
        </text>
      ))}
    </g>
  );
}

/* ------------------------------- Screens ------------------------------- */

function PaymentCapture() {
  return (
    <Phone label="Instant payment capture screen">
      <AppBar title="Send money" />
      <g>
        <rect x={26} y={92} width={104} height={20} rx={10} fill="hsl(150 60% 95%)" stroke="hsl(150 60% 32%)" />
        <circle cx={38} cy={102} r={3.5} fill="hsl(150 60% 32%)" />
        <text x={48} y={106} fontSize={9.5} fill="hsl(150 60% 30%)">
          Instant · 10 sec
        </text>
      </g>
      <Field x={26} y={132} w={268} label="From account" value="Current account · NL91 ···· 4300" />
      <text x={26} y={186} fontSize={9} fill={subtle}>
        Available balance EUR 4,820.55
      </text>

      <Field x={26} y={206} w={268} label="Beneficiary IBAN" value="DE89 3704 0044 0532 0130 00" active />
      <Field x={26} y={266} w={268} label="Beneficiary name" value="Helena Brandt" />
      <Field x={26} y={326} w={268} label="Amount (EUR)" value="1,250.00" />
      <Field x={26} y={386} w={268} label="Reference (optional)" value="Invoice 2025-0442" />

      <Banner
        y={442}
        tone="info"
        title="Daily instant limit"
        body={["EUR 15,500.00 of EUR 30,000.00 remaining", "Resets on a rolling 24-hour basis"]}
      />

      <PrimaryButton x={26} y={528} w={268} label="Continue" />
      <SecondaryButton x={26} y={572} w={268} label="Send as standard transfer instead" />
    </Phone>
  );
}

function VerificationOfPayee() {
  return (
    <Phone label="Verification of Payee close match screen">
      <AppBar title="Check the name" />
      <g>
        <circle cx={160} cy={130} r={26} fill="hsl(38 92% 95%)" stroke="hsl(38 92% 45%)" strokeWidth={1.6} />
        <text x={160} y={137} textAnchor="middle" fontSize={22} fill="hsl(38 92% 40%)">
          !
        </text>
      </g>
      <text x={160} y={186} textAnchor="middle" fontSize={13} fontWeight={600} fill={text}>
        The name does not match exactly
      </text>
      <text x={160} y={206} textAnchor="middle" fontSize={10} fill={subtle}>
        Check with the person you are paying
      </text>

      <g>
        <rect x={26} y={228} width={268} height={62} rx={7} fill={muted} stroke={stroke} />
        <text x={40} y={248} fontSize={9} fill={subtle}>
          You entered
        </text>
        <text x={40} y={266} fontSize={12} fontWeight={600} fill={text}>
          Helena Brandt
        </text>
        <text x={40} y={282} fontSize={9} fill={subtle}>
          DE89 3704 ···· 3000
        </text>
      </g>

      <g>
        <rect x={26} y={300} width={268} height={62} rx={7} fill="hsl(38 92% 96%)" stroke="hsl(38 92% 45%)" />
        <text x={40} y={320} fontSize={9} fill="hsl(38 92% 35%)">
          Name registered at the bank
        </text>
        <text x={40} y={338} fontSize={12} fontWeight={600} fill={text}>
          H. M. Brandt
        </text>
        <text x={40} y={354} fontSize={9} fill={subtle}>
          Match score 87 / 100
        </text>
      </g>

      <Banner
        y={378}
        tone="warning"
        title="Instant payments cannot be reversed"
        body={["If you were asked to pay by someone you do not", "know, this could be a scam."]}
      />

      <PrimaryButton x={26} y={470} w={268} label="Amend the details" />
      <SecondaryButton x={26} y={514} w={268} label="Continue with the name I entered" />
      <text x={160} y={578} textAnchor="middle" fontSize={9} fill={subtle}>
        Your decision is recorded for your protection
      </text>
    </Phone>
  );
}

function ConfirmAndAuthorise() {
  return (
    <Phone label="Payment confirmation and SCA challenge screen">
      <AppBar title="Confirm payment" />
      <g>
        <rect x={26} y={94} width={268} height={130} rx={8} fill={muted} stroke={stroke} />
        <text x={160} y={126} textAnchor="middle" fontSize={11} fill={subtle}>
          You are sending
        </text>
        <text x={160} y={156} textAnchor="middle" fontSize={24} fontWeight={700} fill={text}>
          EUR 1,250.00
        </text>
        <line x1={44} y1={172} x2={276} y2={172} stroke={stroke} />
        <text x={44} y={192} fontSize={9.5} fill={subtle}>
          To
        </text>
        <text x={276} y={192} textAnchor="end" fontSize={10.5} fontWeight={600} fill={text}>
          H. M. Brandt
        </text>
        <text x={44} y={210} fontSize={9.5} fill={subtle}>
          Arrives
        </text>
        <text x={276} y={210} textAnchor="end" fontSize={10.5} fill={text}>
          Within 10 seconds
        </text>
      </g>

      <g>
        <text x={26} y={252} fontSize={9} fill={subtle}>
          Reference
        </text>
        <text x={26} y={270} fontSize={10.5} fill={text}>
          Invoice 2025-0442
        </text>
        <line x1={26} y1={284} x2={294} y2={284} stroke={stroke} />
        <text x={26} y={304} fontSize={9} fill={subtle}>
          Fee
        </text>
        <text x={294} y={304} textAnchor="end" fontSize={10.5} fill={text}>
          No fee
        </text>
      </g>

      <g>
        <rect x={26} y={326} width={268} height={188} rx={10} fill={surface} stroke={accent} strokeWidth={1.5} />
        <text x={160} y={352} textAnchor="middle" fontSize={11} fontWeight={600} fill={text}>
          Authorise with Face ID
        </text>
        <circle cx={160} cy={412} r={34} fill="none" stroke={accent} strokeWidth={2} />
        <path
          d="M 146 400 v -6 a 4 4 0 0 1 4 -4 h 6 M 174 400 v -6 a 4 4 0 0 0 -4 -4 h -6 M 146 424 v 6 a 4 4 0 0 0 4 4 h 6 M 174 424 v 6 a 4 4 0 0 1 -4 4 h -6"
          stroke={accent}
          strokeWidth={2}
          fill="none"
        />
        <text x={160} y={470} textAnchor="middle" fontSize={9.5} fill={subtle}>
          Confirming: EUR 1,250.00 to H. M. Brandt
        </text>
        <text x={160} y={488} textAnchor="middle" fontSize={9} fill={subtle}>
          Dynamic linking — PSD2 Article 97
        </text>
      </g>

      <SecondaryButton x={26} y={534} w={268} label="Cancel" />
    </Phone>
  );
}

function PaymentSettled() {
  return (
    <Phone label="Payment settled confirmation screen">
      <AppBar title="Payment sent" />
      <circle cx={160} cy={148} r={34} fill="hsl(150 60% 95%)" stroke="hsl(150 60% 34%)" strokeWidth={2} />
      <path d="M 146 148 l 10 11 l 20 -22" stroke="hsl(150 60% 30%)" strokeWidth={3} fill="none" />

      <text x={160} y={214} textAnchor="middle" fontSize={15} fontWeight={700} fill={text}>
        EUR 1,250.00 sent
      </text>
      <text x={160} y={234} textAnchor="middle" fontSize={10.5} fill={subtle}>
        Received by H. M. Brandt
      </text>

      <g>
        <rect x={26} y={258} width={268} height={140} rx={8} fill={muted} stroke={stroke} />
        <text x={44} y={282} fontSize={9.5} fill={subtle}>
          Settled at
        </text>
        <text x={276} y={282} textAnchor="end" fontSize={10.5} fill={text}>
          02 Jun 2025 · 09:41:07
        </text>
        <text x={44} y={308} fontSize={9.5} fill={subtle}>
          Completed in
        </text>
        <text x={276} y={308} textAnchor="end" fontSize={10.5} fill={text}>
          3.2 seconds
        </text>
        <text x={44} y={334} fontSize={9.5} fill={subtle}>
          Scheme reference
        </text>
        <text x={276} y={334} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill={text}>
          TIPS20250602X0099183
        </text>
        <line x1={44} y1={352} x2={276} y2={352} stroke={stroke} />
        <text x={44} y={376} fontSize={9.5} fill={subtle}>
          New balance
        </text>
        <text x={276} y={376} textAnchor="end" fontSize={11} fontWeight={600} fill={text}>
          EUR 3,570.55
        </text>
      </g>

      <Banner
        y={414}
        tone="success"
        title="Instant payments are final"
        body={["This payment cannot be cancelled or reversed."]}
      />

      <PrimaryButton x={26} y={492} w={268} label="Share receipt" />
      <SecondaryButton x={26} y={536} w={268} label="Done" />
    </Phone>
  );
}

function PaymentRejected() {
  return (
    <Phone label="Payment rejected with fallback screen">
      <AppBar title="Payment not sent" />
      <circle cx={160} cy={144} r={34} fill="hsl(0 80% 96%)" stroke="hsl(0 70% 48%)" strokeWidth={2} />
      <path d="M 148 132 l 24 24 M 172 132 l -24 24" stroke="hsl(0 70% 45%)" strokeWidth={3} />

      <text x={160} y={210} textAnchor="middle" fontSize={14} fontWeight={700} fill={text}>
        The beneficiary account is closed
      </text>
      <text x={160} y={232} textAnchor="middle" fontSize={10.5} fill={subtle}>
        No money has left your account.
      </text>

      <g>
        <rect x={26} y={256} width={268} height={104} rx={8} fill={muted} stroke={stroke} />
        <text x={44} y={280} fontSize={9.5} fill={subtle}>
          Amount
        </text>
        <text x={276} y={280} textAnchor="end" fontSize={10.5} fill={text}>
          EUR 1,250.00
        </text>
        <text x={44} y={306} fontSize={9.5} fill={subtle}>
          Beneficiary
        </text>
        <text x={276} y={306} textAnchor="end" fontSize={10.5} fill={text}>
          H. M. Brandt
        </text>
        <text x={44} y={332} fontSize={9.5} fill={subtle}>
          Your balance
        </text>
        <text x={276} y={332} textAnchor="end" fontSize={10.5} fontWeight={600} fill={text}>
          Unchanged
        </text>
      </g>

      <Banner
        y={378}
        tone="info"
        title="Try a standard transfer"
        body={["Your details are saved. A standard SEPA transfer", "would arrive on 03 Jun 2025."]}
      />

      <PrimaryButton x={26} y={470} w={268} label="Send as standard transfer" />
      <SecondaryButton x={26} y={514} w={268} label="Edit beneficiary details" />
      <text x={160} y={578} textAnchor="middle" fontSize={9} fill={subtle}>
        Reference IPH-P-20250602-0093312
      </text>
    </Phone>
  );
}

function OperationsConsole() {
  const queues = [
    { label: "Compliance holds", count: "7", tone: "hsl(0 70% 48%)" },
    { label: "Fraud review", count: "12", tone: "hsl(38 92% 45%)" },
    { label: "Failed reservations", count: "2", tone: "hsl(38 92% 45%)" },
    { label: "Reconciliation breaks", count: "1", tone: "hsl(200 80% 42%)" },
  ];

  const rows = [
    ["IPH-P-20250602-0093312", "EUR 1,250.00", "Compliance hold", "09:41", "Unassigned"],
    ["IPH-P-20250602-0093298", "EUR 18,400.00", "Fraud review", "09:38", "T. Lindqvist"],
    ["IPH-P-20250602-0093244", "EUR 640.00", "Compliance hold", "09:31", "Unassigned"],
    ["IPH-P-20250602-0093180", "EUR 2,900.00", "Failed reservation", "09:22", "P. Raghunathan"],
    ["IPH-P-20250601-0091044", "EUR 2,400.00", "Recon break", "Yesterday", "M. Delacroix"],
  ];

  return (
    <svg
      viewBox="0 0 960 560"
      width={960}
      height={560}
      role="img"
      aria-label="Operations console exception queues screen"
      className="select-none"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <rect x={0} y={0} width={960} height={560} rx={8} fill={surface} stroke={stroke} strokeWidth={1.5} />

      {/* Top bar */}
      <rect x={0} y={0} width={960} height={44} fill={muted} />
      <line x1={0} y1={44} x2={960} y2={44} stroke={stroke} />
      <text x={20} y={28} fontSize={12} fontWeight={700} fill={text}>
        Payments Operations Console
      </text>
      <rect x={620} y={11} width={190} height={22} rx={5} fill={surface} stroke={stroke} />
      <text x={632} y={26} fontSize={9.5} fill={subtle}>
        Search payment reference…
      </text>
      <circle cx={890} cy={22} r={11} fill={surface} stroke={stroke} />
      <text x={890} y={26} textAnchor="middle" fontSize={9} fill={subtle}>
        MD
      </text>

      {/* Side nav */}
      <rect x={0} y={44} width={168} height={516} fill={muted} />
      <line x1={168} y1={44} x2={168} y2={560} stroke={stroke} />
      {["Exception queues", "Payment search", "Recall cases", "Reconciliation", "Reports"].map(
        (item, index) => (
          <g key={item}>
            <rect
              x={10}
              y={62 + index * 32}
              width={148}
              height={26}
              rx={5}
              fill={index === 0 ? surface : "none"}
              stroke={index === 0 ? stroke : "none"}
            />
            <text
              x={24}
              y={79 + index * 32}
              fontSize={10.5}
              fontWeight={index === 0 ? 600 : 400}
              fill={index === 0 ? text : subtle}
            >
              {item}
            </text>
          </g>
        ),
      )}

      {/* Queue tiles */}
      {queues.map((queue, index) => (
        <g key={queue.label}>
          <rect
            x={188 + index * 190}
            y={66}
            width={172}
            height={64}
            rx={7}
            fill={surface}
            stroke={stroke}
          />
          <rect x={188 + index * 190} y={66} width={172} height={3} rx={1.5} fill={queue.tone} />
          <text x={202 + index * 190} y={98} fontSize={20} fontWeight={700} fill={text}>
            {queue.count}
          </text>
          <text x={202 + index * 190} y={116} fontSize={9.5} fill={subtle}>
            {queue.label}
          </text>
        </g>
      ))}

      {/* Table */}
      <rect x={188} y={152} width={752} height={330} rx={7} fill={surface} stroke={stroke} />
      <rect x={188} y={152} width={752} height={32} fill={muted} />
      <line x1={188} y1={184} x2={940} y2={184} stroke={stroke} />
      {["Payment reference", "Amount", "Queue", "Received", "Assigned to"].map((header, index) => (
        <text
          key={header}
          x={204 + index * 150}
          y={172}
          fontSize={9}
          fontWeight={600}
          fill={subtle}
        >
          {header.toUpperCase()}
        </text>
      ))}

      {rows.map((row, rowIndex) => (
        <g key={row[0]}>
          <line x1={188} y1={216 + rowIndex * 36} x2={940} y2={216 + rowIndex * 36} stroke={stroke} />
          {row.map((cell, cellIndex) => (
            <text
              key={cellIndex}
              x={204 + cellIndex * 150}
              y={206 + rowIndex * 36}
              fontSize={10}
              fontFamily={cellIndex === 0 ? "var(--font-mono)" : undefined}
              fill={cellIndex === 4 && cell === "Unassigned" ? subtle : text}
            >
              {cell}
            </text>
          ))}
        </g>
      ))}

      {/* Action bar */}
      <rect x={188} y={498} width={752} height={44} rx={7} fill={muted} stroke={stroke} />
      <text x={204} y={525} fontSize={10} fill={subtle}>
        2 selected
      </text>
      <rect x={640} y={508} width={110} height={26} rx={5} fill={surface} stroke={stroke} />
      <text x={695} y={525} textAnchor="middle" fontSize={10} fill={text}>
        Assign to me
      </text>
      <rect x={760} y={508} width={166} height={26} rx={5} fill={accent} />
      <text x={843} y={525} textAnchor="middle" fontSize={10} fontWeight={600} fill="white">
        Release (four-eyes)
      </text>
    </svg>
  );
}

const SCREENS: Record<string, () => React.JSX.Element> = {
  "SCR-PAY-01": PaymentCapture,
  "SCR-PAY-02": VerificationOfPayee,
  "SCR-PAY-03": ConfirmAndAuthorise,
  "SCR-PAY-04": PaymentSettled,
  "SCR-PAY-05": PaymentRejected,
  "SCR-OPS-01": OperationsConsole,
};

export function WireframeCanvas({ screenId }: { screenId: string }) {
  const Renderer = SCREENS[screenId];
  if (!Renderer) return null;
  return <Renderer />;
}
