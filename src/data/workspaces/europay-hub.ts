import type { Actor, BusinessRule, Requirement, WorkspaceDocument } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";
import { europayCriteria } from "@/data/workspaces/europay-hub-criteria";
import { europaySqlTables, europaySqlValidations } from "@/data/workspaces/europay-hub-sql";
import { europayApiServices } from "@/data/workspaces/europay-hub-api";
import { europayTestCases } from "@/data/workspaces/europay-hub-tests";
import { europayDiagrams, europayFunctionalSpec } from "@/data/workspaces/europay-hub-models";
import { europayProcessFlows } from "@/data/workspaces/europay-hub-process";

/**
 * EuroPay Hub — European merchant payment platform.
 *
 * Content transcribed from the project's own analysis artefacts:
 * https://github.com/abdessalems/europay-hub/tree/main/docs
 *
 * Business objectives (BO-1…6), functional requirements (FR-1…12) and the
 * headline business rules (BR-001…008) are taken from `01-business-requirements.md`
 * as written. The deeper artefact sets — API contracts, use cases, acceptance
 * criteria and the test catalogue — are transcribed from the same folder.
 */

const baseRequirements: Requirement[] = [
  {
    id: "FR-1",
    title: "Merchant Registration & Authentication",
    businessNeed:
      "BO-6 — Be secure by default (authentication, authorisation, auditability). A merchant cannot transact until it has an identity the platform can trust and audit.",
    description:
      "A merchant can register and authenticate. Registration atomically creates the merchant and its first user; authentication issues a JWT carrying the user's identity and role. Login failures are indistinguishable from one another so the endpoint cannot be used to enumerate accounts.",
    priority: "Critical",
    status: "Implemented",
    category: "Identity & Access",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR1-1",
        given: "a new merchant with an unused email address",
        when: "the registration endpoint is called",
        then: "HTTP 201 is returned with a merchantId and a userId, and the user holds the MERCHANT role",
      },
      {
        id: "AC-FR1-2",
        given: "an email address already registered",
        when: "registration is attempted again",
        then: "the request is rejected — email uniqueness is enforced platform-wide",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-03"],
    relatedApis: ["API-EP-01", "API-EP-02", "API-EP-03"],
    relatedTestCases: ["TC-EP-001", "TC-EP-002", "TC-EP-003", "TC-EP-004", "TC-EP-005", "TC-EP-006", "TC-EP-007", "TC-EP-008"],
    relatedRules: ["BR-EP-008"],
  },
  {
    id: "FR-2",
    title: "API Key Management",
    businessNeed:
      "BO-1 — Server-to-server integration needs a credential that is independent of a human login session and can be rotated without downtime.",
    description:
      "A merchant can generate and revoke API keys. The secret is displayed once at creation and never again; only the key prefix and a BCrypt hash are persisted. Keys are merchant-scoped, cryptographically generated, and can be revoked or allowed to expire.",
    priority: "Critical",
    status: "Implemented",
    category: "Identity & Access",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR2-1",
        given: "an authenticated merchant",
        when: "an API key is created",
        then: "the plaintext secret is returned exactly once and only its prefix and hash are stored",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-03"],
    relatedApis: ["API-EP-04", "API-EP-05", "API-EP-06"],
    relatedTestCases: ["TC-EP-010", "TC-EP-011", "TC-EP-012", "TC-EP-013"],
    relatedRules: ["BR-EP-001"],
  },
  {
    id: "FR-3",
    title: "Order Management",
    businessNeed:
      "BO-1 — A payment is always raised against a commercial intent; the order is that intent and gives the merchant something to reconcile against.",
    description:
      "A merchant can create, view and cancel orders. Order references are unique per merchant, amounts are validated against the configured EUR maximum, and cancellation is restricted to orders still in the CREATED state. Customers are reused by the email and merchant tuple.",
    priority: "High",
    status: "Implemented",
    category: "Orders & Customers",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR3-1",
        given: "an order that has not yet been paid",
        when: "the merchant cancels it",
        then: "the cancellation succeeds only while the order is in CREATED",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-07", "API-EP-08", "API-EP-09", "API-EP-10", "API-EP-11", "API-EP-12", "API-EP-13"],
    relatedTestCases: ["TC-EP-020", "TC-EP-021", "TC-EP-022", "TC-EP-023", "TC-EP-024", "TC-EP-025"],
    relatedRules: ["BR-EP-006", "BR-EP-007"],
  },
  {
    id: "FR-4",
    title: "Payment Creation",
    businessNeed:
      "BO-1 — Let a merchant accept payments via several methods through one API, abstracting the differences between payment rails behind one consistent contract.",
    description:
      "A merchant can create a payment for an order using a chosen method. The provider is resolved through a registry, so Wero, Bancontact and Visa are selected by configuration rather than by branching logic. Amount and currency are inherited from the order, and the caller may authenticate with either a JWT or an API key.",
    priority: "Critical",
    status: "Implemented",
    category: "Payments",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR4-1",
        given: "an order in a payable state",
        when: "a payment is created with method WERO",
        then: "the payment is routed to the Wero provider and inherits the order's amount and currency",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-14", "API-EP-15", "API-EP-16"],
    relatedTestCases: ["TC-EP-030", "TC-EP-031", "TC-EP-032", "TC-EP-033", "TC-EP-041"],
    relatedRules: ["BR-EP-001", "BR-EP-006", "BR-EP-007"],
  },
  {
    id: "FR-5",
    title: "Payment State Machine",
    businessNeed:
      "BO-2 — Provide a reliable, observable payment lifecycle with clear states, so that any payment's position is unambiguous at any moment.",
    description:
      "A payment progresses through a well-defined state machine. Transitions are enforced centrally rather than by each caller, which is what makes refunds, retries, cancellation windows and expiry deterministic.",
    priority: "Critical",
    status: "Implemented",
    category: "Payments",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR5-1",
        given: "a payment in a terminal state",
        when: "an illegal transition is attempted",
        then: "the transition is rejected by the state machine, not by the calling code",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-17"],
    relatedTestCases: ["TC-EP-036", "TC-EP-037"],
    relatedRules: ["BR-EP-003", "BR-EP-004"],
  },
  {
    id: "FR-6",
    title: "Idempotency",
    businessNeed:
      "BO-4 — Prevent duplicate charges and enforce payment safety. A retried network call must never take a customer's money twice.",
    description:
      "Duplicate payment requests are prevented via an Idempotency-Key header. A repeated request carrying the same key returns the original result rather than creating a second payment.",
    priority: "Critical",
    status: "Implemented",
    category: "Payments",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR6-1",
        given: "a payment already created with a given Idempotency-Key",
        when: "the identical request is replayed",
        then: "the original payment is returned and no second payment exists",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-14"],
    relatedTestCases: ["TC-EP-034", "TC-EP-035"],
    relatedRules: ["BR-EP-002"],
  },
  {
    id: "FR-7",
    title: "Full Refunds",
    businessNeed:
      "BO-5 — Support post-payment operations. A merchant must be able to return funds without leaving the platform.",
    description:
      "A successful payment can be refunded in full. Refunds are permitted only for payments that reached SUCCESS or SETTLED, which prevents refunding money that was never captured.",
    priority: "High",
    status: "Implemented",
    category: "Payments",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR7-1",
        given: "a payment that is not in SUCCESS or SETTLED",
        when: "a refund is requested",
        then: "the refund is rejected",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-19"],
    relatedTestCases: ["TC-EP-038", "TC-EP-039"],
    relatedRules: ["BR-EP-003"],
  },
  {
    id: "FR-8",
    title: "Cancellation & Retry",
    businessNeed:
      "BO-5 — Support post-payment operations: refund, cancel, retry, so a transient failure does not cost the merchant the sale.",
    description:
      "A payment can be cancelled before completion, and a failed payment can be retried. Retry is bounded, and expired payments cannot be approved.",
    priority: "High",
    status: "Implemented",
    category: "Payments",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR8-1",
        given: "a payment that has expired",
        when: "approval is attempted",
        then: "the approval is rejected",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-18", "API-EP-20"],
    relatedTestCases: ["TC-EP-040"],
    relatedRules: ["BR-EP-004"],
  },
  {
    id: "FR-9",
    title: "Webhook Events",
    businessNeed:
      "BO-3 — Notify merchants of payment outcomes reliably. Polling is wasteful and slow; the merchant's own systems must be told.",
    description:
      "The platform sends webhook events for payment state changes. Events are written through a transactional outbox so an event is never lost when the transaction commits, and each delivery is signed with HMAC-SHA256 so the merchant can verify authenticity.",
    priority: "High",
    status: "Implemented",
    category: "Webhooks",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR9-1",
        given: "a payment whose state changes",
        when: "the transaction commits",
        then: "a webhook event is enqueued through the outbox and signed with HMAC-SHA256",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-21", "API-EP-22", "API-EP-23"],
    relatedTestCases: ["TC-EP-050", "TC-EP-051", "TC-EP-052"],
    relatedRules: ["BR-EP-005"],
  },
  {
    id: "FR-10",
    title: "Webhook Retries",
    businessNeed:
      "BO-3 — At-least-once delivery. A merchant endpoint that is briefly down must not cause a permanently lost notification.",
    description:
      "Failed webhooks are retried up to 3 times with exponential backoff. Only a 2xx response counts as delivered; every attempt is logged, and secrets are masked in those logs.",
    priority: "High",
    status: "Implemented",
    category: "Webhooks",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR10-1",
        given: "a merchant endpoint returning a non-2xx response",
        when: "delivery is attempted",
        then: "the delivery is retried at most 3 times with exponential backoff and every attempt is logged",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-24"],
    relatedTestCases: ["TC-EP-053"],
    relatedRules: ["BR-EP-005"],
  },
  {
    id: "FR-11",
    title: "Audit Logging",
    businessNeed:
      "BO-6 — Auditability. Compliance must be able to reconstruct who did what, and when, without reading application logs.",
    description:
      "Significant actions are recorded in an append-only audit log. Entries are never mutated, and merchant scoping is applied so one merchant can never read another's activity.",
    priority: "High",
    status: "Implemented",
    category: "Audit & Reporting",
    moscow: "Must",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR11-1",
        given: "any significant action on the platform",
        when: "it completes",
        then: "an append-only audit entry exists for it",
      },
    ],
    relatedDocuments: ["DOC-EP-01", "DOC-EP-02"],
    relatedApis: ["API-EP-26"],
    relatedTestCases: ["TC-EP-060", "TC-EP-061", "TC-EP-063"],
    relatedRules: ["BR-EP-008"],
  },
  {
    id: "FR-12",
    title: "Dashboard Metrics",
    businessNeed:
      "BO-2 — Observability for the merchant, not only for the operator: the merchant needs to see its own transactions and totals.",
    description:
      "Merchants can view transactions and dashboard metrics. Metrics are aggregated server-side rather than by loading full tables, and every query is filtered to the calling merchant's own data.",
    priority: "Medium",
    status: "Implemented",
    category: "Audit & Reporting",
    moscow: "Should",
    owner: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    version: "1.0",
    acceptanceCriteria: [
      {
        id: "AC-FR12-1",
        given: "a merchant requesting dashboard metrics",
        when: "the aggregation runs",
        then: "it is computed server-side and scoped to that merchant only",
      },
    ],
    relatedDocuments: ["DOC-EP-01"],
    relatedApis: ["API-EP-25"],
    relatedTestCases: ["TC-EP-062"],
    relatedRules: ["BR-EP-008"],
  },
];

