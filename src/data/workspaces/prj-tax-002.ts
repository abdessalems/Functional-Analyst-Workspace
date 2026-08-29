import type { Actor, ApiService, BusinessRule, Diagram, FunctionalSpecSection, ProcessFlow, Requirement, SqlValidationQuery, TestCase, Wireframe, WorkspaceDocument } from "@/lib/types";
import type { ProjectDataBundle } from "@/data/workspaces/types";
import { EMPTY_BUNDLE } from "@/data/workspaces/types";

/**
 * Generated from a spreadsheet in the workspace studio.
 *
 * Empty and still to add by hand:
 *   - nothing: every collection arrived with content
 *
 * A spreadsheet also cannot carry the detail inside a functional specification —
 * field tables, validations, error codes and edge cases — nor the result rows
 * that make a SQL check evidence rather than an intention.
 *
 * Anything left empty simply does not appear; the page shows "Not yet".
 */

const requirements: Requirement[] = [
    {
      "id": "BR-001",
      "title": "Submit a declaration via REST API",
      "businessNeed": "The legacy synchronous EJB submission does not scale and exposes no standard API for channel or partner integration.",
      "description": "The Declaration Service exposes POST /v1/declarations; on acceptance it persists the declaration, publishes a DeclarationSubmitted event to Artemis, and returns 202 Accepted with a tracking identifier.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Declaration",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-03",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-001.1",
          "given": "a complete declaration payload",
          "when": "POST /v1/declarations is called",
          "then": "the API returns 202 Accepted with a declarationId, and a DeclarationSubmitted event is published to Artemis"
        },
        {
          "id": "AC-001.2",
          "given": "a payload missing a mandatory field",
          "when": "POST /v1/declarations is called",
          "then": "the API returns 400 with a Belgif-style error body and no event is published"
        }
      ],
      "relatedDocuments": [
        "DOC-002"
      ],
      "relatedApis": [
        "API-001"
      ],
      "relatedTestCases": [
        "TC-001",
        "TC-002"
      ],
      "relatedRules": [
        "RULE-001",
        "RULE-002"
      ]
    },
    {
      "id": "BR-002",
      "title": "Validate a declaration asynchronously",
      "businessNeed": "Decoupling validation from submission removes the legacy single-transaction bottleneck and lets each service scale independently.",
      "description": "The Validation Service consumes DeclarationSubmitted from Artemis, applies business and technical rules, and publishes ValidationCompleted or ValidationRejected.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Validation",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-03",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-002.1",
          "given": "a DeclarationSubmitted event on the queue",
          "when": "the Validation Service consumes it",
          "then": "it publishes ValidationCompleted or ValidationRejected within the configured processing SLA"
        }
      ],
      "relatedDocuments": [
        "DOC-004"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-003"
      ],
      "relatedRules": [
        "RULE-003"
      ]
    },
    {
      "id": "BR-003",
      "title": "Calculate the tax result",
      "businessNeed": "The tax due or refund amount must remain consistent with the legal tax tables, now read from a DB2 reference schema owned by the Validation Service.",
      "description": "The Validation Service computes TAX_DUE or REFUND from the declared income and publishes a CalculationCompleted event carrying the outcome.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Calculation",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-04",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-003.1",
          "given": "a validated declaration",
          "when": "the tax result is calculated",
          "then": "a CalculationCompleted event carries either TAX_DUE or REFUND with the amount"
        }
      ],
      "relatedDocuments": [
        "DOC-004"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-004"
      ],
      "relatedRules": [
        "RULE-004"
      ]
    },
    {
      "id": "BR-004",
      "title": "Create a refund and orchestrate payment via Saga",
      "businessNeed": "Coordinating refund creation and payment across independently deployable services needs a saga, since a distributed transaction across five services is not viable.",
      "description": "The Refund Service owns the REFUND aggregate and drives the Refund Payment Saga from REFUND_CREATED through PAYMENT_COMPLETED, or a documented failure/manual-recovery outcome.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Refund",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-06",
      "version": "1.1",
      "acceptanceCriteria": [
        {
          "id": "AC-004.1",
          "given": "a REFUND calculation outcome",
          "when": "the saga starts",
          "then": "a refund is created in state REFUND_CREATED and a PaymentRequested command is published"
        },
        {
          "id": "AC-004.2",
          "given": "a saga in state PAYMENT_PENDING",
          "when": "PaymentProcessed is received",
          "then": "the saga completes in state PAYMENT_COMPLETED"
        }
      ],
      "relatedDocuments": [
        "DOC-005"
      ],
      "relatedApis": [
        "API-003",
        "API-004"
      ],
      "relatedTestCases": [
        "TC-005"
      ],
      "relatedRules": [
        "RULE-005",
        "RULE-009"
      ]
    },
    {
      "id": "BR-005",
      "title": "Execute payment with retry and idempotency",
      "businessNeed": "The external payment system returns transient errors under load; retries must never create a duplicate payment, unlike the legacy defect recorded in Project 1 (EC-004).",
      "description": "The Payment Service calls the External Payment System, applies exponential-backoff retry for retryable errors, and enforces an Idempotency-Key so a duplicate request returns the original result.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Payment",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-07",
      "version": "1.2",
      "acceptanceCriteria": [
        {
          "id": "AC-005.1",
          "given": "the External Payment System returns a 503",
          "when": "the Payment Service retries",
          "then": "it waits with exponential backoff (2s, 4s, 8s) before each attempt, up to the configured maximum of 3"
        },
        {
          "id": "AC-005.2",
          "given": "two payment requests carry the same Idempotency-Key",
          "when": "the second one arrives after the first has succeeded",
          "then": "the original result is returned and no second payment is executed"
        }
      ],
      "relatedDocuments": [
        "DOC-005"
      ],
      "relatedApis": [
        "API-005",
        "API-006"
      ],
      "relatedTestCases": [
        "TC-006",
        "TC-007"
      ],
      "relatedRules": [
        "RULE-006",
        "RULE-007"
      ]
    },
    {
      "id": "BR-006",
      "title": "Track status in near real time",
      "businessNeed": "Taxpayers expect a consolidated, up-to-date view of their declaration, refund and payment across all services.",
      "description": "Declaration, Refund and Payment status is queryable per service and aggregated for the taxpayer view through the API Gateway.",
      "priority": "High",
      "status": "Approved",
      "category": "Tracking",
      "moscow": "Should",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-08",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-006.1",
          "given": "a taxpayer queries their declaration",
          "when": "the API Gateway aggregates Declaration, Refund and Payment",
          "then": "a single consolidated status is returned"
        }
      ],
      "relatedDocuments": [
        "DOC-002"
      ],
      "relatedApis": [
        "API-002",
        "API-007",
        "API-010"
      ],
      "relatedTestCases": [
        "TC-008"
      ],
      "relatedRules": []
    },
    {
      "id": "BR-007",
      "title": "Handle rejection with a machine-readable reason",
      "businessNeed": "Rejections must be consumable by both the taxpayer channel and partner integrations, in a format aligned with the Belgif error model.",
      "description": "A declaration rejected by the Validation Service returns a structured error with a stable code, consistent with Belgif conventions.",
      "priority": "High",
      "status": "Approved",
      "category": "Validation",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-08",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-007.1",
          "given": "a declaration rejected by a named business rule",
          "when": "the taxpayer views the rejection",
          "then": "the response includes the rule's error code and a human-readable message"
        }
      ],
      "relatedDocuments": [
        "DOC-003"
      ],
      "relatedApis": [
        "API-001"
      ],
      "relatedTestCases": [
        "TC-009"
      ],
      "relatedRules": [
        "RULE-003"
      ]
    },
    {
      "id": "BR-008",
      "title": "Correlate and audit across services",
      "businessNeed": "Distributed tracing is required to reconstruct a taxpayer's journey across five independently deployed services.",
      "description": "Every REST call and Artemis message carries a correlation identifier that each service logs, enabling end-to-end reconstruction of a case.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Observability",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-09",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-008.1",
          "given": "a request enters the system",
          "when": "it flows through Declaration, Validation, Refund and Payment",
          "then": "every log line across all four services carries the same correlationId"
        }
      ],
      "relatedDocuments": [
        "DOC-005"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-010"
      ],
      "relatedRules": [
        "RULE-010"
      ]
    },
    {
      "id": "BR-009",
      "title": "Route unrecoverable payment failures to a Dead Letter Queue",
      "businessNeed": "A payment message that exhausts its retries must not be lost or looped indefinitely; it needs a defined manual-recovery path.",
      "description": "After the retry policy is exhausted, the Payment Service moves the message to a DLQ and a business compensation status is set on the refund; an operator investigates and can trigger a replay.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Resilience",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-10",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-009.1",
          "given": "a payment message fails 3 retry attempts",
          "when": "the final attempt fails",
          "then": "the message is moved to the DLQ, the refund is set PAYMENT_FAILED, and an operations alert is raised"
        }
      ],
      "relatedDocuments": [
        "DOC-005"
      ],
      "relatedApis": [
        "API-008",
        "API-009"
      ],
      "relatedTestCases": [
        "TC-011"
      ],
      "relatedRules": [
        "RULE-007",
        "RULE-008",
        "RULE-009"
      ]
    },
    {
      "id": "BR-010",
      "title": "Expose REST contracts aligned with Belgif / public-sector API principles",
      "businessNeed": "The mandate confirmed by Jean-Philippe Collin requires new APIs to follow the applicable Belgif guidelines for resource naming, error handling, versioning and correlation identifiers.",
      "description": "Every public endpoint is documented in OpenAPI 3.1, reviewed against the Belgif checklist, and versioned under /v1 before publication.",
      "priority": "High",
      "status": "Approved",
      "category": "Governance",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-11",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-010.1",
          "given": "a new endpoint is proposed",
          "when": "it is reviewed",
          "then": "it follows the Belgif resource-naming, versioning and error-handling conventions before being published"
        }
      ],
      "relatedDocuments": [
        "DOC-002",
        "DOC-003"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-012"
      ],
      "relatedRules": []
    },
    {
      "id": "BR-011",
      "title": "NFR - Response time and throughput",
      "businessNeed": "Client channels (web/mobile) need a predictable latency contract to set realistic expectations with taxpayers and to size the API Gateway correctly.",
      "description": "POST /v1/declarations must respond within 300ms at the 95th percentile under nominal load; end-to-end processing from submission to refund completion must finish within 15 minutes for 99% of cases.",
      "priority": "High",
      "status": "Approved",
      "category": "NFR",
      "moscow": "Should",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-28",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-011.1",
          "given": "the platform under nominal load",
          "when": "POST /v1/declarations is called repeatedly",
          "then": "the 95th-percentile response time stays under 300ms"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-001"
      ],
      "relatedTestCases": [
        "TC-014"
      ],
      "relatedRules": [
        "RULE-011"
      ]
    },
    {
      "id": "BR-012",
      "title": "NFR - Availability during deployment",
      "businessNeed": "Refund processing must not be interrupted by routine operations such as rolling out a new version of a single service.",
      "description": "Each microservice is independently deployable via a Kubernetes rolling update without downtime for the other services; an in-flight saga must survive a pod restart of the service that owns it.",
      "priority": "Critical",
      "status": "Approved",
      "category": "NFR",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-28",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-012.1",
          "given": "a saga in state PAYMENT_PENDING during a rolling deployment of the Refund Service",
          "when": "the deployment completes",
          "then": "the saga resumes from PAYMENT_PENDING with no state loss"
        }
      ],
      "relatedDocuments": [
        "DOC-001",
        "DOC-005"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-013"
      ],
      "relatedRules": [
        "RULE-012"
      ]
    },
    {
      "id": "BR-013",
      "title": "NFR - Independent scalability",
      "businessNeed": "Refund campaigns create load spikes concentrated on payment processing; scaling the whole legacy WebLogic domain to absorb that, as in the AS-IS, wastes capacity on the other four services.",
      "description": "Each service scales independently on its own load signal (for example, Payment Service on Artemis queue depth) rather than the platform scaling as one unit.",
      "priority": "Medium",
      "status": "Approved",
      "category": "NFR",
      "moscow": "Should",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-28",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-013.1",
          "given": "a spike in refund volume",
          "when": "the Payment Service's queue-depth threshold is crossed",
          "then": "additional Payment Service pods start without scaling the other four services"
        }
      ],
      "relatedDocuments": [
        "DOC-001",
        "DOC-005"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-015"
      ],
      "relatedRules": [
        "RULE-013"
      ]
    },
    {
      "id": "BR-014",
      "title": "NFR - Security of personal data in transit and in logs",
      "businessNeed": "Taxpayer identifiers and financial amounts are personal data; every public and internal call must be authenticated, and nothing sensitive may leak into logs used for support and debugging.",
      "description": "All public endpoints require an OAuth2 scope; internal service-to-service calls are authenticated; fields such as taxpayerNumber are masked before being written to any log.",
      "priority": "Critical",
      "status": "Approved",
      "category": "NFR",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-28",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-014.1",
          "given": "a service writes a log entry that includes taxpayerNumber",
          "when": "the log line is emitted",
          "then": "the value is masked, never shown in plaintext"
        }
      ],
      "relatedDocuments": [
        "DOC-001",
        "DOC-002"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-016"
      ],
      "relatedRules": [
        "RULE-014"
      ]
    },
    {
      "id": "BR-015",
      "title": "NFR - Maintainability and observability",
      "businessNeed": "In the AS-IS, a production issue could only be investigated through a single shared AUDIT_LOG table with no cross-component trace; that must not carry over into a five-service system.",
      "description": "Structured logs plus the correlationId propagated by RULE-010 must let an operator reconstruct one taxpayer's journey across all four processing services without reading source code, so an incident can be diagnosed in minutes rather than hours.",
      "priority": "High",
      "status": "Approved",
      "category": "NFR",
      "moscow": "Should",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-28",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-015.1",
          "given": "a production incident affecting one taxpayer's case",
          "when": "an operator searches the centralized logs by correlationId",
          "then": "they can reconstruct the full journey across all four services without reading source code"
        }
      ],
      "relatedDocuments": [
        "DOC-001",
        "DOC-005"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-010"
      ],
      "relatedRules": [
        "RULE-010"
      ]
    }
  ];

