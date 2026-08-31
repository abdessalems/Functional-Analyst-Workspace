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
    stack: ["Java", "Spring Boot", "ISO 20022", "TIPS"],
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
    stack: ["Java", "Spring Boot", "PostgreSQL", "Swagger", "OpenAPI"],
  },

  {
    "code": "TAX-1.0",
    "name": "AS-IS — Tax Declaration & Refund (Legacy EJB / WebLogic)",
    "shortName": "AS-IS Tax Declaration",
    "domain": "Public Sector",
    "subDomain": "Tax & Revenue",
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
    "summary": "The tax declaration and refund service as it runs today: synchronous EJB components on Oracle WebLogic, writing to DB2, with the calculation and refund path carried by scheduled batches. The analysis documents what the system does now, where the coupling sits, and which constraints make each change slow and risky.",
    "businessObjective": "Establish an accurate baseline of the existing service — its requirements, rules, actors, interfaces and data — so that the target architecture can be judged against what it actually replaces.",
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
    "tags": ["AS-IS analysis","Legacy","Idempotency","INVEST"],
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
    },
    "stack": ["Oracle WebLogic","EJB","Java","DB2","Excel"],
  },
  {
    "code": "TAX-2.0",
    "name": "TO-BE — Tax Declaration & Refund (Cloud-Native)",
    "shortName": "TO-BE Tax Declaration",
    "domain": "Public Sector",
    "subDomain": "Tax & Revenue",
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
    "summary": "The same service re-analysed as Java microservices on Kubernetes: REST contracts written to the Belgif standard, declarations accepted asynchronously with events published to Artemis, and the refund payment orchestrated as a Saga with idempotent retries so a replay can never pay twice.",
    "businessObjective": "Define the target architecture in enough detail to be built from: the API contracts, the event flows, the data model on DB2, and the acceptance criteria that decide whether each requirement was met.",
    "inScope": [
      "Target microservices architecture: Declaration, Validation, Refund, Payment, Notification",
      "REST / OpenAPI 3.1 contracts, versioned under /v1",
      "Artemis event/command catalogue (commands vs events)",
      "Saga orchestration, Retry policy, Idempotency and DLQ design",
      "DB2 logical data ownership model per service",
      "Docker/Kubernetes deployment view (design only)",
      "Belgif-aligned API governance checklist",
      "Postman test scenario definitions (happy path, retry, idempotency, DLQ)",
      "Non-functional requirements: performance, availability, scalability, security, observability"
    ],
    "outOfScope": [
      "Actual implementation/coding of the microservices (optional bonus, see Phase 3 plan)",
      "Production deployment or real Kubernetes cluster operation",
      "Data migration from the legacy DB2 schema",
      "Formal Belgif certification (a governance checklist is produced, not a certification)",
      "Execution of load/performance tests (scenarios are defined, not run)"
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
        "name": "Site Reliability Engineer",
        "role": "Infrastructure",
        "email": "sre-lead@case-study.example",
        "department": "IT Infrastructure",
        "raci": "Consulted"
      },
      {
        "id": "STK-008",
        "name": "IT Security Officer",
        "role": "Security & Compliance",
        "email": "security-officer@case-study.example",
        "department": "Security & Compliance",
        "raci": "Consulted"
      }
    ],
    "timeline": [
      {
        "id": "TL-001",
        "label": "Target architecture design",
        "date": "2026-03-05",
        "status": "Upcoming",
        "description": "Defined the five-service decomposition and the overall component/context diagram."
      },
      {
        "id": "TL-002",
        "label": "API and event contract definition",
        "date": "2026-03-16",
        "status": "Upcoming",
        "description": "OpenAPI 3.1 contracts for Declaration/Refund/Payment/Ops APIs; Artemis command/event catalogue."
      },
      {
        "id": "TL-003",
        "label": "Resilience pattern design",
        "date": "2026-03-21",
        "status": "Upcoming",
        "description": "Saga state machine, retry policy with exponential backoff, idempotency, and DLQ design."
      },
      {
        "id": "TL-004",
        "label": "Belgif governance checklist review",
        "date": "2026-03-24",
        "status": "Upcoming",
        "description": "Reviewed the ten public/service endpoints against the API governance checklist."
      },
      {
        "id": "TL-005",
        "label": "TO-BE sign-off",
        "date": "2026-03-27",
        "status": "Upcoming",
        "description": "Business sign-off by the Business Sponsor and Product Owner, reviewed by the Business Analyst."
      },
      {
        "id": "TL-006",
        "label": "Optional proof-of-concept (Phase 3)",
        "date": "2026-04-15",
        "status": "Upcoming",
        "description": "Bonus scope: a small runnable vertical slice on Docker/kind, not required for the case study."
      }
    ],
    "dependencies": [
      {
        "id": "DEP-001",
        "name": "AS-IS analysis frozen and signed off",
        "type": "Internal System",
        "owner": "Nicolas Leroy",
        "status": "Resolved",
        "description": "The TO-BE design formally depends on the approved AS-IS baseline and its pain-points register."
      },
      {
        "id": "DEP-002",
        "name": "Applicable Belgif guideline documentation",
        "type": "Internal System",
        "owner": "Jean-Philippe Collin",
        "status": "Resolved",
        "description": "Needed to build the API governance checklist; final validation against the project's actual guidelines remains a real-project follow-up."
      },
      {
        "id": "DEP-003",
        "name": "Artemis broker reference documentation",
        "type": "Internal System",
        "owner": "Saadaoui Abdessalem",
        "status": "Resolved",
        "description": "Needed to define the command/event catalogue and the JMS-based service contracts."
      },
      {
        "id": "DEP-004",
        "name": "Db2 Community Edition Docker image (optional PoC only)",
        "type": "Internal System",
        "owner": "Saadaoui Abdessalem",
        "status": "On Track",
        "description": "Only needed if the optional Phase 3 proof-of-concept proceeds; the default local profile uses Postgres."
      }
    ],
    "risks": [
      {
        "id": "RISK-001",
        "description": "Belgif guidelines used in the checklist are inspired by public-sector principles but not verified against a specific real project standard.",
        "likelihood": "Medium",
        "impact": "Medium",
        "mitigation": "Explicitly frame the checklist as a starting point to validate against the actual applicable standard on a real engagement.",
        "owner": "Saadaoui Abdessalem"
      },
      {
        "id": "RISK-002",
        "description": "Saga complexity is underestimated for a five-service system, making the orchestration hard to reason about.",
        "likelihood": "Low",
        "impact": "High",
        "mitigation": "Keep orchestration centralized in the Refund Service rather than choreography across all services.",
        "owner": "Saadaoui Abdessalem"
      },
      {
        "id": "RISK-003",
        "description": "A real DB2 instance is too resource-heavy to run alongside five services and Kubernetes on a laptop for the optional PoC.",
        "likelihood": "Medium",
        "impact": "Low",
        "mitigation": "Default to Postgres locally and keep a documented Db2 profile as a stretch option (see Phase 3 plan).",
        "owner": "Saadaoui Abdessalem"
      },
      {
        "id": "RISK-004",
        "description": "Scope creep into full implementation reduces the depth of the analysis and design deliverables.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Freeze the AS-IS and TO-BE Excel files as the primary deliverable; treat implementation as optional bonus scope only.",
        "owner": "Nicolas Leroy"
      }
    ],
    "tags": ["TO-BE architecture","Event-driven","Saga","Idempotency","INVEST","Scrum"],
    "startDate": "2026-03-03",
    "targetDate": "",
    "lastUpdated": "2026-08-29",
    "completion": 0,
    "regulatoryDrivers": [],
    "id": "PRJ-TAX-002",
    "metrics": {
      "requirements": 15,
      "businessRules": 14,
      "apis": 10,
      "documents": 8,
      "testCases": 16,
      "actors": 7,
      "diagrams": 11
    },
    "stack": ["Java","Microservices","Kubernetes","Docker","Artemis","DB2","REST","OpenAPI","Belgif","Postman"],
  },
  {
    "code": "EVE-1.0",
    "name": "Energy Risk Management — Business & Functional Analysis with Testing",
    "shortName": "Energy Risk Management",
    "domain": "Energy",
    "subDomain": "Risk & Compliance",
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
    "summary": "Portfolio case study, not client work. An end-to-end analysis of a risk management platform for the energy market, carried by one analyst through the whole lifecycle: stakeholder elicitation and business requirements, AS-IS and TO-BE process analysis, functional specifications with acceptance criteria and business rules, API and data design, and a test catalogue covering functional, regression, integration and negative scenarios — traced back to the requirement each one proves.",
    "businessObjective": "Show the working method of a Business Analyst / Functional Analyst who also tests: every requirement elicited from a stakeholder, specified precisely enough to build, and matched to the test that would prove it was delivered. The domain — exposure calculation, risk limits and breach handling on the energy market — is modelled realistically; the platform itself is a case study rather than a delivered client system.",
    "inScope": [
      "Portfolio exposure calculation",
      "Risk limit and threshold configuration",
      "Intraday risk monitoring dashboard",
      "Risk breach alert generation",
      "Trade and position search",
      "Functional validation of REST APIs",
      "Audit trail for risk decisions",
      "Role-based access",
      "Regression and integration testing",
      "AS-IS process mapping",
      "TO-BE process design",
      "Business process exceptions",
      "UAT preparation",
      "Defect lifecycle and triage",
      "Requirements traceability",
      "Non-functional acceptance checks"
    ],
    "outOfScope": [
      "Execution of energy trades",
      "Pricing model development",
      "Replacement of the enterprise identity provider",
      "Production infrastructure implementation",
      "Financial accounting and settlement",
      "Actual production deployment",
      "Real client confidential data"
    ],
    "stakeholders": [
      {
        "id": "STK-001",
        "name": "Elsa Carvalho",
        "role": "Business Analyst",
        "email": "",
        "department": "Business Analysis",
        "raci": "Accountable"
      },
      {
        "id": "STK-002",
        "name": "Teresa Gomes",
        "role": "Functional Analyst",
        "email": "",
        "department": "Functional Analysis",
        "raci": "Responsible"
      },
      {
        "id": "STK-003",
        "name": "Risk Manager",
        "role": "Risk Management — business owner of exposure limits and breach handling",
        "email": "",
        "department": "Risk Management",
        "raci": "Consulted"
      },
      {
        "id": "STK-004",
        "name": "QA / Test Lead",
        "role": "Owns the test strategy and the defect process",
        "email": "",
        "department": "Quality Assurance",
        "raci": "Informed"
      }
    ],
    "timeline": [
      {
        "id": "TL-001",
        "label": "Discovery & stakeholder interviews",
        "date": "2026-09-01",
        "status": "Upcoming",
        "description": "Interview Risk Manager, Risk Analysts and Trading stakeholders; document current pain points."
      },
      {
        "id": "TL-002",
        "label": "AS-IS process analysis",
        "date": "2026-09-04",
        "status": "Upcoming",
        "description": "Map current manual exposure calculation and breach review process."
      },
      {
        "id": "TL-003",
        "label": "Requirements workshop",
        "date": "2026-09-08",
        "status": "Upcoming",
        "description": "Prioritize functional and non-functional requirements."
      },
      {
        "id": "TL-004",
        "label": "Functional specification",
        "date": "2026-09-15",
        "status": "Upcoming",
        "description": "Produce process flows, rules, API expectations and acceptance criteria."
      },
      {
        "id": "TL-005",
        "label": "Development sprint",
        "date": "2026-09-28",
        "status": "Upcoming",
        "description": "Development team implements prioritized stories."
      },
      {
        "id": "TL-006",
        "label": "System / integration testing",
        "date": "2026-10-12",
        "status": "Upcoming",
        "description": "Execute functional, regression and integration test suites."
      },
      {
        "id": "TL-007",
        "label": "Sprint 1 - Exposure",
        "date": "2026-09-28",
        "status": "Upcoming",
        "description": "Implement portfolio exposure calculation and core API."
      },
      {
        "id": "TL-008",
        "label": "Sprint 2 - Breaches",
        "date": "2026-10-12",
        "status": "Upcoming",
        "description": "Implement threshold evaluation, breach workflow and notifications."
      },
      {
        "id": "TL-009",
        "label": "Sprint 3 - Search & Reporting",
        "date": "2026-10-26",
        "status": "Upcoming",
        "description": "Implement filtering, pagination and export."
      },
      {
        "id": "TL-010",
        "label": "UAT preparation",
        "date": "2026-11-09",
        "status": "Upcoming",
        "description": "Prepare UAT scenarios, data and entry/exit criteria."
      },
      {
        "id": "TL-011",
        "label": "UAT execution",
        "date": "2026-11-16",
        "status": "Upcoming",
        "description": "Business users validate end-to-end workflows."
      },
      {
        "id": "TL-012",
        "label": "Release readiness",
        "date": "2026-11-23",
        "status": "Upcoming",
        "description": "Review defects, traceability, regression results and acceptance."
      }
    ],
    "dependencies": [
      {
        "id": "DEP-001",
        "name": "Market Data API",
        "type": "Internal System",
        "owner": "Market Data Team",
        "status": "On Track",
        "description": "Provides latest approved market prices used in exposure calculation."
      },
      {
        "id": "DEP-002",
        "name": "Trade Position API",
        "type": "Internal System",
        "owner": "Trading IT",
        "status": "On Track",
        "description": "Provides validated trade and position information."
      },
      {
        "id": "DEP-003",
        "name": "Identity & Access Management",
        "type": "Internal System",
        "owner": "Security Team",
        "status": "On Track",
        "description": "Provides user authentication and role claims."
      },
      {
        "id": "DEP-004",
        "name": "Notification Service",
        "type": "Internal System",
        "owner": "Platform Team",
        "status": "On Track",
        "description": "Sends email/in-app notifications for critical risk breaches."
      },
      {
        "id": "DEP-005",
        "name": "Email Notification Provider",
        "type": "Internal System",
        "owner": "Notification Platform Team",
        "status": "On Track",
        "description": "Required for external critical-breach email delivery."
      },
      {
        "id": "DEP-006",
        "name": "Reference Risk Limit Store",
        "type": "Internal System",
        "owner": "Risk Data Team",
        "status": "On Track",
        "description": "Provides approved portfolio risk limits."
      },
      {
        "id": "DEP-007",
        "name": "Synthetic Test Data Set",
        "type": "Internal System",
        "owner": "QA/Test Lead",
        "status": "On Track",
        "description": "Representative portfolios, positions, limits and market prices are required."
      },
      {
        "id": "DEP-008",
        "name": "UAT Business Availability",
        "type": "Internal System",
        "owner": "Risk Management",
        "status": "On Track",
        "description": "Risk users must be available to validate scenarios and accept outcomes."
      },
      {
        "id": "DEP-009",
        "name": "API Contract Approval",
        "type": "Internal System",
        "owner": "Architecture Team",
        "status": "On Track",
        "description": "API contracts must be reviewed before integration testing."
      }
    ],
    "risks": [
      {
        "id": "RSK-001",
        "description": "Market data may arrive late or contain stale prices.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Display data timestamp; block calculation when data freshness exceeds configured threshold.",
        "owner": "Risk Manager"
      },
      {
        "id": "RSK-002",
        "description": "Different stakeholders may interpret exposure thresholds differently.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Run requirement workshops; document rules and obtain business-owner approval.",
        "owner": "Business Analyst"
      },
      {
        "id": "RSK-003",
        "description": "Duplicate events could create duplicate breach alerts.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Use event identifier and idempotency rule; add integration tests.",
        "owner": "Functional Analyst"
      },
      {
        "id": "RSK-004",
        "description": "Manual legacy spreadsheet results may differ from the new calculation.",
        "likelihood": "High",
        "impact": "Medium",
        "mitigation": "Run parallel reconciliation with representative historical portfolios.",
        "owner": "QA/Test Lead"
      },
      {
        "id": "RSK-005",
        "description": "Notification delivery may fail after a critical breach is persisted.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Decouple breach persistence from notification; retry failed notifications and monitor DLQ.",
        "owner": "Operations Manager"
      },
      {
        "id": "RSK-006",
        "description": "Exporting large result sets may impact API performance.",
        "likelihood": "Medium",
        "impact": "Medium",
        "mitigation": "Use asynchronous export for large datasets and enforce maximum filters/page sizes.",
        "owner": "Product Owner"
      },
      {
        "id": "RSK-007",
        "description": "Requirements change after development begins.",
        "likelihood": "Medium",
        "impact": "Medium",
        "mitigation": "Use backlog refinement, change impact analysis and Product Owner approval.",
        "owner": "Product Owner"
      },
      {
        "id": "RSK-008",
        "description": "Critical defect discovered late in UAT.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Define critical-path tests early and execute regression continuously.",
        "owner": "QA/Test Lead"
      },
      {
        "id": "RSK-009",
        "description": "Insufficient representative test data.",
        "likelihood": "Medium",
        "impact": "High",
        "mitigation": "Create controlled synthetic portfolios covering normal, boundary and breach scenarios.",
        "owner": "Business Tester"
      },
      {
        "id": "RSK-010",
        "description": "Ambiguous ownership of risk-limit changes.",
        "likelihood": "Low",
        "impact": "High",
        "mitigation": "Document RACI and enforce authorization rules.",
        "owner": "Business Analyst"
      }
    ],
    "tags": ["Portfolio case study", "Risk Management","Energy","Agile","Scrum","Functional specification","UAT","Regression testing","Integration testing","API testing","Test automation","Defect management"],
    "startDate": "2026-08-29",
    "targetDate": "",
    "lastUpdated": "2026-08-29",
    "completion": 0,
    "regulatoryDrivers": [],
    "id": "PRJ-EVE-003",
    "metrics": {
      "requirements": 20,
      "businessRules": 22,
      "apis": 9,
      "documents": 12,
      "testCases": 50,
      "actors": 6,
      "diagrams": 22
    },
    "stack": ["REST API","Swagger","OpenAPI","SQL","ALM","SpiraTest","Visio","Excel"],
  },
];

/** The project the workspace opens on. */
export const ACTIVE_PROJECT_ID = "PRJ-IPH-023";

export const activeProject = projects.find((p) => p.id === ACTIVE_PROJECT_ID)!;

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
