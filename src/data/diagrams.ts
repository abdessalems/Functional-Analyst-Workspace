import type { Diagram, Wireframe } from "@/lib/types";

/**
 * PlantUML models maintained alongside the specification. The `source` is the
 * authoritative artefact; previews are rendered client-side from the same model.
 */
export const diagrams: Diagram[] = [
  {
    id: "UML-001",
    title: "Instant Payment — Use Case Model",
    type: "Use Case",
    description:
      "Actors and use cases in scope for release 2.3, including the servicing and back-office capabilities introduced alongside the customer journey.",
    version: "2.3",
    author: "Amelia Fontaine",
    lastUpdated: "2025-04-30",
    relatedRequirements: ["REQ-001", "REQ-010", "REQ-012", "REQ-013"],
    source: `@startuml IPH-UseCase
left to right direction
skinparam packageStyle rectangle

actor "Retail Customer" as RC
actor "SME Customer" as SC
actor "Contact Centre Agent" as CCA
actor "Payments Ops Officer" as POO
actor "Compliance Officer" as CO
actor "TIPS Scheme" as TIPS

rectangle "Instant Payments Hub" {
  usecase "Initiate Instant Payment" as UC1
  usecase "Verify Payee" as UC2
  usecase "Check Payment Status" as UC3
  usecase "Manage Payment Limits" as UC4
  usecase "Raise Recall Request" as UC5
  usecase "Adjudicate Compliance Hold" as UC6
  usecase "Reconcile Settlement" as UC7
  usecase "Receive Inbound Payment" as UC8
}

RC --> UC1
RC --> UC3
RC --> UC4
SC --> UC1
SC --> UC3
CCA --> UC3
CCA --> UC5
POO --> UC5
POO --> UC7
CO  --> UC6
TIPS --> UC8

UC1 ..> UC2 : <<include>>
UC1 ..> UC6 : <<extend>>
UC5 ..> UC7 : <<include>>
@enduml`,
  },
  {
    id: "UML-002",
    title: "Outbound Payment — Sequence Diagram",
    type: "Sequence",
    description:
      "Synchronous interaction between the channel, the hub, the financial crime services, the core ledger and the TIPS gateway, annotated with the stage latency budgets.",
    version: "2.3",
    author: "Priya Raghunathan",
    lastUpdated: "2025-05-14",
    relatedRequirements: ["REQ-001", "REQ-003", "REQ-005", "REQ-006"],
    source: `@startuml IPH-Sequence
autonumber
participant "Mobile App" as APP
participant "Instant Payments Hub" as IPH
participant "VoP Service" as VOP
participant "Fraud Engine" as FRD
participant "Sanctions Screening" as SAN
participant "Core Ledger (T24)" as LDG
participant "TIPS Gateway" as TIPS

APP -> IPH : POST /payments (pain-like request)
activate IPH
IPH -> IPH : validate structure (300 ms)
IPH -> VOP : verifyPayee(iban, name)
VOP --> IPH : CLOSE_MATCH (1,500 ms budget)
IPH --> APP : confirmation required
APP -> IPH : customer confirmed
IPH -> FRD : score(paymentContext)
FRD --> IPH : score = 41 (800 ms)
IPH -> SAN : screen(parties)
SAN --> IPH : CLEAR (1,200 ms)
IPH -> LDG : reserveFunds(amount, ttl=25s)
LDG --> IPH : reservationId
IPH -> TIPS : pacs.008
TIPS --> IPH : pacs.002 ACCP (4,000 ms budget)
IPH -> LDG : convertReservation(reservationId)
LDG --> IPH : postingReference
IPH --> APP : 201 ACCP + schemeReference
deactivate IPH
@enduml`,
  },
  {
    id: "UML-003",
    title: "Instant Payments Hub — Component Diagram",
    type: "Component",
    description:
      "Logical component decomposition of the hub and its integration points with internal platforms and external scheme infrastructure.",
    version: "2.2",
    author: "Priya Raghunathan",
    lastUpdated: "2025-03-27",
    relatedRequirements: ["REQ-006", "REQ-019", "REQ-022"],
    source: `@startuml IPH-Component
skinparam componentStyle rectangle

package "Digital Channels" {
  [Mobile Banking App]
  [Internet Banking Portal]
}

package "Instant Payments Hub" {
  [Payment API Gateway]
  [Orchestration Engine]
  [Validation Service]
  [Limit Service]
  [Scheme Adapter]
  [Reconciliation Service]
  database "Payment Store" as PS
}

package "Financial Crime" {
  [Fraud Decision Engine]
  [Sanctions Screening]
}

package "Core Platforms" {
  [Core Banking T24]
  [Notification Service]
  [Audit Store]
}

cloud "TIPS / ESMIG" as TIPS

[Mobile Banking App] --> [Payment API Gateway] : HTTPS / OAuth2
[Internet Banking Portal] --> [Payment API Gateway] : HTTPS / OAuth2
[Payment API Gateway] --> [Orchestration Engine]
[Orchestration Engine] --> [Validation Service]
[Orchestration Engine] --> [Limit Service]
[Orchestration Engine] --> [Fraud Decision Engine] : REST
[Orchestration Engine] --> [Sanctions Screening] : REST
[Orchestration Engine] --> [Core Banking T24] : reservation API
[Orchestration Engine] --> [Scheme Adapter]
[Scheme Adapter] --> TIPS : ISO 20022
[Orchestration Engine] --> PS
[Orchestration Engine] --> [Audit Store] : append-only
[Orchestration Engine] --> [Notification Service] : events
[Reconciliation Service] --> PS
[Reconciliation Service] --> TIPS : camt.053
@enduml`,
  },
  {
    id: "UML-004",
    title: "Payment Validation — Activity Diagram",
    type: "Activity",
    description:
      "Decision logic applied between request intake and scheme submission, including the compensating release path.",
    version: "2.3",
    author: "Amelia Fontaine",
    lastUpdated: "2025-05-06",
    relatedRequirements: ["REQ-002", "REQ-004", "REQ-005", "REQ-011"],
    source: `@startuml IPH-Activity
start
:Receive payment request;
if (Amount <= 100,000 EUR and currency = EUR?) then (no)
  :Reject IPH-VAL-001;
  :Offer standard SCT;
  stop
endif
:Verify payee;
if (VoP result?) then (NO_MATCH and first use)
  :Block IPH-VOP-022;
  stop
elseif (CLOSE_MATCH) then
  :Request customer confirmation;
endif
:Evaluate limits;
if (Within 24h limit?) then (no)
  :Reject IPH-LIM-002;
  stop
endif
:Score fraud risk;
if (Score >= 85?) then (yes)
  :Block and create fraud case;
  stop
elseif (Score >= 60?) then (yes)
  :Step-up authentication;
endif
:Screen sanctions;
if (Hit?) then (yes)
  :Hold for compliance review;
  stop
endif
:Reserve funds;
:Submit pacs.008;
if (pacs.002 ACCP within 10s?) then (yes)
  :Convert reservation to debit;
  :Notify customer;
  stop
else (no)
  :Release reservation;
  :Reject with scheme reason;
  stop
endif
@enduml`,
  },
  {
    id: "UML-005",
    title: "Payment Lifecycle — State Machine",
    type: "State",
    description:
      "Permitted payment states and transitions. Terminal states are immutable; late scheme messages create linked exception records.",
    version: "2.3",
    author: "Priya Raghunathan",
    lastUpdated: "2025-05-14",
    relatedRequirements: ["REQ-007", "REQ-012", "REQ-013"],
    source: `@startuml IPH-State
[*] --> RCVD : request accepted
RCVD --> VALD : structural validation passed
RCVD --> RJCT : validation failed
VALD --> COOLING_OFF : first-use beneficiary > 5,000 EUR
COOLING_OFF --> SCRN : 30 minutes elapsed
COOLING_OFF --> CANC : customer cancelled
VALD --> SCRN : controls invoked
SCRN --> HELD : sanctions hit
SCRN --> RJCT : fraud block
SCRN --> RSVD : controls cleared
RSVD --> SUBM : pacs.008 submitted
SUBM --> ACCP : pacs.002 ACCP
SUBM --> RJCT : pacs.002 RJCT or timeout
HELD --> ACCP : compliance released
HELD --> RJCT : compliance rejected
ACCP --> RECALLED : recall accepted by beneficiary bank
ACCP --> [*]
RJCT --> [*]
CANC --> [*]
RECALLED --> [*]
@enduml`,
  },
];