const businessRules: BusinessRule[] = [
    {
      "id": "RULE-001",
      "description": "A declaration is accepted only for an ACTIVE taxpayer known to the Tax Reference System.",
      "logic": "IF taxpayer.status <> 'ACTIVE' THEN reject WITH 'TAXPAYER_NOT_ACTIVE' (checked asynchronously by Validation Service)",
      "priority": "Critical",
      "source": "Tax code, article 12",
      "status": "Approved",
      "category": "Eligibility",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-002",
      "description": "At most one open declaration per taxpayer per tax year.",
      "logic": "Enforced by a unique constraint on (taxpayer_number, tax_year) in the Declaration Service's own DB2 schema",
      "priority": "Critical",
      "source": "Tax code, article 14",
      "status": "Approved",
      "category": "Eligibility",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-003",
      "description": "Mandatory fields and supported tax years are enforced by the Validation Service before any downstream event is published.",
      "logic": "IF income_amount IS NULL OR tax_year < CURRENT_YEAR-1 THEN publish ValidationRejected(code)",
      "priority": "Critical",
      "source": "Validation service contract v2",
      "status": "Approved",
      "category": "Validation",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-002",
        "BR-007"
      ]
    },
    {
      "id": "RULE-004",
      "description": "Tax is calculated from the DB2 reference tables valid for the declared year; a REFUND outcome triggers the saga.",
      "logic": "IF calculated_amount < 0 THEN publish CalculationCompleted(outcome=REFUND)",
      "priority": "Critical",
      "source": "Tax code, article 27",
      "status": "Approved",
      "category": "Calculation",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-003",
        "BR-004"
      ]
    },
    {
      "id": "RULE-005",
      "description": "A refund is created only in response to a CalculationCompleted event carrying a REFUND outcome.",
      "logic": "ON CalculationCompleted(outcome=REFUND) DO createRefund(amount) AND start saga",
      "priority": "Critical",
      "source": "Refund service contract v1",
      "status": "Approved",
      "category": "Refund",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-004"
      ]
    },
    {
      "id": "RULE-006",
      "description": "Retryable payment errors are retried up to 3 times with exponential backoff; non-retryable errors fail immediately.",
      "logic": "Retryable: timeout, 429, 502, 503 -> backoff 2s/4s/8s, max 3 attempts. Non-retryable: 400, permanent business rejection -> fail immediately, no retry",
      "priority": "Critical",
      "source": "ADR-006 Retry Policy",
      "status": "Approved",
      "category": "Resilience",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-005"
      ]
    },
    {
      "id": "RULE-007",
      "description": "Every payment request carries a client-generated Idempotency-Key; a duplicate key returns the stored result instead of re-executing the payment.",
      "logic": "ON POST /v1/payments WITH Idempotency-Key=k: IF k EXISTS THEN return stored result ELSE process AND store(k, result)",
      "priority": "Critical",
      "source": "ADR-007 Idempotency",
      "status": "Approved",
      "category": "Resilience",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-005",
        "BR-009"
      ]
    },
    {
      "id": "RULE-008",
      "description": "A payment message that exhausts its retries is moved to the DLQ rather than reprocessed indefinitely.",
      "logic": "IF attempt_count >= 3 AND last_result = FAILURE THEN route_to_dlq(message)",
      "priority": "Critical",
      "source": "ADR-008 DLQ",
      "status": "Approved",
      "category": "Resilience",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-009"
      ]
    },
    {
      "id": "RULE-009",
      "description": "A permanent payment failure sets the refund to PAYMENT_FAILED and requires manual business recovery; this is a technical retry limit, not an automatic financial reversal.",
      "logic": "ON dlq_routed(paymentId) DO refund.status = 'PAYMENT_FAILED' AND create ops task (no automatic compensation posting)",
      "priority": "Critical",
      "source": "ADR-008 DLQ / business compensation policy",
      "status": "Approved",
      "category": "Refund",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-004",
        "BR-009"
      ]
    },
    {
      "id": "RULE-010",
      "description": "Every inbound REST call and Artemis message carries a correlationId, propagated to all downstream calls and log entries.",
      "logic": "IF request.correlationId IS NULL THEN gateway generates one; every service MUST log and forward it unchanged",
      "priority": "High",
      "source": "ADR-009 Observability",
      "status": "Approved",
      "category": "Observability",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-008",
        "BR-015"
      ]
    },
    {
      "id": "RULE-011",
      "description": "The declaration acceptance endpoint responds within 300ms at the 95th percentile under nominal load; full processing completes within 15 minutes for 99% of cases.",
      "logic": "MONITOR p95(POST /v1/declarations latency) < 300ms; MONITOR p99(submission-to-completion duration) < 15min",
      "priority": "High",
      "source": "NFR target, mission SLA",
      "status": "Approved",
      "category": "Performance",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-011"
      ]
    },
    {
      "id": "RULE-012",
      "description": "Every service must tolerate a rolling Kubernetes deployment of itself or of any other service without losing saga or request state.",
      "logic": "ON pod restart: reload persisted state from DB2, resume in-flight sagas from their last recorded sagaState, never from scratch",
      "priority": "Critical",
      "source": "ADR-010 Docker/Kubernetes deployment",
      "status": "Approved",
      "category": "Availability",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-012"
      ]
    },
    {
      "id": "RULE-013",
      "description": "Each service defines its own horizontal scaling metric (CPU, memory, or Artemis queue depth) and scales independently of the other four services.",
      "logic": "Kubernetes HorizontalPodAutoscaler per service, scoped to that service's own metric only",
      "priority": "Medium",
      "source": "ADR-010 Docker/Kubernetes deployment",
      "status": "Approved",
      "category": "Scalability",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-013"
      ]
    },
    {
      "id": "RULE-014",
      "description": "Personal data such as taxpayerNumber must never appear in plaintext in logs; only a masked or hashed reference may be logged.",
      "logic": "IF field IN (taxpayerNumber, ...) THEN log(mask(field)) ELSE log(field)",
      "priority": "Critical",
      "source": "Data protection policy",
      "status": "Approved",
      "category": "Security",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-04-01",
      "impactedRequirements": [
        "BR-014"
      ]
    }
  ];

