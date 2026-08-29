import type { Project } from "@/lib/types";

/**
 * Every project the workspace can open.
 *
 * A project belongs here only once its documentation set exists — a card that
 * opens onto empty pages reads as a broken tool rather than as work in
 * progress, so placeholders are not kept.
 */
export const projects: Project[] = [
  {
    id: "PRJ-IPH-023",
    code: "IPH-2.3",
    name: "Instant Payments Hub — SCT Inst Onboarding",
    shortName: "Instant Payments Hub",
    domain: "Banking",
    subDomain: "Payments & Clearing",
    status: "Completed",
    version: "2.3",
    release: "R2025.06 — Payments Wave 3",
    owner: {
      id: "USR-001",
      name: "Saadaoui Abdessalem",
      role: "Lead Business Analyst",
      email: "abdessalem.saadaoui@retail-bank.example",
      department: "Payments Change Delivery",
    },
    businessOwner: "Head of Payments Operations",
    programme: "Payments Modernisation Programme",
    summary:
      "Sample analysis — a method demonstration, not client work. Delivery of a real-time SEPA Instant Credit Transfer (SCT Inst) capability for retail and SME customers, replacing the batch-based legacy transfer engine. The hub exposes a synchronous payment initiation API, performs real-time sanctions and fraud screening, and settles through the TIPS gateway within the 10-second scheme deadline.",
    businessObjective:
      "Enable 24/7/365 euro payments up to EUR 100,000 with an end-to-end execution time under 10 seconds, achieve full compliance with the EPC SCT Inst rulebook v2024, and reduce the cost per outbound payment by 38% by decommissioning the legacy batch transfer engine.",
    inScope: [
      "Outbound SCT Inst payment initiation from web and mobile banking channels",
      "Inbound SCT Inst payment reception, validation and account crediting",
      "Real-time sanctions screening and fraud scoring within the payment path",
      "Payment status enquiry and recall (SCT Inst recall / r-transaction handling)",
      "Beneficiary account verification (Verification of Payee) prior to submission",
      "Customer and internal limit management for instant payments",
      "TIPS gateway connectivity, reachability checks and reconciliation reporting",
    ],
    outOfScope: [
      "SEPA Direct Debit and standard SCT batch flows (unchanged, legacy engine retained)",
      "Cross-currency and non-euro instant payment schemes (FPS, TCH RTP)",
      "Corporate host-to-host (ISO 20022 file-based) channel — planned for release 2.5",
      "Card-based push payments and wallet top-ups",
      "Migration of historical payment archive older than 24 months",
    ],
    stakeholders: [
      {
        id: "STK-001",
        name: "Marcus Delacroix",
        role: "Head of Payments Operations",
        email: "marcus.delacroix@retail-bank.example",
        department: "Payments Operations",
        raci: "Accountable",
      },
      {
        id: "STK-002",
        name: "Saadaoui Abdessalem",
        role: "Lead Business Analyst",
        email: "abdessalem.saadaoui@retail-bank.example",
        department: "Payments Change Delivery",
        raci: "Responsible",
      },
      {
        id: "STK-003",
        name: "Priya Raghunathan",
        role: "Solution Architect",
        email: "priya.raghunathan@retail-bank.example",
        department: "Enterprise Architecture",
        raci: "Consulted",
      },
      {
        id: "STK-004",
        name: "Tobias Lindqvist",
        role: "Financial Crime Compliance Officer",
        email: "tobias.lindqvist@retail-bank.example",
        department: "Financial Crime & Compliance",
        raci: "Consulted",
      },
      {
        id: "STK-005",
        name: "Hannah Okafor",
        role: "Product Owner — Digital Channels",
        email: "hannah.okafor@retail-bank.example",
        department: "Digital Banking",
        raci: "Responsible",
      },
      {
        id: "STK-006",
        name: "Gerald Vance",
        role: "Head of Internal Audit",
        email: "gerald.vance@retail-bank.example",
        department: "Internal Audit",
        raci: "Informed",
      },
      {
        id: "STK-007",
        name: "Sofia Marchetti",
        role: "QA Manager",
        email: "sofia.marchetti@retail-bank.example",
        department: "Quality Engineering",
        raci: "Consulted",
      },
    ],
    timeline: [
      {
        id: "MS-01",
        label: "Business case approved",
        date: "2024-09-12",
        status: "Completed",
        description: "Payments Steering Committee approved the EUR 4.2m investment case.",
      },
      {
        id: "MS-02",
        label: "Business requirements signed off",
        date: "2024-11-08",
        status: "Completed",
        description: "24 business requirements baselined at version 1.0 with Ops and Compliance.",
      },
      {
        id: "MS-03",
        label: "Functional specification baselined",
        date: "2025-01-24",
        status: "Completed",
        description: "FS v2.1 approved including VoP and fraud scoring in the payment path.",
      },
      {
        id: "MS-04",
        label: "TIPS connectivity certification",
        date: "2025-03-14",
        status: "Completed",
        description: "Scheme certification passed on first submission; reachability confirmed.",
      },
      {
        id: "MS-05",
        label: "SIT & UAT completed",
        date: "2025-05-16",
        status: "Completed",
        description:
          "39 test cases executed: 37 passed, DEF-1207 open on late scheme acceptance, TC-034 blocked.",
      },
      {
        id: "MS-06",
        label: "Production go-live (pilot)",
        date: "2025-06-02",
        status: "Completed",
        description: "Pilot cohort of 5,000 retail customers enabled with a EUR 15,000 cap.",
      },
      {
        id: "MS-07",
        label: "Full customer rollout",
        date: "2025-06-27",
        status: "Completed",
        description: "All retail and SME segments enabled; legacy batch engine decommissioned.",
      },
      {
        id: "MS-08",
        label: "Post-implementation review",
        date: "2025-08-15",
        status: "Completed",
        description: "Benefits realisation confirmed: 41% cost reduction, 99.2% within 5 seconds.",
      },
    ],
    dependencies: [
      {
        id: "DEP-01",
        name: "TIPS Gateway (Banca d'Italia)",
        type: "External Party",
        owner: "Priya Raghunathan",
        status: "Resolved",
        description:
          "Scheme connectivity for settlement in central bank money. Certification completed 14 Mar 2025.",
      },
      {
        id: "DEP-02",
        name: "Sanctions Screening Platform (FircoSoft)",
        type: "Vendor",
        owner: "Tobias Lindqvist",
        status: "Resolved",
        description:
          "Real-time screening API upgraded to v4 to meet the 1,200 ms in-path response budget.",
      },
      {
        id: "DEP-03",
        name: "Core Banking Ledger (Temenos T24)",
        type: "Internal System",
        owner: "Priya Raghunathan",
        status: "Resolved",
        description:
          "Reservation-based posting API required for two-phase debit with automatic release.",
      },
      {
        id: "DEP-04",
        name: "Fraud Decision Engine (Featurespace ARIC)",
        type: "Vendor",
        owner: "Tobias Lindqvist",
        status: "Resolved",
        description: "Behavioural scoring model retrained on instant payment velocity patterns.",
      },
      {
        id: "DEP-05",
        name: "EPC SCT Inst Rulebook 2024 v1.1",
        type: "Regulatory",
        owner: "Marcus Delacroix",
        status: "Resolved",
        description:
          "Mandatory adoption of the Verification of Payee service ahead of the Oct 2025 deadline.",
      },
      {
        id: "DEP-06",
        name: "Customer Notification Service",
        type: "Internal System",
        owner: "Hannah Okafor",
        status: "On Track",
        description: "Push and SMS confirmation templates for instant credit and debit events.",
      },
    ],
    risks: [
      {
        id: "RSK-01",
        description:
          "Sanctions screening latency exceeds the in-path budget during peak volumes, causing scheme timeouts.",
        likelihood: "Medium",
        impact: "High",
        mitigation:
          "Warm cache of cleared beneficiaries, circuit breaker to manual queue, load tested at 3x peak TPS.",
        owner: "Tobias Lindqvist",
      },
      {
        id: "RSK-02",
        description:
          "Authorised push payment (APP) fraud increases with irrevocable real-time settlement.",
        likelihood: "High",
        impact: "High",
        mitigation:
          "Verification of Payee, dynamic velocity limits, cooling-off period for first-time beneficiaries.",
        owner: "Tobias Lindqvist",
      },
      {
        id: "RSK-03",
        description: "Core ledger reservation release fails, leaving customer funds held.",
        likelihood: "Low",
        impact: "High",
        mitigation:
          "Compensating release job every 60 seconds plus daily reconciliation with break reporting.",
        owner: "Priya Raghunathan",
      },
      {
        id: "RSK-04",
        description: "Customer confusion over the EUR 100,000 scheme cap generates contact volume.",
        likelihood: "Medium",
        impact: "Low",
        mitigation: "Inline channel messaging and automatic fallback offer to standard SCT.",
        owner: "Hannah Okafor",
      },
    ],
    tags: [
      "Sample analysis",
      "SEPA",
      "SCT Inst",
      "ISO 20022",
      "TIPS",
      "Real-Time Payments",
      "PSD2",
      "Verification of Payee",
      "Regulatory",
    ],
    metrics: {
      requirements: 24,
      businessRules: 16,
      apis: 5,
      documents: 7,
      testCases: 39,
      actors: 8,
      diagrams: 5,
    },
    startDate: "2024-09-12",
    targetDate: "2025-06-27",
    lastUpdated: "2025-08-15",
    completion: 100,
    regulatoryDrivers: [
      "EPC SCT Inst Rulebook 2024 v1.1",
      "EU Instant Payments Regulation (EU) 2024/886",
      "PSD2 — Strong Customer Authentication (RTS)",
      "EU Funds Transfer Regulation 2015/847",
    ],
  },
  {
    id: "PRJ-EPH-001",
    code: "EPH-1.0",
    name: "EuroPay Hub — Merchant Payment Platform",
    shortName: "EuroPay Hub",
    domain: "Payments",
    subDomain: "Merchant Acquiring",
    status: "In Progress",
    version: "1.0",
    release: "Phases 0–6",
    owner: {
      id: "USR-001",
      name: "Saadaoui Abdessalem",
      role: "Functional Analyst & Java Developer",
      email: "abdessalemsaa@gmail.com",
      department: "Product Engineering",
    },
    businessOwner: "Platform Admin",
    programme: "EuroPay Platform",
    summary:
      "A European merchant payment platform enabling acceptance of multiple payment methods through a single API. It abstracts the differences between payment rails — Wero, Bancontact, Visa and future methods — behind one consistent contract, with a fully observable payment lifecycle, idempotent creation, refunds and reliable webhook notification.",
    businessObjective:
      "Let a merchant accept payments via several methods through one API; provide a reliable, observable payment lifecycle with clear states; notify merchants of outcomes reliably through webhooks with retries; prevent duplicate charges through idempotency; support refund, cancel and retry; and be secure by default with authentication, authorisation and auditability.",
    inScope: [
      "Merchant onboarding, authentication (JWT), and API-key issuance",
      "Customer and order management",
      "Payment creation and full lifecycle across mock Wero/Bancontact/Visa",
      "Refunds, cancellations, retries of failed payments",
      "Webhook configuration, delivery, retries, and logs",
      "Audit logging of significant actions",
      "EUR currency only",
    ],
    outOfScope: [
      "Real PSP connectivity and real fund movement",
      "Multi-currency and FX",
      "3-D Secure/SCA flows (may be simulated later)",
      "Merchant dashboard UI (API only; UI is a future improvement)",
      "Payouts/settlement banking integration (modelled as a state only)",
    ],
    stakeholders: [
      {
        id: "STK-EP-1",
        name: "Merchant",
        role: "Primary user — accepts payments via the API",
        email: "merchant@europay.example",
        department: "External",
        raci: "Responsible",
      },
      {
        id: "STK-EP-2",
        name: "Customer",
        role: "Payer completing the purchase",
        email: "customer@europay.example",
        department: "External",
        raci: "Informed",
      },
      {
        id: "STK-EP-3",
        name: "Platform Admin",
        role: "Operates and configures the platform",
        email: "admin@europay.example",
        department: "Platform",
        raci: "Accountable",
      },
      {
        id: "STK-EP-4",
        name: "Compliance / Audit",
        role: "Reviews the append-only audit trail",
        email: "compliance@europay.example",
        department: "Governance",
        raci: "Consulted",
      },
      {
        id: "STK-EP-5",
        name: "Saadaoui Abdessalem",
        role: "Functional Analyst & Java Developer",
        email: "abdessalemsaa@gmail.com",
        department: "Product Engineering",
        raci: "Responsible",
      },
    ],
    timeline: [
      {
        id: "MS-EP-0",
        label: "Phase 0 — Glossary & business requirements",
        date: "2025-11-10",
        status: "Completed",
        description:
          "Ubiquitous language agreed and the BRD baselined: 6 objectives, 12 functional requirements, scope and non-functional requirements.",
      },
      {
        id: "MS-EP-1",
        label: "Phase 1 — Identity, merchant & API keys",
        date: "2025-12-08",
        status: "Completed",
        description:
          "Merchant registration, JWT authentication, role-based access and hashed API keys with one-time secret display.",
      },
      {
        id: "MS-EP-2",
        label: "Phase 2 — Orders & customers",
        date: "2026-01-05",
        status: "Completed",
        description:
          "Order creation, cancellation and customer reuse by email and merchant tuple, with ownership-based data isolation.",
      },
      {
        id: "MS-EP-3",
        label: "Phase 3 — Payments & idempotency",
        date: "2026-01-26",
        status: "Completed",
        description:
          "Payment creation across mock Wero, Bancontact and Visa through a provider registry, with idempotent replay.",
      },
      {
        id: "MS-EP-4",
        label: "Phase 4 — Lifecycle, refunds & retries",
        date: "2026-02-16",
        status: "Completed",
        description:
          "State machine enforcement, full refunds on settled payments, expiry scheduling and bounded retries.",
      },
      {
        id: "MS-EP-5",
        label: "Phase 5 — Webhooks",
        date: "2026-03-09",
        status: "In Progress",
        description:
          "Transactional outbox, HMAC-SHA256 signing, three-attempt retry with exponential backoff and delivery logging.",
      },
      {
        id: "MS-EP-6",
        label: "Phase 6 — Audit & dashboard",
        date: "2026-04-06",
        status: "Upcoming",
        description:
          "Append-only audit events and server-side aggregated dashboard metrics, scoped per merchant.",
      },
    ],
    dependencies: [
      {
        id: "DEP-EP-1",
        name: "PostgreSQL",
        type: "Internal System",
        owner: "Saadaoui Abdessalem",
        status: "Resolved",
        description: "Primary data store; integration tests run against it via Testcontainers.",
      },
      {
        id: "DEP-EP-2",
        name: "Mock payment providers (Wero, Bancontact, Visa)",
        type: "Vendor",
        owner: "Saadaoui Abdessalem",
        status: "On Track",
        description:
          "Provider adapters resolved through a registry so a real PSP can replace a mock without touching the domain.",
      },
      {
        id: "DEP-EP-3",
        name: "Merchant webhook endpoints",
        type: "External Party",
        owner: "Merchant",
        status: "On Track",
        description:
          "Merchant-operated HTTPS endpoints; only a 2xx response counts as successful delivery.",
      },
    ],
    risks: [
      {
        id: "R-01",
        description: "Double charge on client retries",
        likelihood: "Medium",
        impact: "High",
        mitigation: "Idempotency-Key dedup (BR-041); unique constraint",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-02",
        description: "Lost payment notification (crash between DB commit and webhook)",
        likelihood: "Medium",
        impact: "High",
        mitigation:
          "Transactional outbox — event persisted atomically, delivered async (BR-060)",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-03",
        description: "Forged webhook accepted by merchant",
        likelihood: "Low",
        impact: "High",
        mitigation: "HMAC-SHA256 signature per payload (BR-061)",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-04",
        description: "Illegal payment state change",
        likelihood: "Medium",
        impact: "High",
        mitigation: "State-machine guard rejects invalid transitions (BR-042)",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-05",
        description: "API key leakage from our store",
        likelihood: "Low",
        impact: "High",
        mitigation: "Only prefix + BCrypt hash stored; secret shown once (BR-011)",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-06",
        description: "Credential stuffing / user enumeration",
        likelihood: "Medium",
        impact: "Medium",
        mitigation: "Uniform 401 on login; BCrypt; (future: rate limiting)",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-07",
        description: "Cross-merchant data access",
        likelihood: "Low",
        impact: "High",
        mitigation: "Every query scoped by merchant id; 404 (not 403) on foreign resources",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-08",
        description: "Money rounding errors",
        likelihood: "Low",
        impact: "High",
        mitigation: "Integer minor units + Money value object; never floating point",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-09",
        description: "Webhook endpoint down",
        likelihood: "Medium",
        impact: "Medium",
        mitigation: "3× retry with backoff, then FAILED; delivery log for diagnosis",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-10",
        description: "Stale pending payment approved late",
        likelihood: "Medium",
        impact: "Medium",
        mitigation: "Expiry scheduler + state machine block approval of EXPIRED",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-11",
        description: "Architecture erosion over time",
        likelihood: "Medium",
        impact: "Medium",
        mitigation: "ArchUnit rules fail the build on boundary violations",
        owner: "Saadaoui Abdessalem",
      },
      {
        id: "R-12",
        description: "Secret/JWT key committed",
        likelihood: "Low",
        impact: "High",
        mitigation: "Externalized via env (JWT_SECRET); dev default only",
        owner: "Saadaoui Abdessalem",
      },
    ],
    tags: [
      "Payments",
      "Wero",
      "Bancontact",
      "Visa",
      "Idempotency",
      "Webhooks",
      "Clean Architecture",
      "DDD",
      "Java 21",
    ],
    metrics: {
      requirements: 12,
      businessRules: 8,
      apis: 26,
      documents: 10,
      testCases: 39,
      actors: 6,
      diagrams: 8,
    },
    startDate: "2025-11-10",
    targetDate: "2026-04-06",
    lastUpdated: "2026-02-18",
    completion: 72,
    regulatoryDrivers: [
      "PSD2 — strong authentication and auditability principles",
      "EUR-only scope pending multi-currency assessment",
    ],
  },

  {
    "code": "1-1.0",
    "name": "1 AS IS   Tax Declaration & Refund   Legacy EJB WebLogic",
    "shortName": "1 AS IS",
    "domain": "Banking",
    "subDomain": "Imported",
    "status": "In Progress",
    "version": "1.0",
    "release": "—",
    "owner": {
      "id": "USR-DRAFT",
      "name": "Saadaoui Abdessalem",
      "role": "Functional Analyst",
      "email": "",
      "department": ""
    },
    "businessOwner": "",
    "programme": "",
    "summary": "Imported into this browser from a spreadsheet on 2026-08-29. It is a draft: it is not on the published site until its bundle is committed.",
    "businessObjective": "Analyse the functional and technical architecture of a legacy tax declaration and refund platform based on EJB, WebLogic and DB2, identify business processes, integrations, data dependencies, technical constraints and modernization pain points.",
    "inScope": [
      "Legacy EJB/WebLogic architecture analysis",
      "DB2 legacy schema documentation (TAXPAYER, DECLARATION, DECLARATION_LINE, REFUND, PAYMENT, AUDIT_LOG)",
      "BPMN and sequence diagrams of the current declaration/refund process",
      "Legacy EJB interface inventory (documented as pseudo-API endpoints)",
      "Pain-points register motivating the future TO-BE modernization",
      "Functional test cases against the legacy behaviour"
    ],
    "outOfScope": [
      "Any code change to the legacy EJB/WebLogic application",
      "Production data migration or extraction",
      "New feature development on the legacy platform",
      "Performance tuning or capacity planning of the legacy platform",
      "Design of the TO-BE target architecture (covered by the separate TO-BE project)"
    ],
    "stakeholders": [
      {
        "id": "STK-001",
        "name": "Saadaoui Abdessalem",
        "role": "Technical Analyst",
        "email": "abdessalem.saadaoui@case-study.example",
        "department": "IT Architecture",
        "raci": "Consulted"
      },
      {
        "id": "STK-002",
        "name": "Jean-Philippe Collin",
        "role": "Business Sponsor",
        "email": "jean-philippe.collin@case-study.example",
        "department": "Business Operations",
        "raci": "Consulted"
      },
      {
        "id": "STK-003",
        "name": "Nicolas Leroy",
        "role": "Product Owner",
        "email": "nicolas.leroy@case-study.example",
        "department": "Digital Strategy",
        "raci": "Consulted"
      },
      {
        "id": "STK-004",
        "name": "Noureddine Ouzoubair",
        "role": "Senior Business Analyst",
        "email": "noureddine.ouzoubair@case-study.example",
        "department": "Business Operations",
        "raci": "Consulted"
      },
      {
        "id": "STK-005",
        "name": "Tax Administration Agent (business representative)",
        "role": "Business SME",
        "email": "tax-agent-rep@case-study.example",
        "department": "Front Office",
        "raci": "Consulted"
      },
      {
        "id": "STK-006",
        "name": "Payment Operations Lead",
        "role": "Operations",
        "email": "payment-ops-lead@case-study.example",
        "department": "Operations",
        "raci": "Consulted"
      },
      {
        "id": "STK-007",
        "name": "System Administrator (WebLogic/DB2)",
        "role": "Infrastructure",
        "email": "sysadmin@case-study.example",
        "department": "IT Infrastructure",
        "raci": "Consulted"
      }
    ],
    "timeline": [
      {
        "id": "TL-001",
        "label": "Kickoff and stakeholder interviews",
        "date": "2026-01-05",
        "status": "Upcoming",
        "description": "Initial interviews with the Business Sponsor, Product Owner and Business Analyst to frame the AS-IS analysis."
      },
      {
        "id": "TL-002",
        "label": "Legacy architecture discovery",
        "date": "2026-01-12",
        "status": "Upcoming",
        "description": "EJB interface inventory, WebLogic domain review, DB2 schema extraction."
      },
      {
        "id": "TL-003",
        "label": "Business process and BPMN modelling",
        "date": "2026-01-17",
        "status": "Upcoming",
        "description": "Documented the declaration, validation, calculation, refund and payment flow as BPMN and sequence diagrams."
      },
      {
        "id": "TL-004",
        "label": "Pain points workshop",
        "date": "2026-01-22",
        "status": "Upcoming",
        "description": "Consolidated the eight legacy pain points that motivate the TO-BE modernization business case."
      },
      {
        "id": "TL-005",
        "label": "AS-IS sign-off",
        "date": "2026-01-27",
        "status": "Upcoming",
        "description": "Business sign-off by the Business Sponsor and Product Owner, reviewed by the Business Analyst."
      }
    ],
    "dependencies": [
      {
        "id": "DEP-001",
        "name": "Access to the legacy WebLogic admin console",
        "type": "Internal System",
        "owner": "System Administrator (WebLogic/DB2)",
        "status": "Resolved",
        "description": "Needed to inspect the EJB deployment descriptors and the WebLogic domain configuration."
      },
      {
        "id": "DEP-002",
        "name": "DB2 schema export",
        "type": "Internal System",
        "owner": "System Administrator (WebLogic/DB2)",
        "status": "Resolved",
        "description": "Needed to document the TAXPAYER/DECLARATION/REFUND/PAYMENT/AUDIT_LOG tables accurately."
      },
      {
        "id": "DEP-003",
        "name": "Business SME availability for interviews",
        "type": "Internal System",
        "owner": "Noureddine Ouzoubair",
        "status": "Resolved",
        "description": "Legacy business rules (eligibility, refund calculation) could only be confirmed through interviews with the domain SME."
      }
    ],
    "risks": [
      {
        "id": "RISK-001",
        "description": "Legacy documentation is incomplete or outdated compared to the actual EJB code and DB2 schema.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Cross-check the EJB deployment descriptors and DB2 DDL directly rather than relying on outdated documentation.",
        "owner": "Saadaoui Abdessalem"
      },
      {
        "id": "RISK-002",
        "description": "The legacy business SME is unavailable during the discovery window, delaying validation of tax eligibility rules.",
        "likelihood": "Low",
        "impact": "Medium",
        "mitigation": "Schedule interviews early in the timeline and record sessions for later reference.",
        "owner": "Noureddine Ouzoubair"
      }
    ],
    "tags": [],
    "startDate": "2026-01-05",
    "targetDate": "",
    "lastUpdated": "2026-08-29",
    "completion": 0,
    "regulatoryDrivers": [],
    "id": "PRJ-TAX-001",
    "metrics": {
      "requirements": 9,
      "businessRules": 8,
      "apis": 6,
      "documents": 6,
      "testCases": 11,
      "actors": 6,
      "diagrams": 9
    }
  },
];

/** The project the workspace opens on. */
export const ACTIVE_PROJECT_ID = "PRJ-IPH-023";

export const activeProject = projects.find((p) => p.id === ACTIVE_PROJECT_ID)!;

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