/**
 * Acceptance criteria come from the project's own criteria document, so each
 * requirement carries the exact AC ids the test cases reference.
 */
const requirements: Requirement[] = baseRequirements.map((requirement) => ({
  ...requirement,
  acceptanceCriteria: europayCriteria[requirement.id] ?? requirement.acceptanceCriteria,
}));

/** BR-001…008 exactly as catalogued in the project's business requirements document. */
const businessRules: BusinessRule[] = [
  {
    id: "BR-EP-001",
    description: "An API key is required for all merchant server-to-server calls.",
    logic: "IF request.origin = 'SERVER_TO_SERVER' AND request.apiKey IS NULL THEN reject 401",
    priority: "Critical",
    source: "EuroPay Hub BRD — BR-001",
    status: "Implemented",
    category: "Identity & Access",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-2", "FR-4"],
  },
  {
    id: "BR-EP-002",
    description: "Duplicate payment requests with the same Idempotency-Key return the original result.",
    logic:
      "IF EXISTS(payment WHERE idempotencyKey = request.idempotencyKey) THEN return original payment ELSE create new",
    priority: "Critical",
    source: "EuroPay Hub BRD — BR-002",
    status: "Implemented",
    category: "Payments",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-6"],
  },
  {
    id: "BR-EP-003",
    description: "A refund is only allowed for a payment in SUCCESS (or SETTLED).",
    logic: "IF payment.status NOT IN ('SUCCESS','SETTLED') THEN reject refund",
    priority: "Critical",
    source: "EuroPay Hub BRD — BR-003",
    status: "Implemented",
    category: "Payments",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-7", "FR-5"],
  },
  {
    id: "BR-EP-004",
    description: "An EXPIRED payment cannot be approved.",
    logic: "IF payment.status = 'EXPIRED' THEN reject approval",
    priority: "Critical",
    source: "EuroPay Hub BRD — BR-004",
    status: "Implemented",
    category: "Payments",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-8", "FR-5"],
  },
  {
    id: "BR-EP-005",
    description: "Webhooks are retried at most 3 times.",
    logic:
      "IF delivery.response NOT IN 2xx AND attempt < 3 THEN schedule retry WITH exponential backoff ELSE mark failed",
    priority: "High",
    source: "EuroPay Hub BRD — BR-005",
    status: "Implemented",
    category: "Webhooks",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-9", "FR-10"],
  },
  {
    id: "BR-EP-006",
    description: "The payment amount must not exceed the configurable maximum.",
    logic: "IF payment.amount > config.maxAmount THEN reject",
    priority: "High",
    source: "EuroPay Hub BRD — BR-006",
    status: "Implemented",
    category: "Orders & Customers",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-3", "FR-4"],
  },
  {
    id: "BR-EP-007",
    description: "Only EUR is supported initially.",
    logic: "IF order.currency <> 'EUR' THEN reject",
    priority: "High",
    source: "EuroPay Hub BRD — BR-007",
    status: "Implemented",
    category: "Orders & Customers",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-3", "FR-4"],
  },
  {
    id: "BR-EP-008",
    description: "Every important action must be audited.",
    logic: "ON significantAction DO append auditEvent (immutable, merchant-scoped)",
    priority: "High",
    source: "EuroPay Hub BRD — BR-008",
    status: "Implemented",
    category: "Audit & Reporting",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2026-02-18",
    impactedRequirements: ["FR-1", "FR-11", "FR-12"],
  },
];

