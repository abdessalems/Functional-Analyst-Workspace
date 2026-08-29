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
      "title": "Calculate portfolio exposure",
      "businessNeed": "Risk analysts need a consistent view of exposure.",
      "description": "The system shall calculate current portfolio exposure from approved positions and market prices.",
      "priority": "High",
      "status": "Draft",
      "category": "Risk",
      "moscow": "Must",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-001",
          "given": "Approved position and market-price data exist.",
          "when": "A user requests exposure for a portfolio.",
          "then": "The system returns the calculated exposure with calculation timestamp and data version."
        },
        {
          "id": "AC-002",
          "given": "A portfolio contains three positions with known values.",
          "when": "The exposure calculation is executed.",
          "then": "The total equals the sum of position-level exposure according to the approved calculation rule."
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-001",
        "API-002"
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
      "title": "Display risk limit utilization",
      "businessNeed": "Risk users need to know how close each portfolio is to its approved limit.",
      "description": "The dashboard shall display exposure, configured limit and utilization percentage for each monitored portfolio.",
      "priority": "High",
      "status": "Draft",
      "category": "Risk",
      "moscow": "Must",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-003",
          "given": "Exposure is 8 million and limit is 10 million.",
          "when": "The dashboard loads.",
          "then": "Utilization is displayed as 80%."
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-003"
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
      "title": "Generate breach alert",
      "businessNeed": "Risk managers need immediate visibility when a limit is exceeded.",
      "description": "The system shall create a risk breach alert when utilization reaches or exceeds the configured threshold.",
      "priority": "High",
      "status": "Draft",
      "category": "Risk Alert",
      "moscow": "Must",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-004",
          "given": "Utilization threshold is 100%.",
          "when": "Exposure changes from 99% to 100%.",
          "then": "A breach alert is created with severity CRITICAL."
        },
        {
          "id": "AC-005",
          "given": "A breach already exists for the same portfolio and calculation version.",
          "when": "The same event is processed again.",
          "then": "No duplicate breach alert is created."
        }
      ],
      "relatedDocuments": [
        "DOC-002"
      ],
      "relatedApis": [
        "API-004"
      ],
      "relatedTestCases": [
        "TC-004",
        "TC-005"
      ],
      "relatedRules": [
        "RULE-004",
        "RULE-005"
      ]
    },
    {
      "id": "BR-004",
      "title": "Acknowledge and review breach",
      "businessNeed": "Risk managers need an auditable workflow for investigating breaches.",
      "description": "Authorized users shall acknowledge a breach, enter a comment and move it to REVIEWED or ESCALATED.",
      "priority": "High",
      "status": "Draft",
      "category": "Workflow",
      "moscow": "Must",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-006",
          "given": "A user has Risk Manager permission.",
          "when": "The user acknowledges an OPEN breach with a comment.",
          "then": "Status changes to ACKNOWLEDGED and the audit entry is created."
        },
        {
          "id": "AC-007",
          "given": "A user does not have Risk Manager permission.",
          "when": "The user attempts to acknowledge a breach.",
          "then": "The action is rejected with FORBIDDEN."
        }
      ],
      "relatedDocuments": [
        "DOC-002"
      ],
      "relatedApis": [
        "API-005"
      ],
      "relatedTestCases": [
        "TC-006"
      ],
      "relatedRules": [
        "RULE-006"
      ]
    },
    {
      "id": "BR-005",
      "title": "Search trades and positions",
      "businessNeed": "Analysts need traceability from an exposure to underlying positions.",
      "description": "Users shall search positions by portfolio, instrument, trade date and status.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Functional",
      "moscow": "Should",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-008",
          "given": "The search criteria include portfolio and trade date.",
          "when": "The user submits the search.",
          "then": "Only matching positions are returned."
        }
      ],
      "relatedDocuments": [
        "DOC-003"
      ],
      "relatedApis": [
        "API-002"
      ],
      "relatedTestCases": [
        "TC-007"
      ],
      "relatedRules": [
        "RULE-007"
      ]
    },
    {
      "id": "BR-006",
      "title": "Role-based permissions",
      "businessNeed": "Sensitive risk information must be accessible only to authorized roles.",
      "description": "The application shall enforce permissions for Risk Analyst, Risk Manager and Operations roles.",
      "priority": "High",
      "status": "Draft",
      "category": "Security",
      "moscow": "Must",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-009",
          "given": "A user has the Risk Analyst role.",
          "when": "The user opens the monitoring dashboard.",
          "then": "The user can view exposure but cannot change risk limits."
        }
      ],
      "relatedDocuments": [
        "DOC-004"
      ],
      "relatedApis": [
        "API-001"
      ],
      "relatedTestCases": [
        "TC-008"
      ],
      "relatedRules": [
        "RULE-008"
      ]
    },
    {
      "id": "BR-007",
      "title": "Market data freshness validation",
      "businessNeed": "Risk calculations must not use stale market data.",
      "description": "The calculation service shall reject or flag calculations when market data is older than the configured freshness window.",
      "priority": "High",
      "status": "Draft",
      "category": "Validation",
      "moscow": "Must",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-010",
          "given": "Market data timestamp is older than the configured freshness window.",
          "when": "A calculation is requested.",
          "then": "The calculation is rejected with MARKET_DATA_STALE."
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-001",
        "API-002"
      ],
      "relatedTestCases": [
        "TC-009"
      ],
      "relatedRules": [
        "RULE-009"
      ]
    },
    {
      "id": "BR-008",
      "title": "Audit trail",
      "businessNeed": "Risk decisions must be traceable for internal controls.",
      "description": "Every breach status change shall record actor, timestamp, previous status, new status and comment.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Audit",
      "moscow": "Should",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [],
      "relatedDocuments": [
        "DOC-002"
      ],
      "relatedApis": [
        "API-005"
      ],
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
      "description": "Only approved positions are included in exposure.",
      "logic": "IF position.status = APPROVED THEN include position ELSE exclude position",
      "priority": "High",
      "source": "Risk methodology v1",
      "status": "Draft",
      "category": "Calculation",
      "owner": "Risk Manager",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-002",
      "description": "Portfolio exposure is the sum of approved position exposure values.",
      "logic": "SUM(position.exposureValue) GROUP BY portfolioId",
      "priority": "High",
      "source": "Risk methodology v1",
      "status": "Draft",
      "category": "Calculation",
      "owner": "Risk Manager",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-001"
      ]
    },
    {
      "id": "RULE-003",
      "description": "Utilization is exposure divided by approved limit.",
      "logic": "utilization = exposure / riskLimit * 100",
      "priority": "High",
      "source": "Risk methodology v1",
      "status": "Draft",
      "category": "Threshold",
      "owner": "Risk Manager",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-002"
      ]
    },
    {
      "id": "RULE-004",
      "description": "A breach occurs when utilization is greater than or equal to the configured threshold.",
      "logic": "IF utilization >= threshold THEN create breach",
      "priority": "Critical",
      "source": "Risk policy",
      "status": "Draft",
      "category": "Alert",
      "owner": "Risk Manager",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-003"
      ]
    },
    {
      "id": "RULE-005",
      "description": "A breach event must be idempotent.",
      "logic": "IF breachEventId already processed THEN do not create another breach",
      "priority": "Critical",
      "source": "Integration design",
      "status": "Draft",
      "category": "Integration",
      "owner": "Functional Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-003"
      ]
    },
    {
      "id": "RULE-006",
      "description": "Only Risk Managers can change breach status.",
      "logic": "IF role != RISK_MANAGER THEN return FORBIDDEN",
      "priority": "High",
      "source": "Access policy",
      "status": "Draft",
      "category": "Authorization",
      "owner": "Security Team",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-004"
      ]
    },
    {
      "id": "RULE-007",
      "description": "Position search returns only records matching all supplied filters.",
      "logic": "Apply AND logic to all non-empty search parameters",
      "priority": "Medium",
      "source": "Functional requirement",
      "status": "Draft",
      "category": "Search",
      "owner": "Business Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-005"
      ]
    },
    {
      "id": "RULE-008",
      "description": "Roles define permitted operations.",
      "logic": "Risk Analyst=READ; Risk Manager=READ,ACKNOWLEDGE,ESCALATE; Operations=READ_SUPPORT",
      "priority": "High",
      "source": "Access matrix",
      "status": "Draft",
      "category": "Security",
      "owner": "Security Team",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-006"
      ]
    },
    {
      "id": "RULE-009",
      "description": "Market data must be fresh enough for calculation.",
      "logic": "IF now - marketDataTimestamp > freshnessWindow THEN reject",
      "priority": "Critical",
      "source": "Risk control",
      "status": "Draft",
      "category": "Validation",
      "owner": "Risk Manager",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-007"
      ]
    },
    {
      "id": "RULE-010",
      "description": "Every breach transition is audited.",
      "logic": "On status change persist actor, timestamp, oldStatus, newStatus, comment",
      "priority": "Medium",
      "source": "Audit policy",
      "status": "Draft",
      "category": "Audit",
      "owner": "Business Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-008"
      ]
    }
  ];

