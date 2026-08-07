import type { Actor, ApiService, BusinessRule, Diagram, ProcessFlow, Requirement, SqlValidationQuery, TestCase, Wireframe, WorkspaceDocument } from "@/lib/types";
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
      "title": "Raise a card dispute from a settled transaction",
      "businessNeed": "Disputes arrive by phone and are keyed by an agent, which costs 11 minutes per case and loses the evidence trail.",
      "description": "A cardholder selects a settled transaction from the last 120 days and raises a dispute against it, choosing a reason code.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Disputes",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-10",
      "version": "1.2",
      "acceptanceCriteria": [
        {
          "id": "AC-001.1",
          "given": "a settled card transaction dated within the last 120 days",
          "when": "the cardholder raises a dispute and selects a reason code",
          "then": "the dispute is created with the status Submitted and a reference is shown"
        },
        {
          "id": "AC-001.2",
          "given": "a transaction older than 120 days",
          "when": "the cardholder opens it",
          "then": "the dispute action is unavailable and the reason is stated on screen"
        },
        {
          "id": "AC-001.3",
          "given": "a transaction that already has an open dispute",
          "when": "the cardholder tries to dispute it again",
          "then": "the existing case is shown instead of a second one being created"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
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
      "title": "Credit the cardholder provisionally within one working day",
      "businessNeed": "Regulation requires the funds to be restored while the case is investigated; today it is manual and late.",
      "description": "Once a dispute is accepted, a provisional credit for the disputed amount is posted to the cardholder account.",
      "priority": "Critical",
      "status": "Approved",
      "category": "Disputes",
      "moscow": "Must",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-10",
      "version": "1.1",
      "acceptanceCriteria": [
        {
          "id": "AC-002.1",
          "given": "a dispute accepted at 16:00 on a working day",
          "when": "the next end-of-day run completes",
          "then": "a provisional credit for the full disputed amount is posted"
        },
        {
          "id": "AC-002.2",
          "given": "a dispute later rejected",
          "when": "the rejection is recorded",
          "then": "the provisional credit is reversed and the cardholder is told why"
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-002"
      ],
      "relatedTestCases": [
        "TC-003"
      ],
      "relatedRules": [
        "RULE-003"
      ]
    },
    {
      "id": "BR-003",
      "title": "Let the cardholder attach evidence to an open dispute",
      "businessNeed": "Cases stall waiting for a receipt that the cardholder already has on their phone.",
      "description": "Up to five files of 10 MB each may be attached to a dispute while its status is Under Review.",
      "priority": "High",
      "status": "In Review",
      "category": "Disputes",
      "moscow": "Should",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-14",
      "version": "0.4",
      "acceptanceCriteria": [
        {
          "id": "AC-003.1",
          "given": "a dispute with the status Under Review and four files already attached",
          "when": "the cardholder attaches a fifth file of 8 MB",
          "then": "the file is accepted and the attach action is then disabled"
        }
      ],
      "relatedDocuments": [],
      "relatedApis": [
        "API-003"
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
      "title": "Notify the cardholder at every change of dispute status",
      "businessNeed": "Two thirds of calls to the contact centre are cardholders asking where their case stands.",
      "description": "A notification is sent when a dispute moves to Under Review, Resolved or Rejected.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Notifications",
      "moscow": "Should",
      "owner": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-18",
      "version": "0.2",
      "acceptanceCriteria": [
        {
          "id": "AC-004.1",
          "given": "a dispute that moves from Submitted to Under Review",
          "when": "the status change is saved",
          "then": "exactly one notification is sent to the cardholder"
        }
      ],
      "relatedDocuments": [],
      "relatedApis": [],
      "relatedTestCases": [
        "TC-005"
      ],
      "relatedRules": []
    }
  ];

const businessRules: BusinessRule[] = [
    {
      "id": "RULE-001",
      "description": "A dispute may only be raised against a settled transaction.",
      "logic": "IF transaction.status <> 'SETTLED' THEN reject WITH 'NOT_DISPUTABLE'",
      "priority": "Critical",
      "source": "Scheme rules, chapter 11",
      "status": "Approved",
      "category": "Eligibility",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-002",
      "description": "A transaction is disputable for 120 days after its settlement date.",
      "logic": "IF today - transaction.settled_date > 120 THEN reject WITH 'WINDOW_CLOSED'",
      "priority": "Critical",
      "source": "Scheme rules, chapter 11",
      "status": "Approved",
      "category": "Eligibility",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-003",
      "description": "A provisional credit equals the disputed amount, never more.",
      "logic": "credit.amount = dispute.amount AND credit.amount <= transaction.amount",
      "priority": "Critical",
      "source": "Treasury policy 7.1",
      "status": "Approved",
      "category": "Settlement",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-01-01",
      "impactedRequirements": [
        "BR-002"
      ]
    },
    {
      "id": "RULE-004",
      "description": "At most five evidence files, each at most 10 MB, per dispute.",
      "logic": "IF files.count > 5 OR file.size > 10485760 THEN reject WITH 'ATTACHMENT_LIMIT'",
      "priority": "Medium",
      "source": "Operations handbook 3.4",
      "status": "In Review",
      "category": "Evidence",
      "owner": "Saadaoui Abdessalem",
      "effectiveFrom": "2026-03-01",
      "impactedRequirements": [
        "BR-003"
      ]
    }
  ];

const testCases: TestCase[] = [
    {
      "id": "TC-001",
      "scenario": "A settled transaction inside the window can be disputed",
      "suite": "Disputes",
      "preconditions": [
        "A card with a settled transaction dated 30 days ago"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Open the transaction",
          "expected": "the Dispute action is available"
        },
        {
          "step": 2,
          "action": "Choose a reason and confirm",
          "expected": "a reference is shown"
        }
      ],
      "expectedResult": "The dispute exists with the status Submitted.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-02-19",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-002",
      "scenario": "A transaction older than 120 days cannot be disputed",
      "suite": "Disputes",
      "preconditions": [
        "A card with a settled transaction dated 130 days ago"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Open the transaction",
          "expected": "the Dispute action is disabled and the reason is shown"
        }
      ],
      "expectedResult": "No dispute is created and the cardholder is told why.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Negative",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-02-19",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-003",
      "scenario": "A provisional credit is posted for the disputed amount",
      "suite": "Settlement",
      "preconditions": [
        "A dispute of 84.50 accepted before the end-of-day run"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Run end of day",
          "expected": "a posting appears"
        },
        {
          "step": 2,
          "action": "Read the posting",
          "expected": "the amount is 84.50"
        }
      ],
      "expectedResult": "One provisional credit of 84.50 and no second posting.",
      "status": "Passed",
      "priority": "Critical",
      "type": "Integration",
      "linkedRequirement": "BR-002",
      "lastRun": "2026-02-20",
      "executedBy": "Saadaoui Abdessalem"
    },
    {
      "id": "TC-004",
      "scenario": "The sixth evidence file is refused",
      "suite": "Evidence",
      "preconditions": [
        "A dispute Under Review with five files attached"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Attach a sixth file",
          "expected": "the error ATTACHMENT_LIMIT is shown"
        }
      ],
      "expectedResult": "The file is refused and the five existing files are untouched.",
      "status": "Failed",
      "priority": "Medium",
      "type": "Negative",
      "linkedRequirement": "BR-003",
      "lastRun": "2026-02-20",
      "executedBy": "Saadaoui Abdessalem",
      "defect": "DEF-118"
    },
    {
      "id": "TC-005",
      "scenario": "One notification per status change",
      "suite": "Notifications",
      "preconditions": [
        "A dispute with the status Submitted"
      ],
      "steps": [
        {
          "step": 1,
          "action": "Move it to Under Review",
          "expected": "one notification is sent"
        }
      ],
      "expectedResult": "Exactly one notification, not one per retry.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-004",
      "lastRun": "",
      "executedBy": "Saadaoui Abdessalem"
    }
  ];

