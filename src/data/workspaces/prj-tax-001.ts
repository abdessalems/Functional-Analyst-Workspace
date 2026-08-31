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
      "title": "Submit a tax declaration",
      "businessNeed": "Taxpayers submit declarations through a legacy portal built on WebLogic/EJB; the current submission path must be understood and documented before any modernization decision is taken. Confirmed with Jean-Philippe Collin.",
      "description": "A taxpayer fills in a declaration form on the legacy portal; on submit, the portal invokes DeclarationEJB synchronously, which persists the declaration in DB2 within a single distributed transaction.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Declaration",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-12",
      "version": "1.1",
      "acceptanceCriteria": [
        {
          "id": "AC-001.1",
          "given": "a taxpayer with an ACTIVE status and a complete declaration",
          "when": "the taxpayer submits it through the legacy portal",
          "then": "the declaration is persisted and status becomes SUBMITTED, with a legacy declaration number shown"
        },
        {
          "id": "AC-001.2",
          "given": "the WebLogic server is under heavy nightly-batch load",
          "when": "the taxpayer submits a declaration",
          "then": "the synchronous call may time out, no declaration is created, and the taxpayer sees a generic technical error"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-L01"
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
      "title": "Validate a declaration",
      "businessNeed": "Invalid declarations must be caught before tax calculation, since the legacy chain has no compensation mechanism once a downstream EJB has run.",
      "description": "ValidationEJB checks mandatory fields, taxpayer status and tax year synchronously, in the same transaction as the submission.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Validation",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-12",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-002.1",
          "given": "a declaration missing a mandatory field",
          "when": "ValidationEJB checks it",
          "then": "the declaration is rejected with reason MISSING_FIELD"
        },
        {
          "id": "AC-002.2",
          "given": "a declaration for a tax year outside the two most recent years",
          "when": "ValidationEJB checks it",
          "then": "the declaration is rejected with reason YEAR_NOT_SUPPORTED"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-L02"
      ],
      "relatedTestCases": [
        "TC-003"
      ],
      "relatedRules": [
        "RULE-003",
        "RULE-004"
      ]
    },
    {
      "id": "BR-003",
      "title": "Calculate the tax result",
      "businessNeed": "The tax due or refund amount must be computed consistently with the legal tax tables held as reference data in DB2.",
      "description": "TaxCalculationEJB applies the tax brackets for the declared year to the declared income and produces a TAX_DUE or REFUND outcome.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Calculation",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-14",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-003.1",
          "given": "a validated declaration",
          "when": "TaxCalculationEJB computes the result",
          "then": "the outcome is TAX_DUE or REFUND with the corresponding amount"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-L03"
      ],
      "relatedTestCases": [
        "TC-004"
      ],
      "relatedRules": [
        "RULE-004"
      ]
    },
    {
      "id": "BR-004",
      "title": "Determine refund eligibility and create the refund",
      "businessNeed": "When the calculation is negative, the taxpayer is owed money and a refund record must exist so the payment step can act on it.",
      "description": "RefundEJB creates a REFUND row linked to the declaration whenever TaxCalculationEJB returns a negative amount.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Refund",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-14",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-004.1",
          "given": "a calculation result of REFUND",
          "when": "RefundEJB runs",
          "then": "a refund row is created with status PENDING, linked to the declaration"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-L04"
      ],
      "relatedTestCases": [
        "TC-005"
      ],
      "relatedRules": [
        "RULE-005"
      ]
    },
    {
      "id": "BR-005",
      "title": "Process the refund payment",
      "businessNeed": "Refunds must reach the taxpayer's bank account; the legacy platform integrates with the External Payment System over a single synchronous call with no built-in retry.",
      "description": "PaymentEJB calls the External Payment System synchronously via SOAP and updates the refund status based on the immediate response.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Payment",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-16",
      "version": "1.2",
      "acceptanceCriteria": [
        {
          "id": "AC-005.1",
          "given": "a refund in status PENDING",
          "when": "the synchronous call to the External Payment System succeeds",
          "then": "the refund status becomes PAID"
        },
        {
          "id": "AC-005.2",
          "given": "a refund in status PENDING",
          "when": "the synchronous call fails or times out",
          "then": "the refund stays PENDING and no automatic retry happens before the next nightly batch"
        }
      ],
      "relatedDocuments": [
        "DOC-001",
        "DOC-003"
      ],
      "relatedApis": [
        "API-L05"
      ],
      "relatedTestCases": [
        "TC-006",
        "TC-007"
      ],
      "relatedRules": [
        "RULE-006"
      ]
    },
    {
      "id": "BR-006",
      "title": "Track declaration and refund status",
      "businessNeed": "Noureddine Ouzoubair confirmed that two thirds of contact-centre calls are taxpayers asking about their declaration or refund status.",
      "description": "Taxpayers and agents query the current status of a declaration and its linked refund through the legacy portal.",
      "priority": "High",
      "status": "Approved",
      "category": "Tracking",
      "moscow": "Should",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-17",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-006.1",
          "given": "a taxpayer with an existing declaration",
          "when": "they check its status on the legacy portal",
          "then": "the current declaration and, if applicable, refund status is displayed"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-L06"
      ],
      "relatedTestCases": [
        "TC-008"
      ],
      "relatedRules": []
    },
    {
      "id": "BR-007",
      "title": "Handle rejection",
      "businessNeed": "Declarations that fail validation or calculation rules must be closed with a reason so the taxpayer is not left in an ambiguous state.",
      "description": "A declaration rejected by ValidationEJB or TaxCalculationEJB is closed with status REJECTED and a fixed legacy reason code.",
      "priority": "High",
      "status": "Approved",
      "category": "Validation",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-17",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-007.1",
          "given": "a declaration rejected by validation or calculation",
          "when": "the taxpayer views it",
          "then": "a fixed legacy reason code is shown with no further explanation"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-009"
      ],
      "relatedRules": [
        "RULE-003",
        "RULE-004"
      ]
    },
    {
      "id": "BR-008",
      "title": "Audit every status change",
      "businessNeed": "Regulatory obligations confirmed by Jean-Philippe Collin require every status change and payment operation to be traceable for at least ten years.",
      "description": "Every EJB writes a row to the shared AUDIT_LOG table in DB2 within its own local transaction whenever a status changes.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Audit",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-18",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-008.1",
          "given": "any status change on a declaration or refund",
          "when": "the change is committed",
          "then": "a row is written to AUDIT_LOG in the same local transaction"
        }
      ],
      "relatedDocuments": [
        "DOC-001",
        "DOC-003"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-010"
      ],
      "relatedRules": [
        "RULE-008"
      ]
    },
    {
      "id": "BR-009",
      "title": "Reconcile stuck refunds by nightly batch",
      "businessNeed": "Because the payment integration is synchronous and unreliable under load, a nightly batch job is the only safety net for refunds left in an intermediate state.",
      "description": "A WebLogic scheduled job scans REFUND rows PENDING for more than 24 hours, retries the payment call once, and flags remaining failures for manual review.",
      "priority": "High",
      "status": "Approved",
      "category": "Payment",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-20",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-009.1",
          "given": "a refund stuck in PENDING for more than 24 hours",
          "when": "the nightly batch runs",
          "then": "the payment is retried exactly once and, on repeated failure, the refund is flagged NEEDS_MANUAL_REVIEW"
        }
      ],
      "relatedDocuments": [
        "DOC-001",
        "DOC-004"
      ],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-011"
      ],
      "relatedRules": [
        "RULE-007"
      ]
    }
  ];