const testCases: TestCase[] = [
    {
      "id": "TC-001",
      "scenario": "POST /declarations returns 202 and publishes DeclarationSubmitted",
      "suite": "Declaration",
      "preconditions": [
        "An ACTIVE taxpayer with no open declaration for the current tax year"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call POST /v1/declarations with a complete payload",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the response",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Check the Artemis queue",
          "expected": ""
        }
      ],
      "expectedResult": "202 Accepted with a declarationId; exactly one DeclarationSubmitted message is published.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-03-19",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-002",
      "scenario": "POST /declarations with a missing field returns 400",
      "suite": "Declaration",
      "preconditions": [
        "A payload missing incomeAmount"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call POST /v1/declarations",
          "expected": ""
        }
      ],
      "expectedResult": "400 with error code MISSING_FIELD; no event is published.",
      "status": "Passed",
      "priority": "High",
      "type": "Negative",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-03-19",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-003",
      "scenario": "Validation Service processes a submitted declaration within SLA",
      "suite": "Validation",
      "preconditions": [
        "A DeclarationSubmitted message on the queue"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Publish the message",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Measure time to ValidationCompleted/Rejected",
          "expected": ""
        }
      ],
      "expectedResult": "The outcome event is published within the configured SLA.",
      "status": "Passed",
      "priority": "High",
      "type": "Integration",
      "linkedRequirement": "BR-002",
      "lastRun": "2026-03-19",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-004",
      "scenario": "Calculation produces the correct TAX_DUE/REFUND outcome",
      "suite": "Calculation",
      "preconditions": [
        "A validated declaration with income just above a bracket boundary"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger the calculation",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the CalculationCompleted event",
          "expected": ""
        }
      ],
      "expectedResult": "The correct bracket rate is applied and the outcome matches the expected sign.",
      "status": "Passed",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-003",
      "lastRun": "2026-03-20",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-005",
      "scenario": "Saga reaches PAYMENT_COMPLETED on the happy path",
      "suite": "Refund",
      "preconditions": [
        "A CalculationCompleted(REFUND) event"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Publish the event",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Let the saga run to completion",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Read the saga state",
          "expected": ""
        }
      ],
      "expectedResult": "The saga reaches PAYMENT_COMPLETED without manual intervention.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Integration",
      "linkedRequirement": "BR-004",
      "lastRun": "2026-03-20",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-006",
      "scenario": "Payment retries on 503 with exponential backoff then succeeds",
      "suite": "Payment",
      "preconditions": [
        "External Payment System stubbed to fail twice with 503",
        "then succeed"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger a payment",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Observe the retry timings",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Read the final status",
          "expected": ""
        }
      ],
      "expectedResult": "Two retries with 2s/4s backoff, then SUCCEEDED on attempt 3.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-005",
      "lastRun": "2026-03-21",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-007",
      "scenario": "Duplicate Idempotency-Key returns the original result",
      "suite": "Payment",
      "preconditions": [
        "A payment already SUCCEEDED under key PAY-123"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Send a second POST /v1/payments with Idempotency-Key: PAY-123",
          "expected": ""
        }
      ],
      "expectedResult": "The original result is returned; the External Payment System is not called a second time.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-005",
      "lastRun": "2026-03-21",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-008",
      "scenario": "Consolidated status reflects Declaration, Refund and Payment",
      "suite": "Tracking",
      "preconditions": [
        "A declaration whose refund has been paid"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call GET /v1/declarations/{id} via the gateway",
          "expected": ""
        }
      ],
      "expectedResult": "The response aggregates declaration, refund and payment status in one payload.",
      "status": "Passed",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-006",
      "lastRun": "2026-03-22",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-009",
      "scenario": "Rejected declaration includes a Belgif-style error code",
      "suite": "Validation",
      "preconditions": [
        "A declaration that fails RULE-003 (mandatory field)"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit the declaration",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the ValidationRejected reason surfaced to the taxpayer",
          "expected": ""
        }
      ],
      "expectedResult": "The error body includes code, message and correlationId.",
      "status": "Passed",
      "priority": "Medium",
      "type": "Negative",
      "linkedRequirement": "BR-007",
      "lastRun": "2026-03-22",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-010",
      "scenario": "CorrelationId is present in logs across all four services",
      "suite": "Observability",
      "preconditions": [
        "A declaration that flows through Declaration",
        "Validation",
        "Refund and Payment"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit a declaration with a known correlationId",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Query the centralized logs for that id",
          "expected": ""
        }
      ],
      "expectedResult": "Log entries from all four services share the same correlationId.",
      "status": "Passed",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-008",
      "lastRun": "2026-03-23",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-011",
      "scenario": "Payment exhausting retries lands in the DLQ and raises an alert",
      "suite": "Payment",
      "preconditions": [
        "External Payment System stubbed to fail all 3 attempts with 503"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger a payment",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Wait for all retries to be exhausted",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Check the DLQ and the alerting channel",
          "expected": ""
        }
      ],
      "expectedResult": "The message is in the DLQ with attemptsMade=3; the refund is PAYMENT_FAILED; an alert fired.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-009",
      "lastRun": "2026-03-23",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-012",
      "scenario": "A new endpoint passes the Belgif design checklist review",
      "suite": "Governance",
      "preconditions": [
        "A draft OpenAPI definition for a new endpoint"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Run the Belgif checklist review",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Record findings",
          "expected": ""
        }
      ],
      "expectedResult": "Naming, versioning, error handling and correlation-id conventions all pass before publication.",
      "status": "Passed",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-010",
      "lastRun": "2026-03-24",
      "executedBy": "Noureddine Ouzoubair"
    },
    {
      "id": "TC-013",
      "scenario": "A Kubernetes rolling deployment preserves in-flight saga state",
      "suite": "Resilience",
      "preconditions": [
        "A saga in PAYMENT_PENDING during a rolling update of the Refund Service"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger a rolling deployment",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Observe the saga after the new pods are ready",
          "expected": ""
        }
      ],
      "expectedResult": "The saga resumes from PAYMENT_PENDING with no data loss (EC-003).",
      "status": "Passed",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-004",
      "lastRun": "2026-03-24",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-014",
      "scenario": "Declaration submission stays under the P95 latency target",
      "suite": "NFR - Performance",
      "preconditions": [
        "Nominal load profile applied to the Declaration Service"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Run a load test against POST /v1/declarations",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Measure the 95th-percentile response time",
          "expected": ""
        }
      ],
      "expectedResult": "P95 latency is under 300ms.",
      "status": "Passed",
      "priority": "Medium",
      "type": "Performance",
      "linkedRequirement": "BR-011",
      "lastRun": "2026-03-28",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-015",
      "scenario": "Payment Service scales independently of the other services under a refund spike",
      "suite": "NFR - Scalability",
      "preconditions": [
        "A simulated spike in Artemis queue depth on the payment.requested queue"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Generate the spike",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Observe the Kubernetes HorizontalPodAutoscaler for each service",
          "expected": ""
        }
      ],
      "expectedResult": "Only the Payment Service scales out; Declaration, Validation, Refund and Notification pod counts stay unchanged.",
      "status": "Passed",
      "priority": "Low",
      "type": "Functional",
      "linkedRequirement": "BR-013",
      "lastRun": "2026-03-28",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-016",
      "scenario": "taxpayerNumber is masked in log output",
      "suite": "NFR - Security",
      "preconditions": [
        "A declaration submission that would normally log the taxpayerNumber field"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit a declaration",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect the emitted log line for that request",
          "expected": ""
        }
      ],
      "expectedResult": "taxpayerNumber appears masked (e.g. last 4 digits only); never in full plaintext.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-014",
      "lastRun": "2026-03-28",
      "executedBy": "Saadaoui Abdessalem"
    }
  ];