const actors: Actor[] = [
    {
      "id": "ACT-001",
      "name": "Cardholder",
      "type": "Human",
      "description": "The retail customer whose card was charged.",
      "responsibilities": [
        "Raises the dispute",
        "supplies evidence",
        "accepts the outcome"
      ],
      "permissions": [
        "Read own transactions",
        "create dispute",
        "attach evidence"
      ],
      "systemsUsed": [
        "Mobile app",
        "internet banking"
      ],
      "channel": "Mobile"
    },
    {
      "id": "ACT-002",
      "name": "Disputes agent",
      "type": "Human",
      "description": "Back-office analyst who investigates the case against the scheme rules.",
      "responsibilities": [
        "Reviews evidence",
        "decides the outcome",
        "raises the chargeback"
      ],
      "permissions": [
        "Read all disputes",
        "change status",
        "post adjustments"
      ],
      "systemsUsed": [
        "Disputes console",
        "card management system"
      ],
      "channel": "Back Office"
    },
    {
      "id": "ACT-003",
      "name": "Card scheme",
      "type": "External",
      "description": "Visa or Mastercard, which arbitrates the chargeback.",
      "responsibilities": [
        "Accepts the chargeback",
        "rules on representment"
      ],
      "permissions": [
        "Receive chargeback messages"
      ],
      "systemsUsed": [
        "Scheme gateway"
      ],
      "channel": "File transfer"
    },
    {
      "id": "ACT-004",
      "name": "Ledger",
      "type": "System",
      "description": "Posts the provisional credit and any later reversal.",
      "responsibilities": [
        "Applies postings",
        "guarantees a single posting per instruction"
      ],
      "permissions": [
        "Write postings"
      ],
      "systemsUsed": [
        "Core banking"
      ],
      "channel": "API"
    }
  ];