const testCases: TestCase[] = [
    {
      "id": "TC-001",
      "scenario": "Calculate exposure for approved positions",
      "suite": "Exposure",
      "preconditions": [
        "Approved positions and fresh market data exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call GET /v1/portfolios/PORT-1001/exposure",
          "expected": "expect 200."
        },
        {
          "step": 2,
          "action": "Verify exposure value",
          "expected": "expect sum of approved positions."
        },
        {
          "step": 3,
          "action": "Verify timestamp",
          "expected": "expect current calculation metadata."
        }
      ],
      "expectedResult": "Exposure equals approved position sum and response contains utilization and data timestamp.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-002",
      "scenario": "Exclude non-approved position",
      "suite": "Exposure",
      "preconditions": [
        "Portfolio contains one APPROVED and one PENDING position."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Execute exposure calculation.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Compare result with approved position only.",
          "expected": ""
        }
      ],
      "expectedResult": "PENDING position is excluded from calculation.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-003",
      "scenario": "Calculate utilization correctly",
      "suite": "Threshold",
      "preconditions": [
        "Exposure = 8",
        "000",
        "000",
        "limit = 10",
        "000",
        "000."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call exposure endpoint.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read utilization.",
          "expected": ""
        }
      ],
      "expectedResult": "Utilization is 80.00%.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-002",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-004",
      "scenario": "Create breach at threshold",
      "suite": "Breach",
      "preconditions": [
        "Threshold = 100%",
        "utilization reaches 100%."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit risk calculation.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Query breaches.",
          "expected": ""
        }
      ],
      "expectedResult": "Exactly one CRITICAL breach is created.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Integration",
      "linkedRequirement": "BR-003",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-005",
      "scenario": "Prevent duplicate breach",
      "suite": "Breach",
      "preconditions": [
        "Same breach event is processed twice."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Publish same event twice.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Query breaches by event ID.",
          "expected": ""
        }
      ],
      "expectedResult": "Only one breach record exists.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Integration",
      "linkedRequirement": "BR-003",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-006",
      "scenario": "Risk Manager acknowledges breach",
      "suite": "Breach Review",
      "preconditions": [
        "OPEN breach exists",
        "user has RISK_MANAGER role."
      ],
      "steps": [
        {
          "step": 1,
          "action": "PATCH breach with status ACKNOWLEDGED and comment.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Query breach.",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Query audit record.",
          "expected": ""
        }
      ],
      "expectedResult": "Status becomes ACKNOWLEDGED and audit entry contains actor, timestamp, old/new status and comment.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-004",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-007",
      "scenario": "Search positions with filters",
      "suite": "Position Search",
      "preconditions": [
        "Approved positions exist for multiple portfolios."
      ],
      "steps": [
        {
          "step": 1,
          "action": "GET /positions?portfolioId=PORT-1001&status=APPROVED.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect returned records.",
          "expected": ""
        }
      ],
      "expectedResult": "All returned records match both filters.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-005",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-008",
      "scenario": "Reject unauthorized breach update",
      "suite": "Authorization",
      "preconditions": [
        "User has RISK_ANALYST role",
        "OPEN breach exists."
      ],
      "steps": [
        {
          "step": 1,
          "action": "PATCH breach to ACKNOWLEDGED.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect response and breach.",
          "expected": ""
        }
      ],
      "expectedResult": "403 FORBIDDEN; breach remains OPEN.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-006",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-009",
      "scenario": "Reject stale market data",
      "suite": "Validation",
      "preconditions": [
        "Market data timestamp is older than freshness window."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call exposure calculation.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect response.",
          "expected": ""
        }
      ],
      "expectedResult": "Calculation is rejected with MARKET_DATA_STALE; no successful exposure result is published.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Negative",
      "linkedRequirement": "BR-007",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-010",
      "scenario": "Audit every status transition",
      "suite": "Audit",
      "preconditions": [
        "OPEN breach exists."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Acknowledge breach.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Query audit history.",
          "expected": ""
        }
      ],
      "expectedResult": "Audit record contains actor, timestamp, previous status, new status and comment.",
      "status": "Not Run",
      "priority": "High",
      "type": "Integration",
      "linkedRequirement": "BR-008",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    }
  ];

