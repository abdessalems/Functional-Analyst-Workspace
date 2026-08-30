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
    },
    {
      "id": "BR-009",
      "title": "Filter breaches by severity and status",
      "businessNeed": "Risk managers need to focus on critical and unresolved exceptions.",
      "description": "The system shall allow breach filtering by portfolio, severity, status and date range.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Search",
      "moscow": "Should",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-011",
          "given": "Breaches exist with different severities and statuses.",
          "when": "The user filters by severity CRITICAL and status OPEN.",
          "then": "Only OPEN CRITICAL breaches are returned."
        },
        {
          "id": "AC-012",
          "given": "A date range is selected.",
          "when": "The user submits a breach search.",
          "then": "Every returned breach has a timestamp inside the requested range."
        }
      ],
      "relatedDocuments": [
        "DOC-002"
      ],
      "relatedApis": [
        "API-004"
      ],
      "relatedTestCases": [
        "TC-011",
        "TC-012"
      ],
      "relatedRules": [
        "RULE-011"
      ]
    },
    {
      "id": "BR-010",
      "title": "Export risk results",
      "businessNeed": "Risk management needs evidence for daily controls and management reporting.",
      "description": "Authorized users shall export filtered exposure and breach results in CSV format.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Reporting",
      "moscow": "Could",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-013",
          "given": "A Risk Manager has a filtered result set.",
          "when": "The user selects Export CSV.",
          "then": "The downloaded file contains only the filtered records and a generated timestamp."
        }
      ],
      "relatedDocuments": [
        "DOC-005"
      ],
      "relatedApis": [
        "API-007"
      ],
      "relatedTestCases": [
        "TC-013"
      ],
      "relatedRules": [
        "RULE-012"
      ]
    },
    {
      "id": "BR-011",
      "title": "Handle calculation failure",
      "businessNeed": "Users need a clear operational status when exposure cannot be calculated.",
      "description": "The system shall mark the calculation as FAILED and expose a technical reference when a dependent service is unavailable.",
      "priority": "High",
      "status": "Draft",
      "category": "Exception Handling",
      "moscow": "Must",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-014",
          "given": "The Market Data API is unavailable.",
          "when": "The user requests exposure.",
          "then": "The calculation is marked FAILED and a technical reference is returned."
        },
        {
          "id": "AC-015",
          "given": "The Position API times out.",
          "when": "The calculation is attempted.",
          "then": "No partial exposure is presented as successful."
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-001"
      ],
      "relatedTestCases": [
        "TC-014",
        "TC-015"
      ],
      "relatedRules": [
        "RULE-013"
      ]
    },
    {
      "id": "BR-012",
      "title": "Maintain calculation history",
      "businessNeed": "Risk users need to compare exposure across time.",
      "description": "The system shall retain successful exposure calculations and make historical values queryable.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Reporting",
      "moscow": "Should",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-016",
          "given": "Two successful calculations exist for the same portfolio on different timestamps.",
          "when": "The user opens exposure history.",
          "then": "Both immutable calculation results are displayed in chronological order."
        }
      ],
      "relatedDocuments": [
        "DOC-001"
      ],
      "relatedApis": [
        "API-006"
      ],
      "relatedTestCases": [
        "TC-016"
      ],
      "relatedRules": [
        "RULE-014"
      ]
    },
    {
      "id": "BR-013",
      "title": "Notify critical breaches",
      "businessNeed": "Risk managers need timely notification for critical exceptions.",
      "description": "A CRITICAL breach shall trigger an in-app notification and an email notification.",
      "priority": "High",
      "status": "Draft",
      "category": "Notification",
      "moscow": "Must",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-017",
          "given": "A newly created breach has severity CRITICAL.",
          "when": "The breach is committed.",
          "then": "An in-app notification and email notification are created."
        },
        {
          "id": "AC-018",
          "given": "An existing breach is updated without changing severity.",
          "when": "The update is processed.",
          "then": "No duplicate new-breach notification is sent."
        }
      ],
      "relatedDocuments": [
        "DOC-002"
      ],
      "relatedApis": [
        "API-008"
      ],
      "relatedTestCases": [
        "TC-017",
        "TC-018"
      ],
      "relatedRules": [
        "RULE-015"
      ]
    },
    {
      "id": "BR-014",
      "title": "Support pagination",
      "businessNeed": "Large portfolios must not overload the application or API response.",
      "description": "Search and history endpoints shall support page number, page size and total count.",
      "priority": "Medium",
      "status": "Draft",
      "category": "API",
      "moscow": "Should",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-019",
          "given": "A user requests pageSize=50.",
          "when": "The API processes the request.",
          "then": "At most 50 records are returned and totalCount is provided."
        }
      ],
      "relatedDocuments": [
        "DOC-003"
      ],
      "relatedApis": [
        "API-002",
        "API-006"
      ],
      "relatedTestCases": [
        "TC-019"
      ],
      "relatedRules": [
        "RULE-016"
      ]
    },
    {
      "id": "BR-015",
      "title": "Correlation and traceability",
      "businessNeed": "Support teams need to trace a business request across services.",
      "description": "Every API response and asynchronous event shall carry a correlation identifier.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Integration",
      "moscow": "Should",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-020",
          "given": "A request has correlationId CORR-123.",
          "when": "The request is processed across dependent services.",
          "then": "The same correlation ID is present in logs/events for traceability."
        }
      ],
      "relatedDocuments": [
        "DOC-005"
      ],
      "relatedApis": [
        "API-001",
        "API-005"
      ],
      "relatedTestCases": [
        "TC-020"
      ],
      "relatedRules": [
        "RULE-017"
      ]
    },
    {
      "id": "BR-016",
      "title": "Provide UAT-ready breach scenarios",
      "businessNeed": "Business users need representative scenarios.",
      "description": "Provide controlled UAT scenarios covering normal, threshold, breach, recovery and authorization cases.",
      "priority": "Medium",
      "status": "Draft",
      "category": "UAT",
      "moscow": "Should",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-021",
          "given": "UAT data is prepared.",
          "when": "Business users execute critical scenarios.",
          "then": "All critical UAT paths have documented outcomes and evidence."
        }
      ],
      "relatedDocuments": [
        "DOC-008"
      ],
      "relatedApis": [
        "API-004",
        "API-005"
      ],
      "relatedTestCases": [
        "TC-031",
        "TC-032"
      ],
      "relatedRules": [
        "RULE-018"
      ]
    },
    {
      "id": "BR-017",
      "title": "Record defect severity and business impact",
      "businessNeed": "The team needs consistent defect triage.",
      "description": "Every defect shall have severity, priority, environment, reproduction steps and business impact.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Quality",
      "moscow": "Should",
      "owner": "QA/Test Lead",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-022",
          "given": "A defect is discovered.",
          "when": "Tester submits the defect.",
          "then": "Severity, priority, environment, steps, expected/actual result and business impact are recorded."
        }
      ],
      "relatedDocuments": [
        "DOC-009"
      ],
      "relatedApis": [
        "API-001"
      ],
      "relatedTestCases": [
        "TC-033"
      ],
      "relatedRules": [
        "RULE-019"
      ]
    },
    {
      "id": "BR-018",
      "title": "Support regression baseline",
      "businessNeed": "Existing functionality must remain stable.",
      "description": "A regression suite shall cover critical exposure, breach, authorization and API paths after each release candidate.",
      "priority": "High",
      "status": "Draft",
      "category": "Testing",
      "moscow": "Must",
      "owner": "QA/Test Lead",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-023",
          "given": "Release candidate exists.",
          "when": "Critical regression suite is executed.",
          "then": "All Critical regression tests pass before release recommendation."
        }
      ],
      "relatedDocuments": [
        "DOC-010"
      ],
      "relatedApis": [
        "API-001",
        "API-005"
      ],
      "relatedTestCases": [
        "TC-034",
        "TC-035"
      ],
      "relatedRules": [
        "RULE-020"
      ]
    },
    {
      "id": "BR-019",
      "title": "Define non-functional acceptance checks",
      "businessNeed": "Users need predictable API response time.",
      "description": "Critical read APIs shall meet agreed response-time targets under defined test load.",
      "priority": "Medium",
      "status": "Draft",
      "category": "Non-Functional",
      "moscow": "Should",
      "owner": "Functional Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-024",
          "given": "Environment is under agreed load.",
          "when": "Exposure API is exercised.",
          "then": "p95 response time is below 2 seconds or approved exception is recorded."
        }
      ],
      "relatedDocuments": [
        "DOC-010"
      ],
      "relatedApis": [
        "API-001",
        "API-004"
      ],
      "relatedTestCases": [
        "TC-036"
      ],
      "relatedRules": [
        "RULE-021"
      ]
    },
    {
      "id": "BR-020",
      "title": "Support UAT sign-off",
      "businessNeed": "Business ownership must be explicit before release.",
      "description": "UAT results shall record scenario, evidence, business decision and sign-off status.",
      "priority": "High",
      "status": "Draft",
      "category": "UAT",
      "moscow": "Must",
      "owner": "Business Analyst",
      "lastUpdated": "2026-08-29",
      "version": "1.0",
      "acceptanceCriteria": [
        {
          "id": "AC-025",
          "given": "UAT is complete.",
          "when": "Business Owner reviews results.",
          "then": "UAT is Passed only when critical scenarios are accepted or formally waived."
        }
      ],
      "relatedDocuments": [
        "DOC-008"
      ],
      "relatedApis": [
        "API-001",
        "API-005"
      ],
      "relatedTestCases": [
        "TC-037"
      ],
      "relatedRules": [
        "RULE-022"
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
    },
    {
      "id": "RULE-011",
      "description": "Breach search filters are combined using AND logic.",
      "logic": "Apply all supplied filters; omit filters that are not supplied.",
      "priority": "Medium",
      "source": "Functional requirement",
      "status": "Draft",
      "category": "Search",
      "owner": "Business Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-009"
      ]
    },
    {
      "id": "RULE-012",
      "description": "Export respects the filters used in the current search.",
      "logic": "Export exactly the filtered dataset displayed/requested by the user.",
      "priority": "Medium",
      "source": "Reporting requirement",
      "status": "Draft",
      "category": "Reporting",
      "owner": "Functional Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-010"
      ]
    },
    {
      "id": "RULE-013",
      "description": "A calculation failure must not be presented as a valid exposure.",
      "logic": "IF dependency failure THEN status=FAILED and expose referenceId",
      "priority": "Critical",
      "source": "Operational control",
      "status": "Draft",
      "category": "Exception",
      "owner": "Functional Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-011"
      ]
    },
    {
      "id": "RULE-014",
      "description": "Historical exposure is immutable after successful calculation.",
      "logic": "A successful calculation record cannot be modified; corrections create a new calculation version.",
      "priority": "High",
      "source": "Audit policy",
      "status": "Draft",
      "category": "History",
      "owner": "Risk Manager",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-012"
      ]
    },
    {
      "id": "RULE-015",
      "description": "Only CRITICAL breaches trigger external notification.",
      "logic": "IF severity=CRITICAL AND breach is newly created THEN send notification",
      "priority": "High",
      "source": "Notification policy",
      "status": "Draft",
      "category": "Notification",
      "owner": "Risk Manager",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-013"
      ]
    },
    {
      "id": "RULE-016",
      "description": "Maximum page size is 100.",
      "logic": "IF requested pageSize > 100 THEN reject with INVALID_PAGE_SIZE",
      "priority": "Medium",
      "source": "API standard",
      "status": "Draft",
      "category": "API",
      "owner": "Functional Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-014"
      ]
    },
    {
      "id": "RULE-017",
      "description": "Correlation ID is mandatory for traceable operations.",
      "logic": "IF correlationId missing THEN reject request or generate one at the gateway, according to API contract",
      "priority": "Medium",
      "source": "Integration standard",
      "status": "Draft",
      "category": "Integration",
      "owner": "Functional Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-015"
      ]
    },
    {
      "id": "RULE-018",
      "description": "UAT scenarios cover critical business paths.",
      "logic": "Minimum UAT = normal + threshold + breach + authorization + dependency failure + audit.",
      "priority": "High",
      "source": "UAT strategy",
      "status": "Draft",
      "category": "UAT",
      "owner": "Business Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-016"
      ]
    },
    {
      "id": "RULE-019",
      "description": "Defect triage requires minimum classification data.",
      "logic": "Severity, priority, environment, reproduction steps and business impact are mandatory.",
      "priority": "Medium",
      "source": "QA process",
      "status": "Draft",
      "category": "Quality",
      "owner": "QA/Test Lead",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-017"
      ]
    },
    {
      "id": "RULE-020",
      "description": "Critical regression tests must pass before release recommendation.",
      "logic": "IF any Critical regression test fails THEN release recommendation = NOT READY",
      "priority": "Critical",
      "source": "Release policy",
      "status": "Draft",
      "category": "Testing",
      "owner": "QA/Test Lead",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-018"
      ]
    },
    {
      "id": "RULE-021",
      "description": "Critical read APIs target p95 response time below 2 seconds under agreed load.",
      "logic": "Measure p95 latency during performance test; breach creates release risk.",
      "priority": "Medium",
      "source": "NFR proposal",
      "status": "Draft",
      "category": "Performance",
      "owner": "Functional Analyst",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-019"
      ]
    },
    {
      "id": "RULE-022",
      "description": "UAT sign-off requires critical scenarios accepted or formally waived.",
      "logic": "IF critical scenario != Accepted AND no waiver THEN UAT = NOT PASSED",
      "priority": "Critical",
      "source": "UAT governance",
      "status": "Draft",
      "category": "UAT",
      "owner": "Business Owner",
      "effectiveFrom": "2026-09-01",
      "impactedRequirements": [
        "BR-020"
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
    },
    {
      "id": "TC-011",
      "scenario": "Filter breaches by severity and status",
      "suite": "Breach Search",
      "preconditions": [
        "OPEN and CLOSED breaches exist with multiple severities."
      ],
      "steps": [
        {
          "step": 1,
          "action": "GET /breaches?severity=CRITICAL&status=OPEN.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect all records.",
          "expected": ""
        }
      ],
      "expectedResult": "Every returned record is CRITICAL and OPEN.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-009",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-012",
      "scenario": "Filter breaches by date range",
      "suite": "Breach Search",
      "preconditions": [
        "Breaches exist inside and outside the requested range."
      ],
      "steps": [
        {
          "step": 1,
          "action": "GET /breaches?fromDate=2026-09-01&toDate=2026-09-15.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Verify timestamps.",
          "expected": ""
        }
      ],
      "expectedResult": "Only breaches inside the inclusive range are returned.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-009",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-013",
      "scenario": "Export filtered breach results",
      "suite": "Reporting",
      "preconditions": [
        "Filtered breach search returns known records."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Apply severity/status filters.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Call export endpoint.",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Open CSV.",
          "expected": ""
        }
      ],
      "expectedResult": "CSV contains exactly the filtered records and export timestamp.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-010",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-014",
      "scenario": "Return controlled error when Market Data API is unavailable",
      "suite": "Failure Handling",
      "preconditions": [
        "Market Data API returns 503."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Request exposure.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect response.",
          "expected": ""
        }
      ],
      "expectedResult": "503 DEPENDENCY_UNAVAILABLE with referenceId; no successful exposure is created.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Integration",
      "linkedRequirement": "BR-011",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-015",
      "scenario": "Do not expose partial calculation after dependency timeout",
      "suite": "Failure Handling",
      "preconditions": [
        "Position API times out after market data is retrieved."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Request exposure.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect calculation status.",
          "expected": ""
        }
      ],
      "expectedResult": "Calculation is FAILED; partial values are not presented as valid.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Negative",
      "linkedRequirement": "BR-011",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-016",
      "scenario": "Return exposure history",
      "suite": "History",
      "preconditions": [
        "At least three successful calculations exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "GET exposure/history.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Verify ordering.",
          "expected": ""
        }
      ],
      "expectedResult": "Historical results are returned chronologically with immutable values.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-012",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-017",
      "scenario": "Create notification for critical breach",
      "suite": "Notifications",
      "preconditions": [
        "A new breach is created with severity CRITICAL."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Create breach event.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Check notification service.",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Check user notification.",
          "expected": ""
        }
      ],
      "expectedResult": "Exactly one notification is created for the new critical breach.",
      "status": "Not Run",
      "priority": "High",
      "type": "Integration",
      "linkedRequirement": "BR-013",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-018",
      "scenario": "Do not duplicate notification for repeated event",
      "suite": "Notifications",
      "preconditions": [
        "Same critical breach event is delivered twice."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Deliver event twice.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Query notifications.",
          "expected": ""
        }
      ],
      "expectedResult": "One business notification exists for the breach.",
      "status": "Not Run",
      "priority": "High",
      "type": "Integration",
      "linkedRequirement": "BR-013",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-019",
      "scenario": "Paginate position results",
      "suite": "Pagination",
      "preconditions": [
        "More than 100 positions exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Request pageSize=50.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Request page=2.",
          "expected": ""
        }
      ],
      "expectedResult": "Each page has at most 50 records and totalCount remains consistent.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-014",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-020",
      "scenario": "Propagate correlation ID",
      "suite": "Traceability",
      "preconditions": [
        "Request contains CORR-123."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call risk API.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect downstream logs/events.",
          "expected": ""
        }
      ],
      "expectedResult": "CORR-123 is available throughout the request chain.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Integration",
      "linkedRequirement": "BR-015",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-021",
      "scenario": "Reject page size above maximum",
      "suite": "Pagination",
      "preconditions": [
        "API supports maximum pageSize=100."
      ],
      "steps": [
        {
          "step": 1,
          "action": "GET /positions?pageSize=101.",
          "expected": ""
        }
      ],
      "expectedResult": "400 INVALID_PAGE_SIZE; no query is executed.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Negative",
      "linkedRequirement": "BR-014",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-022",
      "scenario": "Reject invalid date range",
      "suite": "Breach Search",
      "preconditions": [
        "fromDate is later than toDate."
      ],
      "steps": [
        {
          "step": 1,
          "action": "GET /breaches?fromDate=2026-09-20&toDate=2026-09-15.",
          "expected": ""
        }
      ],
      "expectedResult": "400 INVALID_DATE_RANGE.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Negative",
      "linkedRequirement": "BR-009",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-023",
      "scenario": "Risk Analyst cannot change risk limit",
      "suite": "Security",
      "preconditions": [
        "User has RISK_ANALYST role."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Attempt risk-limit update.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect response.",
          "expected": ""
        }
      ],
      "expectedResult": "403 FORBIDDEN; risk limit remains unchanged.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-006",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-024",
      "scenario": "Risk Manager can escalate breach",
      "suite": "Workflow",
      "preconditions": [
        "OPEN breach exists",
        "user is Risk Manager."
      ],
      "steps": [
        {
          "step": 1,
          "action": "PATCH breach to ESCALATED with comment.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Read breach and audit.",
          "expected": ""
        }
      ],
      "expectedResult": "Status is ESCALATED and audit entry exists.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-004",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-025",
      "scenario": "Regression - existing exposure endpoint after breach feature",
      "suite": "Regression",
      "preconditions": [
        "Baseline exposure test suite passes."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Execute exposure endpoint regression suite.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Compare results with baseline.",
          "expected": ""
        }
      ],
      "expectedResult": "All existing exposure tests continue to pass.",
      "status": "Not Run",
      "priority": "High",
      "type": "Regression",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-026",
      "scenario": "API contract - missing required correlation ID",
      "suite": "API Contract",
      "preconditions": [
        "API contract requires correlationId."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Send request without correlationId.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect response.",
          "expected": ""
        }
      ],
      "expectedResult": "400 INVALID_CORRELATION_ID or gateway-generated ID according to approved contract.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-015",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-027",
      "scenario": "Boundary - utilization exactly at threshold",
      "suite": "Threshold",
      "preconditions": [
        "Risk limit=10m and exposure=10m."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Calculate exposure.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect breach state.",
          "expected": ""
        }
      ],
      "expectedResult": "Utilization is 100.00% and a breach is created.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-003",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-028",
      "scenario": "Boundary - utilization just below threshold",
      "suite": "Threshold",
      "preconditions": [
        "Risk limit=10m and exposure=9.999m."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Calculate exposure.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect breach state.",
          "expected": ""
        }
      ],
      "expectedResult": "Utilization is below 100%; no breach is created.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-003",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-029",
      "scenario": "API authorization - unauthenticated request",
      "suite": "Security",
      "preconditions": [
        "No valid OAuth2 token is supplied."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call protected exposure endpoint.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect response.",
          "expected": ""
        }
      ],
      "expectedResult": "401 Unauthorized; business processing is not executed.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-006",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-030",
      "scenario": "Search returns no results",
      "suite": "Position Search",
      "preconditions": [
        "No position matches the selected filters."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Search for a nonexistent portfolio.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect response.",
          "expected": ""
        }
      ],
      "expectedResult": "200 response with empty data array and totalCount=0.",
      "status": "Not Run",
      "priority": "Low",
      "type": "Functional",
      "linkedRequirement": "BR-005",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-031",
      "scenario": "UAT - end-to-end critical breach journey",
      "suite": "UAT",
      "preconditions": [
        "Fresh market data",
        "approved positions and Risk Manager user exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger exposure calculation",
          "expected": "expect valid exposure."
        },
        {
          "step": 2,
          "action": "Push utilization to threshold",
          "expected": "expect breach."
        },
        {
          "step": 3,
          "action": "Review breach",
          "expected": "expect details."
        },
        {
          "step": 4,
          "action": "Acknowledge with comment",
          "expected": "expect status update."
        },
        {
          "step": 5,
          "action": "Check audit and notification",
          "expected": "expect evidence."
        }
      ],
      "expectedResult": "Complete journey succeeds and evidence is available.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-016",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-032",
      "scenario": "UAT - unauthorized user journey",
      "suite": "UAT",
      "preconditions": [
        "Risk Analyst and OPEN breach exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Open breach",
          "expected": "expect read access."
        },
        {
          "step": 2,
          "action": "Attempt acknowledgement",
          "expected": "expect 403."
        },
        {
          "step": 3,
          "action": "Verify state",
          "expected": "expect OPEN."
        }
      ],
      "expectedResult": "User can view but cannot perform unauthorized action.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-016",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-033",
      "scenario": "Defect data completeness",
      "suite": "Quality",
      "preconditions": [
        "Defect form is available."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Submit defect without severity",
          "expected": "expect rejection."
        },
        {
          "step": 2,
          "action": "Add required classification",
          "expected": "expect acceptance."
        }
      ],
      "expectedResult": "Incomplete defect is rejected; complete defect enters triage.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-017",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-034",
      "scenario": "Critical regression - exposure calculation",
      "suite": "Regression",
      "preconditions": [
        "Approved portfolio baseline exists."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Execute exposure test.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Compare to baseline.",
          "expected": ""
        }
      ],
      "expectedResult": "Exposure result remains within agreed tolerance and API contract is unchanged.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Regression",
      "linkedRequirement": "BR-018",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-035",
      "scenario": "Critical regression - breach authorization",
      "suite": "Regression",
      "preconditions": [
        "Risk Manager and Risk Analyst accounts exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Acknowledge with Risk Manager.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Repeat with Risk Analyst.",
          "expected": ""
        }
      ],
      "expectedResult": "Manager succeeds; Analyst receives 403.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Regression",
      "linkedRequirement": "BR-018",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-036",
      "scenario": "API performance acceptance",
      "suite": "Performance",
      "preconditions": [
        "Performance environment and agreed load exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Execute representative read load.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Measure p95 latency.",
          "expected": ""
        }
      ],
      "expectedResult": "p95 is below 2 seconds or approved exception exists.",
      "status": "Not Run",
      "priority": "High",
      "type": "Performance",
      "linkedRequirement": "BR-019",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-037",
      "scenario": "UAT sign-off validation",
      "suite": "UAT",
      "preconditions": [
        "Critical UAT scenarios have evidence."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Review scenario results.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Check critical scenarios.",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Record decision.",
          "expected": ""
        }
      ],
      "expectedResult": "UAT is Passed only if critical scenarios are accepted or waived.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Functional",
      "linkedRequirement": "BR-020",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-038",
      "scenario": "Expired token rejected",
      "suite": "Security",
      "preconditions": [
        "Protected endpoint exists."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call endpoint with expired token.",
          "expected": ""
        }
      ],
      "expectedResult": "401 Unauthorized; no business processing.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-006",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-039",
      "scenario": "Unsupported HTTP method",
      "suite": "API Contract",
      "preconditions": [
        "GET endpoint exists."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Send POST to GET-only endpoint.",
          "expected": ""
        }
      ],
      "expectedResult": "405 Method Not Allowed.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-040",
      "scenario": "Zero exposure boundary",
      "suite": "Boundary",
      "preconditions": [
        "Portfolio has zero approved exposure."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Calculate exposure.",
          "expected": ""
        }
      ],
      "expectedResult": "Exposure 0; utilization 0%; no breach.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-041",
      "scenario": "Minimum valid risk limit",
      "suite": "Boundary",
      "preconditions": [
        "Smallest allowed positive risk limit is configured."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Calculate utilization.",
          "expected": ""
        }
      ],
      "expectedResult": "No division-by-zero; valid result.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-002",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-042",
      "scenario": "Notification retry after outage",
      "suite": "Integration",
      "preconditions": [
        "Critical breach exists",
        "notification service unavailable."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Create breach.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Simulate notification failure.",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Restore service.",
          "expected": ""
        },
        {
          "step": 4,
          "action": "Retry.",
          "expected": ""
        }
      ],
      "expectedResult": "Breach remains committed; one notification eventually delivered.",
      "status": "Not Run",
      "priority": "High",
      "type": "Integration",
      "linkedRequirement": "BR-013",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-043",
      "scenario": "Correlation ID across services",
      "suite": "Integration",
      "preconditions": [
        "Services are available."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Call exposure API with correlationId.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Trace logs.",
          "expected": ""
        }
      ],
      "expectedResult": "Same correlation ID is traceable across services.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Integration",
      "linkedRequirement": "BR-015",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-044",
      "scenario": "Invalid portfolio identifier",
      "suite": "Negative",
      "preconditions": [
        "Portfolio does not exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "GET exposure for invalid ID.",
          "expected": ""
        }
      ],
      "expectedResult": "404 PORTFOLIO_NOT_FOUND; no calculation starts.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Negative",
      "linkedRequirement": "BR-001",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-045",
      "scenario": "Acknowledge without comment",
      "suite": "Negative",
      "preconditions": [
        "OPEN breach",
        "Risk Manager authenticated."
      ],
      "steps": [
        {
          "step": 1,
          "action": "PATCH ACKNOWLEDGED with empty comment.",
          "expected": ""
        }
      ],
      "expectedResult": "400 COMMENT_REQUIRED; breach remains OPEN.",
      "status": "Not Run",
      "priority": "High",
      "type": "Negative",
      "linkedRequirement": "BR-004",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-046",
      "scenario": "Stale data during calculation",
      "suite": "Negative",
      "preconditions": [
        "Market data becomes stale."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Start calculation.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Simulate stale timestamp.",
          "expected": ""
        }
      ],
      "expectedResult": "Calculation is not successful; controlled error/status returned.",
      "status": "Not Run",
      "priority": "Critical",
      "type": "Negative",
      "linkedRequirement": "BR-007",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-047",
      "scenario": "Failed calculation retry",
      "suite": "Recovery",
      "preconditions": [
        "First dependency call fails",
        "second succeeds."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Trigger calculation.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Simulate transient failure.",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Retry.",
          "expected": ""
        }
      ],
      "expectedResult": "Retry succeeds and exactly one successful result is recorded.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-011",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-048",
      "scenario": "Regression - pagination after export",
      "suite": "Regression",
      "preconditions": [
        "More than 100 breach records exist."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Run paginated search.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Run export.",
          "expected": ""
        },
        {
          "step": 3,
          "action": "Compare record set.",
          "expected": ""
        }
      ],
      "expectedResult": "Pagination and export return consistent filtered records.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Regression",
      "linkedRequirement": "BR-014",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-049",
      "scenario": "Restricted screen direct URL",
      "suite": "Security",
      "preconditions": [
        "Risk Analyst lacks risk-limit permission."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Navigate directly to restricted URL.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect UI/API.",
          "expected": ""
        }
      ],
      "expectedResult": "Restricted action unavailable; API enforces authorization.",
      "status": "Not Run",
      "priority": "High",
      "type": "Functional",
      "linkedRequirement": "BR-006",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate"
    },
    {
      "id": "TC-050",
      "scenario": "Audit unauthorized action",
      "suite": "Security",
      "preconditions": [
        "Risk Analyst attempts breach update."
      ],
      "steps": [
        {
          "step": 1,
          "action": "Attempt update.",
          "expected": ""
        },
        {
          "step": 2,
          "action": "Inspect security log and state.",
          "expected": ""
        }
      ],
      "expectedResult": "Action rejected, traceable, and business state unchanged.",
      "status": "Not Run",
      "priority": "Medium",
      "type": "Functional",
      "linkedRequirement": "BR-006",
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
    },
    {
      "id": "DGM-004",
      "title": "System context and external integrations",
      "type": "Sequence",
      "description": "Shows the Risk Platform and its main surrounding systems: Market Data, Position, IAM and Notification services.",
      "source": "@startuml\nleft to right direction\nactor \"Risk Analyst\" as RA\nactor \"Risk Manager\" as RM\nrectangle \"Risk Management Platform\" as RISK\nrectangle \"Market Data API\" as MKT\nrectangle \"Trade Position API\" as POS\nrectangle \"Identity Provider\" as IAM\nrectangle \"Notification Service\" as NOTIF\nRA --> RISK : monitor/search\nRM --> RISK : review/configure\nRISK --> MKT : prices\nRISK --> POS : positions\nRISK --> IAM : authenticate/authorize\nRISK --> NOTIF : critical breach\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-006",
        "BR-013",
        "BR-015"
      ]
    },
    {
      "id": "DGM-005",
      "title": "Breach state machine",
      "type": "State",
      "description": "Defines allowed lifecycle states for a risk breach.",
      "source": "@startuml\n[*] --> OPEN\nOPEN --> ACKNOWLEDGED : Risk Manager + comment\nOPEN --> ESCALATED : Risk Manager + comment\nACKNOWLEDGED --> ESCALATED : Risk Manager + escalation\nESCALATED --> ACKNOWLEDGED : Risk Manager + resolution\nACKNOWLEDGED --> [*]\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-003",
        "BR-004",
        "BR-008"
      ]
    },
    {
      "id": "DGM-006",
      "title": "Exposure calculation component view",
      "type": "Component",
      "description": "Shows the logical components involved in calculating portfolio exposure.",
      "source": "@startuml\ncomponent \"Risk API\" as API\ncomponent \"Exposure Calculator\" as CALC\ncomponent \"Position Adapter\" as POS\ncomponent \"Market Data Adapter\" as MKT\ndatabase \"Risk DB\" as DB\nAPI --> CALC\nCALC --> POS\nCALC --> MKT\nCALC --> DB\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-007"
      ]
    },
    {
      "id": "DGM-007",
      "title": "API request sequence - breach review",
      "type": "Sequence",
      "description": "Shows the functional API flow for acknowledging a breach and creating an audit record.",
      "source": "@startuml\nactor \"Risk Manager\" as RM\nparticipant \"Breach API\" as API\nparticipant \"Authorization\" as AUTH\ndatabase \"Risk DB\" as DB\nparticipant \"Audit Service\" as AUD\nRM -> API : PATCH /breaches/{id}\nAPI -> AUTH : check RISK_MANAGER\nAUTH --> API : authorized\nAPI -> DB : update status + comment\nDB --> API : committed\nAPI -> AUD : write transition\nAUD --> API : auditId\nAPI --> RM : 200 OK\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-004",
        "BR-008"
      ]
    },
    {
      "id": "DGM-008",
      "title": "Data model - core risk entities",
      "type": "ER",
      "description": "Logical relationship between Portfolio, Position, Exposure Calculation, Risk Limit and Breach.",
      "source": "@startuml\nentity Portfolio {\n* portfolioId : UUID\n--\nname : String\n}\nentity Position {\n* positionId : UUID\n--\nportfolioId : UUID\nstatus : String\nexposureValue : Decimal\n}\nentity ExposureCalculation {\n* calculationId : UUID\n--\nportfolioId : UUID\nexposure : Decimal\nutilization : Decimal\n}\nentity RiskLimit {\n* riskLimitId : UUID\n--\nportfolioId : UUID\nlimitValue : Decimal\n}\nentity Breach {\n* breachId : UUID\n--\ncalculationId : UUID\nstatus : String\nseverity : String\n}\nPortfolio ||--o{ Position\nPortfolio ||--o{ ExposureCalculation\nPortfolio ||--|| RiskLimit\nExposureCalculation ||--o{ Breach\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-012"
      ]
    },
    {
      "id": "DGM-009",
      "title": "Error handling sequence",
      "type": "Sequence",
      "description": "Shows controlled handling when a dependency is unavailable.",
      "source": "@startuml\nactor User\nparticipant \"Risk API\" as API\nparticipant \"Market Data API\" as MKT\nUser -> API : GET exposure\nAPI -> MKT : get latest price\nMKT --> API : 503 Service Unavailable\nAPI -> API : create referenceId\nAPI --> User : 503 DEPENDENCY_UNAVAILABLE\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-011",
        "BR-015"
      ]
    },
    {
      "id": "DGM-010",
      "title": "Audit trail interaction",
      "type": "Sequence",
      "description": "Shows how a breach status change is traced for audit purposes.",
      "source": "@startuml\nactor \"Risk Manager\" as RM\nparticipant \"Breach API\" as API\ndatabase \"Risk DB\" as DB\nparticipant \"Audit Service\" as AUD\nRM -> API : review breach + correlationId\nAPI -> DB : update breach\nAPI -> AUD : actor + old/new status + comment + correlationId\nAUD --> API : audit stored\nAPI --> RM : success + correlationId\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-008",
        "BR-015"
      ]
    },
    {
      "id": "DGM-011",
      "title": "Notification flow",
      "type": "Sequence",
      "description": "Shows creation of a critical breach notification without coupling notification success to breach persistence.",
      "source": "@startuml\nparticipant \"Risk Engine\" as ENG\nparticipant \"Breach Service\" as BR\nparticipant \"Notification Service\" as N\nactor \"Risk Manager\" as RM\nENG -> BR : critical breach event\nBR -> BR : persist breach\nBR -> N : create notification\nN --> BR : notification accepted\nN -> RM : email / in-app notification\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-003",
        "BR-013"
      ]
    },
    {
      "id": "DGM-012",
      "title": "AS-IS risk breach process",
      "type": "BPMN",
      "description": "Current-state manual process: spreadsheet consolidation, manual calculation, threshold check and email escalation.",
      "source": "@startuml\n|Risk Analyst|\nstart\n:Export positions;\n:Import market prices;\n:Calculate exposure manually;\n:Compare against risk limit;\nif (Limit exceeded?) then (Yes)\n:Email Risk Manager;\nelse (No)\n:Save daily spreadsheet;\nendif\nstop\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-004"
      ]
    },
    {
      "id": "DGM-013",
      "title": "TO-BE risk monitoring process",
      "type": "BPMN",
      "description": "Future-state automated process with validation, calculation, breach review, notification and audit.",
      "source": "@startuml\n|Market Data Service|\nstart\n:Publish approved market data;\n|Risk Platform|\n:Retrieve approved positions;\n:Validate data freshness;\nif (Data valid?) then (Yes)\n:Calculate exposure;\n:Calculate utilization;\nif (Threshold reached?) then (Yes)\n:Create breach;\n|Notification Service|\n:Notify Risk Manager;\n|Risk Manager|\n:Review breach;\nif (Decision?) then (Acknowledge)\n:Acknowledge with comment;\nelse (Escalate)\n:Escalate with comment;\nendif\n|Risk Platform|\n:Write audit record;\nelse (No)\n:Create operational failure;\nendif\nelse (No)\n:Create operational failure;\nendif\nstop\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-004",
        "BR-013"
      ]
    },
    {
      "id": "DGM-014",
      "title": "AS-IS vs TO-BE improvement map",
      "type": "Sequence",
      "description": "Shows manual spreadsheet control replaced by automated, traceable services.",
      "source": "@startuml\nrectangle AS_IS { [Manual extraction] --> [Spreadsheet calculation] --> [Manual threshold check] --> [Email escalation] }\nrectangle TO_BE { [API ingestion] --> [Automated calculation] --> [Threshold engine] --> [Breach workflow] --> [Audit + notification] }\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-008"
      ]
    },
    {
      "id": "DGM-015",
      "title": "Calculation state machine",
      "type": "State",
      "description": "Calculation lifecycle and failure/retry behaviour.",
      "source": "@startuml\n[*] --> REQUESTED\nREQUESTED --> VALIDATING\nVALIDATING --> CALCULATING : data valid\nVALIDATING --> FAILED : stale/invalid dependency\nCALCULATING --> SUCCESS\nCALCULATING --> FAILED : dependency failure\nFAILED --> REQUESTED : retry\nSUCCESS --> [*]\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-007",
        "BR-011",
        "BR-012"
      ]
    },
    {
      "id": "DGM-016",
      "title": "Requirement-to-test traceability",
      "type": "Activity",
      "description": "Shows how a business need becomes a requirement, rule, acceptance criterion, test and evidence.",
      "source": "@startuml\nstart\n:Business need;\n:Requirement;\n:Business rule;\n:Acceptance criteria;\n:Functional/API tests;\n:Regression execution;\n:Evidence + defect review;\n:Business acceptance;\nstop\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-004",
        "BR-018"
      ]
    },
    {
      "id": "DGM-017",
      "title": "Breach state machine",
      "type": "State",
      "description": "Allowed lifecycle for an identified risk breach.",
      "source": "@startuml\n[*] --> OPEN\nOPEN --> ACKNOWLEDGED : comment\nOPEN --> ESCALATED : comment\nACKNOWLEDGED --> ESCALATED : escalation\nESCALATED --> ACKNOWLEDGED : resolution\nACKNOWLEDGED --> [*]\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-003",
        "BR-004",
        "BR-008"
      ]
    },
    {
      "id": "DGM-018",
      "title": "System context and integrations",
      "type": "Sequence",
      "description": "Risk Platform and surrounding market data, position, IAM and notification systems.",
      "source": "@startuml\nleft to right direction\nactor \"Risk Analyst\" as RA\nactor \"Risk Manager\" as RM\nrectangle \"Risk Platform\" as R\nrectangle \"Market Data API\" as M\nrectangle \"Position API\" as P\nrectangle \"Identity Provider\" as I\nrectangle \"Notification Service\" as N\nRA --> R\nRM --> R\nR --> M\nR --> P\nR --> I\nR --> N\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-006",
        "BR-013",
        "BR-015"
      ]
    },
    {
      "id": "DGM-019",
      "title": "Core risk data model",
      "type": "ER",
      "description": "Logical relationships between portfolio, position, calculation, risk limit and breach.",
      "source": "@startuml\nentity Portfolio {\n  * portfolioId : UUID\n}\nentity Position {\n  * positionId : UUID\n  --\n  portfolioId : UUID\n}\nentity ExposureCalculation {\n  * calculationId : UUID\n  --\n  portfolioId : UUID\n}\nentity RiskLimit {\n  * riskLimitId : UUID\n  --\n  portfolioId : UUID\n}\nentity Breach {\n  * breachId : UUID\n  --\n  calculationId : UUID\n}\nPortfolio ||--o{ Position\nPortfolio ||--o{ ExposureCalculation\nPortfolio ||--|| RiskLimit\nExposureCalculation ||--o{ Breach\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-001",
        "BR-002",
        "BR-003",
        "BR-012"
      ]
    },
    {
      "id": "DGM-020",
      "title": "Breach review API sequence",
      "type": "Sequence",
      "description": "Functional interaction for authorized breach acknowledgement and audit.",
      "source": "@startuml\nactor \"Risk Manager\" as RM\nparticipant \"Breach API\" as API\nparticipant Authorization as AUTH\ndatabase \"Risk DB\" as DB\nparticipant \"Audit Service\" as AUD\nRM -> API : PATCH breach + correlationId\nAPI -> AUTH : authorize\nAUTH --> API : allowed\nAPI -> DB : update status/comment\nAPI -> AUD : write audit\nAUD --> API : auditId\nAPI --> RM : 200 OK\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-004",
        "BR-008",
        "BR-015"
      ]
    },
    {
      "id": "DGM-021",
      "title": "Dependency failure sequence",
      "type": "Sequence",
      "description": "Controlled handling when a required dependency is unavailable.",
      "source": "@startuml\nactor User\nparticipant \"Risk API\" as API\nparticipant \"Market Data API\" as MKT\nUser -> API : GET exposure\nAPI -> MKT : latest price\nMKT --> API : 503\nAPI -> API : create referenceId\nAPI --> User : 503 DEPENDENCY_UNAVAILABLE\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-011",
        "BR-015"
      ]
    },
    {
      "id": "DGM-022",
      "title": "Critical notification sequence",
      "type": "Sequence",
      "description": "Critical breach notification is decoupled from breach persistence.",
      "source": "@startuml\nparticipant \"Risk Engine\" as ENG\nparticipant \"Breach Service\" as BR\nparticipant \"Notification Service\" as N\nactor \"Risk Manager\" as RM\nENG -> BR : critical breach event\nBR -> BR : persist breach\nBR -> N : create notification\nN --> BR : accepted\nN -> RM : email/in-app\n@enduml",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "relatedRequirements": [
        "BR-003",
        "BR-013"
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
        },
        {
          "id": "API-009",
          "method": "GET",
          "path": "/breaches/{breachId}",
          "summary": "Get breach details",
          "description": "Returns breach detail, calculation reference and review history.",
          "tag": "Breach",
          "operationId": "getBreach",
          "auth": "OAuth2 scope risk.read",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-004",
            "BR-008"
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
    },
    {
      "id": "SVC-4",
      "name": "Reporting API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Reporting API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-007",
          "method": "GET",
          "path": "/exports/breaches",
          "summary": "Export breach results",
          "description": "Creates a CSV export using the supplied breach filters.",
          "tag": "Reporting",
          "operationId": "exportBreaches",
          "auth": "OAuth2 scope risk.export",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-010"
          ]
        }
      ]
    },
    {
      "id": "SVC-5",
      "name": "Notification API",
      "basePath": "/v1",
      "version": "1.0.0",
      "description": "Endpoints exposed by Notification API.",
      "owner": "Saadaoui Abdessalem",
      "status": "In Development",
      "endpoints": [
        {
          "id": "API-008",
          "method": "POST",
          "path": "/notifications/risk-breach",
          "summary": "Create risk notification",
          "description": "Creates notification records for newly created critical breaches.",
          "tag": "Notification",
          "operationId": "createRiskNotification",
          "auth": "OAuth2 scope notifications.write",
          "parameters": [],
          "responses": [],
          "relatedRequirements": [
            "BR-013"
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
    },
    {
      "id": "SQL-005",
      "title": "Critical breaches have audit history",
      "purpose": "Verify every non-OPEN breach has an audit record.",
      "database": "RISKDB",
      "sql": "SELECT b.breach_id FROM risk_breach b LEFT JOIN risk_breach_audit a ON a.breach_id=b.breach_id WHERE b.status <> 'OPEN' GROUP BY b.breach_id HAVING COUNT(a.audit_id)=0;",
      "columns": [
        "breach_id"
      ],
      "rows": [],
      "notes": [
        "Expected: no rows."
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
      "id": "SQL-006",
      "title": "Duplicate critical notifications",
      "purpose": "Verify one business notification per critical breach event.",
      "database": "RISKDB",
      "sql": "SELECT breach_id, COUNT(*) FROM risk_notification WHERE event_type='CRITICAL_BREACH' GROUP BY breach_id HAVING COUNT(*) > 1;",
      "columns": [
        "breach_id",
        "count"
      ],
      "rows": [],
      "notes": [
        "Expected: no rows."
      ],
      "status": "Validated",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate",
      "relatedRequirements": [
        "BR-013"
      ],
      "relatedRules": [
        "RULE-015"
      ]
    },
    {
      "id": "SQL-007",
      "title": "Successful calculations use fresh data",
      "purpose": "Verify successful calculations never use stale market data.",
      "database": "RISKDB",
      "sql": "SELECT calculation_id FROM exposure_calculation WHERE status='SUCCESS' AND market_data_fresh=FALSE;",
      "columns": [
        "calculation_id"
      ],
      "rows": [],
      "notes": [
        "Expected: no rows."
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
    },
    {
      "id": "SQL-008",
      "title": "Immutable calculation history",
      "purpose": "Verify successful historical records are not overwritten.",
      "database": "RISKDB",
      "sql": "SELECT calculation_id FROM exposure_calculation WHERE status='SUCCESS' AND updated_at<>created_at AND version IS NULL;",
      "columns": [
        "calculation_id"
      ],
      "rows": [],
      "notes": [
        "Expected: no rows."
      ],
      "status": "Validated",
      "lastRun": "2026-08-29",
      "executedBy": "Candidate",
      "relatedRequirements": [
        "BR-012"
      ],
      "relatedRules": [
        "RULE-014"
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
    },
    {
      "id": "DOC-006",
      "name": "API Error Catalogue",
      "format": "Excel",
      "description": "Standardized business and technical errors for risk APIs.",
      "category": "Interface",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "85 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-007",
        "BR-011",
        "BR-014",
        "BR-015"
      ]
    },
    {
      "id": "DOC-007",
      "name": "Traceability Matrix",
      "format": "Excel",
      "description": "Maps business requirements to rules, APIs, acceptance criteria and test cases.",
      "category": "Governance",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "95 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-004",
        "BR-006",
        "BR-011",
        "BR-013"
      ]
    },
    {
      "id": "DOC-008",
      "name": "UAT Scenario Pack",
      "format": "Excel",
      "description": "Business UAT scenarios, expected results, evidence and sign-off.",
      "category": "UAT",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "110 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-016",
        "BR-020"
      ]
    },
    {
      "id": "DOC-009",
      "name": "Defect Triage Template",
      "format": "Excel",
      "description": "Defect fields, severity/priority, reproduction and business impact guidance.",
      "category": "Testing",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "65 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-017"
      ]
    },
    {
      "id": "DOC-010",
      "name": "Regression & Release Test Plan",
      "format": "Word",
      "description": "Regression scope, entry/exit criteria, performance acceptance and release recommendation.",
      "category": "Testing",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "140 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-018",
        "BR-019"
      ]
    },
    {
      "id": "DOC-011",
      "name": "AS-IS Process Notes",
      "format": "Word",
      "description": "Current-state manual workflow, pain points and control weaknesses.",
      "category": "Business Analysis",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "100 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-003"
      ]
    },
    {
      "id": "DOC-012",
      "name": "TO-BE Process Specification",
      "format": "Word",
      "description": "Future-state workflow, exceptions, ownership and SLA expectations.",
      "category": "Business Analysis",
      "version": "1.0",
      "author": "Candidate",
      "lastUpdated": "2026-08-29",
      "size": "130 KB",
      "status": "Draft",
      "confidentiality": "Internal",
      "relatedRequirements": [
        "BR-001",
        "BR-003",
        "BR-004"
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
    },
    {
      "id": "FS-005",
      "title": "Breach Search and Export",
      "summary": "Search, filter and export risk breaches for authorized users.",
      "requirementRefs": [
        "BR-009",
        "BR-010",
        "BR-014"
      ],
      "businessLogic": [
        "Validate filters.",
        "Apply AND logic.",
        "Paginate results.",
        "Generate export from the same filtered dataset."
      ],
      "fields": [
        {
          "name": "severity",
          "type": "string",
          "length": "20",
          "mandatory": false,
          "description": "Filter for breach severity.",
          "example": "CRITICAL"
        },
        {
          "name": "status",
          "type": "string",
          "length": "20",
          "mandatory": false,
          "description": "Filter for breach workflow status.",
          "example": "OPEN"
        },
        {
          "name": "fromDate",
          "type": "date",
          "length": "10",
          "mandatory": false,
          "description": "Start of breach search range.",
          "example": "2026-09-01"
        },
        {
          "name": "toDate",
          "type": "date",
          "length": "10",
          "mandatory": false,
          "description": "End of breach search range.",
          "example": "2026-09-15"
        },
        {
          "name": "pageSize",
          "type": "integer",
          "length": "3",
          "mandatory": false,
          "description": "Number of records per page.",
          "example": "50"
        }
      ],
      "validations": [
        {
          "field": "fromDate",
          "rule": "Must be less than or equal to toDate.",
          "errorCode": "INVALID_DATE_RANGE",
          "severity": "Blocking"
        },
        {
          "field": "pageSize",
          "rule": "Must be between 1 and 100.",
          "errorCode": "INVALID_PAGE_SIZE",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "INVALID_DATE_RANGE",
          "httpStatus": 400,
          "message": "The selected date range is invalid.",
          "handling": "Return validation details; do not execute search."
        },
        {
          "code": "INVALID_PAGE_SIZE",
          "httpStatus": 400,
          "message": "The page size must be between 1 and 100.",
          "handling": "Return validation details."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-007",
          "scenario": "User requests page 10 after records were deleted between page requests.",
          "expectedBehaviour": "Return an empty page with current totalCount; do not return duplicate records."
        }
      ]
    },
    {
      "id": "FS-006",
      "title": "Failure Handling and Traceability",
      "summary": "Defines dependency failures, correlation IDs and operational error handling.",
      "requirementRefs": [
        "BR-011",
        "BR-015"
      ],
      "businessLogic": [
        "Propagate correlation ID.",
        "Capture dependency failure.",
        "Return controlled business error.",
        "Persist technical reference for support."
      ],
      "fields": [
        {
          "name": "correlationId",
          "type": "string",
          "length": "64",
          "mandatory": true,
          "description": "Identifier used to trace a request across services.",
          "example": "CORR-8f12a"
        },
        {
          "name": "referenceId",
          "type": "string",
          "length": "64",
          "mandatory": false,
          "description": "Technical support reference for failed operations.",
          "example": "ERR-20260915-0021"
        }
      ],
      "validations": [
        {
          "field": "correlationId",
          "rule": "Must contain only supported characters and be no longer than 64 characters.",
          "errorCode": "INVALID_CORRELATION_ID",
          "severity": "Blocking"
        }
      ],
      "errors": [
        {
          "code": "DEPENDENCY_UNAVAILABLE",
          "httpStatus": 503,
          "message": "A required service is temporarily unavailable.",
          "handling": "Return referenceId and allow controlled retry."
        },
        {
          "code": "INVALID_CORRELATION_ID",
          "httpStatus": 400,
          "message": "The correlation identifier is invalid.",
          "handling": "Reject request before business processing."
        }
      ],
      "edgeCases": [
        {
          "id": "EC-008",
          "scenario": "Market Data API returns HTTP 200 but an invalid timestamp.",
          "expectedBehaviour": "Treat timestamp validation as failed and do not calculate exposure."
        },
        {
          "id": "EC-009",
          "scenario": "The same correlation ID is reused for a retry.",
          "expectedBehaviour": "Logs remain traceable and the business operation follows the idempotency contract."
        }
      ]
    },
    {
      "id": "FS-007",
      "title": "Notifications",
      "summary": "Creates notifications for critical breaches.",
      "requirementRefs": [
        "BR-013"
      ],
      "businessLogic": [
        "Detect new critical breach.",
        "Create in-app notification.",
        "Request email notification.",
        "Avoid duplicate notification."
      ],
      "fields": [
        {
          "name": "notificationId",
          "type": "uuid",
          "length": "36",
          "mandatory": true,
          "description": "Unique notification identifier.",
          "example": "9a9f4f91-1d1a-4db2-a8d8-123456789012"
        }
      ],
      "validations": [
        {
          "field": "severity",
          "rule": "Notification is only created for CRITICAL severity.",
          "errorCode": "NOTIFICATION_NOT_REQUIRED",
          "severity": "Blocking"
        }
      ],
      "errors": [],
      "edgeCases": [
        {
          "id": "EC-010",
          "scenario": "Notification service is unavailable after a critical breach is created.",
          "expectedBehaviour": "Keep the breach committed; record notification failure for retry without recreating the breach."
        }
      ]
    }
  ];

export const prjEve003Bundle: ProjectDataBundle = {
  ...EMPTY_BUNDLE,
  projectId: "PRJ-EVE-003",
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