const diagrams: Diagram[] = [
    {
      "id": "DGM-001",
      "title": "Who can do what with a dispute",
      "type": "Use Case",
      "description": "The actors around the dispute process and what each may initiate.",
      "source": "@startuml\nleft to right direction\nskinparam packageStyle rectangle\n\nactor \"Cardholder\" as CH\nactor \"Disputes agent\" as AG\nactor \"Card scheme\" as CS\n\nrectangle \"Card disputes\" {\n  usecase \"Raise a dispute\" as UC1\n  usecase \"Attach evidence\" as UC2\n  usecase \"Investigate case\" as UC3\n  usecase \"Raise chargeback\" as UC4\n  usecase \"Notify cardholder\" as UC5\n}\n\nCH --> UC1\nCH --> UC2\nAG --> UC3\nAG --> UC4\nUC4 --> CS\nUC3 ..> UC5 : <<include>>\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-10",
      "relatedRequirements": [
        "BR-001",
        "BR-003"
      ]
    },
    {
      "id": "DGM-002",
      "title": "Raising a dispute, end to end",
      "type": "Sequence",
      "description": "The calls made from the tap on Dispute to the provisional credit.",
      "source": "@startuml\nautonumber\nactor Cardholder\nparticipant \"Mobile app\" as App\nparticipant \"Disputes API\" as API\ndatabase \"Disputes DB\" as DB\nparticipant \"Ledger\" as Ledger\n\nCardholder -> App : tap Dispute\nApp -> API : POST /disputes\nAPI -> API : check status and 120-day window\nalt not eligible\n  API --> App : 422 NOT_DISPUTABLE\n  App --> Cardholder : reason shown\nelse eligible\n  API -> DB : insert dispute (Submitted)\n  API --> App : 201 Created\n  API -> Ledger : POST /postings (provisional credit)\n  Ledger --> API : posted\n  API -> DB : status = Under Review\n  API --> Cardholder : notification\nend\n@enduml",
      "version": "1.1",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-12",
      "relatedRequirements": [
        "BR-001",
        "BR-002"
      ]
    },
    {
      "id": "DGM-003",
      "title": "The life of a dispute",
      "type": "State",
      "description": "Every status a dispute may hold and the moves allowed between them.",
      "source": "@startuml\n[*] --> Submitted\nSubmitted --> UnderReview : accepted\nSubmitted --> Rejected : ineligible\nUnderReview --> Resolved : in favour of cardholder\nUnderReview --> Rejected : evidence insufficient\nRejected --> [*]\nResolved --> [*]\n\nnote right of UnderReview\n  Provisional credit is\n  in place from here\nend note\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-12",
      "relatedRequirements": [
        "BR-001",
        "BR-004"
      ]
    },
    {
      "id": "DGM-004",
      "title": "Dispute data model",
      "type": "ER",
      "description": "The tables the dispute writes and the keys that join them.",
      "source": "@startuml\nentity \"card_transaction\" as T {\n  * transaction_id : uuid\n  --\n  card_id : uuid\n  amount : numeric(15,2)\n  settled_date : date\n  status : varchar(20)\n}\n\nentity \"dispute\" as D {\n  * dispute_id : uuid\n  --\n  transaction_id : uuid <<FK>>\n  reason_code : varchar(10)\n  amount : numeric(15,2)\n  status : varchar(20)\n  raised_at : timestamp\n}\n\nentity \"dispute_evidence\" as E {\n  * evidence_id : uuid\n  --\n  dispute_id : uuid <<FK>>\n  file_name : varchar(255)\n  size_bytes : bigint\n}\n\nT ||--o{ D\nD ||--o{ E\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-13",
      "relatedRequirements": [
        "BR-001",
        "BR-002"
      ]
    },
    {
      "id": "DGM-005",
      "title": "Dispute process, BPMN",
      "type": "BPMN",
      "description": "The same flow in BPMN notation, with the lanes that own each step.",
      "source": "@startuml\n!theme plain\ntitle Raise and settle a card dispute\n\n|Cardholder|\nstart\n:Select a settled transaction;\n:Choose a reason code;\n\n|Disputes service|\nif (Eligible?) then (no)\n  :Refuse and explain;\n  stop\nelse (yes)\n  :Create dispute (Submitted);\nendif\n\n|Ledger|\n:Post provisional credit;\n\n|Disputes agent|\n:Investigate the evidence;\nif (In favour of cardholder?) then (yes)\n  :Raise chargeback;\n  |Disputes service|\n  :Close as Resolved;\nelse (no)\n  |Ledger|\n  :Reverse the credit;\n  |Disputes service|\n  :Close as Rejected;\nendif\nstop\n@enduml",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-14",
      "relatedRequirements": [
        "BR-001",
        "BR-002"
      ]
    }
  ];