const actors: Actor[] = [
    {
      "id": "ACT-001",
      "name": "Risk Analyst",
      "type": "Human",
      "description": "Monitors portfolio exposure and investigates risk indicators.",
      "responsibilities": [
        "View dashboards",
        "search positions",
        "inspect breaches"
      ],
      "permissions": [
        "Read risk data",
        "search positions"
      ],
      "systemsUsed": [
        "Risk Platform"
      ],
      "channel": "Web"
    },
    {
      "id": "ACT-002",
      "name": "Risk Manager",
      "type": "Human",
      "description": "Owns risk limits and breach decisions.",
      "responsibilities": [
        "Configure limits",
        "acknowledge",
        "escalate breaches"
      ],
      "permissions": [
        "Read/write risk controls"
      ],
      "systemsUsed": [
        "Risk Platform"
      ],
      "channel": "Web"
    },
    {
      "id": "ACT-003",
      "name": "Trading Desk User",
      "type": "Human",
      "description": "Provides business context for positions and exposure.",
      "responsibilities": [
        "View own trading-related positions"
      ],
      "permissions": [
        "Read limited position data"
      ],
      "systemsUsed": [
        "Risk Platform"
      ],
      "channel": "Web"
    },
    {
      "id": "ACT-004",
      "name": "Operations Support",
      "type": "Human",
      "description": "Supports operational incidents and data investigations.",
      "responsibilities": [
        "Investigate failed jobs and integration errors"
      ],
      "permissions": [
        "Read operational data"
      ],
      "systemsUsed": [
        "Operations Console"
      ],
      "channel": "Web"
    },
    {
      "id": "ACT-005",
      "name": "Market Data Service",
      "type": "System",
      "description": "Provides approved market prices.",
      "responsibilities": [
        "Publish market data"
      ],
      "permissions": [
        "Write market-price feed"
      ],
      "systemsUsed": [
        "Market Data API"
      ],
      "channel": "API"
    },
    {
      "id": "ACT-006",
      "name": "Trade Position Service",
      "type": "System",
      "description": "Provides approved positions.",
      "responsibilities": [
        "Publish/query positions"
      ],
      "permissions": [
        "Read position data"
      ],
      "systemsUsed": [
        "Position API"
      ],
      "channel": "API"
    }
  ];

