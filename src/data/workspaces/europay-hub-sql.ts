import type { SqlTable, SqlValidationQuery } from "@/lib/types";

/**
 * Data model and validation queries for EuroPay Hub.
 *
 * The tables and columns are taken from the project's ER model
 * (`docs/diagrams/plantuml/03-er-diagram.puml`, Flyway V1–V7). The queries are
 * analyst-written controls: each one asserts a business rule against the
 * database and passes when it returns no rows.
 */

export const europaySqlTables: SqlTable[] = [
  {
    name: "PAYMENT",
    schema: "public",
    description: "One row per payment attempt against an order.",
    columns: [
      { name: "id", type: "UUID", nullable: false, description: "Primary key." },
      { name: "merchant_id", type: "UUID", nullable: false, description: "Owning merchant; every query is scoped by it." },
      { name: "order_id", type: "UUID", nullable: false, description: "The order being paid." },
      { name: "payment_method", type: "VARCHAR", nullable: false, description: "WERO, BANCONTACT, VISA, MASTERCARD, SEPA_INSTANT, PAYPAL or APPLE_PAY." },
      { name: "amount_minor", type: "BIGINT", nullable: false, description: "Amount in minor units — never a floating point value." },
      { name: "status", type: "VARCHAR", nullable: false, description: "CREATED, PENDING, AUTHORIZED, SUCCESS, FAILED, EXPIRED, CANCELLED, REFUNDED or SETTLED." },
      { name: "provider_reference", type: "VARCHAR", nullable: true, description: "Reference returned by the provider on submission." },
    ],
  },
  {
    name: "ORDERS",
    schema: "public",
    description: "Commercial intent a payment is raised against.",
    columns: [
      { name: "id", type: "UUID", nullable: false, description: "Primary key." },
      { name: "merchant_id", type: "UUID", nullable: false, description: "Owning merchant." },
      { name: "customer_id", type: "UUID", nullable: false, description: "Customer placing the order." },
      { name: "reference", type: "VARCHAR", nullable: false, description: "Unique per merchant." },
      { name: "amount_minor", type: "BIGINT", nullable: false, description: "Order amount in minor units." },
      { name: "currency", type: "VARCHAR(3)", nullable: false, description: "EUR only in the current scope." },
      { name: "status", type: "VARCHAR", nullable: false, description: "CREATED, PAID, CANCELLED or EXPIRED." },
    ],
  },
  {
    name: "IDEMPOTENCY_KEY",
    schema: "public",
    description: "Replay protection for payment creation, unique per merchant and key.",
    columns: [
      { name: "id", type: "UUID", nullable: false, description: "Primary key." },
      { name: "merchant_id", type: "UUID", nullable: false, description: "Owning merchant." },
      { name: "idempotency_key", type: "VARCHAR", nullable: false, description: "Key supplied by the caller." },
      { name: "request_hash", type: "VARCHAR", nullable: false, description: "Hash of the request body, to detect reuse with a different payload." },
      { name: "payment_id", type: "UUID", nullable: false, description: "Payment created for this key." },
    ],
  },
  {
    name: "WEBHOOK_EVENT",
    schema: "public",
    description: "Transactional outbox row per payment lifecycle event.",
    columns: [
      { name: "id", type: "UUID", nullable: false, description: "Primary key." },
      { name: "merchant_id", type: "UUID", nullable: false, description: "Owning merchant." },
      { name: "event_type", type: "VARCHAR", nullable: false, description: "For example payment.success." },
      { name: "status", type: "VARCHAR", nullable: false, description: "PENDING, DELIVERED or FAILED." },
      { name: "attempts", type: "INT", nullable: false, description: "Delivery attempts made so far." },
      { name: "next_attempt_at", type: "TIMESTAMP", nullable: true, description: "Scheduled retry time." },
    ],
  },
  {
    name: "REFUND",
    schema: "public",
    description: "Refund raised against a settled payment.",
    columns: [
      { name: "id", type: "UUID", nullable: false, description: "Primary key." },
      { name: "payment_id", type: "UUID", nullable: false, description: "Payment being refunded." },
      { name: "amount_minor", type: "BIGINT", nullable: false, description: "Refunded amount in minor units." },
      { name: "reason", type: "VARCHAR", nullable: true, description: "Reason supplied by the merchant." },
    ],
  },
];