const wireframes: Wireframe[] = [
    {
      "id": "WF-001",
      "title": "Transaction detail with the Dispute action",
      "screenId": "SCR-TXN-01",
      "description": "Where the cardholder starts, and where the 120-day rule becomes visible.",
      "channel": "Mobile",
      "version": "1.1",
      "status": "Approved",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-11",
      "annotations": [
        "Dispute button is disabled past 120 days",
        "the reason is shown beneath it",
        "never as a toast"
      ],
      "relatedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "WF-002",
      "title": "Reason code selection",
      "screenId": "SCR-DSP-01",
      "description": "A short list of reasons in the cardholder's words, not the scheme's.",
      "channel": "Mobile",
      "version": "1.0",
      "status": "In Review",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-13",
      "annotations": [
        "Each reason carries one line of plain explanation",
        "no scheme codes on screen"
      ],
      "relatedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "WF-003",
      "title": "Open dispute with evidence",
      "screenId": "SCR-DSP-02",
      "description": "Case status, the provisional credit, and the attach action.",
      "channel": "Mobile",
      "version": "0.3",
      "status": "Draft",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-18",
      "annotations": [
        "Attach is hidden once five files exist",
        "rather than shown failing"
      ],
      "relatedRequirements": [
        "BR-003",
        "BR-004"
      ]
    }
  ];