const diagrams: Diagram[] = [
    {
      "id": "DGM-001",
      "title": "Risk monitoring use cases",
      "type": "Use Case",
      "description": "Actors and core capabilities of the risk platform.",
      "source": "@startuml\nleft to right direction\nactor \"Risk Analyst\" as RA\nactor \"Risk Manager\" as RM\nactor \"Trading Desk\" as TD\nrectangle \"Risk Platform\" {\n usecase \"View Exposure\" as U1\n usecase \"Search Positions\" as U2\n usecase \"Review Breach\" as U3\n usecase \"Configure Risk Limit\" as U4\n}\nRA --> U1\nRA --> U2\nRM --> U1\nRM --> U3\nRM --> U4\nTD --> U2\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-004",
        "BR-006"
      ]
    },
    {
      "id": "DGM-002",
      "title": "Exposure calculation sequence",
      "type": "Sequence",
      "description": "Shows the functional interaction between data services and risk engine.",
      "source": "@startuml\nactor Scheduler\nparticipant \"Risk API\" as API\nparticipant \"Position Service\" as POS\nparticipant \"Market Data API\" as MKT\nparticipant \"Risk Engine\" as ENG\nScheduler -> API : calculate exposure\nAPI -> MKT : get latest price\nMKT --> API : price + timestamp\nAPI -> POS : get approved positions\nPOS --> API : positions\nAPI -> ENG : calculate(position, price)\nENG --> API : exposure + utilization\nAPI --> Scheduler : result\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-007"
      ]
    },
    {
      "id": "DGM-003",
      "title": "Breach review workflow",
      "type": "Activity",
      "description": "Functional workflow from threshold evaluation to business review.",
      "source": "@startuml\nstart\n:Calculate utilization;\nif (Utilization >= threshold?) then (Yes)\n  :Create idempotent breach;\n  :Notify Risk Manager;\n  :Review breach;\n  if (Business response?) then (Acknowledge)\n    :Save comment;\n  else (Escalate)\n    :Save escalation comment;\n  endif\n  :Write audit record;\nelse (No)\n  :Update dashboard;\nendif\nstop\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-003",
        "BR-004",
        "BR-008"
      ]
    }
  ];

