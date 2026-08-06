import type { BpmnModel, ProcessFlow } from "@/lib/types";

/** End-to-end outbound instant payment process, rendered as swimlanes and as BPMN. */
export const processFlows: ProcessFlow[] = [
  {
    id: "PF-001",
    name: "Outbound Instant Payment Execution",
    description:
      "Synchronous execution of a customer-initiated SEPA Instant Credit Transfer from channel submission through to scheme settlement, including the financial crime controls and the two-phase ledger reservation.",
    trigger: "The customer confirms an instant payment in the mobile or internet banking channel.",
    outcome:
      "The payment is settled at TIPS and booked on the customer account, or is rejected or held with a deterministic status returned to the channel.",
    slaTarget: "10 seconds end to end (95th percentile at or below 5 seconds)",
    lanes: [
      { id: "LN-1", name: "Customer", actorId: "ACT-001" },
      { id: "LN-2", name: "Digital Channel", actorId: "ACT-001" },
      { id: "LN-3", name: "Instant Payments Hub", actorId: "ACT-008" },
      { id: "LN-4", name: "Financial Crime Controls", actorId: "ACT-005" },
      { id: "LN-5", name: "Core Ledger & Scheme", actorId: "ACT-007" },
    ],
    steps: [
      {
        id: "S1",
        name: "Start — payment requested",
        type: "start",
        lane: "LN-1",
        description: "The customer enters beneficiary details and the amount, then confirms.",
        rules: [],
        next: ["S2"],
      },
      {
        id: "S2",
        name: "Capture & validate input",
        type: "task",
        lane: "LN-2",
        description:
          "The channel performs structural validation of IBAN, amount and reference before submission.",
        rules: ["BR-001", "BR-002"],
        next: ["S3"],
      },
      {
        id: "S3",
        name: "Verify payee",
        type: "system",
        lane: "LN-3",
        description:
          "Verification of Payee compares the entered beneficiary name against the registered account name.",
        rules: ["BR-006", "BR-007"],
        next: ["S4"],
      },
      {
        id: "S4",
        name: "Name match?",
        type: "decision",
        lane: "LN-3",
        description: "MATCH continues; CLOSE_MATCH or NO_MATCH returns to the customer for a decision.",
        rules: ["BR-006", "BR-007"],
        next: ["S5", "S14"],
      },
      {
        id: "S5",
        name: "Evaluate limits & reachability",
        type: "task",
        lane: "LN-3",
        description:
          "Segment limits, the scheme cap and the TIPS reachability directory are evaluated before any costly downstream call.",
        rules: ["BR-001", "BR-005", "BR-012"],
        next: ["S6"],
      },
      {
        id: "S6",
        name: "Score fraud risk",
        type: "system",
        lane: "LN-4",
        description: "The behavioural engine returns a risk score from 0 to 100.",
        rules: ["BR-009", "BR-010"],
        next: ["S7"],
      },
      {
        id: "S7",
        name: "Risk decision",
        type: "decision",
        lane: "LN-4",
        description:
          "Allow, challenge with step-up authentication, or block and refer to Fraud Operations.",
        rules: ["BR-009"],
        next: ["S8", "S14"],
      },
      {
        id: "S8",
        name: "Screen sanctions lists",
        type: "system",
        lane: "LN-4",
        description:
          "All payment parties are screened against consolidated sanctions lists within a 1,200 ms budget.",
        rules: ["BR-008"],
        next: ["S9"],
      },
      {
        id: "S9",
        name: "Reserve funds",
        type: "task",
        lane: "LN-5",
        description:
          "The amount is reserved on the debtor account with a 25-second expiry; the available balance drops immediately.",
        rules: ["BR-003", "BR-004", "BR-011"],
        next: ["S10"],
      },
      {
        id: "S10",
        name: "Submit pacs.008 to TIPS",
        type: "system",
        lane: "LN-5",
        description: "The ISO 20022 payment message is submitted to the scheme gateway.",
        rules: ["BR-011"],
        next: ["S11"],
      },
      {
        id: "S11",
        name: "Scheme accepted?",
        type: "decision",
        lane: "LN-5",
        description: "The pacs.002 response is correlated by end-to-end identification.",
        rules: ["BR-011"],
        next: ["S12", "S13"],
      },
      {
        id: "S12",
        name: "Book debit & notify",
        type: "task",
        lane: "LN-5",
        description:
          "The reservation is converted to a booked debit and the settlement notification is published.",
        rules: ["BR-014"],
        next: ["S15"],
      },
      {
        id: "S13",
        name: "Release reservation",
        type: "task",
        lane: "LN-5",
        description: "The reservation is released and the available balance is restored.",
        rules: ["BR-011"],
        next: ["S14"],
      },
      {
        id: "S14",
        name: "End — payment not executed",
        type: "end",
        lane: "LN-1",
        description:
          "The customer is shown the translated reason and is offered a retry or a standard SCT fallback.",
        rules: ["BR-012"],
        next: [],
      },
      {
        id: "S15",
        name: "End — payment settled",
        type: "end",
        lane: "LN-1",
        description: "The customer receives an immediate confirmation with the scheme reference.",
        rules: [],
        next: [],
      },
    ],
  },
];

export const bpmnModels: BpmnModel[] = [
  {
    id: "BPMN-001",
    title: "Outbound Instant Payment Execution",
    description:
      "Collaboration diagram covering the customer, channel, hub, financial crime controls and the scheme gateway, with the compensating release path for unconfirmed reservations.",
    version: "2.3",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2025-05-14",
    notation: "BPMN 2.0",
    processFlowId: "PF-001",
  },
];

export function getProcessFlowById(id: string): ProcessFlow | undefined {
  return processFlows.find((flow) => flow.id === id);
}