const apiServices: ApiService[] = [
    {
      "id": "SVC-1",
      "name": "Disputes API",
      "basePath": "/disputes/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Disputes API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-001",
          "method": "POST",
          "path": "/disputes",
          "summary": "Raise a dispute against a settled transaction",
          "description": "Checks eligibility, creates the case and returns its reference.",
          "tag": "Disputes",
          "operationId": "createDispute",
          "auth": "OAuth2, scope disputes.write",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-001"
          ]
        },
        {
          "id": "API-002",
          "method": "GET",
          "path": "/disputes/{disputeId}",
          "summary": "Read a dispute and its provisional credit",
          "description": "Returns the case, its status history and any posting made against it.",
          "tag": "Disputes",
          "operationId": "getDispute",
          "auth": "OAuth2, scope disputes.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-002"
          ]
        },
        {
          "id": "API-003",
          "method": "POST",
          "path": "/disputes/{disputeId}/evidence",
          "summary": "Attach an evidence file to an open dispute",
          "description": "Accepts up to five files of 10 MB while the case is Under Review.",
          "tag": "Evidence",
          "operationId": "addEvidence",
          "auth": "OAuth2, scope disputes.write",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-003"
          ]
        },
        {
          "id": "API-004",
          "method": "GET",
          "path": "/disputes",
          "summary": "List the disputes on a card",
          "description": "Paged, newest first, filtered by status.",
          "tag": "Disputes",
          "operationId": "listDisputes",
          "auth": "OAuth2, scope disputes.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-001"
          ]
        }
      ]
    }
  ];

const sqlValidations: SqlValidationQuery[] = [
    {
      "id": "SQL-001",
      "title": "Disputes raised outside the 120-day window",
      "purpose": "Proves RULE-002 holds in the data, not only in the code.",
      "database": "cards",
      "sql": "SELECT d.dispute_id,\n       t.settled_date,\n       d.raised_at::date - t.settled_date AS days_elapsed\nFROM   dispute d\nJOIN   card_transaction t ON t.transaction_id = d.transaction_id\nWHERE  d.raised_at::date - t.settled_date > 120\nORDER  BY days_elapsed DESC;",
      "columns": [
        "dispute_id",
        "settled_date",
        "days_elapsed"
      ],
      "rows": [],
      "notes": [
        "Returns no rows",
        "the window is enforced at creation"
      ],
      "status": "Validated",
      "lastRun": "2026-02-20",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-001"
      ],
      "relatedRules": [
        "RULE-002"
      ]
    },
    {
      "id": "SQL-002",
      "title": "Provisional credits that do not match the disputed amount",
      "purpose": "Proves RULE-003: the credit never exceeds what was disputed.",
      "database": "cards",
      "sql": "SELECT d.dispute_id,\n       d.amount        AS disputed,\n       p.amount        AS credited\nFROM   dispute d\nJOIN   posting p ON p.dispute_id = d.dispute_id\nWHERE  p.type = 'PROVISIONAL_CREDIT'\nAND    p.amount <> d.amount;",
      "columns": [
        "dispute_id",
        "disputed",
        "credited"
      ],
      "rows": [],
      "notes": [
        "Returns no rows"
      ],
      "status": "Validated",
      "lastRun": "2026-02-20",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-002"
      ],
      "relatedRules": [
        "RULE-003"
      ]
    },
    {
      "id": "SQL-003",
      "title": "Disputes with more than five evidence files",
      "purpose": "Checks the attachment limit in RULE-004.",
      "database": "cards",
      "sql": "SELECT dispute_id, COUNT(*) AS files\nFROM   dispute_evidence\nGROUP  BY dispute_id\nHAVING COUNT(*) > 5;",
      "columns": [
        "dispute_id",
        "files"
      ],
      "rows": [],
      "notes": [
        "Rule not yet live",
        "run again after the March release"
      ],
      "status": "Needs Review",
      "lastRun": "2026-02-20",
      "executedBy": "Saadaoui Abdessalem",
      "relatedRequirements": [
        "BR-003"
      ],
      "relatedRules": [
        "RULE-004"
      ]
    }
  ];