const wireframes: Wireframe[] = [
    {
      "id": "WF-001",
      "title": "Risk Monitoring Dashboard",
      "screenId": "SCR-RISK-01",
      "description": "Dashboard showing portfolio exposure, risk limit, utilization, breach severity and last market-data timestamp.",
      "channel": "Web",
      "version": "1.0",
      "status": "Draft",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "annotations": [
        "Filters: portfolio",
        "desk",
        "date. Red/amber/green status is illustrative",
        "exact UI colors to be agreed with UX."
      ],
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003"
      ]
    },
    {
      "id": "WF-002",
      "title": "Breach Review Panel",
      "screenId": "SCR-BREACH-01",
      "description": "Panel displaying breach details, underlying exposure, threshold, status history and review comment field.",
      "channel": "Web",
      "version": "1.0",
      "status": "Draft",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "annotations": [
        "Acknowledge and Escalate actions visible only to Risk Manager."
      ],
      "relatedRequirements": [
        "BR-004",
        "BR-006",
        "BR-008"
      ]
    }
  ];

const apiServices: ApiService[] = [
    {
      "id": "SVC-1",
      "name": "Risk API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Risk API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-001",
          "method": "GET",
          "path": "/portfolios/{portfolioId}/exposure",
          "summary": "Get portfolio exposure",
          "description": "Returns current exposure, risk limit, utilization and market data timestamp.",
          "tag": "Exposure",
          "operationId": "getPortfolioExposure",
          "auth": "OAuth2 scope risk.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-001",
            "BR-002",
            "BR-007"
          ]
        },
        {
          "id": "API-003",
          "method": "GET",
          "path": "/portfolios/{portfolioId}/risk-limit",
          "summary": "Get risk limit",
          "description": "Returns the currently approved risk limit for a portfolio.",
          "tag": "Risk Limit",
          "operationId": "getRiskLimit",
          "auth": "OAuth2 scope risk.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-002"
          ]
        },
        {
          "id": "API-006",
          "method": "GET",
          "path": "/portfolios/{portfolioId}/exposure/history",
          "summary": "Exposure history",
          "description": "Returns historical exposure and utilization points.",
          "tag": "Exposure",
          "operationId": "getExposureHistory",
          "auth": "OAuth2 scope risk.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-001",
            "BR-002"
          ]
        }
      ]
    },
    {
      "id": "SVC-2",
      "name": "Position API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Position API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-002",
          "method": "GET",
          "path": "/positions",
          "summary": "Search positions",
          "description": "Returns paginated approved positions using portfolio, instrument, date and status filters.",
          "tag": "Position",
          "operationId": "searchPositions",
          "auth": "OAuth2 scope positions.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-001",
            "BR-005"
          ]
        }
      ]
    },
    {
      "id": "SVC-3",
      "name": "Breach API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Breach API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-004",
          "method": "GET",
          "path": "/breaches",
          "summary": "List breaches",
          "description": "Returns breaches filtered by portfolio, status, severity and date.",
          "tag": "Breach",
          "operationId": "listBreaches",
          "auth": "OAuth2 scope risk.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-003",
            "BR-004"
          ]
        },
        {
          "id": "API-005",
          "method": "PATCH",
          "path": "/breaches/{breachId}",
          "summary": "Review breach",
          "description": "Updates breach status and records business comment.",
          "tag": "Breach",
          "operationId": "reviewBreach",
          "auth": "OAuth2 scope risk.manage",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-004",
            "BR-008"
          ]
        }
      ]
    }
  ];