const businessRules: BusinessRule[] = [
    {
      "id": "RULE-001",
      "description": "A declaration must reference a registered, ACTIVE taxpayer.",
      "logic": "IF taxpayer.status <> 'ACTIVE' THEN reject WITH 'TAXPAYER_NOT_ACTIVE'",
      "priority": "Critical",
      "source": "Tax code, article 12",
      "status": "Approved",
      "category": "Eligibility",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-002",
      "description": "A taxpayer may submit at most one declaration per tax year.",
      "logic": "IF EXISTS(DECLARATION WHERE TAXPAYER_ID=:tp AND TAX_YEAR=:yr) THEN reject WITH 'DECLARATION_EXISTS'",
      "priority": "Critical",
      "source": "Tax code, article 14",
      "status": "Approved",
      "category": "Eligibility",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-003",
      "description": "Mandatory declaration fields must all be present.",
      "logic": "IF income_amount IS NULL OR tax_year IS NULL THEN reject WITH 'MISSING_FIELD'",
      "priority": "Critical",
      "source": "Legacy validation spec v3",
      "status": "Approved",
      "category": "Validation",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-002",
        "BR-007"
      ]
    },
    {
      "id": "RULE-004",
      "description": "Only the two most recent tax years are accepted online.",
      "logic": "IF tax_year < CURRENT_YEAR - 1 THEN reject WITH 'YEAR_NOT_SUPPORTED'",
      "priority": "High",
      "source": "Legacy validation spec v3",
      "status": "Approved",
      "category": "Validation",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-002",
        "BR-003",
        "BR-007"
      ]
    },
    {
      "id": "RULE-005",
      "description": "A refund is created only when the calculated result is negative.",
      "logic": "IF calculated_amount < 0 THEN create REFUND(amount = ABS(calculated_amount))",
      "priority": "Critical",
      "source": "Tax code, article 27",
      "status": "Approved",
      "category": "Calculation",
      "owner": "Noureddine Ouzoubair",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-004"
      ]
    },
    {
      "id": "RULE-006",
      "description": "A payment is attempted synchronously exactly once per submission cycle.",
      "logic": "CALL EXTERNAL_PAYMENT_SYSTEM SYNCHRONOUS; no built-in retry inside the transaction",
      "priority": "High",
      "source": "Legacy payment interface spec",
      "status": "Approved",
      "category": "Payment",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-005",
        "BR-009"
      ]
    },
    {
      "id": "RULE-007",
      "description": "A refund still PENDING after 24h is retried once by the nightly batch, then flagged for manual review.",
      "logic": "IF refund.status='PENDING' AND now - refund.created_at > 24h THEN retry_once() ELSE flag('NEEDS_MANUAL_REVIEW')",
      "priority": "High",
      "source": "Operations runbook",
      "status": "Approved",
      "category": "Payment",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-009"
      ]
    },
    {
      "id": "RULE-008",
      "description": "Every EJB writes to the shared AUDIT_LOG table within its own local transaction.",
      "logic": "ON any status change INSERT INTO AUDIT_LOG(entity, old_status, new_status, actor, ts)",
      "priority": "Critical",
      "source": "Internal audit policy",
      "status": "Approved",
      "category": "Audit",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-008"
      ]
    }
  ];