const documents: WorkspaceDocument[] = [
    {
      "id": "DOC-001",
      "name": "Card disputes — business requirements",
      "format": "Word",
      "description": "The signed requirements pack behind BR-001 and BR-002.",
      "category": "Requirements",
      "version": "1.2",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-10",
      "size": "412 KB",
      "status": "Approved",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-002"
      ]
    },
    {
      "id": "DOC-002",
      "name": "Disputes API contract",
      "format": "Swagger",
      "description": "OpenAPI 3.1 definition of the four dispute endpoints.",
      "category": "Interface",
      "version": "1.0.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-15",
      "size": "38 KB",
      "status": "In Review",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-003"
      ]
    },
    {
      "id": "DOC-003",
      "name": "Dispute process model",
      "format": "BPMN",
      "description": "The BPMN 2.0 file behind the process flow.",
      "category": "Process",
      "version": "1.0",
      "author": "Saadaoui Abdessalem",
      "lastUpdated": "2026-02-14",
      "size": "24 KB",
      "status": "Approved",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001"
      ]
    }
  ];

const processFlows: ProcessFlow[] = [
    {
      "id": "PF-001",
      "name": "Raise and settle a card dispute",
      "description": "From the cardholder tapping Dispute to the case being closed.",
      "lanes": [
        {
          "id": "PF-001-L1",
          "name": "Cardholder",
          "actorId": ""
        },
        {
          "id": "PF-001-L2",
          "name": "Disputes service",
          "actorId": ""
        },
        {
          "id": "PF-001-L3",
          "name": "Ledger",
          "actorId": ""
        },
        {
          "id": "PF-001-L4",
          "name": "Disputes agent",
          "actorId": ""
        },
        {
          "id": "PF-001-L5",
          "name": "Card scheme",
          "actorId": ""
        }
      ],
      "steps": [
        {
          "id": "S1",
          "name": "Select the transaction",
          "type": "start",
          "lane": "Cardholder",
          "description": "The cardholder opens a settled transaction in the app.",
          "rules": [],
          "next": [
            "S2"
          ]
        },
        {
          "id": "S2",
          "name": "Check the dispute is allowed",
          "type": "decision",
          "lane": "Disputes service",
          "description": "Status and the 120-day window are tested.",
          "rules": [
            "RULE-001",
            "RULE-002"
          ],
          "next": [
            "S3",
            "S9"
          ]
        },
        {
          "id": "S3",
          "name": "Capture the reason code",
          "type": "task",
          "lane": "Cardholder",
          "description": "The cardholder picks a reason and confirms the amount.",
          "rules": [],
          "next": [
            "S4"
          ]
        },
        {
          "id": "S4",
          "name": "Create the dispute",
          "type": "system",
          "lane": "Disputes service",
          "description": "The case is created with the status Submitted.",
          "rules": [],
          "next": [
            "S5"
          ]
        },
        {
          "id": "S5",
          "name": "Post the provisional credit",
          "type": "system",
          "lane": "Ledger",
          "description": "The disputed amount is credited while the case is investigated.",
          "rules": [
            "RULE-003"
          ],
          "next": [
            "S6"
          ]
        },
        {
          "id": "S6",
          "name": "Investigate the case",
          "type": "task",
          "lane": "Disputes agent",
          "description": "Evidence is read and the scheme rules applied.",
          "rules": [
            "RULE-004"
          ],
          "next": [
            "S7"
          ]
        },
        {
          "id": "S7",
          "name": "Raise the chargeback",
          "type": "task",
          "lane": "Card scheme",
          "description": "The chargeback is sent to the scheme for arbitration.",
          "rules": [],
          "next": [
            "S8"
          ]
        },
        {
          "id": "S8",
          "name": "Close the case",
          "type": "end",
          "lane": "Disputes service",
          "description": "The case is Resolved; the provisional credit stands or is reversed.",
          "rules": [],
          "next": []
        },
        {
          "id": "S9",
          "name": "Refuse the dispute",
          "type": "end",
          "lane": "Disputes service",
          "description": "The cardholder is told which condition failed.",
          "rules": [],
          "next": []
        }
      ],
      "trigger": "The cardholder disputes a settled transaction",
      "outcome": "The case is Resolved or Rejected and the ledger agrees",
      "slaTarget": "Provisional credit within 1 working day; outcome within 45 days"
    }
  ];

export const myProjectBundle: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: "PRJ-NEW-001",
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
  databaseObjectsByRequirement: {},
};