const sqlValidations: SqlValidationQuery[] = [
    {
      "id": "SQL-001",
      "title": "No duplicate breach events",
      "purpose": "Verify idempotency rule does not create duplicate breach records.",
      "database": "RISKDB",
      "sql": "SELECT breach_event_id, COUNT(*) AS cnt FROM risk_breach GROUP BY breach_event_id HAVING COUNT(*) > 1;",
      "columns": [
        "breach_event_id",
        "cnt"
      ],
      "rows": [],
      "notes": [
        "Expected result: no rows."
      ],
      "status": "Validated",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate",
      "relatedRequirements": [
        "BR-003"
      ],
      "relatedRules": [
        "RULE-005"
      ]
    },
    {
      "id": "SQL-002",
      "title": "Audit trail completeness",
      "purpose": "Verify every breach status change has an audit record.",
      "database": "RISKDB",
      "sql": "SELECT b.breach_id, b.status FROM risk_breach b LEFT JOIN risk_breach_audit a ON a.breach_id=b.breach_id WHERE a.breach_id IS NULL AND b.status <> 'OPEN';",
      "columns": [
        "breach_id",
        "status"
      ],
      "rows": [],
      "notes": [
        "Expected result: no rows."
      ],
      "status": "Validated",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate",
      "relatedRequirements": [
        "BR-008"
      ],
      "relatedRules": [
        "RULE-010"
      ]
    },
    {
      "id": "SQL-003",
      "title": "Stale market data not used",
      "purpose": "Find calculations created with stale source data.",
      "database": "RISKDB",
      "sql": "SELECT calculation_id, portfolio_id FROM exposure_calculation WHERE market_data_fresh = FALSE AND status='SUCCESS';",
      "columns": [
        "calculation_id",
        "portfolio_id"
      ],
      "rows": [],
      "notes": [
        "Expected result: no rows."
      ],
      "status": "Validated",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate",
      "relatedRequirements": [
        "BR-007"
      ],
      "relatedRules": [
        "RULE-009"
      ]
    }
  ];

const documents: WorkspaceDocument[] = [
    {
      "id": "DOC-001",
      "name": "Risk Exposure Functional Specification",
      "format": "Word",
      "description": "Functional specification for exposure calculation, thresholds, validation and API behaviour.",
      "category": "Functional Specification",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "250 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-007"
      ]
    },
    {
      "id": "DOC-002",
      "name": "Breach Management Specification",
      "format": "Word",
      "description": "Workflow, status transitions, authorization and audit requirements for risk breaches.",
      "category": "Functional Specification",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "180 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-003",
        "BR-004",
        "BR-008"
      ]
    },
    {
      "id": "DOC-003",
      "name": "Position Search API Contract",
      "format": "Swagger",
      "description": "OpenAPI-style contract for position search and filtering.",
      "category": "Interface",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "90 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-005"
      ]
    },
    {
      "id": "DOC-004",
      "name": "Role & Permission Matrix",
      "format": "Excel",
      "description": "Matrix mapping Risk Analyst, Risk Manager and Operations permissions.",
      "category": "Security",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "70 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-006"
      ]
    },
    {
      "id": "DOC-005",
      "name": "Risk Test Strategy",
      "format": "Word",
      "description": "Functional, integration, regression, negative and API testing approach.",
      "category": "Testing",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "120 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-006",
        "BR-007"
      ]
    }
  ];

const processFlows: ProcessFlow[] = [
    {
      "id": "PF-001",
      "name": "Monitor and review portfolio risk",
      "description": "End-to-end flow from position/market data to risk breach review.",
      "lanes": [
        {
          "id": "PF-001-L1",
          "name": "Market Data Service",
          "actorId": ""
        },
        {
          "id": "PF-001-L2",
          "name": "Risk Platform",
          "actorId": ""
        },
        {
          "id": "PF-001-L3",
          "name": "Risk Engine",
          "actorId": ""
        },
        {
          "id": "PF-001-L4",
          "name": "Risk Manager",
          "actorId": ""
        },
        {
          "id": "PF-001-L5",
          "name": "Audit Service",
          "actorId": ""
        }
      ],
      "steps": [
        {
          "id": "S1",
          "name": "Receive market data",
          "type": "start",
          "lane": "Market Data Service",
          "description": "Publish approved market data for the calculation window.",
          "rules": [
            "RULE-009"
          ],
          "next": [
            "S2"
          ]
        },
        {
          "id": "S2",
          "name": "Load approved positions",
          "type": "task",
          "lane": "Risk Platform",
          "description": "Retrieve approved positions for monitored portfolios.",
          "rules": [
            "RULE-001"
          ],
          "next": [
            "S3"
          ]
        },
        {
          "id": "S3",
          "name": "Validate market data",
          "type": "decision",
          "lane": "Risk Platform",
          "description": "Check market data freshness before calculation.",
          "rules": [
            "RULE-009"
          ],
          "next": [
            "S4"
          ]
        },
        {
          "id": "S4",
          "name": "Calculate exposure",
          "type": "task",
          "lane": "Risk Engine",
          "description": "Calculate approved portfolio exposure.",
          "rules": [
            "RULE-002"
          ],
          "next": [
            "S5"
          ]
        },
        {
          "id": "S5",
          "name": "Calculate utilization",
          "type": "task",
          "lane": "Risk Engine",
          "description": "Compare exposure against configured limit.",
          "rules": [
            "RULE-003"
          ],
          "next": [
            "S6"
          ]
        },
        {
          "id": "S6",
          "name": "Check threshold",
          "type": "decision",
          "lane": "Risk Engine",
          "description": "Determine whether utilization has reached the threshold.",
          "rules": [
            "RULE-004"
          ],
          "next": [
            "S7"
          ]
        },
        {
          "id": "S7",
          "name": "Create or update breach",
          "type": "task",
          "lane": "Risk Platform",
          "description": "Create a breach only when the event has not already been processed.",
          "rules": [
            "RULE-005"
          ],
          "next": [
            "S8"
          ]
        },
        {
          "id": "S8",
          "name": "Review breach",
          "type": "task",
          "lane": "Risk Manager",
          "description": "Acknowledge or escalate breach and provide a comment.",
          "rules": [
            "RULE-006",
            "RULE-010"
          ],
          "next": [
            "S9"
          ]
        },
        {
          "id": "S9",
          "name": "Record audit trail",
          "type": "end",
          "lane": "Audit Service",
          "description": "Persist the status transition and business comment.",
          "rules": [
            "RULE-010"
          ],
          "next": []
        }
      ],
      "trigger": "New market data or position update.",
      "outcome": "Exposure calculated; dashboard updated; breach reviewed if threshold exceeded.",
      "slaTarget": "15 minutes"
    }
  ];