const testCases: TestCase[] = [
    {
      "id": "TC-001",
      "scenario": "A valid declaration is registered",
      "suite": "Declaration",
      "preconditions": [
        "An ACTIVE taxpayer with no declaration for the current tax year"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit a complete declaration",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the confirmation screen",
          "expected": ""
        }
      ],
      "expectedResult": "The declaration exists with status SUBMITTED and a legacy declaration number is shown.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-01-22",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-002",
      "scenario": "A duplicate declaration for the same year is rejected",
      "suite": "Declaration",
      "preconditions": [
        "A taxpayer with an existing SUBMITTED declaration for the current year"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit a second declaration for the same year",
          "expected": ""
        }
      ],
      "expectedResult": "The submission is rejected with DECLARATION_EXISTS.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Negative",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-01-22",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-003",
      "scenario": "A declaration missing a mandatory field is rejected",
      "suite": "Validation",
      "preconditions": [
        "A declaration payload with incomeAmount left blank"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit the incomplete declaration",
          "expected": ""
        }
      ],
      "expectedResult": "The declaration is rejected with MISSING_FIELD.",
      "status": "Passed",
      "priority": "High",
      "type": "Negative",
      "linkedRequirement": "BR-002",
      "lastRun": "2026-01-22",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-004",
      "scenario": "Tax calculation returns the correct bracket result",
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
          "action": "Read the calculated amount",
          "expected": ""
        }
      ],
      "expectedResult": "The higher bracket rate is applied from the boundary inclusive.",
      "status": "Passed",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-003",
      "lastRun": "2026-01-23",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-005",
      "scenario": "A negative calculation result creates a refund",
      "suite": "Refund",
      "preconditions": [
        "A validated declaration whose calculated amount is negative"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger the calculation",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the refund record",
          "expected": ""
        }
      ],
      "expectedResult": "A refund exists with status PENDING, amount equal to the absolute calculated value.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-004",
      "lastRun": "2026-01-23",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-006",
      "scenario": "A successful synchronous payment marks the refund PAID",
      "suite": "Payment",
      "preconditions": [
        "A refund in status PENDING",
        "External Payment System stubbed to succeed"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger PaymentEJB",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the refund status",
          "expected": ""
        }
      ],
      "expectedResult": "The refund status becomes PAID.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Integration",
      "linkedRequirement": "BR-005",
      "lastRun": "2026-01-24",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-007",
      "scenario": "A synchronous payment timeout leaves the refund PENDING",
      "suite": "Payment",
      "preconditions": [
        "A refund in status PENDING",
        "External Payment System stubbed to hang past the transaction timeout"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger PaymentEJB",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the refund status",
          "expected": ""
        }
      ],
      "expectedResult": "The refund stays PENDING; no automatic retry occurs.",
      "status": "Passed",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-005",
      "lastRun": "2026-01-24",
      "executedBy": "Saadaoui Abdessalem",
      "defect": "DEF-201"
    },
    {
      "id": "TC-008",
      "scenario": "Status lookup shows the current declaration and refund state",
      "suite": "Tracking",
      "preconditions": [
        "A declaration with a linked refund in status PAID"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Look up the declaration by number",
          "expected": ""
        }
      ],
      "expectedResult": "Both the declaration status and refund status are displayed.",
      "status": "Passed",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-006",
      "lastRun": "2026-01-24",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-009",
      "scenario": "A rejected declaration shows the legacy reason code",
      "suite": "Validation",
      "preconditions": [
        "A declaration that fails RULE-004 (year not supported)"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit the declaration",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the rejection message",
          "expected": ""
        }
      ],
      "expectedResult": "The reason code YEAR_NOT_SUPPORTED is shown, without further explanation.",
      "status": "Passed",
      "priority": "Medium",
      "type": "Negative",
      "linkedRequirement": "BR-007",
      "lastRun": "2026-01-24",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-010",
      "scenario": "Every status change writes an audit row",
      "suite": "Audit",
      "preconditions": [
        "A declaration about to change status"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Change the declaration status",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Query AUDIT_LOG for the same entity",
          "expected": ""
        }
      ],
      "expectedResult": "One AUDIT_LOG row exists for the change, in the same transaction.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-008",
      "lastRun": "2026-01-25",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-011",
      "scenario": "The nightly batch retries a stuck refund once, then flags it",
      "suite": "Payment",
      "preconditions": [
        "A refund PENDING for more than 24h",
        "External Payment System stubbed to fail"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Run the nightly batch",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read the refund status",
          "expected": ""
        }
      ],
      "expectedResult": "The refund is retried exactly once and ends NEEDS_MANUAL_REVIEW.",
      "status": "Passed",
      "priority": "High",
      "type": "Integration",
      "linkedRequirement": "BR-009",
      "lastRun": "2026-01-25",
      "executedBy": "Saadaoui Abdessalem"
    }
  ];

const actors: Actor[] = [
    {
      "id": "ACT-001",
      "name": "Taxpayer",
      "type": "Human",
      "description": "The citizen filing a tax declaration and awaiting a refund.",
      "responsibilities": [
        "Submits the declaration",
        "views status"
      ],
      "permissions": [
        "Read own declarations",
        "create declaration"
      ],
      "systemsUsed": [
        "Legacy Portal"
      ],
      "channel": "Web"
    },
    {
      "id": "ACT-002",
      "name": "Tax Administration Agent",
      "type": "Human",
      "description": "Back-office agent who reviews rejected declarations and manual-review refunds.",
      "responsibilities": [
        "Reviews rejections",
        "unblocks manual-review refunds"
      ],
      "permissions": [
        "Read all declarations",
        "override status"
      ],
      "systemsUsed": [
        "WebLogic Admin Console"
      ],
      "channel": "Back Office"
    },
    {
      "id": "ACT-003",
      "name": "Payment Operator",
      "type": "Human",
      "description": "Operator monitoring the nightly batch and payment failures.",
      "responsibilities": [
        "Monitors the batch job",
        "investigates NEEDS_MANUAL_REVIEW refunds"
      ],
      "permissions": [
        "Read refunds",
        "trigger a manual payment retry"
      ],
      "systemsUsed": [
        "Legacy Portal",
        "DB2 tooling"
      ],
      "channel": "Back Office"
    },
    {
      "id": "ACT-004",
      "name": "System Administrator",
      "type": "Human",
      "description": "Maintains the WebLogic domain and the DB2 database.",
      "responsibilities": [
        "Deploys EJBs",
        "manages the WebLogic domain",
        "DB2 maintenance"
      ],
      "permissions": [
        "Full administrative access"
      ],
      "systemsUsed": [
        "WebLogic Console",
        "DB2"
      ],
      "channel": "Back Office"
    },
    {
      "id": "ACT-005",
      "name": "External Tax Reference System",
      "type": "External",
      "description": "Provides the reference tax tables used by TaxCalculationEJB.",
      "responsibilities": [
        "Supplies tax brackets and rates"
      ],
      "permissions": [
        "Read-only reference data"
      ],
      "systemsUsed": [
        "Legacy SOAP gateway"
      ],
      "channel": "File Transfer / SOAP"
    },
    {
      "id": "ACT-006",
      "name": "External Payment System",
      "type": "External",
      "description": "Executes the actual bank transfer for refunds.",
      "responsibilities": [
        "Executes the payment",
        "returns a synchronous result"
      ],
      "permissions": [
        "Receive payment instruction"
      ],
      "systemsUsed": [
        "Legacy SOAP gateway"
      ],
      "channel": "SOAP"
    }
  ];