const actors: Actor[] = [
    {
      "id": "ACT-001",
      "name": "Taxpayer",
      "type": "Human",
      "description": "Submits declarations and tracks refunds via the modern web/mobile channel.",
      "responsibilities": [
        "Submits declaration",
        "tracks status"
      ],
      "permissions": [
        "Read own data",
        "create declaration"
      ],
      "systemsUsed": [
        "API Gateway"
      ],
      "channel": "Web / Mobile"
    },
    {
      "id": "ACT-002",
      "name": "Tax Administration Agent",
      "type": "Human",
      "description": "Reviews rejected declarations and manual-recovery cases surfaced by the saga.",
      "responsibilities": [
        "Reviews rejections",
        "investigates PAYMENT_FAILED refunds"
      ],
      "permissions": [
        "Read all cases",
        "trigger business recovery"
      ],
      "systemsUsed": [
        "Refund console"
      ],
      "channel": "Back Office"
    },
    {
      "id": "ACT-003",
      "name": "Payment Operator",
      "type": "Human",
      "description": "Monitors the Dead Letter Queue and investigates permanent payment failures.",
      "responsibilities": [
        "Investigates DLQ entries",
        "triggers replay after a fix"
      ],
      "permissions": [
        "Read DLQ",
        "replay message"
      ],
      "systemsUsed": [
        "Ops console",
        "DLQ dashboard"
      ],
      "channel": "Back Office"
    },
    {
      "id": "ACT-004",
      "name": "Site Reliability Engineer",
      "type": "Human",
      "description": "Operates the Kubernetes cluster, deployments, scaling and alerting.",
      "responsibilities": [
        "Deploys services",
        "manages scaling and health checks",
        "responds to alerts"
      ],
      "permissions": [
        "Full cluster admin"
      ],
      "systemsUsed": [
        "Kubernetes",
        "monitoring stack"
      ],
      "channel": "Back Office"
    },
    {
      "id": "ACT-005",
      "name": "External Tax Reference System",
      "type": "External",
      "description": "Supplies the reference tax tables consumed by the Validation Service.",
      "responsibilities": [
        "Supplies tax brackets and rates"
      ],
      "permissions": [
        "Read-only reference data"
      ],
      "systemsUsed": [
        "REST interface"
      ],
      "channel": "API"
    },
    {
      "id": "ACT-006",
      "name": "External Payment System",
      "type": "External",
      "description": "Executes the payment instruction issued by the Payment Service.",
      "responsibilities": [
        "Executes the payment",
        "returns a result",
        "possibly after retries"
      ],
      "permissions": [
        "Receive payment instruction"
      ],
      "systemsUsed": [
        "REST/SOAP gateway"
      ],
      "channel": "API"
    },
    {
      "id": "ACT-007",
      "name": "Notification Service",
      "type": "System",
      "description": "Publishes taxpayer notifications on key status changes.",
      "responsibilities": [
        "Consumes domain events",
        "sends notifications"
      ],
      "permissions": [
        "Subscribe to Artemis topics"
      ],
      "systemsUsed": [
        "Artemis"
      ],
      "channel": "Event"
    }
  ];