const actors: Actor[] = [
  {
    id: "ACT-EP-001",
    name: "Merchant",
    type: "Human",
    description:
      "A European business accepting payments through the platform. Integrates server-to-server and manages its own orders, keys and webhooks.",
    responsibilities: [
      "Register and authenticate on the platform",
      "Generate and revoke API keys",
      "Create, view and cancel orders",
      "Create payments and request refunds",
      "Configure webhook endpoints and review delivery logs",
    ],
    permissions: [
      "MERCHANT role via JWT, or server-to-server via API key",
      "Full access to its own orders, customers, payments and audit entries",
      "No visibility of any other merchant's data",
    ],
    systemsUsed: ["EuroPay Hub REST API", "Merchant back office"],
    channel: "Server-to-server API",
  },
  {
    id: "ACT-EP-002",
    name: "Customer",
    type: "Human",
    description:
      "The payer completing a purchase with the merchant, using Wero, Bancontact or Visa.",
    responsibilities: [
      "Complete the payment on the selected method",
      "Receive the outcome of the payment attempt",
    ],
    permissions: [
      "No direct platform access — represented as a customer record owned by the merchant",
    ],
    systemsUsed: ["Payment method app or page"],
    channel: "Checkout",
  },
  {
    id: "ACT-EP-003",
    name: "Platform Admin",
    type: "Human",
    description:
      "Operator of the platform, holding the ADMIN role, responsible for configuration and cross-merchant support.",
    responsibilities: [
      "Maintain platform configuration such as the maximum payment amount",
      "Investigate delivery and provider failures",
      "Support merchant onboarding",
    ],
    permissions: ["ADMIN role enforced with @PreAuthorize", "Cannot bypass the audit trail"],
    systemsUsed: ["EuroPay Hub REST API", "Operational tooling"],
    channel: "Back office",
  },
  {
    id: "ACT-EP-004",
    name: "Compliance / Audit",
    type: "Human",
    description:
      "Reviews the append-only audit trail to evidence that platform activity is controlled and reconstructable.",
    responsibilities: [
      "Review audit events for significant actions",
      "Evidence access control and data isolation between merchants",
    ],
    permissions: ["Read-only access to audit records", "Cannot mutate or delete audit entries"],
    systemsUsed: ["Audit log", "Reporting"],
    channel: "Governance",
  },
  {
    id: "ACT-EP-005",
    name: "Payment Provider (Wero / Bancontact / Visa)",
    type: "External",
    description:
      "The payment rail executing the transaction. Mocked in the current scope; selected at runtime through the provider registry.",
    responsibilities: [
      "Accept a payment instruction for its method",
      "Return the outcome of the authorisation",
    ],
    permissions: ["Receives only the data required to execute the payment"],
    systemsUsed: ["Provider adapter", "Provider registry"],
    channel: "Provider interface",
  },
  {
    id: "ACT-EP-006",
    name: "Merchant Webhook Endpoint",
    type: "System",
    description:
      "The merchant-operated HTTPS endpoint receiving signed payment lifecycle events from the platform.",
    responsibilities: [
      "Accept signed event deliveries",
      "Verify the HMAC-SHA256 signature",
      "Return 2xx to acknowledge receipt",
    ],
    permissions: [
      "Receives only events for its own merchant",
      "Delivery is retried at most 3 times before being marked failed",
    ],
    systemsUsed: ["Merchant integration layer"],
    channel: "Outbound webhook",
  },
];