const diagrams: Diagram[] = [
    {
      "id": "DGM-001",
      "title": "Who can do what with a declaration (legacy)",
      "type": "Use Case",
      "description": "The actors around the legacy declaration process and what each may initiate.",
      "source": "@startuml\nleft to right direction\nskinparam packageStyle rectangle\n\nactor \"Taxpayer\" as TP\nactor \"Tax Administration Agent\" as AG\nactor \"Payment Operator\" as PO\nactor \"External Payment System\" as EPS\n\nrectangle \"Legacy tax platform\" {\n  usecase \"Submit declaration\" as UC1\n  usecase \"View status\" as UC2\n  usecase \"Review rejection\" as UC3\n  usecase \"Investigate stuck refund\" as UC4\n  usecase \"Process payment\" as UC5\n}\n\nTP --> UC1\nTP --> UC2\nAG --> UC3\nPO --> UC4\nUC5 --> EPS\nUC4 ..> UC5 : <<include>>\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-19",
      "relatedRequirements": [
        "BR-001",
        "BR-006"
      ]
    },
    {
      "id": "DGM-002",
      "title": "Submit and validate a declaration",
      "type": "Sequence",
      "description": "The synchronous call chain from the taxpayer to DB2, in a single transaction.",
      "source": "@startuml\nautonumber\nactor Taxpayer\nparticipant \"Legacy Portal\" as Portal\nparticipant \"WebLogic\" as WL\nparticipant \"DeclarationEJB\" as DEJB\nparticipant \"ValidationEJB\" as VEJB\ndatabase \"DB2\" as DB\n\nTaxpayer -> Portal : submit declaration\nPortal -> WL : invoke DeclarationEJB\nWL -> DEJB : submitDeclaration()\nDEJB -> VEJB : validate()\nalt not eligible\n  VEJB --> DEJB : REJECTED (reason code)\n  DEJB --> Portal : REJECTED\nelse eligible\n  VEJB --> DEJB : OK\n  DEJB -> DB : INSERT declaration (SUBMITTED)\n  DB --> DEJB : committed\n  DEJB --> Portal : SUBMITTED\nend\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-19",
      "relatedRequirements": [
        "BR-001",
        "BR-002"
      ]
    },
    {
      "id": "DGM-003",
      "title": "Calculate tax and create refund",
      "type": "Sequence",
      "description": "Same transaction continues into TaxCalculationEJB and, if applicable, RefundEJB.",
      "source": "@startuml\nautonumber\nparticipant \"DeclarationEJB\" as DEJB\nparticipant \"TaxCalculationEJB\" as CEJB\nparticipant \"RefundEJB\" as REJB\ndatabase \"DB2\" as DB\n\nDEJB -> CEJB : calculate()\nCEJB -> DB : read tax brackets\nDB --> CEJB : brackets\nCEJB -> CEJB : apply formula\nalt result < 0 (refund)\n  CEJB -> REJB : createRefund(amount)\n  REJB -> DB : INSERT refund (PENDING)\nelse result >= 0 (tax due)\n  CEJB -> DB : UPDATE declaration (TAX_DUE)\nend\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-19",
      "relatedRequirements": [
        "BR-003",
        "BR-004"
      ]
    },
    {
      "id": "DGM-004",
      "title": "Process refund payment (synchronous)",
      "type": "Sequence",
      "description": "The single synchronous call to the External Payment System, with no built-in retry.",
      "source": "@startuml\nautonumber\nparticipant \"RefundEJB\" as REJB\nparticipant \"PaymentEJB\" as PEJB\nparticipant \"External Payment System\" as EPS\ndatabase \"DB2\" as DB\n\nREJB -> PEJB : processPayment(refundId)\nPEJB -> EPS : SOAP payment request (synchronous)\nalt success\n  EPS --> PEJB : payment confirmed\n  PEJB -> DB : UPDATE refund (PAID)\nelse timeout or failure\n  EPS --> PEJB : error / no response\n  PEJB -> DB : refund stays PENDING\nend\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-19",
      "relatedRequirements": [
        "BR-005"
      ]
    },
    {
      "id": "DGM-005",
      "title": "Nightly batch reconciliation",
      "type": "Sequence",
      "description": "The only retry mechanism in the legacy platform: a scheduled job, once per day.",
      "source": "@startuml\nautonumber\nparticipant \"WebLogic Scheduler\" as Sched\nparticipant \"PaymentEJB\" as PEJB\ndatabase \"DB2\" as DB\nparticipant \"External Payment System\" as EPS\n\nSched -> DB : SELECT refunds PENDING > 24h\nDB --> Sched : list\nloop each stuck refund\n  Sched -> PEJB : retryPayment(refundId)\n  PEJB -> EPS : SOAP payment request\n  alt success\n    EPS --> PEJB : confirmed\n    PEJB -> DB : UPDATE refund (PAID)\n  else failure again\n    EPS --> PEJB : error\n    PEJB -> DB : UPDATE refund (NEEDS_MANUAL_REVIEW)\n  end\nend\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-19",
      "relatedRequirements": [
        "BR-009"
      ]
    },
    {
      "id": "DGM-006",
      "title": "Life of a declaration and its refund",
      "type": "State",
      "description": "Every status a declaration/refund may hold and the transitions allowed between them.",
      "source": "@startuml\n[*] --> SUBMITTED\nSUBMITTED --> REJECTED : validation or calculation failed\nSUBMITTED --> TAX_DUE : positive result\nSUBMITTED --> PENDING : negative result (refund created)\nPENDING --> PAID : synchronous payment succeeds\nPENDING --> PENDING : payment fails (no auto-retry)\nPENDING --> NEEDS_MANUAL_REVIEW : nightly batch retry also fails\nNEEDS_MANUAL_REVIEW --> PAID : agent triggers manual payment\nTAX_DUE --> [*]\nPAID --> [*]\nREJECTED --> [*]\n\nnote right of PENDING\n  Only one retry exists\n  in the whole platform:\n  the nightly batch\nend note\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-20",
      "relatedRequirements": [
        "BR-001",
        "BR-006",
        "BR-007"
      ]
    },
    {
      "id": "DGM-007",
      "title": "Legacy DB2 data model",
      "type": "ER",
      "description": "The tables the legacy EJBs write and the keys that join them.",
      "source": "@startuml\nentity \"TAXPAYER\" as TPY {\n  * ID : uuid\n  --\n  TAXPAYER_NUMBER : varchar(15)\n  NAME : varchar(120)\n  STATUS : varchar(20)\n}\n\nentity \"DECLARATION\" as DCL {\n  * ID : uuid\n  --\n  TAXPAYER_ID : uuid <<FK>>\n  TAX_YEAR : int\n  STATUS : varchar(20)\n  SUBMITTED_AT : timestamp\n}\n\nentity \"DECLARATION_LINE\" as DCLN {\n  * ID : uuid\n  --\n  DECLARATION_ID : uuid <<FK>>\n  TYPE : varchar(30)\n  AMOUNT : numeric(15,2)\n}\n\nentity \"REFUND\" as RFD {\n  * ID : uuid\n  --\n  DECLARATION_ID : uuid <<FK>>\n  AMOUNT : numeric(15,2)\n  STATUS : varchar(20)\n}\n\nentity \"PAYMENT\" as PAY {\n  * ID : uuid\n  --\n  REFUND_ID : uuid <<FK>>\n  AMOUNT : numeric(15,2)\n  STATUS : varchar(20)\n  PAYMENT_DATE : date\n}\n\nentity \"AUDIT_LOG\" as AUD {\n  * ID : uuid\n  --\n  ENTITY_TYPE : varchar(30)\n  ENTITY_ID : uuid\n  OLD_STATUS : varchar(20)\n  NEW_STATUS : varchar(20)\n  CHANGED_AT : timestamp\n}\n\nTPY ||--o{ DCL\nDCL ||--o{ DCLN\nDCL ||--o| RFD\nRFD ||--o{ PAY\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-21",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005"
      ]
    },
    {
      "id": "DGM-008",
      "title": "System context and components (EJB/WebLogic/DB2)",
      "type": "Component",
      "description": "The AS-IS system context: one WebLogic domain, five tightly-coupled EJBs and a shared DB2 schema.",
      "source": "@startuml\nskinparam componentStyle rectangle\n\nactor Taxpayer\ncomponent \"Legacy Portal\" as Portal\nnode \"WebLogic Domain\" {\n  component \"DeclarationEJB\" as DEJB\n  component \"ValidationEJB\" as VEJB\n  component \"TaxCalculationEJB\" as CEJB\n  component \"RefundEJB\" as REJB\n  component \"PaymentEJB\" as PEJB\n}\ndatabase \"DB2\" as DB\ncomponent \"External Tax Reference System\" as ETRS\ncomponent \"External Payment System\" as EPS\n\nTaxpayer --> Portal\nPortal --> DEJB\nDEJB --> VEJB\nDEJB --> CEJB\nCEJB --> ETRS\nDEJB --> REJB\nREJB --> PEJB\nPEJB --> EPS\nDEJB --> DB\nVEJB --> DB\nCEJB --> DB\nREJB --> DB\nPEJB --> DB\n@enduml",
      "version": "1.1",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-22",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005",
        "BR-008",
        "BR-009"
      ]
    },
    {
      "id": "DGM-009",
      "title": "Declaration and refund process, BPMN (legacy)",
      "type": "BPMN",
      "description": "The same end-to-end flow as PF-001, in BPMN notation, with the lane that owns each step.",
      "source": "@startuml\n!theme plain\ntitle Submit, calculate and refund (legacy)\n\n|Taxpayer|\nstart\n:Fill in the declaration form;\n:Submit;\n\n|WebLogic / DeclarationEJB|\nif (Eligible taxpayer,\nno existing declaration?) then (no)\n  |ValidationEJB|\n  :Reject declaration;\n  stop\nelse (yes)\n  :Register declaration (SUBMITTED);\nendif\n\n|ValidationEJB|\nif (Mandatory fields OK,\ntax year supported?) then (no)\n  :Reject declaration;\n  stop\nelse (yes)\nendif\n\n|TaxCalculationEJB|\n:Calculate tax;\nif (Result negative?) then (yes)\n  |RefundEJB|\n  :Create refund (PENDING);\n  |PaymentEJB|\n  :Call External Payment System\\n(synchronous, single attempt);\n  if (Payment succeeds?) then (yes)\n    :Set refund PAID;\n    stop\n  else (no)\n    |WebLogic Scheduler|\n    :Nightly batch retries once;\n    if (Retry succeeds?) then (yes)\n      :Set refund PAID;\n      stop\n    else (no)\n      :Flag NEEDS_MANUAL_REVIEW;\n      stop\n    endif\n  endif\nelse (no)\n  |DeclarationEJB|\n  :Close as TAX_DUE;\n  stop\nendif\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-22",
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
      "title": "Legacy declaration submission screen",
      "screenId": "SCR-DECL-01",
      "description": "The single-page postback form used to submit a declaration; no client-side validation, full page reload on error.",
      "channel": "Web",
      "version": "1.0",
      "status": "Approved",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-15",
      "annotations": [
        "Errors are only shown after a full postback",
        "the taxpayer loses unsaved input on rejection."
      ],
      "relatedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "WF-002",
      "title": "Legacy status lookup screen",
      "screenId": "SCR-STAT-01",
      "description": "Lets a taxpayer or agent look up a declaration by number and see a coarse status only.",
      "channel": "Web",
      "version": "1.0",
      "status": "Approved",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-17",
      "annotations": [
        "No distinction between PENDING and NEEDS_MANUAL_REVIEW is shown to the taxpayer."
      ],
      "relatedRequirements": [
        "BR-006"
      ]
    }
  ];