export const europaySqlValidations: SqlValidationQuery[] = [
  {
    id: "SQL-EP-01",
    title: "No duplicate payment for a reused idempotency key",
    purpose:
      "Evidence for BR-002 and risk R-01. A replayed request must return the original payment, so a merchant and key pair can never map to more than one payment.",
    database: "europay (PostgreSQL)",
    status: "Validated",
    lastRun: "2026-02-18",
    executedBy: "Saadaoui Abdessalem",
    sql: `-- BR-002 / R-01: one payment per (merchant, idempotency key)
SELECT k.merchant_id,
       k.idempotency_key,
       COUNT(DISTINCT k.payment_id) AS payments
  FROM idempotency_key k
 GROUP BY k.merchant_id, k.idempotency_key
HAVING COUNT(DISTINCT k.payment_id) > 1;`,
    columns: ["merchant_id", "idempotency_key", "payments"],
    rows: [],
    notes: [
      "Zero rows — the unique constraint on (merchant_id, idempotency_key) holds and no key produced a second payment.",
      "TC-EP-034 exercises the replay path; TC-EP-035 exercises reuse with a different body.",
    ],
    relatedRequirements: ["FR-6"],
    relatedRules: ["BR-EP-002"],
  },
  {
    id: "SQL-EP-02",
    title: "Refunds only against settled payments",
    purpose:
      "Evidence for BR-003. A refund must exist only where the payment reached SUCCESS or SETTLED — money cannot be returned that was never captured.",
    database: "europay (PostgreSQL)",
    status: "Validated",
    lastRun: "2026-02-18",
    executedBy: "Saadaoui Abdessalem",
    sql: `-- BR-003: refunds are only permitted from SUCCESS / SETTLED
SELECT r.id AS refund_id,
       p.id AS payment_id,
       p.status,
       r.amount_minor
  FROM refund r
  JOIN payment p ON p.id = r.payment_id
 WHERE p.status NOT IN ('SUCCESS', 'SETTLED', 'REFUNDED');`,
    columns: ["refund_id", "payment_id", "status", "amount_minor"],
    rows: [],
    notes: [
      "Zero rows — no refund exists against a payment that never succeeded.",
      "REFUNDED is included because the status moves on once the refund is stored.",
    ],
    relatedRequirements: ["FR-7"],
    relatedRules: ["BR-EP-003"],
  },
  {
    id: "SQL-EP-03",
    title: "Webhook retry ceiling respected",
    purpose:
      "Evidence for BR-005 and risk R-09. Delivery is attempted at most three times, after which the event is marked FAILED rather than retried indefinitely.",
    database: "europay (PostgreSQL)",
    status: "Needs Review",
    lastRun: "2026-02-18",
    executedBy: "Saadaoui Abdessalem",
    sql: `-- BR-005 / R-09: at most 3 attempts, and no PENDING event beyond the ceiling
SELECT e.id,
       e.event_type,
       e.status,
       e.attempts,
       e.next_attempt_at
  FROM webhook_event e
 WHERE e.attempts > 3
    OR (e.attempts >= 3 AND e.status = 'PENDING')
 ORDER BY e.attempts DESC;`,
    columns: ["id", "event_type", "status", "attempts", "next_attempt_at"],
    rows: [
      ["e3f1…", "payment.success", "PENDING", "3", "2026-02-18T09:44:07Z"],
    ],
    notes: [
      "One event sat at three attempts while still PENDING, because the dispatcher had not yet run the transition to FAILED.",
      "Re-run after the scheduler interval returned zero rows, so the ceiling holds — but the window between the third failure and the status change is worth tightening.",
      "Raised as an observation rather than a defect; TC-EP-053 covers the retry sequence itself.",
    ],
    relatedRequirements: ["FR-10"],
    relatedRules: ["BR-EP-005"],
  },
  {
    id: "SQL-EP-04",
    title: "No cross-merchant leakage between orders and payments",
    purpose:
      "Evidence for risk R-07. A payment must always belong to the same merchant as the order it pays, otherwise ownership scoping could be bypassed.",
    database: "europay (PostgreSQL)",
    status: "Validated",
    lastRun: "2026-02-18",
    executedBy: "Saadaoui Abdessalem",
    sql: `-- R-07: payment and its order must share the same merchant
SELECT p.id  AS payment_id,
       p.merchant_id AS payment_merchant,
       o.merchant_id AS order_merchant
  FROM payment p
  JOIN orders o ON o.id = p.order_id
 WHERE p.merchant_id <> o.merchant_id;`,
    columns: ["payment_id", "payment_merchant", "order_merchant"],
    rows: [],
    notes: [
      "Zero rows — ownership is consistent across the join.",
      "TC-EP-063 covers the API-level scoping; this query covers the data itself.",
    ],
    relatedRequirements: ["FR-11"],
    relatedRules: ["BR-EP-008"],
  },
  {
    id: "SQL-EP-05",
    title: "Currency and amount integrity",
    purpose:
      "Evidence for BR-007 and risk R-08. Only EUR is in scope, amounts are held in integer minor units, and a payment must match the amount of its order.",
    database: "europay (PostgreSQL)",
    status: "Validated",
    lastRun: "2026-02-18",
    executedBy: "Saadaoui Abdessalem",
    sql: `-- BR-007 / R-08: EUR only, positive minor units, payment matches its order
SELECT o.id AS order_id,
       o.currency,
       o.amount_minor AS order_amount,
       p.amount_minor AS payment_amount
  FROM orders o
  LEFT JOIN payment p ON p.order_id = o.id
 WHERE o.currency <> 'EUR'
    OR o.amount_minor <= 0
    OR (p.id IS NOT NULL AND p.amount_minor <> o.amount_minor);`,
    columns: ["order_id", "currency", "order_amount", "payment_amount"],
    rows: [],
    notes: [
      "Zero rows — every order is in EUR, every amount is positive, and no payment diverges from its order.",
      "Amounts are stored as integer minor units, so this check cannot be defeated by rounding.",
    ],
    relatedRequirements: ["FR-3", "FR-4"],
    relatedRules: ["BR-EP-006", "BR-EP-007"],
  },
  {
    id: "SQL-EP-06",
    title: "Order marked paid only by a successful payment",
    purpose:
      "Evidence for BR-050 as modelled on the state machine: an order reaches PAID only when a payment for it reached SUCCESS or beyond.",
    database: "europay (PostgreSQL)",
    status: "Validated",
    lastRun: "2026-02-18",
    executedBy: "Saadaoui Abdessalem",
    sql: `-- State machine: PAID orders must have a settled payment behind them
SELECT o.id AS order_id,
       o.reference,
       o.status AS order_status
  FROM orders o
 WHERE o.status = 'PAID'
   AND NOT EXISTS (
         SELECT 1
           FROM payment p
          WHERE p.order_id = o.id
            AND p.status IN ('SUCCESS', 'SETTLED', 'REFUNDED')
       );`,
    columns: ["order_id", "reference", "order_status"],
    rows: [],
    notes: [
      "Zero rows — no order is marked PAID without a payment that succeeded.",
      "TC-EP-037 proves the transition; this query proves the resulting data is consistent.",
    ],
    relatedRequirements: ["FR-5"],
    relatedRules: ["BR-EP-003"],
  },
];