/** Controlled document set — the analysis artefacts version-controlled with the code. */
const documents: WorkspaceDocument[] = [
  {
    id: "DOC-EP-01",
    name: "Business Requirements (BRD)",
    format: "PDF",
    description:
      "Why the platform exists, scope, stakeholders and the twelve high-level functional requirements, with the non-functional requirements per category.",
    category: "Requirements",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "5.4 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-1", "FR-2", "FR-3", "FR-4", "FR-5", "FR-6"],
  },
  {
    id: "DOC-EP-02",
    name: "Functional Specification",
    format: "Word",
    description: "Detailed behaviour per module, from identity through to the audit trail.",
    category: "Specification",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "2.7 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-4", "FR-5", "FR-7", "FR-8", "FR-9", "FR-10"],
  },
  {
    id: "DOC-EP-03",
    name: "Business Rules Catalogue",
    format: "Excel",
    description:
      "Numbered, testable rules (BR-001 onward) spanning identity, API keys, orders, payments, lifecycle, webhooks and audit.",
    category: "Rules",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "6.1 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-1", "FR-2", "FR-3", "FR-6", "FR-11"],
  },
  {
    id: "DOC-EP-04",
    name: "User Stories & Use Cases",
    format: "Word",
    description: "Actor-goal stories with use-case detail, one set per delivery phase.",
    category: "Analysis",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "8.8 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-1", "FR-3", "FR-4"],
  },
  {
    id: "DOC-EP-05",
    name: "Acceptance Criteria",
    format: "Word",
    description: "Given/When/Then criteria per user story, referenced directly by the test cases.",
    category: "Quality",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "6.9 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-1", "FR-4", "FR-6", "FR-7"],
  },
  {
    id: "DOC-EP-06",
    name: "API Contracts",
    format: "Swagger",
    description:
      "Request and response schemas with error codes for all 27 endpoints across auth, merchants, orders, customers, payments, webhooks, dashboard and audit.",
    category: "Interface",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "7.1 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-2", "FR-3", "FR-4", "FR-7", "FR-9", "FR-12"],
  },
  {
    id: "DOC-EP-07",
    name: "Test Cases",
    format: "Excel",
    description:
      "TC-001 onward, each traced to an acceptance criterion, a business rule and the automated test class that proves it.",
    category: "Quality",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "6.3 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-1", "FR-4", "FR-6", "FR-9", "FR-11"],
  },
  {
    id: "DOC-EP-08",
    name: "Risk Analysis",
    format: "PDF",
    description: "Risks with likelihood, impact and mitigation.",
    category: "Governance",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "1.8 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-6", "FR-10"],
  },
  {
    id: "DOC-EP-09",
    name: "Glossary — Ubiquitous Language",
    format: "PDF",
    description:
      "Shared vocabulary that drives the domain-driven naming used throughout the codebase.",
    category: "Analysis",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "2.9 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-3", "FR-5"],
  },
  {
    id: "DOC-EP-10",
    name: "Release Notes",
    format: "Word",
    description: "Per-milestone changelog across the six delivery phases.",
    category: "Governance",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    size: "1.6 KB",
    status: "Approved",
    confidentiality: "Internal",
    relatedRequirements: ["FR-12"],
  },
];

export const europayHubBundle: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: "PRJ-EPH-001",
  requirements,
  businessRules,
  actors,
  functionalSpecSections: europayFunctionalSpec,
  processFlows: europayProcessFlows,
  diagrams: europayDiagrams,
  apiServices: europayApiServices,
  sqlTables: europaySqlTables,
  sqlValidations: europaySqlValidations,
  testCases: europayTestCases,
  documents,
  databaseObjectsByRequirement: {
    "FR-1": ["MERCHANT", "APP_USER"],
    "FR-2": ["API_KEY"],
    "FR-3": ["ORDERS", "CUSTOMER"],
    "FR-4": ["PAYMENT", "ORDERS"],
    "FR-5": ["PAYMENT"],
    "FR-6": ["PAYMENT", "IDEMPOTENCY_KEY"],
    "FR-7": ["REFUND", "PAYMENT"],
    "FR-8": ["PAYMENT"],
    "FR-9": ["WEBHOOK_EVENT", "WEBHOOK_ENDPOINT"],
    "FR-10": ["WEBHOOK_DELIVERY"],
    "FR-11": ["AUDIT_LOG"],
    "FR-12": ["PAYMENT", "ORDERS"],
  },
};