const apiServices: ApiService[] = [
    {
      "id": "SVC-1",
      "name": "Declaration EJB",
      "basePath": "n/a (RMI/IIOP)",
      "version": "1.0.0",
      "description": "Endpoints exposed by Declaration EJB.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-L01",
          "method": "GET",
          "path": "DeclarationEJB.submitDeclaration()",
          "summary": "Remote EJB method to submit a declaration",
          "description": "Synchronous remote call; runs validation and, on success, calculation in the same transaction.",
          "tag": "Declaration",
          "operationId": "submitDeclaration",
          "auth": "WebLogic JAAS",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-001"
          ]
        },
        {
          "id": "API-L02",
          "method": "GET",
          "path": "ValidationEJB.validate()",
          "summary": "Remote EJB method to validate a declaration",
          "description": "Called internally by DeclarationEJB; not exposed outside the WebLogic domain.",
          "tag": "Validation",
          "operationId": "validate",
          "auth": "WebLogic JAAS",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-002"
          ]
        },
        {
          "id": "API-L06",
          "method": "GET",
          "path": "DeclarationEJB.getStatus()",
          "summary": "Remote EJB method to read declaration/refund status",
          "description": "Read-only lookup used by the status screen; no pagination, no filtering.",
          "tag": "Tracking",
          "operationId": "getStatus",
          "auth": "WebLogic JAAS",
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
      "name": "Calculation EJB",
      "basePath": "n/a (RMI/IIOP)",
      "version": "1.0.0",
      "description": "Endpoints exposed by Calculation EJB.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-L03",
          "method": "GET",
          "path": "TaxCalculationEJB.calculate()",
          "summary": "Remote EJB method to calculate the tax result",
          "description": "Reads DB2 reference tables and returns TAX_DUE or REFUND.",
          "tag": "Calculation",
          "operationId": "calculate",
          "auth": "WebLogic JAAS",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-003"
          ]
        }
      ]
    },
    {
      "id": "SVC-3",
      "name": "Refund EJB",
      "basePath": "n/a (RMI/IIOP)",
      "version": "1.0.0",
      "description": "Endpoints exposed by Refund EJB.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-L04",
          "method": "GET",
          "path": "RefundEJB.createRefund()",
          "summary": "Remote EJB method to create a refund",
          "description": "Called only when the calculation result is negative.",
          "tag": "Refund",
          "operationId": "createRefund",
          "auth": "WebLogic JAAS",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-004"
          ]
        }
      ]
    },
    {
      "id": "SVC-4",
      "name": "Payment EJB",
      "basePath": "n/a (RMI/IIOP)",
      "version": "1.0.0",
      "description": "Endpoints exposed by Payment EJB.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-L05",
          "method": "GET",
          "path": "PaymentEJB.processPayment()",
          "summary": "Remote EJB method that calls the external payment system",
          "description": "Wraps a single synchronous SOAP call to the External Payment System; no retry, no idempotency key.",
          "tag": "Payment",
          "operationId": "processPayment",
          "auth": "WebLogic JAAS",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-005"
          ]
        }
      ]
    }
  ];

