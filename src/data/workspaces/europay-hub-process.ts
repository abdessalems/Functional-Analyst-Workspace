import type { ProcessFlow } from "@/lib/types";

/**
 * Payment collection process, transcribed from the project's BPMN model
 * (`docs/diagrams/plantuml/08-bpmn-payment-process.puml`). The lanes and the
 * decision points match that model exactly; each step names the rule that
 * governs it.
 */
export const europayProcessFlows: ProcessFlow[] = [
  {
    id: "PF-EP-01",
    name: "Payment Collection Process",
    description:
      "End-to-end collection of a payment across the customer, the merchant, the hub and the payment provider. The idempotency check short-circuits duplicate requests before any provider call, and the outbox event is written in the same transaction as the payment so a notification is never lost.",
    trigger: "The customer places an order request with the merchant.",
    outcome:
      "The payment reaches SUCCESS, the order is marked PAID and a signed webhook notifies the merchant — or the payment fails and a payment.failed event is emitted.",
    slaTarget: "Synchronous creation; webhook delivery retried up to 3 times with exponential backoff",
    lanes: [
      { id: "EP-LN-1", name: "Customer", actorId: "ACT-EP-002" },
      { id: "EP-LN-2", name: "Merchant", actorId: "ACT-EP-001" },
      { id: "EP-LN-3", name: "EuroPay Hub", actorId: "ACT-EP-006" },
      { id: "EP-LN-4", name: "Payment Provider", actorId: "ACT-EP-005" },
    ],
    steps: [
      {
        id: "EP-S1",
        name: "Place order request",
        type: "start",
        lane: "EP-LN-1",
        description: "The customer initiates a purchase with the merchant.",
        rules: [],
        next: ["EP-S2"],
      },
      {
        id: "EP-S2",
        name: "Create order (CREATED)",
        type: "task",
        lane: "EP-LN-2",
        description:
          "The merchant creates the order. The amount must be positive and within the configured maximum, and the reference is unique per merchant.",
        rules: ["BR-EP-006", "BR-EP-007"],
        next: ["EP-S3"],
      },
      {
        id: "EP-S3",
        name: "Request payment (choose method)",
        type: "task",
        lane: "EP-LN-2",
        description: "The merchant requests a payment for the order and selects the payment method.",
        rules: ["BR-EP-001"],
        next: ["EP-S4"],
      },
      {
        id: "EP-S4",
        name: "Check Idempotency-Key",
        type: "system",
        lane: "EP-LN-3",
        description:
          "The hub looks up the supplied key for this merchant before doing any work.",
        rules: ["BR-EP-002"],
        next: ["EP-S5"],
      },
      {
        id: "EP-S5",
        name: "Duplicate request?",
        type: "decision",
        lane: "EP-LN-3",
        description:
          "A replayed key returns the original payment immediately; no provider call is made and no second payment is created.",
        rules: ["BR-EP-002"],
        next: ["EP-S6", "EP-S14"],
      },
      {
        id: "EP-S6",
        name: "Create Payment (CREATED)",
        type: "system",
        lane: "EP-LN-3",
        description: "The payment is created and inherits the order's amount and currency.",
        rules: ["BR-EP-007"],
        next: ["EP-S7"],
      },
      {
        id: "EP-S7",
        name: "Route to provider (Strategy)",
        type: "system",
        lane: "EP-LN-3",
        description:
          "The provider is resolved from the registry by payment method, so adding a rail is configuration rather than a code branch.",
        rules: [],
        next: ["EP-S8"],
      },
      {
        id: "EP-S8",
        name: "Process transaction",
        type: "system",
        lane: "EP-LN-4",
        description: "The provider processes the transaction and returns an outcome.",
        rules: [],
        next: ["EP-S9"],
      },
      {
        id: "EP-S9",
        name: "Provider outcome?",
        type: "decision",
        lane: "EP-LN-3",
        description:
          "DECLINED fails the payment; card methods authorise immediately; account methods stay pending until the customer approves.",
        rules: ["BR-EP-003", "BR-EP-004"],
        next: ["EP-S10", "EP-S11", "EP-S15"],
      },
      {
        id: "EP-S10",
        name: "Approve payment",
        type: "task",
        lane: "EP-LN-1",
        description:
          "For account-based methods the customer approves the pending payment. A stale pending payment is expired by the scheduler.",
        rules: ["BR-EP-004"],
        next: ["EP-S11"],
      },
      {
        id: "EP-S11",
        name: "Payment SUCCESS, mark order PAID",
        type: "system",
        lane: "EP-LN-3",
        description:
          "The state machine moves the payment to SUCCESS and the associated order becomes PAID.",
        rules: ["BR-EP-003"],
        next: ["EP-S12"],
      },
      {
        id: "EP-S12",
        name: "Write outbox event (same transaction)",
        type: "system",
        lane: "EP-LN-3",
        description:
          "The webhook event is inserted in the same transaction as the payment, so it can never be lost or emitted for work that rolled back.",
        rules: ["BR-EP-005"],
        next: ["EP-S13"],
      },
      {
        id: "EP-S13",
        name: "Dispatch signed webhook (HMAC, 3x retry)",
        type: "system",
        lane: "EP-LN-3",
        description:
          "Delivery is signed with HMAC-SHA256 and retried up to three times with exponential backoff; only a 2xx counts as delivered.",
        rules: ["BR-EP-005"],
        next: ["EP-S16"],
      },
      {
        id: "EP-S14",
        name: "End — original payment returned",
        type: "end",
        lane: "EP-LN-3",
        description: "The duplicate request is answered with the payment created the first time.",
        rules: ["BR-EP-002"],
        next: [],
      },
      {
        id: "EP-S15",
        name: "End — payment FAILED",
        type: "end",
        lane: "EP-LN-3",
        description: "The payment is marked FAILED and a payment.failed event is emitted. It may be retried.",
        rules: ["BR-EP-005"],
        next: [],
      },
      {
        id: "EP-S16",
        name: "End — merchant notified",
        type: "end",
        lane: "EP-LN-2",
        description: "The merchant receives the signed payment.success notification.",
        rules: [],
        next: [],
      },
    ],
  },
];