const diagrams: Diagram[] = [
    {
      "id": "DGM-001",
      "title": "Who can do what (cloud-native)",
      "type": "Use Case",
      "description": "The actors around the TO-BE platform and what each may initiate.",
      "source": "@startuml\nleft to right direction\nskinparam packageStyle rectangle\n\nactor \"Taxpayer\" as TP\nactor \"Tax Administration Agent\" as AG\nactor \"Payment Operator\" as PO\nactor \"SRE\" as SRE\n\nrectangle \"Cloud-native tax platform\" {\n  usecase \"Submit declaration\" as UC1\n  usecase \"Track status\" as UC2\n  usecase \"Review rejection\" as UC3\n  usecase \"Investigate DLQ\" as UC4\n  usecase \"Replay payment\" as UC5\n  usecase \"Operate cluster\" as UC6\n}\n\nTP --> UC1\nTP --> UC2\nAG --> UC3\nPO --> UC4\nUC4 ..> UC5 : <<include>>\nSRE --> UC6\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-12",
      "relatedRequirements": [
        "BR-001",
        "BR-006"
      ]
    },
    {
      "id": "DGM-002",
      "title": "Submit declaration (synchronous REST)",
      "type": "Sequence",
      "description": "Acceptance path: client to API Gateway to Declaration Service, with the event published to Artemis.",
      "source": "@startuml\nautonumber\nactor Client\nparticipant \"API Gateway\" as GW\nparticipant \"Declaration Service\" as DS\ndatabase \"DB2 (Declaration)\" as DB\nqueue \"Artemis\" as MQ\n\nClient -> GW : POST /v1/declarations\nGW -> DS : forward (correlationId)\nDS -> DS : validate shape, apply RULE-001/002\nalt accepted\n  DS -> DB : INSERT declaration\n  DS -> MQ : publish DeclarationSubmitted\n  DS --> GW : 202 Accepted (declarationId)\n  GW --> Client : 202 Accepted\nelse rejected\n  DS --> GW : 400/409 Belgif error\n  GW --> Client : error body\nend\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-12",
      "relatedRequirements": [
        "BR-001",
        "BR-010"
      ]
    },
    {
      "id": "DGM-003",
      "title": "Validate and calculate (asynchronous)",
      "type": "Sequence",
      "description": "The Validation Service consumes the submission event and publishes the outcome.",
      "source": "@startuml\nautonumber\nqueue \"Artemis\" as MQ\nparticipant \"Validation Service\" as VS\ndatabase \"DB2 (Tax reference)\" as DB\n\nMQ -> VS : DeclarationSubmitted\nVS -> VS : check eligibility, mandatory fields, tax year\nalt invalid\n  VS -> MQ : publish ValidationRejected(code)\nelse valid\n  VS -> DB : read tax brackets for the year\n  DB --> VS : brackets\n  VS -> VS : apply formula\n  VS -> MQ : publish CalculationCompleted(outcome, amount)\nend\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-12",
      "relatedRequirements": [
        "BR-002",
        "BR-003"
      ]
    },
    {
      "id": "DGM-004",
      "title": "Refund payment saga - happy path",
      "type": "Sequence",
      "description": "From CalculationCompleted(REFUND) to PAYMENT_COMPLETED.",
      "source": "@startuml\nautonumber\nqueue \"Artemis\" as MQ\nparticipant \"Refund Service\" as RS\nparticipant \"Payment Service\" as PS\nparticipant \"External Payment System\" as EPS\n\nMQ -> RS : CalculationCompleted(outcome=REFUND)\nRS -> RS : create refund, state=REFUND_CREATED\nRS -> MQ : publish PaymentRequested(refundId, idempotencyKey)\nMQ -> PS : PaymentRequested\nPS -> EPS : execute payment (Idempotency-Key)\nEPS --> PS : success\nPS -> MQ : publish PaymentProcessed(refundId)\nMQ -> RS : PaymentProcessed\nRS -> RS : state=PAYMENT_COMPLETED\n@enduml",
      "version": "1.1",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-13",
      "relatedRequirements": [
        "BR-004",
        "BR-005"
      ]
    },
    {
      "id": "DGM-005",
      "title": "Payment retry with exponential backoff",
      "type": "Sequence",
      "description": "Retryable failures on the External Payment System are retried up to 3 times.",
      "source": "@startuml\nautonumber\nparticipant \"Payment Service\" as PS\nparticipant \"External Payment System\" as EPS\n\nPS -> EPS : attempt 1\nEPS --> PS : 503 Service Unavailable\nPS -> PS : wait 2s\nPS -> EPS : attempt 2\nEPS --> PS : 503 Service Unavailable\nPS -> PS : wait 4s\nPS -> EPS : attempt 3\nEPS --> PS : 200 OK\nPS -> PS : mark SUCCEEDED, publish PaymentProcessed\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-13",
      "relatedRequirements": [
        "BR-005"
      ]
    },
    {
      "id": "DGM-006",
      "title": "Idempotent payment (duplicate request)",
      "type": "Sequence",
      "description": "A retried or duplicated request never causes a second payment.",
      "source": "@startuml\nautonumber\nparticipant \"Payment Service\" as PS\nparticipant \"Idempotency Store\" as IK\nparticipant \"External Payment System\" as EPS\n\n== First request ==\nPS -> IK : lookup key PAY-123\nIK --> PS : not found\nPS -> EPS : execute payment\nEPS --> PS : SUCCESS\nPS -> IK : store(PAY-123, SUCCESS)\n\n== Duplicate request ==\nPS -> IK : lookup key PAY-123\nIK --> PS : found (SUCCESS)\nPS -> PS : return stored result, no call to EPS\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-13",
      "relatedRequirements": [
        "BR-005",
        "BR-009"
      ]
    },
    {
      "id": "DGM-007",
      "title": "DLQ and manual recovery",
      "type": "Sequence",
      "description": "What happens once the retry policy is exhausted.",
      "source": "@startuml\nautonumber\nparticipant \"Payment Service\" as PS\nqueue \"DLQ\" as DLQ\nparticipant \"Refund Service\" as RS\nparticipant \"Payment Operator\" as OP\n\nPS -> PS : attempt 3 fails\nPS -> DLQ : route message (reason, attemptsMade)\nPS -> RS : publish PaymentFailed(refundId)\nRS -> RS : state=PAYMENT_FAILED\nRS -> RS : raise ops task\nOP -> DLQ : inspect message\nOP -> OP : fix root cause\nOP -> DLQ : replay (same Idempotency-Key)\nDLQ -> PS : redeliver\nPS -> PS : idempotency check prevents duplicate payment\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-14",
      "relatedRequirements": [
        "BR-009"
      ]
    },
    {
      "id": "DGM-008",
      "title": "Refund Payment Saga - state machine",
      "type": "State",
      "description": "Every state the saga may hold and the transitions allowed between them.",
      "source": "@startuml\n[*] --> INITIATED\nINITIATED --> VALIDATED : ValidationCompleted\nVALIDATED --> REFUND_CREATED : CalculationCompleted(REFUND)\nREFUND_CREATED --> PAYMENT_PENDING : PaymentRequested published\nPAYMENT_PENDING --> PAYMENT_COMPLETED : PaymentProcessed\nPAYMENT_PENDING --> PAYMENT_PENDING : retryable failure (backoff)\nPAYMENT_PENDING --> PAYMENT_FAILED : retries exhausted, routed to DLQ\nPAYMENT_FAILED --> PAYMENT_COMPLETED : manual recovery / DLQ replay\nPAYMENT_COMPLETED --> [*]\n\nnote right of PAYMENT_FAILED\n  Technical retry limit,\n  not an automatic\n  financial reversal.\n  Requires manual\n  business recovery.\nend note\n@enduml",
      "version": "1.1",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-14",
      "relatedRequirements": [
        "BR-004",
        "BR-009"
      ]
    },
    {
      "id": "DGM-009",
      "title": "TO-BE logical data model (per-service ownership)",
      "type": "ER",
      "description": "Each service owns its own tables; DB2 infrastructure may still be shared, ownership is logical.",
      "source": "@startuml\npackage \"Declaration Service (owns)\" {\n  entity \"DECLARATION\" as DCL {\n    * ID : uuid\n    --\n    TAXPAYER_NUMBER : varchar(15)\n    TAX_YEAR : int\n    STATUS : varchar(20)\n    CORRELATION_ID : uuid\n  }\n}\n\npackage \"Validation Service (owns)\" {\n  entity \"CALCULATION\" as CLC {\n    * ID : uuid\n    --\n    DECLARATION_ID : uuid\n    OUTCOME : varchar(20)\n    CALCULATED_AMOUNT : numeric(15,2)\n  }\n}\n\npackage \"Refund Service (owns)\" {\n  entity \"REFUND\" as RFD {\n    * ID : uuid\n    --\n    DECLARATION_ID : uuid\n    SAGA_STATE : varchar(25)\n    AMOUNT : numeric(15,2)\n  }\n}\n\npackage \"Payment Service (owns)\" {\n  entity \"PAYMENT_ATTEMPT\" as PAT {\n    * ID : uuid\n    --\n    REFUND_ID : uuid\n    IDEMPOTENCY_KEY : varchar(50)\n    ATTEMPT_NUMBER : int\n    STATUS : varchar(20)\n  }\n}\n\nDCL ||--o| CLC\nCLC ||--o| RFD\nRFD ||--o{ PAT\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-15",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005"
      ]
    },
    {
      "id": "DGM-010",
      "title": "Cloud-native architecture - services, Artemis, Kubernetes",
      "type": "Component",
      "description": "The TO-BE system context: five independently deployable services behind an API Gateway, connected through Artemis, running on Kubernetes.",
      "source": "@startuml\nskinparam componentStyle rectangle\n\nactor Client\ncomponent \"API Gateway\" as GW\nqueue \"Artemis\" as MQ\n\nnode \"Kubernetes Cluster\" {\n  component \"Declaration Service\" as DS\n  component \"Validation Service\" as VS\n  component \"Refund Service\" as RS\n  component \"Payment Service\" as PS\n  component \"Notification Service\" as NS\n}\n\ndatabase \"DB2\" as DB\ncomponent \"External Tax Reference System\" as ETRS\ncomponent \"External Payment System\" as EPS\nqueue \"DLQ\" as DLQ\n\nClient --> GW\nGW --> DS\nDS --> MQ\nMQ --> VS\nVS --> ETRS\nVS --> MQ\nMQ --> RS\nRS --> MQ\nMQ --> PS\nPS --> EPS\nPS --> DLQ\nMQ --> NS\nDS --> DB\nVS --> DB\nRS --> DB\nPS --> DB\n@enduml",
      "version": "1.3",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-28",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005",
        "BR-006",
        "BR-008",
        "BR-009",
        "BR-010",
        "BR-012",
        "BR-013"
      ]
    },
    {
      "id": "DGM-011",
      "title": "Declaration, validation, saga and payment, BPMN (cloud-native)",
      "type": "BPMN",
      "description": "The same end-to-end flow as PF-001, in BPMN notation, with the lane that owns each step across the five services.",
      "source": "@startuml\n!theme plain\ntitle Submit, validate, refund and pay (cloud-native)\n\n|Taxpayer|\nstart\n:Call POST /v1/declarations;\n\n|Declaration Service|\nif (Eligible taxpayer,\nno existing declaration?) then (no)\n  :Return 400/409 Belgif error;\n  stop\nelse (yes)\n  :Persist declaration;\n  :Publish DeclarationSubmitted;\n  :Return 202 Accepted;\nendif\n\n|Validation Service|\nif (Mandatory fields OK,\ntax year supported?) then (no)\n  :Publish ValidationRejected(code);\n  stop\nelse (yes)\nendif\n:Calculate tax against DB2\\nreference tables;\nif (Outcome REFUND?) then (yes)\n  :Publish CalculationCompleted(REFUND);\n\n  |Refund Service|\n  :Create refund, state REFUND_CREATED;\n  :Publish PaymentRequested;\n\n  |Payment Service|\n  :Call External Payment System\\n(Idempotency-Key, retry with backoff);\n  if (Payment succeeds\\nwithin 3 attempts?) then (yes)\n    :Publish PaymentProcessed;\n    |Refund Service|\n    :State PAYMENT_COMPLETED;\n    stop\n  else (no)\n    :Route message to DLQ;\n    |Refund Service|\n    :State PAYMENT_FAILED;\n    :Raise ops task;\n\n    |Payment Operator|\n    :Investigate and replay\\n(same Idempotency-Key);\n    stop\n  endif\nelse (no)\n  |Declaration Service|\n  :Close as TAX_DUE;\n  stop\nendif\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-17",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005",
        "BR-007",
        "BR-009"
      ]
    }
  ];

const wireframes: Wireframe[] = [
    {
      "id": "WF-001",
      "title": "Declaration submission (modern web/mobile)",
      "screenId": "SCR-DECL-01",
      "description": "A multi-step form calling the REST API with client-side validation and an immediate 202 acknowledgement, replacing the legacy full-page postback.",
      "channel": "Web",
      "version": "1.0",
      "status": "Approved",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-11",
      "annotations": [
        "A tracking reference is shown immediately",
        "the taxpayer can poll status without reloading the whole page."
      ],
      "relatedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "WF-002",
      "title": "Operations DLQ dashboard",
      "screenId": "SCR-OPS-01",
      "description": "Lets the Payment Operator see DLQ entries, failure reasons and attempt counts, and trigger a replay.",
      "channel": "Back Office",
      "version": "1.0",
      "status": "In Review",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-14",
      "annotations": [
        "Replay is disabled until the operator confirms the root cause field",
        "to avoid blind retries."
      ],
      "relatedRequirements": [
        "BR-009"
      ]
    }
  ];