const sqlValidations: SqlValidationQuery[] = [
    {
      "id": "SQL-001",
      "title": "Refunds stuck beyond the 25h worst-case SLA",
      "purpose": "Detects refunds that exceeded the SLA, proving RULE-007 is actually enforced in production.",
      "database": "TAXDB2",
      "sql": "SELECT r.id, r.status, r.created_at,\n       CURRENT TIMESTAMP - r.created_at AS age\nFROM   REFUND r\nWHERE  r.status = 'PENDING'\nAND    CURRENT TIMESTAMP - r.created_at > 25 HOURS\nORDER  BY age DESC;",
      "columns": [
        "id",
        "status",
        "created_at",
        "age"
      ],
      "rows": [],
      "notes": [
        "Returned 3 rows in the case-study dataset",
        "confirms the batch's single retry is insufficient under load."
      ],
      "status": "Validated",
      "lastRun": "2026-01-23",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-009"
      ],
      "relatedRules": [
        "RULE-007"
      ]
    },
    {
      "id": "SQL-002",
      "title": "Duplicate payments caused by lost synchronous responses",
      "purpose": "Detects duplicate EXTERNAL_REFERENCE values, proving edge case EC-004 occurs in production.",
      "database": "TAXDB2",
      "sql": "SELECT external_reference, COUNT(*) AS occurrences\nFROM   PAYMENT\nWHERE  external_reference IS NOT NULL\nGROUP  BY external_reference\nHAVING COUNT(*) > 1;",
      "columns": [
        "external_reference",
        "occurrences"
      ],
      "rows": [],
      "notes": [
        "Returned 1 row",
        "the legacy interface has no idempotency key",
        "so a lost response can pay twice."
      ],
      "status": "Validated",
      "lastRun": "2026-01-23",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-005",
        "BR-009"
      ],
      "relatedRules": [
        "RULE-006"
      ]
    },
    {
      "id": "SQL-003",
      "title": "Declarations without a matching audit row",
      "purpose": "Proves RULE-008 (every status change is audited) actually holds in the data.",
      "database": "TAXDB2",
      "sql": "SELECT d.id, d.status\nFROM   DECLARATION d\nWHERE  NOT EXISTS (\n         SELECT 1 FROM AUDIT_LOG a\n         WHERE  a.entity_type = 'DECLARATION' AND a.entity_id = d.id\n       );",
      "columns": [
        "id",
        "status"
      ],
      "rows": [],
      "notes": [
        "Returned no rows",
        "the audit rule holds for declarations."
      ],
      "status": "Validated",
      "lastRun": "2026-01-24",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-008"
      ],
      "relatedRules": [
        "RULE-008"
      ]
    }
  ];

const documents: WorkspaceDocument[] = [
    {
      "id": "DOC-001",
      "name": "Legacy tax platform - architecture assessment",
      "format": "Word",
      "description": "Findings from the AS-IS analysis: business flow, EJB/WebLogic architecture, DB2 model and integrations.",
      "category": "Architecture",
      "version": "1.2",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-25",
      "size": "612 KB",
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
        "BR-009"
      ]
    },
    {
      "id": "DOC-002",
      "name": "EJB interface catalogue",
      "format": "Excel",
      "description": "Inventory of the six legacy EJB remote interfaces, their callers and their WebLogic deployment unit.",
      "category": "Interface",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-19",
      "size": "58 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-004",
        "BR-005",
        "BR-006"
      ]
    },
    {
      "id": "DOC-003",
      "name": "DB2 legacy schema (DDL)",
      "format": "Word",
      "description": "DDL for TAXPAYER, DECLARATION, DECLARATION_LINE, REFUND, PAYMENT and AUDIT_LOG.",
      "category": "Data",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-21",
      "size": "14 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-004",
        "BR-005",
        "BR-008"
      ]
    },
    {
      "id": "DOC-004",
      "name": "Legacy pain points register",
      "format": "Word",
      "description": "The eight pain points that justify the modernization business case: EJB coupling, WebLogic lock-in, synchronous integration, shared database, large deployment unit, difficult independent scaling, difficult fault isolation, no API standardization. This is the bridge to Project 2 (TO-BE).",
      "category": "Architecture",
      "version": "1.1",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-01-26",
      "size": "204 KB",
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
        "BR-009"
      ]
    },
    {
      "id": "DOC-005",
      "name": "AS-IS sign-off",
      "format": "Word",
      "description": "Business sign-off of the AS-IS analysis by Jean-Philippe Collin (Business Sponsor) and Nicolas Leroy (Product Owner), reviewed by Noureddine Ouzoubair (Senior Business Analyst), Tax Administration.",
      "category": "Governance",
      "version": "1.0",
      "author": "Jean-Philippe Collin",
      "lastUpdated": "2026-01-27",
      "size": "88 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-009"
      ]
    },
    {
      "id": "DOC-006",
      "name": "AS-IS discovery backlog and prioritization",
      "format": "Excel",
      "description": "The initial discovery backlog for the AS-IS analysis (stakeholder interviews, EJB interface inventory, DB2 schema extraction), sequenced and prioritized by Nicolas Leroy as Product Owner. Business rules were elicited jointly with Noureddine Ouzoubair as the domain SME for tax eligibility and refund calculation logic.",
      "category": "Planning",
      "version": "1.0",
      "author": "Nicolas Leroy",
      "lastUpdated": "2026-01-10",
      "size": "36 KB",
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
        "BR-009"
      ]
    }
  ];