export const wireframes: Wireframe[] = [
  {
    id: "WF-001",
    title: "Instant Payment — Amount & Beneficiary",
    screenId: "SCR-PAY-01",
    description:
      "Primary capture screen for a new instant payment. Presents the instant badge, the remaining daily allowance and inline IBAN validation.",
    channel: "Mobile",
    version: "2.3",
    status: "Approved",
    author: "Hannah Okafor",
    lastUpdated: "2025-03-19",
    annotations: [
      "The instant badge is shown only once beneficiary reachability has been confirmed.",
      "The remaining daily allowance is refreshed on every screen entry.",
      "IBAN validation is inline and non-blocking until the field loses focus.",
    ],
    relatedRequirements: ["REQ-001", "REQ-009", "REQ-010"],
  },
  {
    id: "WF-002",
    title: "Verification of Payee — Close Match",
    screenId: "SCR-PAY-02",
    description:
      "Interstitial presented when the beneficiary name is a close match, showing the registered name and requiring an explicit customer decision.",
    channel: "Mobile",
    version: "2.3",
    status: "Approved",
    author: "Hannah Okafor",
    lastUpdated: "2025-04-02",
    annotations: [
      "The registered name is displayed exactly as held by the beneficiary bank.",
      "Continue is a secondary action; Amend details is the visually primary action.",
      "The customer decision is written to the audit trail with the match score.",
    ],
    relatedRequirements: ["REQ-002"],
  },
  {
    id: "WF-003",
    title: "Payment Confirmation & SCA Challenge",
    screenId: "SCR-PAY-03",
    description:
      "Review and authorise screen with dynamic linking: the challenge repeats the exact amount and beneficiary name.",
    channel: "Mobile",
    version: "2.3",
    status: "Approved",
    author: "Hannah Okafor",
    lastUpdated: "2025-03-26",
    annotations: [
      "Amount and payee are restated inside the biometric prompt to satisfy dynamic linking.",
      "Any amendment invalidates the challenge and issues a new one.",
      "Exempted payments show an explanatory note in place of the challenge.",
    ],
    relatedRequirements: ["REQ-017"],
  },
  {
    id: "WF-004",
    title: "Payment Result — Settled",
    screenId: "SCR-PAY-04",
    description:
      "Success state showing the scheme reference, the settlement timestamp and the updated available balance.",
    channel: "Mobile",
    version: "2.3",
    status: "Approved",
    author: "Hannah Okafor",
    lastUpdated: "2025-03-26",
    annotations: [
      "The scheme reference is copyable for customer records.",
      "Share receipt generates a PDF confirmation.",
    ],
    relatedRequirements: ["REQ-001", "REQ-015"],
  },
  {
    id: "WF-005",
    title: "Payment Result — Rejected with Fallback",
    screenId: "SCR-PAY-05",
    description:
      "Failure state presenting the translated scheme reason and a single-tap fallback to a standard SEPA credit transfer.",
    channel: "Mobile",
    version: "2.2",
    status: "Approved",
    author: "Hannah Okafor",
    lastUpdated: "2025-04-09",
    annotations: [
      "Scheme reason codes are never shown raw; the mapping table supplies plain-language text.",
      "The fallback retains all captured details and states the next value date.",
    ],
    relatedRequirements: ["REQ-007", "REQ-016"],
  },
  {
    id: "WF-006",
    title: "Operations Console — Exception Queues",
    screenId: "SCR-OPS-01",
    description:
      "Back-office triage workspace listing compliance holds, fraud reviews, failed reservations and reconciliation breaks with four-eyes release.",
    channel: "Back Office",
    version: "1.0",
    status: "In Review",
    author: "Marcus Delacroix",
    lastUpdated: "2025-09-08",
    annotations: [
      "Queue counts refresh every 30 seconds without a full page reload.",
      "Release requires a second authoriser; the action is disabled for the initiator.",
      "Every action writes to the immutable audit trail with a business justification.",
    ],
    relatedRequirements: ["REQ-023", "REQ-003"],
  },
];

export function getDiagramById(id: string): Diagram | undefined {
  return diagrams.find((diagram) => diagram.id === id);
}

export function getWireframeById(id: string): Wireframe | undefined {
  return wireframes.find((wireframe) => wireframe.id === id);
}