const apiServices: ApiService[] = [
    {
      "id": "SVC-1",
      "name": "Declaration API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Declaration API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-001",
          "method": "POST",
          "path": "/declarations",
          "summary": "Submit a new declaration",
          "description": "Validates the payload shape, persists the declaration and publishes DeclarationSubmitted.",
          "tag": "Declaration",
          "operationId": "createDeclaration",
          "auth": "OAuth2, scope declarations.write",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-001"
          ]
        },
        {
          "id": "API-002",
          "method": "GET",
          "path": "/declarations/{id}",
          "summary": "Read a declaration",
          "description": "Returns the declaration and, if applicable, its linked refund reference.",
          "tag": "Declaration",
          "operationId": "getDeclaration",
          "auth": "OAuth2, scope declarations.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-006"
          ]
        },
        {
          "id": "API-010",
          "method": "GET",
          "path": "/declarations",
          "summary": "List declarations",
          "description": "Paged, newest first, filterable by status; backs the consolidated taxpayer view.",
          "tag": "Declaration",
          "operationId": "listDeclarations",
          "auth": "OAuth2, scope declarations.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-006"
          ]
        }
      ]
    },
    {
      "id": "SVC-2",
      "name": "Refund API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Refund API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-003",
          "method": "GET",
          "path": "/refunds/{id}",
          "summary": "Read a refund",
          "description": "Returns the refund and its current saga state.",
          "tag": "Refund",
          "operationId": "getRefund",
          "auth": "OAuth2, scope refunds.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-006"
          ]
        },
        {
          "id": "API-004",
          "method": "GET",
          "path": "/refunds/{id}/saga",
          "summary": "Read the saga state history",
          "description": "Returns the ordered list of saga state transitions for a refund.",
          "tag": "Refund",
          "operationId": "getSagaState",
          "auth": "OAuth2, scope refunds.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-004"
          ]
        }
      ]
    },
    {
      "id": "SVC-3",
      "name": "Payment API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Payment API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-005",
          "method": "POST",
          "path": "/payments",
          "summary": "Execute a payment",
          "description": "Requires an Idempotency-Key header; internal call from the Refund Service, not exposed to taxpayers.",
          "tag": "Payment",
          "operationId": "createPayment",
          "auth": "OAuth2, scope payments.write (service-to-service)",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-005"
          ]
        },
        {
          "id": "API-006",
          "method": "POST",
          "path": "/payments/{id}/retry",
          "summary": "Force a manual retry",
          "description": "Used by the Payment Operator after a DLQ replay to re-trigger a payment.",
          "tag": "Payment",
          "operationId": "retryPayment",
          "auth": "OAuth2, scope payments.write",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-009"
          ]
        },
        {
          "id": "API-007",
          "method": "GET",
          "path": "/payments/{id}",
          "summary": "Read a payment attempt",
          "description": "Returns the status and attempt history of a payment.",
          "tag": "Payment",
          "operationId": "getPayment",
          "auth": "OAuth2, scope payments.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-006"
          ]
        }
      ]
    },
    {
      "id": "SVC-4",
      "name": "Ops API",
      "basePath": "/v1/ops",
      "version": "1.0.0",
      "description": "Endpoints exposed by Ops API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-008",
          "method": "GET",
          "path": "/dlq",
          "summary": "List DLQ messages",
          "description": "Paged list of messages currently in the Dead Letter Queue, newest first.",
          "tag": "Operations",
          "operationId": "listDlqMessages",
          "auth": "OAuth2, scope ops.dlq.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-009"
          ]
        },
        {
          "id": "API-009",
          "method": "POST",
          "path": "/dlq/{id}/replay",
          "summary": "Replay a DLQ message",
          "description": "Re-publishes the original message using its original Idempotency-Key.",
          "tag": "Operations",
          "operationId": "replayDlqMessage",
          "auth": "OAuth2, scope ops.dlq.write",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-009"
          ]
        }
      ]
    }
  ];

const sqlValidations: SqlValidationQuery[] = [
    {
      "id": "SQL-001",
      "title": "Refunds without a saga event trail",
      "purpose": "Proves RULE-005: no refund exists that was not created by a CalculationCompleted(REFUND) event.",
      "database": "TAXDB2",
      "sql": "SELECT r.id, r.saga_state, r.created_at\nFROM   REFUND r\nWHERE  NOT EXISTS (\n         SELECT 1 FROM CALCULATION c\n         WHERE  c.declaration_id = r.declaration_id AND c.outcome = 'REFUND'\n       );",
      "columns": [
        "id",
        "saga_state",
        "created_at"
      ],
      "rows": [],
      "notes": [
        "Returns no rows",
        "confirms refunds are always saga-driven",
        "never created ad hoc."
      ],
      "status": "Validated",
      "lastRun": "2026-03-17",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-004"
      ],
      "relatedRules": [
        "RULE-005"
      ]
    },
    {
      "id": "SQL-002",
      "title": "Duplicate payments by idempotency key",
      "purpose": "Proves RULE-007: no idempotency key was ever used to execute two successful payments.",
      "database": "TAXDB2",
      "sql": "SELECT idempotency_key, COUNT(*) AS successful_payments\nFROM   PAYMENT_ATTEMPT\nWHERE  status = 'SUCCEEDED'\nGROUP  BY idempotency_key\nHAVING COUNT(*) > 1;",
      "columns": [
        "idempotency_key",
        "successful_payments"
      ],
      "rows": [],
      "notes": [
        "Returns no rows",
        "the legacy duplicate-payment defect (EC-004) is closed."
      ],
      "status": "Validated",
      "lastRun": "2026-03-17",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-005",
        "BR-009"
      ],
      "relatedRules": [
        "RULE-007"
      ]
    },
    {
      "id": "SQL-003",
      "title": "DLQ messages with fewer than 3 recorded attempts",
      "purpose": "Proves RULE-008: nothing is routed to the DLQ before the retry policy is actually exhausted.",
      "database": "TAXDB2",
      "sql": "SELECT dlq_message_id, attempts_made\nFROM   DLQ_MESSAGE\nWHERE  attempts_made < 3;",
      "columns": [
        "dlq_message_id",
        "attempts_made"
      ],
      "rows": [],
      "notes": [
        "Returns no rows."
      ],
      "status": "Validated",
      "lastRun": "2026-03-18",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-009"
      ],
      "relatedRules": [
        "RULE-008"
      ]
    },
    {
      "id": "SQL-004",
      "title": "Declarations missing a correlationId",
      "purpose": "Proves RULE-010: the observability requirement holds for every persisted declaration.",
      "database": "TAXDB2",
      "sql": "SELECT id, taxpayer_number\nFROM   DECLARATION\nWHERE  correlation_id IS NULL;",
      "columns": [
        "id",
        "taxpayer_number"
      ],
      "rows": [],
      "notes": [
        "Returns no rows."
      ],
      "status": "Validated",
      "lastRun": "2026-03-18",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-008"
      ],
      "relatedRules": [
        "RULE-010"
      ]
    }
  ];

const documents: WorkspaceDocument[] = [
    {
      "id": "DOC-001",
      "name": "Cloud-native target architecture",
      "format": "Word",
      "description": "The TO-BE architecture rationale, explicitly mapped to the AS-IS pain points it resolves (Project 1, DOC-004).",
      "category": "Architecture",
      "version": "1.1",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-25",
      "size": "588 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005",
        "BR-009",
        "BR-010"
      ]
    },
    {
      "id": "DOC-002",
      "name": "OpenAPI 3.1 contract - Declaration, Refund, Payment, Ops APIs",
      "format": "Swagger",
      "description": "Full REST contract for the ten public and service-to-service endpoints, versioned under /v1.",
      "category": "Interface",
      "version": "1.0.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-19",
      "size": "112 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-006",
        "BR-010"
      ]
    },
    {
      "id": "DOC-003",
      "name": "Belgif API design checklist - review record",
      "format": "Word",
      "description": "Resource-oriented naming, HTTP semantics, error model, versioning, pagination and correlation identifiers, checked against each endpoint.",
      "category": "Governance",
      "version": "1.0",
      "author": "Noureddine Ouzoubair",
      "lastUpdated": "2026-03-24",
      "size": "76 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-007",
        "BR-010"
      ]
    },
    {
      "id": "DOC-004",
      "name": "Artemis message catalogue",
      "format": "Excel",
      "description": "Every command and event, its producer, its consumer(s): DeclarationSubmitted, ValidationCompleted, ValidationRejected, CalculationCompleted, PaymentRequested, PaymentProcessed, PaymentFailed.",
      "category": "Interface",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-16",
      "size": "44 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005"
      ]
    },
    {
      "id": "DOC-005",
      "name": "Architecture Decision Records (ADR-001 to ADR-010)",
      "format": "Word",
      "description": "Microservice boundaries, REST API design, sync vs async, Artemis messaging, saga orchestration, retry policy, idempotency, DLQ, DB2 data ownership, Docker/Kubernetes deployment. Each ADR: Context, Decision, Alternatives, Rationale, Consequences, Risks.",
      "category": "Architecture",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-26",
      "size": "340 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-004",
        "BR-005",
        "BR-008",
        "BR-009",
        "BR-010"
      ]
    },
    {
      "id": "DOC-006",
      "name": "Postman collection - happy path, retry, idempotency scenarios",
      "format": "Swagger",
      "description": "Three demonstration flows: full happy path, payment retry to success, and duplicate Idempotency-Key returning the original result.",
      "category": "Testing",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-03-22",
      "size": "28 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-005",
        "BR-006",
        "BR-009"
      ]
    },
    {
      "id": "DOC-007",
      "name": "TO-BE sign-off",
      "format": "Word",
      "description": "Business sign-off of the TO-BE target architecture by Jean-Philippe Collin (Business Sponsor) and Nicolas Leroy (Product Owner), reviewed by Noureddine Ouzoubair (Senior Business Analyst).",
      "category": "Governance",
      "version": "1.0",
      "author": "Jean-Philippe Collin",
      "lastUpdated": "2026-03-27",
      "size": "92 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-004",
        "BR-009",
        "BR-010"
      ]
    },
    {
      "id": "DOC-008",
      "name": "TO-BE sprint backlog and INVEST story grooming",
      "format": "Excel",
      "description": "The TO-BE backlog broken into sprint-sized user stories, groomed against INVEST by Nicolas Leroy as Product Owner across three grooming sessions with Noureddine Ouzoubair and the Technical Analyst. MoSCoW priorities in the Requirements sheet reflect this backlog ordering.",
      "category": "Planning",
      "version": "1.0",
      "author": "Nicolas Leroy",
      "lastUpdated": "2026-03-05",
      "size": "41 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005",
        "BR-006",
        "BR-007",
        "BR-008",
        "BR-009",
        "BR-010",
        "BR-011",
        "BR-012",
        "BR-013",
        "BR-014",
        "BR-015"
      ]
    }
  ];