const processFlows: ProcessFlow[] = [
    {
      "id": "PF-001",
      "name": "Submit, calculate and refund (legacy)",
      "description": "End-to-end legacy flow from submission through synchronous validation, calculation and payment, with a nightly batch as the only safety net.",
      "lanes": [
        {
          "id": "PF-001-L1",
          "name": "Taxpayer",
          "actorId": ""
        },
        {
          "id": "PF-001-L2",
          "name": "Legacy Portal / WebLogic",
          "actorId": ""
        },
        {
          "id": "PF-001-L3",
          "name": "ValidationEJB",
          "actorId": ""
        },
        {
          "id": "PF-001-L4",
          "name": "TaxCalculationEJB",
          "actorId": ""
        },
        {
          "id": "PF-001-L5",
          "name": "RefundEJB",
          "actorId": ""
        },
        {
          "id": "PF-001-L6",
          "name": "PaymentEJB",
          "actorId": ""
        },
        {
          "id": "PF-001-L7",
          "name": "DeclarationEJB",
          "actorId": ""
        },
        {
          "id": "PF-001-L8",
          "name": "WebLogic Scheduler",
          "actorId": ""
        }
      ],
      "steps": [
        {
          "id": "S1",
          "name": "Submit declaration",
          "type": "start",
          "lane": "Taxpayer",
          "description": "The taxpayer fills the form and submits it to the legacy portal.",
          "rules": [],
          "next": [
            "S2"
          ]
        },
        {
          "id": "S2",
          "name": "Register declaration",
          "type": "task",
          "lane": "Legacy Portal / WebLogic",
          "description": "DeclarationEJB persists the declaration synchronously in DB2.",
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
          "lane": "ValidationEJB",
          "description": "Mandatory fields and the tax-year window are checked.",
          "rules": [
            "RULE-003",
            "RULE-004"
          ],
          "next": [
            "S4",
            "S9"
          ]
        },
        {
          "id": "S4",
          "name": "Calculate tax",
          "type": "task",
          "lane": "TaxCalculationEJB",
          "description": "The declared income is compared against the reference tax brackets.",
          "rules": [],
          "next": [
            "S5"
          ]
        },
        {
          "id": "S5",
          "name": "Branch on result",
          "type": "decision",
          "lane": "TaxCalculationEJB",
          "description": "A positive amount becomes TAX_DUE, a negative amount triggers a refund.",
          "rules": [
            "RULE-005"
          ],
          "next": [
            "S6",
            "S8"
          ]
        },
        {
          "id": "S6",
          "name": "Create refund",
          "type": "task",
          "lane": "RefundEJB",
          "description": "A refund record is created with status PENDING.",
          "rules": [
            "RULE-005"
          ],
          "next": [
            "S7"
          ]
        },
        {
          "id": "S7",
          "name": "Process payment (synchronous)",
          "type": "task",
          "lane": "PaymentEJB",
          "description": "The External Payment System is called synchronously, once.",
          "rules": [
            "RULE-006"
          ],
          "next": [
            "S10"
          ]
        },
        {
          "id": "S8",
          "name": "Register tax due",
          "type": "end",
          "lane": "DeclarationEJB",
          "description": "The declaration is closed with status TAX_DUE; no payment step follows.",
          "rules": [],
          "next": []
        },
        {
          "id": "S9",
          "name": "Reject declaration",
          "type": "end",
          "lane": "ValidationEJB",
          "description": "The declaration is closed with status REJECTED and a legacy reason code.",
          "rules": [
            "RULE-003",
            "RULE-004"
          ],
          "next": []
        },
        {
          "id": "S10",
          "name": "Nightly batch reconciliation",
          "type": "task",
          "lane": "WebLogic Scheduler",
          "description": "Refunds still PENDING after 24h are retried once, then flagged NEEDS_MANUAL_REVIEW.",
          "rules": [
            "RULE-007"
          ],
          "next": []
        }
      ],
      "trigger": "The taxpayer submits a declaration through the legacy portal",
      "outcome": "The declaration is closed TAX_DUE, REFUND PAID, or REJECTED; refunds stuck beyond 24h are handled by the nightly batch",
      "slaTarget": "Synchronous response within the HTTP session; refund payment finalized within 25 hours worst case"
    }
  ];