const functionalSpecSections: FunctionalSpecSection[] = [
    {
      "id": "FS-001",
      "title": "Portfolio Exposure API",
      "summary": "Returns calculated exposure for a portfolio.",
      "requirementRefs": [
        "BR-001",
        "BR-002",
        "BR-007"
      ],
      "businessLogic": [
        "Validate portfolioId and calculation date.",
        "Validate market data freshness.",
        "Retrieve approved positions.",
        "Calculate exposure and utilization.",
        "Return calculation metadata."
      ],
      "fields": [
        {
          "name": "portfolioId",
          "type": "string",
          "length": "36",
          "mandatory": true,
          "description": "Unique portfolio identifier.",
          "example": "PORT-1001"
        },
        {
          "name": "asOfDate",
          "type": "date",
          "length": "10",
          "mandatory": true,
          "description": "Business date for the exposure calculation.",
          "example": "2026-09-15"
        },
        {
          "name": "exposure",
          "type": "decimal",
          "length": "18,2",
          "mandatory": true,
          "description": "Calculated portfolio exposure.",
          "example": "8250000.00"
        },
        {
          "name": "riskLimit",
          "type": "decimal",
          "length": "18,2",
          "mandatory": true,
          "description": "Approved risk limit.",
          "example": "10000000.00"
        },
        {
          "name": "utilization",
          "type": "decimal",
          "length": "5,2",
          "mandatory": true,
          "description": "Exposure divided by risk limit.",
          "example": "82.50"
        },
        {
          "name": "marketDataTimestamp",
          "type": "datetime",
          "length": "ISO-8601",
          "mandatory": true,
          "description": "Timestamp of market data used.",
          "example": "2026-09-15T10:05:00Z"
        }
      ],
      "validations": [
        {
          "field": "portfolioId",
          "rule": "Must be a valid known portfolio identifier.",
          "errorCode": "PORTFOLIO_NOT_FOUND",
          "severity": "Blocking"
        },
        {
          "field": "asOfDate",
          "rule": "Must not be more than 1 business day in the future.",
          "errorCode": "INVALID_AS_OF_DATE",
          "severity": "Blocking"
        },
        {
          "field": "marketDataTimestamp",
          "rule": "Must be within configured freshness window.",
          "errorCode": "MARKET_DATA_STALE",
          "severity": "Blocking"
        },
        {
          "field": "riskLimit",
          "rule": "Must be greater than zero.",
          "errorCode": "INVALID_RISK_LIMIT",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "PORTFOLIO_NOT_FOUND",
          "httpStatus": 404,
          "message": "Portfolio was not found.",
          "handling": "Return Belgif-style error; no calculation is performed."
        },
        {
          "code": "MARKET_DATA_STALE",
          "httpStatus": 422,
          "message": "Market data is too old for this calculation.",
          "handling": "Ask caller to retry after fresh market data is available."
        },
        {
          "code": "INVALID_RISK_LIMIT",
          "httpStatus": 422,
          "message": "Risk limit must be greater than zero.",
          "handling": "Reject calculation and log validation failure."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-001",
          "scenario": "Two calculation requests for the same portfolio and as-of date arrive concurrently.",
          "expectedBehaviour": "Return one authoritative calculation result and avoid duplicate calculation records."
        },
        {
          "id": "EC-002",
          "scenario": "Market data timestamp becomes stale while calculation is running.",
          "expectedBehaviour": "Calculation must fail safely and expose MARKET_DATA_STALE; no result is published as valid."
        }
      ]
    },
    {
      "id": "FS-002",
      "title": "Risk Breach API",
      "summary": "Creates and retrieves risk breach records.",
      "requirementRefs": [
        "BR-003",
        "BR-004",
        "BR-008"
      ],
      "businessLogic": [
        "Evaluate threshold.",
        "Create idempotent breach.",
        "Allow authorized status transition.",
        "Persist audit entry."
      ],
      "fields": [
        {
          "name": "breachId",
          "type": "string",
          "length": "36",
          "mandatory": true,
          "description": "Unique breach identifier.",
          "example": "BRH-20260915-001"
        },
        {
          "name": "status",
          "type": "string",
          "length": "20",
          "mandatory": true,
          "description": "Current breach workflow status.",
          "example": "OPEN"
        },
        {
          "name": "severity",
          "type": "string",
          "length": "20",
          "mandatory": true,
          "description": "Severity derived from threshold.",
          "example": "CRITICAL"
        },
        {
          "name": "comment",
          "type": "string",
          "length": "500",
          "mandatory": false,
          "description": "Business comment added during review.",
          "example": "Investigate Nordic power position."
        }
      ],
      "validations": [
        {
          "field": "status",
          "rule": "Only OPEN -> ACKNOWLEDGED or OPEN -> ESCALATED is allowed.",
          "errorCode": "INVALID_STATUS_TRANSITION",
          "severity": "Blocking"
        },
        {
          "field": "comment",
          "rule": "Required when status changes to ACKNOWLEDGED or ESCALATED.",
          "errorCode": "COMMENT_REQUIRED",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "FORBIDDEN",
          "httpStatus": 403,
          "message": "User is not authorized for this operation.",
          "handling": "Do not mutate breach state; record security event."
        },
        {
          "code": "INVALID_STATUS_TRANSITION",
          "httpStatus": 409,
          "message": "The requested breach status transition is not allowed.",
          "handling": "Return current status and allowed transitions."
        },
        {
          "code": "COMMENT_REQUIRED",
          "httpStatus": 400,
          "message": "A review comment is required.",
          "handling": "Return field-level validation error."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-003",
          "scenario": "The same breach event is delivered twice.",
          "expectedBehaviour": "Only one breach record exists because the event is idempotent."
        },
        {
          "id": "EC-004",
          "scenario": "Risk Manager submits ACKNOWLEDGED without a comment.",
          "expectedBehaviour": "Request is rejected with COMMENT_REQUIRED and breach remains OPEN."
        },
        {
          "id": "EC-005",
          "scenario": "Risk Analyst attempts to escalate a breach.",
          "expectedBehaviour": "API returns FORBIDDEN and state remains unchanged."
        }
      ]
    },
    {
      "id": "FS-003",
      "title": "Position Search API",
      "summary": "Searches positions using optional filters.",
      "requirementRefs": [
        "BR-005"
      ],
      "businessLogic": [
        "Apply supplied filters using AND logic",
        "return paginated results."
      ],
      "fields": [],
      "validations": [
        {
          "field": "pageSize",
          "rule": "Must be between 1 and 100.",
          "errorCode": "INVALID_PAGE_SIZE",
          "severity": "Blocking"
        }
      ],
      "errors": [],
      "edgeCases": [
        {
          "id": "EC-006",
          "scenario": "User searches with no filters.",
          "expectedBehaviour": "API returns first page according to default sorting and pagination rules."
        }
      ]
    },
    {
      "id": "FS-004",
      "title": "Authorization",
      "summary": "Defines role-based access for risk functions.",
      "requirementRefs": [
        "BR-006"
      ],
      "businessLogic": [
        "Authenticate user",
        "read role claims",
        "authorize endpoint/action before processing."
      ],
      "fields": [],
      "validations": [],
      "errors": [],
      "edgeCases": []
    }
  ];

export const prjExa003Bundle: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: "PRJ-EXA-003",
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
