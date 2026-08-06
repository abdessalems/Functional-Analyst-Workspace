import type { Actor } from "@/lib/types";

/** Human, internal system and external actors participating in the instant payment flow. */
export const actors: Actor[] = [
  {
    id: "ACT-001",
    name: "Retail Customer",
    type: "Human",
    description:
      "An individual account holder initiating and receiving instant euro payments through the bank's digital channels.",
    responsibilities: [
      "Initiate instant payments and confirm beneficiary details",
      "Respond to Verification of Payee outcomes",
      "Complete Strong Customer Authentication challenges",
      "Cancel a payment during the cooling-off window",
    ],
    permissions: [
      "Initiate payment up to the segment limit",
      "View own payment history and status",
      "Manage beneficiaries and trusted payee list",
      "Request a temporary limit uplift",
    ],
    systemsUsed: ["Mobile Banking App", "Internet Banking Portal"],
    channel: "Digital Self-Service",
  },
  {
    id: "ACT-002",
    name: "SME Customer",
    type: "Human",
    description:
      "A small or medium enterprise user operating under a business mandate, frequently with dual authorisation configured.",
    responsibilities: [
      "Initiate supplier and payroll payments",
      "Apply second authorisation where the mandate requires it",
      "Reconcile outbound payments against accounting records",
    ],
    permissions: [
      "Initiate payment up to the SME limit of EUR 75,000 per 24 hours",
      "Authorise payments raised by other mandate holders",
      "Download payment confirmations and statements",
    ],
    systemsUsed: ["Business Banking Portal", "Mobile Banking App"],
    channel: "Digital Self-Service",
  },
  {
    id: "ACT-003",
    name: "Contact Centre Agent",
    type: "Human",
    description:
      "First-line servicing agent handling customer enquiries about payment status, limits and failed payments.",
    responsibilities: [
      "Answer payment status enquiries at first contact",
      "Explain rejection reason codes in plain language",
      "Raise a recall request on the customer's instruction",
      "Escalate suspected fraud to the Fraud Operations Analyst",
    ],
    permissions: [
      "Read payment status and stage timings",
      "Raise recall request (requires supervisor approval)",
      "View customer limits and remaining allowance",
      "No access to release compliance holds",
    ],
    systemsUsed: ["Contact Centre Desktop", "Operations Console (read-only)"],
    channel: "Assisted Servicing",
  },
  {
    id: "ACT-004",
    name: "Payments Operations Officer",
    type: "Human",
    description:
      "Back-office specialist managing exception queues, reconciliation breaks and scheme correspondence.",
    responsibilities: [
      "Triage failed reservations and unreconciled payments",
      "Process inbound and outbound recall cases within scheme deadlines",
      "Investigate and clear daily reconciliation breaks",
      "Produce the daily payments exception report",
    ],
    permissions: [
      "Full read access to payment records and audit trail",
      "Release payments from the operational exception queue (four-eyes)",
      "Submit camt.056 and camt.029 scheme messages",
      "Cannot approve sanctions holds",
    ],
    systemsUsed: ["Operations Console", "TIPS Gateway Console", "Core Banking (T24)"],
    channel: "Back Office",
  },
  {
    id: "ACT-005",
    name: "Financial Crime Compliance Officer",
    type: "Human",
    description:
      "Compliance specialist adjudicating sanctions alerts raised inside the payment path under strict tip-off restrictions.",
    responsibilities: [
      "Review and adjudicate sanctions screening alerts",
      "Approve release or confirm rejection of held payments",
      "File suspicious activity reports with the FIU",
      "Maintain screening list configuration and thresholds",
    ],
    permissions: [
      "View and adjudicate compliance hold queue",
      "Release or reject held payments (four-eyes required)",
      "Access full customer due diligence records",
      "Cannot initiate or amend payments",
    ],
    systemsUsed: ["Sanctions Screening Platform", "Operations Console", "Case Management"],
    channel: "Back Office",
  },
  {
    id: "ACT-006",
    name: "Fraud Operations Analyst",
    type: "Human",
    description:
      "Analyst reviewing payments blocked or challenged by the behavioural fraud engine and managing scam interventions.",
    responsibilities: [
      "Review blocked payments and contact customers where appropriate",
      "Confirm or dismiss suspected authorised push payment fraud",
      "Trigger recall for confirmed scam payments",
      "Feed confirmed outcomes back into model tuning",
    ],
    permissions: [
      "View fraud review queue and model scores",
      "Release or permanently block a scored payment",
      "Initiate recall with reason code FRAD",
      "View device and session telemetry",
    ],
    systemsUsed: ["Fraud Decision Engine", "Operations Console", "Case Management"],
    channel: "Back Office",
  },
  {
    id: "ACT-007",
    name: "TIPS Scheme Gateway",
    type: "External",
    description:
      "The Eurosystem TARGET Instant Payment Settlement platform providing settlement in central bank money and participant reachability.",
    responsibilities: [
      "Settle instant payments between participant accounts",
      "Return pacs.002 confirmations within the scheme deadline",
      "Publish the daily participant reachability directory",
      "Provide camt.053 end-of-day settlement statements",
    ],
    permissions: [
      "Submit inbound pacs.008 messages to the bank",
      "Receive outbound pacs.008 and camt.056 messages",
      "No access to internal customer data beyond scheme message content",
    ],
    systemsUsed: ["TIPS Platform", "ESMIG Network"],
    channel: "Scheme Interface",
  },
  {
    id: "ACT-008",
    name: "Core Banking Ledger",
    type: "System",
    description:
      "The Temenos T24 accounting engine holding customer balances and providing reservation-based posting for the payment path.",
    responsibilities: [
      "Provide real-time available balance including agreed overdraft",
      "Hold and release funds reservations",
      "Post booked debits and credits with immediate value",
      "Supply end-of-day balances for reconciliation",
    ],
    permissions: [
      "Accept reservation, release and posting instructions from the hub",
      "Reject postings breaching account status or block rules",
      "No outbound payment initiation capability",
    ],
    systemsUsed: ["Temenos T24", "Accounting Data Warehouse"],
    channel: "Internal System Interface",
  },
];

export function getActorById(id: string): Actor | undefined {
  return actors.find((actor) => actor.id === id);
}