const processFlows: ProcessFlow[] = [
    {
      "id": "PF-001",
      "name": "Submit, validate, refund and pay (cloud-native)",
      "description": "End-to-end TO-BE flow: a synchronous REST acceptance followed by an asynchronous chain across Validation, Refund and Payment, orchestrated as a saga with retry, idempotency and a DLQ safety net.",
      "lanes": [
        {
          "id": "PF-001-L1",
          "name": "Taxpayer",
          "actorId": ""
        },
        {
          "id": "PF-001-L2",
          "name": "Declaration Service",
          "actorId": ""
        },
        {
          "id": "PF-001-L3",
          "name": "Validation Service",
          "actorId": ""
        },
        {
          "id": "PF-001-L4",
          "name": "Refund Service",
          "actorId": ""
        },
        {
          "id": "PF-001-L5",
          "name": "Payment Service",
          "actorId": ""
        },
        {
          "id": "PF-001-L6",
          "name": "Payment Service / Refund Service",
          "actorId": ""
        },
        {
          "id": "PF-001-L7",
          "name": "Payment Operator",
          "actorId": ""
        }
      ],
      "steps": [
        {
          "id": "S1",
          "name": "Submit declaration",
          "type": "start",
          "lane": "Taxpayer",
          "description": "POST /v1/declarations via the API Gateway.",
          "rules": [],
          "next": [
            "S2"
          ]
        },
        {
          "id": "S2",
          "name": "Accept and publish",
          "type": "task",
          "lane": "Declaration Service",
          "description": "The declaration is persisted and DeclarationSubmitted is published to Artemis.",
          "rules": [
            "RULE-001",
            "RULE-002"
          ],
          "next": [
            "S3"
          ]
        },
        {
          "id": "S3",
          "name": "Validate declaration",
          "type": "decision",
          "lane": "Validation Service",
          "description": "Consumes the event and checks eligibility and mandatory fields.",
          "rules": [
            "RULE-003"
          ],
          "next": [
            "S4",
            "S10"
          ]
        },
        {
          "id": "S4",
          "name": "Calculate tax",
          "type": "task",
          "lane": "Validation Service",
          "description": "Applies the DB2 reference tax tables to the declared income.",
          "rules": [
            "RULE-004"
          ],
          "next": [
            "S5"
          ]
        },
        {
          "id": "S5",
          "name": "Branch on result",
          "type": "decision",
          "lane": "Validation Service",
          "description": "TAX_DUE ends the flow; REFUND starts the saga.",
          "rules": [
            "RULE-004"
          ],
          "next": [
            "S6",
            "S9"
          ]
        },
        {
          "id": "S6",
          "name": "Create refund (saga start)",
          "type": "task",
          "lane": "Refund Service",
          "description": "State REFUND_CREATED is set and PaymentRequested is published.",
          "rules": [
            "RULE-005"
          ],
          "next": [
            "S7"
          ]
        },
        {
          "id": "S7",
          "name": "Execute payment",
          "type": "task",
          "lane": "Payment Service",
          "description": "Calls the External Payment System with retry and an Idempotency-Key.",
          "rules": [
            "RULE-006",
            "RULE-007"
          ],
          "next": [
            "S8",
            "S11"
          ]
        },
        {
          "id": "S8",
          "name": "Complete saga",
          "type": "end",
          "lane": "Refund Service",
          "description": "On PaymentProcessed the saga reaches PAYMENT_COMPLETED.",
          "rules": [],
          "next": []
        },
        {
          "id": "S9",
          "name": "Close as tax due",
          "type": "end",
          "lane": "Declaration Service",
          "description": "No refund flow is needed.",
          "rules": [],
          "next": []
        },
        {
          "id": "S10",
          "name": "Reject declaration",
          "type": "end",
          "lane": "Validation Service",
          "description": "ValidationRejected is published; the taxpayer is notified with a reason code.",
          "rules": [
            "RULE-003"
          ],
          "next": []
        },
        {
          "id": "S11",
          "name": "Handle permanent payment failure",
          "type": "task",
          "lane": "Payment Service / Refund Service",
          "description": "After retries are exhausted, the message is routed to the DLQ and the refund is set PAYMENT_FAILED.",
          "rules": [
            "RULE-008",
            "RULE-009"
          ],
          "next": [
            "S12"
          ]
        },
        {
          "id": "S12",
          "name": "Manual recovery",
          "type": "end",
          "lane": "Payment Operator",
          "description": "The operator investigates the DLQ entry and triggers business recovery once the cause is fixed.",
          "rules": [
            "RULE-009"
          ],
          "next": []
        }
      ],
      "trigger": "The taxpayer calls POST /v1/declarations",
      "outcome": "The declaration is closed TAX_DUE, or the refund reaches PAYMENT_COMPLETED, PAYMENT_FAILED (manual recovery) or REJECTED",
      "slaTarget": "202 Accepted within 300ms; end-to-end completion within 15 minutes for 99% of cases"
    }
  ];