const functionalSpecSections: FunctionalSpecSection[] = [
    {
      "id": "FS-001",
      "title": "Submitting a declaration (legacy)",
      "summary": "How DeclarationEJB and ValidationEJB process a submission synchronously, in one transaction.",
      "requirementRefs": [
        "BR-001",
        "BR-002"
      ],
      "businessLogic": [
        "Persist the raw declaration",
        "Run mandatory-field and tax-year checks",
        "On failure, roll back and return REJECTED",
        "On success, continue to calculation in the same transaction"
      ],
      "fields": [
        {
          "name": "declarationId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "The declaration being submitted.",
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
        }
      ],
      "validations": [
        {
          "field": "taxpayerNumber",
          "rule": "Must reference an ACTIVE taxpayer",
          "errorCode": "TAXPAYER_NOT_ACTIVE",
          "severity": "Blocking"
        },
        {
          "field": "taxYear",
          "rule": "Must be one of the two most recent tax years",
          "errorCode": "YEAR_NOT_SUPPORTED",
          "severity": "Blocking"
        },
        {
          "field": "incomeAmount",
          "rule": "Must be present and greater than or equal to zero",
          "errorCode": "MISSING_FIELD",
          "severity": "Blocking"
        },
        {
          "field": "taxpayerNumber + taxYear",
          "rule": "No existing declaration for the same taxpayer and year",
          "errorCode": "DECLARATION_EXISTS",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "TAXPAYER_NOT_ACTIVE",
          "httpStatus": 422,
          "message": "This taxpayer is not active.",
          "handling": "Direct the taxpayer to the registration office; no declaration is created."
        },
        {
          "code": "YEAR_NOT_SUPPORTED",
          "httpStatus": 422,
          "message": "This tax year cannot be declared online.",
          "handling": "Show the two supported years and offer the paper channel."
        },
        {
          "code": "DECLARATION_EXISTS",
          "httpStatus": 409,
          "message": "A declaration already exists for this year.",
          "handling": "Take the taxpayer to the existing declaration rather than creating a second one."
        },
        {
          "code": "MISSING_FIELD",
          "httpStatus": 400,
          "message": "Required information is missing.",
          "handling": "Highlight the missing field on the legacy form."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-001",
          "scenario": "The taxpayer submits the same declaration twice in quick succession from two browser tabs",
          "expectedBehaviour": "The second synchronous call fails with DECLARATION_EXISTS because the first transaction has already committed."
        }
      ]
    },
    {
      "id": "FS-002",
      "title": "Tax calculation (legacy)",
      "summary": "How TaxCalculationEJB derives TAX_DUE or REFUND from the declared income and the reference tax tables.",
      "requirementRefs": [
        "BR-003",
        "BR-004"
      ],
      "businessLogic": [
        "Load the tax brackets for the declared year",
        "Apply the bracket formula to the declared income",
        "If the result is negative, create a REFUND row",
        "If the result is positive, close the declaration as TAX_DUE"
      ],
      "fields": [
        {
          "name": "calculationId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "The calculation run linked to the declaration.",
          "example": "3d81c0aa-71f4-4d2e-9c6b-6f0b2b1e77a2"
        },
        {
          "name": "taxBracketId",
          "type": "varchar",
          "length": "10",
          "mandatory": true,
          "description": "Reference to the applicable tax bracket.",
          "example": "BRK-2025-3"
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
          "field": "calculatedAmount",
          "rule": "Must be computed from a tax bracket valid for the declared year",
          "errorCode": "BRACKET_NOT_FOUND",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "BRACKET_NOT_FOUND",
          "httpStatus": 500,
          "message": "The tax calculation could not complete.",
          "handling": "Halt the transaction and alert the system administrator; nothing is persisted."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-002",
          "scenario": "The declared income falls exactly on a tax bracket boundary",
          "expectedBehaviour": "The higher bracket's rate applies from the boundary value inclusive, per the reference tax table."
        }
      ]
    },
    {
      "id": "FS-003",
      "title": "Synchronous refund payment (legacy)",
      "summary": "How PaymentEJB calls the external payment system and what happens when that call fails.",
      "requirementRefs": [
        "BR-005",
        "BR-009"
      ],
      "businessLogic": [
        "Call the External Payment System synchronously",
        "On success, set refund.status = PAID",
        "On failure or timeout, leave refund.status = PENDING",
        "Rely on the nightly batch for the single retry"
      ],
      "fields": [
        {
          "name": "paymentId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "The legacy payment attempt record.",
          "example": "1c4a9e2b-3f7d-4a6e-9c0b-2e5f7a8d1b3c"
        },
        {
          "name": "refundId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "The refund being paid.",
          "example": "7a2e4c1d-8b3f-4e6a-9d0c-1f5b8e2a7c4d"
        },
        {
          "name": "paymentStatus",
          "type": "varchar",
          "length": "20",
          "mandatory": true,
          "description": "PENDING, PAID or FAILED.",
          "example": "PAID"
        },
        {
          "name": "externalReference",
          "type": "varchar",
          "length": "40",
          "mandatory": false,
          "description": "Reference returned by the external payment system.",
          "example": "EXT-PAY-88213"
        }
      ],
      "validations": [
        {
          "field": "paymentStatus",
          "rule": "A refund may only transition PENDING -> PAID or PENDING -> NEEDS_MANUAL_REVIEW",
          "errorCode": "INVALID_PAYMENT_TRANSITION",
          "severity": "Blocking"
        },
        {
          "field": "externalReference",
          "rule": "Should be populated whenever paymentStatus is PAID",
          "errorCode": "MISSING_EXTERNAL_REFERENCE",
          "severity": "Warning"
        }
      ],
      "errors": [
        {
          "code": "INVALID_PAYMENT_TRANSITION",
          "httpStatus": 500,
          "message": "The refund is in an unexpected state.",
          "handling": "Roll back and alert the payment operator; no partial payment is recorded."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-003",
          "scenario": "The external payment system responds slowly, near the WebLogic transaction timeout",
          "expectedBehaviour": "The transaction times out, the local status stays PENDING, and the taxpayer sees a generic error even though the external system may already have processed the payment."
        },
        {
          "id": "EC-004",
          "scenario": "The external payment system pays successfully but the synchronous response is lost",
          "expectedBehaviour": "The refund stays PENDING; the nightly batch retries and creates a duplicate payment, because the legacy interface has no idempotency key."
        }
      ]
    },
    {
      "id": "FS-004",
      "title": "Nightly batch reconciliation",
      "summary": "What the WebLogic scheduled job does with refunds left PENDING beyond the SLA.",
      "requirementRefs": [
        "BR-009"
      ],
      "businessLogic": [
        "Select REFUND rows PENDING for more than 24h",
        "Retry the payment call exactly once",
        "On success, set PAID",
        "On repeated failure, set NEEDS_MANUAL_REVIEW"
      ],
      "fields": [
        {
          "name": "batchRunId",
          "type": "varchar",
          "length": "20",
          "mandatory": true,
          "description": "Identifier of the nightly batch execution.",
          "example": "BATCH-20260214"
        },
        {
          "name": "refundsRetried",
          "type": "int",
          "length": "-",
          "mandatory": true,
          "description": "Number of refunds retried in the run.",
          "example": "14"
        },
        {
          "name": "refundsFlagged",
          "type": "int",
          "length": "-",
          "mandatory": true,
          "description": "Number flagged NEEDS_MANUAL_REVIEW.",
          "example": "2"
        }
      ],
      "validations": [
        {
          "field": "refundsRetried",
          "rule": "The batch must not retry the same refund more than once",
          "errorCode": "DOUBLE_RETRY",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "DOUBLE_RETRY",
          "httpStatus": 500,
          "message": "This refund was already retried.",
          "handling": "Skip the refund in the current batch run and alert the payment operator."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-005",
          "scenario": "The nightly batch job itself fails partway through",
          "expectedBehaviour": "Refunds already processed in that run keep their new status; the batch is not restartable from a checkpoint and must be rerun manually the next morning."
        },
        {
          "id": "EC-006",
          "scenario": "A refund is manually corrected by an agent between two batch runs",
          "expectedBehaviour": "The batch does not detect the manual change and may act on stale data if the agent bypassed the standard status transition."
        }
      ]
    }
  ];

export const prjTax001Bundle: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: "PRJ-TAX-001",
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