const functionalSpecSections: FunctionalSpecSection[] = [
    {
      "id": "FS-001",
      "title": "Declaration Service - submit endpoint",
      "summary": "The REST contract for submitting a declaration and the event it publishes on acceptance.",
      "requirementRefs": [
        "BR-001",
        "BR-010"
      ],
      "businessLogic": [
        "Validate the request shape and required headers (Idempotency not required here, correlationId is)",
        "Persist the declaration in the service's own DB2 schema",
        "Publish DeclarationSubmitted to Artemis",
        "Return 202 Accepted with declarationId"
      ],
      "fields": [
        {
          "name": "declarationId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Identifier assigned to the accepted declaration.",
          "example": "9f2c1b7e-4a2d-4f9a-8b31-0c5e2a7d9f10"
        },
        {
          "name": "taxpayerNumber",
          "type": "varchar",
          "length": "15",
          "mandatory": true,
          "description": "National taxpayer identification number.",
          "example": "75010112345"
        },
        {
          "name": "taxYear",
          "type": "int",
          "length": "4",
          "mandatory": true,
          "description": "Tax year the declaration covers.",
          "example": "2025"
        },
        {
          "name": "incomeAmount",
          "type": "numeric",
          "length": "15,2",
          "mandatory": true,
          "description": "Declared gross income.",
          "example": "48250.00"
        },
        {
          "name": "correlationId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Trace identifier propagated to every downstream service.",
          "example": "c2a7e1b4-6f3d-4a9e-8b0c-1d5f7e2a4c9b"
        }
      ],
      "validations": [
        {
          "field": "taxpayerNumber",
          "rule": "Must reference an ACTIVE taxpayer known to the Tax Reference System",
          "errorCode": "TAXPAYER_NOT_ACTIVE",
          "severity": "Blocking"
        },
        {
          "field": "taxYear",
          "rule": "Must be one of the two most recently supported years",
          "errorCode": "YEAR_NOT_SUPPORTED",
          "severity": "Blocking"
        },
        {
          "field": "incomeAmount",
          "rule": "Required, numeric, greater than or equal to zero",
          "errorCode": "MISSING_FIELD",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "TAXPAYER_NOT_ACTIVE",
          "httpStatus": 422,
          "message": "This taxpayer is not active.",
          "handling": "Direct the taxpayer to the registration office; no event is published."
        },
        {
          "code": "YEAR_NOT_SUPPORTED",
          "httpStatus": 422,
          "message": "This tax year cannot be declared online.",
          "handling": "Show the supported years in the error body's details field."
        },
        {
          "code": "MISSING_FIELD",
          "httpStatus": 400,
          "message": "Required information is missing.",
          "handling": "Return field-level detail in the Belgif error body."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-001",
          "scenario": "Two declarations for the same taxpayer/year arrive concurrently on two Declaration Service pods",
          "expectedBehaviour": "The database unique constraint on (taxpayerNumber, taxYear) rejects the second insert with DECLARATION_EXISTS, even under horizontal scaling."
        }
      ]
    },
    {
      "id": "FS-002",
      "title": "Validation Service - async validation and calculation",
      "summary": "How the Validation Service consumes the submission event, validates it and calculates the tax result.",
      "requirementRefs": [
        "BR-002",
        "BR-003",
        "BR-007"
      ],
      "businessLogic": [
        "Consume DeclarationSubmitted",
        "Apply eligibility, mandatory-field and tax-year rules",
        "On failure, publish ValidationRejected(code)",
        "On success, calculate the result and publish CalculationCompleted(outcome, amount)"
      ],
      "fields": [
        {
          "name": "validationId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Identifier of the validation/calculation run.",
          "example": "3d81c0aa-71f4-4d2e-9c6b-6f0b2b1e77a2"
        },
        {
          "name": "outcome",
          "type": "varchar",
          "length": "20",
          "mandatory": true,
          "description": "TAX_DUE or REFUND.",
          "example": "REFUND"
        },
        {
          "name": "calculatedAmount",
          "type": "numeric",
          "length": "15,2",
          "mandatory": true,
          "description": "Positive = tax due, negative = refund.",
          "example": "-1120.50"
        }
      ],
      "validations": [
        {
          "field": "outcome",
          "rule": "Must be exactly TAX_DUE or REFUND, never both",
          "errorCode": "INVALID_OUTCOME",
          "severity": "Blocking"
        }
      ],
      "errors": [],
      "edgeCases": [
        {
          "id": "EC-002",
          "scenario": "The Validation Service consumer crashes mid-processing",
          "expectedBehaviour": "Artemis redelivers the DeclarationSubmitted message once the consumer restarts; validation logic is idempotent, so redelivery produces the same outcome."
        }
      ]
    },
    {
      "id": "FS-003",
      "title": "Refund Service - saga orchestration",
      "summary": "How the Refund Service owns and drives the Refund Payment Saga.",
      "requirementRefs": [
        "BR-004",
        "BR-009"
      ],
      "businessLogic": [
        "On CalculationCompleted(REFUND), create the refund (REFUND_CREATED)",
        "Publish PaymentRequested",
        "On PaymentProcessed, move to PAYMENT_COMPLETED",
        "On a DLQ-routed payment failure, move to PAYMENT_FAILED and raise a manual-recovery task"
      ],
      "fields": [
        {
          "name": "sagaId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Identifier of the Refund Payment Saga instance.",
          "example": "7a2e4c1d-8b3f-4e6a-9d0c-1f5b8e2a7c4d"
        },
        {
          "name": "refundId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "The refund the saga operates on.",
          "example": "1c4a9e2b-3f7d-4a6e-9c0b-2e5f7a8d1b3c"
        },
        {
          "name": "sagaState",
          "type": "varchar",
          "length": "25",
          "mandatory": true,
          "description": "INITIATED, REFUND_CREATED, PAYMENT_PENDING, PAYMENT_COMPLETED or PAYMENT_FAILED.",
          "example": "PAYMENT_PENDING"
        }
      ],
      "validations": [
        {
          "field": "sagaState",
          "rule": "Must follow the defined saga transition order; no state may be skipped",
          "errorCode": "INVALID_SAGA_TRANSITION",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "INVALID_SAGA_TRANSITION",
          "httpStatus": 409,
          "message": "The refund is in an unexpected state.",
          "handling": "Reject the command, do not mutate state, and alert on-call."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-003",
          "scenario": "The Refund Service pod restarts while a saga is in PAYMENT_PENDING",
          "expectedBehaviour": "The saga state is persisted, so on restart the orchestrator resumes from PAYMENT_PENDING instead of restarting the saga."
        }
      ]
    },
    {
      "id": "FS-004",
      "title": "Payment Service - retry and idempotency",
      "summary": "How the Payment Service calls the external system safely under retries.",
      "requirementRefs": [
        "BR-005",
        "BR-006"
      ],
      "businessLogic": [
        "Require an Idempotency-Key on every payment request",
        "If the key was already processed, return the stored result",
        "Otherwise call the External Payment System",
        "On a retryable error, wait with exponential backoff and retry up to 3 times",
        "On a non-retryable error, fail immediately"
      ],
      "fields": [
        {
          "name": "paymentId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Identifier of a payment attempt.",
          "example": "5e8b2c4a-9f1d-4b7e-8a3c-0d6f2b5e9a1c"
        },
        {
          "name": "idempotencyKey",
          "type": "varchar",
          "length": "50",
          "mandatory": true,
          "description": "Client-generated key that de-duplicates payment requests.",
          "example": "PAY-REFUND-1c4a9e2b"
        },
        {
          "name": "attemptNumber",
          "type": "int",
          "length": "-",
          "mandatory": true,
          "description": "Current retry attempt, 1 to 3.",
          "example": "2"
        },
        {
          "name": "paymentStatus",
          "type": "varchar",
          "length": "20",
          "mandatory": true,
          "description": "PENDING, SUCCEEDED or FAILED.",
          "example": "SUCCEEDED"
        }
      ],
      "validations": [
        {
          "field": "idempotencyKey",
          "rule": "Required on every POST /v1/payments request",
          "errorCode": "MISSING_IDEMPOTENCY_KEY",
          "severity": "Blocking"
        },
        {
          "field": "attemptNumber",
          "rule": "Must not exceed the configured maximum retry count (3)",
          "errorCode": "RETRY_LIMIT_EXCEEDED",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "MISSING_IDEMPOTENCY_KEY",
          "httpStatus": 400,
          "message": "An idempotency key is required.",
          "handling": "Reject before calling the external payment system; nothing is retried."
        },
        {
          "code": "RETRY_LIMIT_EXCEEDED",
          "httpStatus": 503,
          "message": "The payment could not be completed after retrying.",
          "handling": "Route the message to the DLQ and set the refund PAYMENT_FAILED."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-004",
          "scenario": "The External Payment System actually pays but the response is lost before the Payment Service reads it",
          "expectedBehaviour": "The next retry reuses the same Idempotency-Key; the external system recognizes it and returns the original result instead of paying twice - the exact defect recorded in Project 1 (legacy EC-004) is closed by design."
        },
        {
          "id": "EC-005",
          "scenario": "A 400 response is received on the first payment attempt",
          "expectedBehaviour": "The Payment Service does not retry a non-retryable error and fails the payment immediately."
        }
      ]
    },
    {
      "id": "FS-005",
      "title": "Dead Letter Queue and manual recovery",
      "summary": "What happens once the retry policy is exhausted.",
      "requirementRefs": [
        "BR-009"
      ],
      "businessLogic": [
        "Move the exhausted message to the DLQ with its failure reason and attempt count",
        "Set the refund to PAYMENT_FAILED",
        "Raise an operations alert",
        "Allow a Payment Operator to replay the message, reusing the original Idempotency-Key, once the cause is fixed"
      ],
      "fields": [
        {
          "name": "dlqMessageId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Identifier of the message once routed to the DLQ.",
          "example": "8b3f4e6a-9d0c-1f5b-8e2a-7c4d1c4a9e2b"
        },
        {
          "name": "originalQueue",
          "type": "varchar",
          "length": "50",
          "mandatory": true,
          "description": "The Artemis queue the message was routed from.",
          "example": "payment.requested"
        },
        {
          "name": "failureReason",
          "type": "varchar",
          "length": "200",
          "mandatory": true,
          "description": "The final error that caused the DLQ routing.",
          "example": "External payment system: 503 Service Unavailable"
        },
        {
          "name": "attemptsMade",
          "type": "int",
          "length": "-",
          "mandatory": true,
          "description": "Number of attempts made before the message entered the DLQ.",
          "example": "3"
        }
      ],
      "validations": [
        {
          "field": "attemptsMade",
          "rule": "A message enters the DLQ only once attemptsMade is at least 3",
          "errorCode": "PREMATURE_DLQ_ROUTE",
          "severity": "Warning"
        }
      ],
      "errors": [],
      "edgeCases": [
        {
          "id": "EC-006",
          "scenario": "A message is manually replayed from the DLQ after a fix",
          "expectedBehaviour": "The original Idempotency-Key is reused on replay, so the replay cannot create a duplicate payment."
        }
      ]
    },
    {
      "id": "FS-006",
      "title": "Correlation and the Belgif error model",
      "summary": "How requests are traced across services and how errors are shaped for consumers.",
      "requirementRefs": [
        "BR-008",
        "BR-010",
        "BR-007"
      ],
      "businessLogic": [
        "The API Gateway assigns a correlationId if the caller did not supply one",
        "Every service logs and forwards the correlationId unchanged, including on Artemis messages",
        "Every error response follows the Belgif error body: code, message, correlationId, timestamp"
      ],
      "fields": [
        {
          "name": "correlationId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Trace identifier present on every request, message and log line.",
          "example": "c2a7e1b4-6f3d-4a9e-8b0c-1d5f7e2a4c9b"
        },
        {
          "name": "errorCode",
          "type": "varchar",
          "length": "30",
          "mandatory": true,
          "description": "Stable, machine-readable error code.",
          "example": "RETRY_LIMIT_EXCEEDED"
        },
        {
          "name": "httpStatus",
          "type": "int",
          "length": "3",
          "mandatory": true,
          "description": "HTTP status returned to the caller.",
          "example": "503"
        }
      ],
      "validations": [
        {
          "field": "correlationId",
          "rule": "Must be present on every inbound request and propagated downstream unchanged",
          "errorCode": "MISSING_CORRELATION_ID",
          "severity": "Warning"
        }
      ],
      "errors": [
        {
          "code": "MISSING_CORRELATION_ID",
          "httpStatus": 400,
          "message": "A correlation identifier is required.",
          "handling": "The gateway generates one if the client omitted it, and logs a warning rather than failing the call."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-007",
          "scenario": "A request crosses three services during a rolling Kubernetes deployment",
          "expectedBehaviour": "The correlationId is preserved across pod restarts because it travels in the message/header, not in local pod state."
        }
      ]
    }
  ];

export const prjTax002Bundle: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: "PRJ-TAX-002",
  requirements,
  businessRules,
  testCases,
  actors,
  diagrams,
  wireframes,
  apiServices,
  sqlValidations,
  documents,
  processFlows,
  functionalSpecSections,
  databaseObjectsByRequirement: {},
};
