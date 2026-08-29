/**
 * Writes the example workbook the studio ships as its starting point.
 *
 * One small but complete project — a card dispute raised in a banking app —
 * carried through every artefact the studio reads, so the layout is shown being
 * used rather than described. Run: node scripts/make-sample.mjs <path>
 */
import * as XLSX from "xlsx";

const OWNER = "Saadaoui Abdessalem";

const requirements = [
  {
    ID: "BR-001",
    Title: "Raise a card dispute from a settled transaction",
    "Business Need":
      "Disputes arrive by phone and are keyed by an agent, which costs 11 minutes per case and loses the evidence trail.",
    Description:
      "A cardholder selects a settled transaction from the last 120 days and raises a dispute against it, choosing a reason code.",
    Priority: "Critical",
    Status: "Approved",
    Category: "Disputes",
    MoSCoW: "Must",
    Owner: OWNER,
    "Last Updated": "2026-02-10",
    Version: "1.2",
    Rules: "RULE-001, RULE-002",
    Tests: "TC-001, TC-002",
    APIs: "API-001",
    Documents: "DOC-001",
  },
  {
    ID: "BR-002",
    Title: "Credit the cardholder provisionally within one working day",
    "Business Need":
      "Regulation requires the funds to be restored while the case is investigated; today it is manual and late.",
    Description:
      "Once a dispute is accepted, a provisional credit for the disputed amount is posted to the cardholder account.",
    Priority: "Critical",
    Status: "Approved",
    Category: "Disputes",
    MoSCoW: "Must",
    Owner: OWNER,
    "Last Updated": "2026-02-10",
    Version: "1.1",
    Rules: "RULE-003",
    Tests: "TC-003",
    APIs: "API-002",
    Documents: "DOC-001",
  },
  {
    ID: "BR-003",
    Title: "Let the cardholder attach evidence to an open dispute",
    "Business Need":
      "Cases stall waiting for a receipt that the cardholder already has on their phone.",
    Description:
      "Up to five files of 10 MB each may be attached to a dispute while its status is Under Review.",
    Priority: "High",
    Status: "In Review",
    Category: "Disputes",
    MoSCoW: "Should",
    Owner: OWNER,
    "Last Updated": "2026-02-14",
    Version: "0.4",
    Rules: "RULE-004",
    Tests: "TC-004",
    APIs: "API-003",
    Documents: "",
  },
  {
    ID: "BR-004",
    Title: "Notify the cardholder at every change of dispute status",
    "Business Need":
      "Two thirds of calls to the contact centre are cardholders asking where their case stands.",
    Description:
      "A notification is sent when a dispute moves to Under Review, Resolved or Rejected.",
    Priority: "Medium",
    Status: "Draft",
    Category: "Notifications",
    MoSCoW: "Should",
    Owner: OWNER,
    "Last Updated": "2026-02-18",
    Version: "0.2",
    Rules: "",
    Tests: "TC-005",
    APIs: "",
    Documents: "",
  },
];

const acceptanceCriteria = [
  {
    ID: "AC-001.1",
    Requirement: "BR-001",
    Given: "a settled card transaction dated within the last 120 days",
    When: "the cardholder raises a dispute and selects a reason code",
    Then: "the dispute is created with the status Submitted and a reference is shown",
  },
  {
    ID: "AC-001.2",
    Requirement: "BR-001",
    Given: "a transaction older than 120 days",
    When: "the cardholder opens it",
    Then: "the dispute action is unavailable and the reason is stated on screen",
  },
  {
    ID: "AC-001.3",
    Requirement: "BR-001",
    Given: "a transaction that already has an open dispute",
    When: "the cardholder tries to dispute it again",
    Then: "the existing case is shown instead of a second one being created",
  },
  {
    ID: "AC-002.1",
    Requirement: "BR-002",
    Given: "a dispute accepted at 16:00 on a working day",
    When: "the next end-of-day run completes",
    Then: "a provisional credit for the full disputed amount is posted",
  },
  {
    ID: "AC-002.2",
    Requirement: "BR-002",
    Given: "a dispute later rejected",
    When: "the rejection is recorded",
    Then: "the provisional credit is reversed and the cardholder is told why",
  },
  {
    ID: "AC-003.1",
    Requirement: "BR-003",
    Given: "a dispute with the status Under Review and four files already attached",
    When: "the cardholder attaches a fifth file of 8 MB",
    Then: "the file is accepted and the attach action is then disabled",
  },
  {
    ID: "AC-004.1",
    Requirement: "BR-004",
    Given: "a dispute that moves from Submitted to Under Review",
    When: "the status change is saved",
    Then: "exactly one notification is sent to the cardholder",
  },
];

const businessRules = [
  {
    ID: "RULE-001",
    Description: "A dispute may only be raised against a settled transaction.",
    Logic: "IF transaction.status <> 'SETTLED' THEN reject WITH 'NOT_DISPUTABLE'",
    Priority: "Critical",
    Source: "Scheme rules, chapter 11",
    Status: "Approved",
    Category: "Eligibility",
    Owner: OWNER,
    "Effective From": "2026-01-01",
    Requirements: "BR-001",
  },
  {
    ID: "RULE-002",
    Description: "A transaction is disputable for 120 days after its settlement date.",
    Logic: "IF today - transaction.settled_date > 120 THEN reject WITH 'WINDOW_CLOSED'",
    Priority: "Critical",
    Source: "Scheme rules, chapter 11",
    Status: "Approved",
    Category: "Eligibility",
    Owner: OWNER,
    "Effective From": "2026-01-01",
    Requirements: "BR-001",
  },
  {
    ID: "RULE-003",
    Description: "A provisional credit equals the disputed amount, never more.",
    Logic: "credit.amount = dispute.amount AND credit.amount <= transaction.amount",
    Priority: "Critical",
    Source: "Treasury policy 7.1",
    Status: "Approved",
    Category: "Settlement",
    Owner: OWNER,
    "Effective From": "2026-01-01",
    Requirements: "BR-002",
  },
  {
    ID: "RULE-004",
    Description: "At most five evidence files, each at most 10 MB, per dispute.",
    Logic: "IF files.count > 5 OR file.size > 10485760 THEN reject WITH 'ATTACHMENT_LIMIT'",
    Priority: "Medium",
    Source: "Operations handbook 3.4",
    Status: "In Review",
    Category: "Evidence",
    Owner: OWNER,
    "Effective From": "2026-03-01",
    Requirements: "BR-003",
  },
];

const actors = [
  {
    ID: "ACT-001",
    Name: "Cardholder",
    Type: "Human",
    Description: "The retail customer whose card was charged.",
    Responsibilities: "Raises the dispute; supplies evidence; accepts the outcome",
    Permissions: "Read own transactions; create dispute; attach evidence",
    Systems: "Mobile app; internet banking",
    Channel: "Mobile",
  },
  {
    ID: "ACT-002",
    Name: "Disputes agent",
    Type: "Human",
    Description: "Back-office analyst who investigates the case against the scheme rules.",
    Responsibilities: "Reviews evidence; decides the outcome; raises the chargeback",
    Permissions: "Read all disputes; change status; post adjustments",
    Systems: "Disputes console; card management system",
    Channel: "Back Office",
  },
  {
    ID: "ACT-003",
    Name: "Card scheme",
    Type: "External",
    Description: "Visa or Mastercard, which arbitrates the chargeback.",
    Responsibilities: "Accepts the chargeback; rules on representment",
    Permissions: "Receive chargeback messages",
    Systems: "Scheme gateway",
    Channel: "File transfer",
  },
  {
    ID: "ACT-004",
    Name: "Ledger",
    Type: "System",
    Description: "Posts the provisional credit and any later reversal.",
    Responsibilities: "Applies postings; guarantees a single posting per instruction",
    Permissions: "Write postings",
    Systems: "Core banking",
    Channel: "API",
  },
];

const processSteps = [
  {
    Flow: "PF-001",
    "Flow Name": "Raise and settle a card dispute",
    "Flow Description": "From the cardholder tapping Dispute to the case being closed.",
    Trigger: "The cardholder disputes a settled transaction",
    Outcome: "The case is Resolved or Rejected and the ledger agrees",
    SLA: "Provisional credit within 1 working day; outcome within 45 days",
    "Step ID": "S1",
    "Step Name": "Select the transaction",
    Type: "start",
    Lane: "Cardholder",
    Description: "The cardholder opens a settled transaction in the app.",
    Rules: "",
    Next: "S2",
  },
  {
    Flow: "PF-001",
    "Step ID": "S2",
    "Step Name": "Check the dispute is allowed",
    Type: "decision",
    Lane: "Disputes service",
    Description: "Status and the 120-day window are tested.",
    Rules: "RULE-001, RULE-002",
    Next: "S3, S9",
  },
  {
    Flow: "PF-001",
    "Step ID": "S3",
    "Step Name": "Capture the reason code",
    Type: "task",
    Lane: "Cardholder",
    Description: "The cardholder picks a reason and confirms the amount.",
    Rules: "",
    Next: "S4",
  },
  {
    Flow: "PF-001",
    "Step ID": "S4",
    "Step Name": "Create the dispute",
    Type: "system",
    Lane: "Disputes service",
    Description: "The case is created with the status Submitted.",
    Rules: "",
    Next: "S5",
  },
  {
    Flow: "PF-001",
    "Step ID": "S5",
    "Step Name": "Post the provisional credit",
    Type: "system",
    Lane: "Ledger",
    Description: "The disputed amount is credited while the case is investigated.",
    Rules: "RULE-003",
    Next: "S6",
  },
  {
    Flow: "PF-001",
    "Step ID": "S6",
    "Step Name": "Investigate the case",
    Type: "task",
    Lane: "Disputes agent",
    Description: "Evidence is read and the scheme rules applied.",
    Rules: "RULE-004",
    Next: "S7",
  },
  {
    Flow: "PF-001",
    "Step ID": "S7",
    "Step Name": "Raise the chargeback",
    Type: "task",
    Lane: "Card scheme",
    Description: "The chargeback is sent to the scheme for arbitration.",
    Rules: "",
    Next: "S8",
  },
  {
    Flow: "PF-001",
    "Step ID": "S8",
    "Step Name": "Close the case",
    Type: "end",
    Lane: "Disputes service",
    Description: "The case is Resolved; the provisional credit stands or is reversed.",
    Rules: "",
    Next: "",
  },
  {
    Flow: "PF-001",
    "Step ID": "S9",
    "Step Name": "Refuse the dispute",
    Type: "end",
    Lane: "Disputes service",
    Description: "The cardholder is told which condition failed.",
    Rules: "",
    Next: "",
  },
];

const diagrams = [
  {
    ID: "DGM-001",
    Title: "Who can do what with a dispute",
    Type: "Use Case",
    Description: "The actors around the dispute process and what each may initiate.",
    Version: "1.0",
    Author: OWNER,
    "Last Updated": "2026-02-10",
    Requirements: "BR-001, BR-003",
    PlantUML: `@startuml
left to right direction
skinparam packageStyle rectangle

actor "Cardholder" as CH
actor "Disputes agent" as AG
actor "Card scheme" as CS

rectangle "Card disputes" {
  usecase "Raise a dispute" as UC1
  usecase "Attach evidence" as UC2
  usecase "Investigate case" as UC3
  usecase "Raise chargeback" as UC4
  usecase "Notify cardholder" as UC5
}

CH --> UC1
CH --> UC2
AG --> UC3
AG --> UC4
UC4 --> CS
UC3 ..> UC5 : <<include>>
@enduml`,
  },
  {
    ID: "DGM-002",
    Title: "Raising a dispute, end to end",
    Type: "Sequence",
    Description: "The calls made from the tap on Dispute to the provisional credit.",
    Version: "1.1",
    Author: OWNER,
    "Last Updated": "2026-02-12",
    Requirements: "BR-001, BR-002",
    PlantUML: `@startuml
autonumber
actor Cardholder
participant "Mobile app" as App
participant "Disputes API" as API
database "Disputes DB" as DB
participant "Ledger" as Ledger

Cardholder -> App : tap Dispute
App -> API : POST /disputes
API -> API : check status and 120-day window
alt not eligible
  API --> App : 422 NOT_DISPUTABLE
  App --> Cardholder : reason shown
else eligible
  API -> DB : insert dispute (Submitted)
  API --> App : 201 Created
  API -> Ledger : POST /postings (provisional credit)
  Ledger --> API : posted
  API -> DB : status = Under Review
  API --> Cardholder : notification
end
@enduml`,
  },
  {
    ID: "DGM-003",
    Title: "The life of a dispute",
    Type: "State",
    Description: "Every status a dispute may hold and the moves allowed between them.",
    Version: "1.0",
    Author: OWNER,
    "Last Updated": "2026-02-12",
    Requirements: "BR-001, BR-004",
    PlantUML: `@startuml
[*] --> Submitted
Submitted --> UnderReview : accepted
Submitted --> Rejected : ineligible
UnderReview --> Resolved : in favour of cardholder
UnderReview --> Rejected : evidence insufficient
Rejected --> [*]
Resolved --> [*]

note right of UnderReview
  Provisional credit is
  in place from here
end note
@enduml`,
  },
  {
    ID: "DGM-004",
    Title: "Dispute data model",
    Type: "ER",
    Description: "The tables the dispute writes and the keys that join them.",
    Version: "1.0",
    Author: OWNER,
    "Last Updated": "2026-02-13",
    Requirements: "BR-001, BR-002",
    PlantUML: `@startuml
entity "card_transaction" as T {
  * transaction_id : uuid
  --
  card_id : uuid
  amount : numeric(15,2)
  settled_date : date
  status : varchar(20)
}

entity "dispute" as D {
  * dispute_id : uuid
  --
  transaction_id : uuid <<FK>>
  reason_code : varchar(10)
  amount : numeric(15,2)
  status : varchar(20)
  raised_at : timestamp
}

entity "dispute_evidence" as E {
  * evidence_id : uuid
  --
  dispute_id : uuid <<FK>>
  file_name : varchar(255)
  size_bytes : bigint
}

T ||--o{ D
D ||--o{ E
@enduml`,
  },
  {
    ID: "DGM-005",
    Title: "Dispute process, BPMN",
    Type: "BPMN",
    Description: "The same flow in BPMN notation, with the lanes that own each step.",
    Version: "1.0",
    Author: OWNER,
    "Last Updated": "2026-02-14",
    Requirements: "BR-001, BR-002",
    PlantUML: `@startuml
!theme plain
title Raise and settle a card dispute

|Cardholder|
start
:Select a settled transaction;
:Choose a reason code;

|Disputes service|
if (Eligible?) then (no)
  :Refuse and explain;
  stop
else (yes)
  :Create dispute (Submitted);
endif

|Ledger|
:Post provisional credit;

|Disputes agent|
:Investigate the evidence;
if (In favour of cardholder?) then (yes)
  :Raise chargeback;
  |Disputes service|
  :Close as Resolved;
else (no)
  |Ledger|
  :Reverse the credit;
  |Disputes service|
  :Close as Rejected;
endif
stop
@enduml`,
  },
];

const wireframes = [
  {
    ID: "WF-001",
    Title: "Transaction detail with the Dispute action",
    "Screen ID": "SCR-TXN-01",
    Description: "Where the cardholder starts, and where the 120-day rule becomes visible.",
    Channel: "Mobile",
    Version: "1.1",
    Status: "Approved",
    Author: OWNER,
    "Last Updated": "2026-02-11",
    Annotations:
      "Dispute button is disabled past 120 days; the reason is shown beneath it, never as a toast",
    Requirements: "BR-001",
  },
  {
    ID: "WF-002",
    Title: "Reason code selection",
    "Screen ID": "SCR-DSP-01",
    Description: "A short list of reasons in the cardholder's words, not the scheme's.",
    Channel: "Mobile",
    Version: "1.0",
    Status: "In Review",
    Author: OWNER,
    "Last Updated": "2026-02-13",
    Annotations: "Each reason carries one line of plain explanation; no scheme codes on screen",
    Requirements: "BR-001",
  },
  {
    ID: "WF-003",
    Title: "Open dispute with evidence",
    "Screen ID": "SCR-DSP-02",
    Description: "Case status, the provisional credit, and the attach action.",
    Channel: "Mobile",
    Version: "0.3",
    Status: "Draft",
    Author: OWNER,
    "Last Updated": "2026-02-18",
    Annotations: "Attach is hidden once five files exist, rather than shown failing",
    Requirements: "BR-003, BR-004",
  },
];

const apiEndpoints = [
  {
    Service: "Disputes API",
    "Base Path": "/disputes/v1",
    ID: "API-001",
    Method: "POST",
    Path: "/disputes",
    Summary: "Raise a dispute against a settled transaction",
    Description: "Checks eligibility, creates the case and returns its reference.",
    Tag: "Disputes",
    "Operation Id": "createDispute",
    Auth: "OAuth2, scope disputes.write",
    Requirements: "BR-001",
  },
  {
    Service: "Disputes API",
    "Base Path": "/disputes/v1",
    ID: "API-002",
    Method: "GET",
    Path: "/disputes/{disputeId}",
    Summary: "Read a dispute and its provisional credit",
    Description: "Returns the case, its status history and any posting made against it.",
    Tag: "Disputes",
    "Operation Id": "getDispute",
    Auth: "OAuth2, scope disputes.read",
    Requirements: "BR-002",
  },
  {
    Service: "Disputes API",
    "Base Path": "/disputes/v1",
    ID: "API-003",
    Method: "POST",
    Path: "/disputes/{disputeId}/evidence",
    Summary: "Attach an evidence file to an open dispute",
    Description: "Accepts up to five files of 10 MB while the case is Under Review.",
    Tag: "Evidence",
    "Operation Id": "addEvidence",
    Auth: "OAuth2, scope disputes.write",
    Requirements: "BR-003",
  },
  {
    Service: "Disputes API",
    "Base Path": "/disputes/v1",
    ID: "API-004",
    Method: "GET",
    Path: "/disputes",
    Summary: "List the disputes on a card",
    Description: "Paged, newest first, filtered by status.",
    Tag: "Disputes",
    "Operation Id": "listDisputes",
    Auth: "OAuth2, scope disputes.read",
    Requirements: "BR-001",
  },
];

const sqlValidations = [
  {
    ID: "SQL-001",
    Title: "Disputes raised outside the 120-day window",
    Purpose: "Proves RULE-002 holds in the data, not only in the code.",
    Database: "cards",
    SQL: `SELECT d.dispute_id,
       t.settled_date,
       d.raised_at::date - t.settled_date AS days_elapsed
FROM   dispute d
JOIN   card_transaction t ON t.transaction_id = d.transaction_id
WHERE  d.raised_at::date - t.settled_date > 120
ORDER  BY days_elapsed DESC;`,
    Columns: "dispute_id, settled_date, days_elapsed",
    Status: "Validated",
    "Last Run": "2026-02-20",
    "Executed By": OWNER,
    Notes: "Returns no rows; the window is enforced at creation",
    Requirements: "BR-001",
    Rules: "RULE-002",
  },
  {
    ID: "SQL-002",
    Title: "Provisional credits that do not match the disputed amount",
    Purpose: "Proves RULE-003: the credit never exceeds what was disputed.",
    Database: "cards",
    SQL: `SELECT d.dispute_id,
       d.amount        AS disputed,
       p.amount        AS credited
FROM   dispute d
JOIN   posting p ON p.dispute_id = d.dispute_id
WHERE  p.type = 'PROVISIONAL_CREDIT'
AND    p.amount <> d.amount;`,
    Columns: "dispute_id, disputed, credited",
    Status: "Validated",
    "Last Run": "2026-02-20",
    "Executed By": OWNER,
    Notes: "Returns no rows",
    Requirements: "BR-002",
    Rules: "RULE-003",
  },
  {
    ID: "SQL-003",
    Title: "Disputes with more than five evidence files",
    Purpose: "Checks the attachment limit in RULE-004.",
    Database: "cards",
    SQL: `SELECT dispute_id, COUNT(*) AS files
FROM   dispute_evidence
GROUP  BY dispute_id
HAVING COUNT(*) > 5;`,
    Columns: "dispute_id, files",
    Status: "Needs Review",
    "Last Run": "2026-02-20",
    "Executed By": OWNER,
    Notes: "Rule not yet live; run again after the March release",
    Requirements: "BR-003",
    Rules: "RULE-004",
  },
];

const testCases = [
  {
    ID: "TC-001",
    Scenario: "A settled transaction inside the window can be disputed",
    Suite: "Disputes",
    Preconditions: "A card with a settled transaction dated 30 days ago",
    Steps:
      "1. Open the transaction -> the Dispute action is available\n2. Choose a reason and confirm -> a reference is shown",
    "Expected Result": "The dispute exists with the status Submitted.",
    Status: "Passed",
    Priority: "Critical",
    Type: "Functional",
    Requirement: "BR-001",
    "Last Run": "2026-02-19",
    "Executed By": OWNER,
  },
  {
    ID: "TC-002",
    Scenario: "A transaction older than 120 days cannot be disputed",
    Suite: "Disputes",
    Preconditions: "A card with a settled transaction dated 130 days ago",
    Steps: "1. Open the transaction -> the Dispute action is disabled and the reason is shown",
    "Expected Result": "No dispute is created and the cardholder is told why.",
    Status: "Passed",
    Priority: "Critical",
    Type: "Negative",
    Requirement: "BR-001",
    "Last Run": "2026-02-19",
    "Executed By": OWNER,
  },
  {
    ID: "TC-003",
    Scenario: "A provisional credit is posted for the disputed amount",
    Suite: "Settlement",
    Preconditions: "A dispute of 84.50 accepted before the end-of-day run",
    Steps:
      "1. Run end of day -> a posting appears\n2. Read the posting -> the amount is 84.50",
    "Expected Result": "One provisional credit of 84.50 and no second posting.",
    Status: "Passed",
    Priority: "Critical",
    Type: "Integration",
    Requirement: "BR-002",
    "Last Run": "2026-02-20",
    "Executed By": OWNER,
  },
  {
    ID: "TC-004",
    Scenario: "The sixth evidence file is refused",
    Suite: "Evidence",
    Preconditions: "A dispute Under Review with five files attached",
    Steps: "1. Attach a sixth file -> the error ATTACHMENT_LIMIT is shown",
    "Expected Result": "The file is refused and the five existing files are untouched.",
    Status: "Failed",
    Priority: "Medium",
    Type: "Negative",
    Requirement: "BR-003",
    "Last Run": "2026-02-20",
    "Executed By": OWNER,
    Defect: "DEF-118",
  },
  {
    ID: "TC-005",
    Scenario: "One notification per status change",
    Suite: "Notifications",
    Preconditions: "A dispute with the status Submitted",
    Steps: "1. Move it to Under Review -> one notification is sent",
    "Expected Result": "Exactly one notification, not one per retry.",
    Status: "Not Run",
    Priority: "Medium",
    Type: "Functional",
    Requirement: "BR-004",
    "Last Run": "",
    "Executed By": "",
  },
];

const documents = [
  {
    ID: "DOC-001",
    Name: "Card disputes — business requirements",
    Format: "Word",
    Description: "The signed requirements pack behind BR-001 and BR-002.",
    Category: "Requirements",
    Version: "1.2",
    Author: OWNER,
    "Last Updated": "2026-02-10",
    Size: "412 KB",
    Status: "Approved",
    Confidentiality: "Internal",
    Requirements: "BR-001, BR-002",
  },
  {
    ID: "DOC-002",
    Name: "Disputes API contract",
    Format: "Swagger",
    Description: "OpenAPI 3.1 definition of the four dispute endpoints.",
    Category: "Interface",
    Version: "1.0.0",
    Author: OWNER,
    "Last Updated": "2026-02-15",
    Size: "38 KB",
    Status: "In Review",
    Confidentiality: "Internal",
    Requirements: "BR-001, BR-003",
  },
  {
    ID: "DOC-003",
    Name: "Dispute process model",
    Format: "BPMN",
    Description: "The BPMN 2.0 file behind the process flow.",
    Category: "Process",
    Version: "1.0",
    Author: OWNER,
    "Last Updated": "2026-02-14",
    Size: "24 KB",
    Status: "Approved",
    Confidentiality: "Internal",
    Requirements: "BR-001",
  },
];

const specSections = [
  {
    ID: "FS-001",
    Title: "Raising a dispute",
    Summary:
      "How a dispute is created from a settled transaction: what is checked, what is stored, and what the cardholder is told at each refusal.",
    Requirements: "BR-001",
    "Business Logic":
      "1. Read the transaction and confirm it is settled\n2. Confirm the settlement date is within 120 days of today\n3. Confirm no open dispute already exists for it\n4. Store the dispute with the status Submitted and return its reference",
  },
  {
    ID: "FS-002",
    Title: "Provisional credit",
    Summary:
      "How the disputed amount is returned to the cardholder while the case is investigated, and how it is reversed if the dispute fails.",
    Requirements: "BR-002",
    "Business Logic":
      "1. On acceptance, queue a posting for the disputed amount\n2. Post it in the next end-of-day run\n3. On rejection, reverse the posting and notify the cardholder",
  },
  {
    ID: "FS-003",
    Title: "Evidence handling",
    Summary: "What a cardholder may attach to an open case, and what is refused.",
    Requirements: "BR-003",
    "Business Logic":
      "1. Accept files only while the case is Under Review\n2. Refuse a sixth file, or any file over 10 MB\n3. Store the file against the dispute, never against the transaction",
  },
];

const specFields = [
  {
    Section: "FS-001",
    Name: "transactionId",
    Type: "uuid",
    Length: "36",
    Mandatory: "Yes",
    Description: "The settled transaction being disputed.",
    Example: "9f2c1b7e-4a2d-4f9a-8b31-0c5e2a7d9f10",
  },
  {
    Section: "FS-001",
    Name: "reasonCode",
    Type: "varchar",
    Length: "10",
    Mandatory: "Yes",
    Description: "Why the cardholder disputes the charge, in scheme terms.",
    Example: "13.1",
  },
  {
    Section: "FS-001",
    Name: "amount",
    Type: "numeric",
    Length: "15,2",
    Mandatory: "Yes",
    Description: "The disputed amount; may be less than the transaction, never more.",
    Example: "84.50",
  },
  {
    Section: "FS-001",
    Name: "description",
    Type: "varchar",
    Length: "500",
    Mandatory: "No",
    Description: "The cardholder's own account of what happened.",
    Example: "Charged twice for one meal",
  },
  {
    Section: "FS-002",
    Name: "postingId",
    Type: "uuid",
    Length: "36",
    Mandatory: "Yes",
    Description: "The ledger posting that carries the provisional credit.",
    Example: "3d81c0aa-71f4-4d2e-9c6b-6f0b2b1e77a2",
  },
  {
    Section: "FS-002",
    Name: "valueDate",
    Type: "date",
    Length: "10",
    Mandatory: "Yes",
    Description: "The date the credit takes effect on the account.",
    Example: "2026-02-11",
  },
  {
    Section: "FS-003",
    Name: "fileName",
    Type: "varchar",
    Length: "255",
    Mandatory: "Yes",
    Description: "The name of the attached evidence file.",
    Example: "receipt-2026-02-08.pdf",
  },
  {
    Section: "FS-003",
    Name: "sizeBytes",
    Type: "bigint",
    Length: "—",
    Mandatory: "Yes",
    Description: "File size, checked against the 10 MB limit.",
    Example: "2411008",
  },
];

const specValidations = [
  {
    Section: "FS-001",
    Field: "transactionId",
    Rule: "Must reference a transaction whose status is SETTLED",
    "Error Code": "NOT_DISPUTABLE",
    Severity: "Blocking",
  },
  {
    Section: "FS-001",
    Field: "transactionId",
    Rule: "Settlement date must be within 120 days of today",
    "Error Code": "WINDOW_CLOSED",
    Severity: "Blocking",
  },
  {
    Section: "FS-001",
    Field: "transactionId",
    Rule: "No dispute may already be open against this transaction",
    "Error Code": "ALREADY_DISPUTED",
    Severity: "Blocking",
  },
  {
    Section: "FS-001",
    Field: "amount",
    Rule: "Must be greater than zero and at most the transaction amount",
    "Error Code": "AMOUNT_INVALID",
    Severity: "Blocking",
  },
  {
    Section: "FS-001",
    Field: "reasonCode",
    Rule: "Must be one of the scheme reason codes in force",
    "Error Code": "REASON_UNKNOWN",
    Severity: "Blocking",
  },
  {
    Section: "FS-002",
    Field: "amount",
    Rule: "The credit must equal the disputed amount exactly",
    "Error Code": "CREDIT_MISMATCH",
    Severity: "Blocking",
  },
  {
    Section: "FS-003",
    Field: "sizeBytes",
    Rule: "At most 10485760 bytes per file",
    "Error Code": "ATTACHMENT_TOO_LARGE",
    Severity: "Blocking",
  },
  {
    Section: "FS-003",
    Field: "fileName",
    Rule: "Extension should be pdf, png or jpg",
    "Error Code": "ATTACHMENT_TYPE",
    Severity: "Warning",
  },
];

const specErrors = [
  {
    Section: "FS-001",
    Code: "NOT_DISPUTABLE",
    "HTTP Status": 422,
    Message: "This transaction cannot be disputed yet.",
    Handling: "Tell the cardholder to wait until the payment settles, and show the date.",
  },
  {
    Section: "FS-001",
    Code: "WINDOW_CLOSED",
    "HTTP Status": 422,
    Message: "The 120-day window for disputing this payment has passed.",
    Handling: "Show the deadline that passed and offer the contact centre.",
  },
  {
    Section: "FS-001",
    Code: "ALREADY_DISPUTED",
    "HTTP Status": 409,
    Message: "There is already an open dispute for this payment.",
    Handling: "Take the cardholder to the existing case rather than refusing.",
  },
  {
    Section: "FS-001",
    Code: "AMOUNT_INVALID",
    "HTTP Status": 400,
    Message: "The disputed amount is not valid.",
    Handling: "Reset the field to the full transaction amount.",
  },
  {
    Section: "FS-002",
    Code: "CREDIT_MISMATCH",
    "HTTP Status": 500,
    Message: "The provisional credit does not match the disputed amount.",
    Handling: "Hold the posting and raise an operations alert; never post a partial credit.",
  },
  {
    Section: "FS-003",
    Code: "ATTACHMENT_LIMIT",
    "HTTP Status": 422,
    Message: "You can attach up to five files.",
    Handling: "Hide the attach action once five files exist, rather than failing on the sixth.",
  },
  {
    Section: "FS-003",
    Code: "ATTACHMENT_TOO_LARGE",
    "HTTP Status": 413,
    Message: "That file is larger than 10 MB.",
    Handling: "Say the limit before the upload starts, not after it finishes.",
  },
];

const specEdgeCases = [
  {
    Section: "FS-001",
    ID: "EC-001",
    Scenario: "The transaction settles while the cardholder is on the screen",
    "Expected Behaviour":
      "The Dispute action becomes available without a reload; no error is shown for the earlier state.",
  },
  {
    Section: "FS-001",
    ID: "EC-002",
    Scenario: "The dispute is submitted on day 120 at 23:59 local time",
    "Expected Behaviour":
      "It is accepted; the window is counted in whole days against the settlement date, not in hours.",
  },
  {
    Section: "FS-001",
    ID: "EC-003",
    Scenario: "The cardholder taps Submit twice",
    "Expected Behaviour": "One dispute is created; the second call returns the same reference.",
  },
  {
    Section: "FS-002",
    ID: "EC-004",
    Scenario: "The account is closed before the provisional credit posts",
    "Expected Behaviour":
      "The credit is held and an operations task is raised; the case continues regardless.",
  },
  {
    Section: "FS-002",
    ID: "EC-005",
    Scenario: "The transaction is refunded by the merchant while the case is open",
    "Expected Behaviour":
      "The provisional credit is reversed and the case is closed as Resolved, with one notification only.",
  },
  {
    Section: "FS-003",
    ID: "EC-006",
    Scenario: "The case moves to Resolved while a file is uploading",
    "Expected Behaviour": "The upload completes and is stored, but no further file is accepted.",
  },
];


const projectInfo = [
  { Field: "Name", Value: "Card Disputes & Chargeback Automation" },
  { Field: "Code", Value: "CDA-1.0" },
  { Field: "Domain", Value: "Banking" },
  { Field: "Sub Domain", Value: "Cards & Disputes" },
  { Field: "Status", Value: "In Progress" },
  { Field: "Version", Value: "1.0" },
  { Field: "Release", Value: "R2026.03" },
  { Field: "Owner", Value: OWNER },
  { Field: "Owner Role", Value: "Lead Functional Analyst" },
  { Field: "Business Owner", Value: "Head of Card Operations" },
  { Field: "Programme", Value: "Cards Modernisation" },
  { Field: "Summary", Value: "Automating the card dispute lifecycle from the cardholder raising a case to the chargeback being settled with the scheme." },
  { Field: "Business Objective", Value: "Cut the cost per dispute by 45% and post every provisional credit within one working day." },
  { Field: "Start Date", Value: "2026-01-05" },
  { Field: "Target Date", Value: "2026-06-30" },
  { Field: "Completion", Value: "55" },
  { Field: "Regulatory Drivers", Value: "PSD2 Article 74; Scheme rules chapter 11" },
  { Field: "Tags", Value: "Cards, Disputes, Automation" },
];

const scope = [
  { Type: "In", Item: "Raising a dispute from a settled card transaction" },
  { Type: "In", Item: "Provisional credit and its reversal" },
  { Type: "In", Item: "Evidence upload while the case is under review" },
  { Type: "In", Item: "Chargeback submission to the scheme" },
  { Type: "Out", Item: "Merchant-side representment handling" },
  { Type: "Out", Item: "Fraud case management (separate programme)" },
  { Type: "Out", Item: "Cash and cheque disputes" },
];

const stakeholders = [
  { ID: "STK-001", Name: "Head of Card Operations", Role: "Business Owner", Email: "card.ops@bank.example", Department: "Card Operations", RACI: "Accountable" },
  { ID: "STK-002", Name: OWNER, Role: "Lead Functional Analyst", Email: "abdessalemsaa@gmail.com", Department: "Change Delivery", RACI: "Responsible" },
  { ID: "STK-003", Name: "Disputes Team Lead", Role: "Process Owner", Email: "disputes@bank.example", Department: "Card Operations", RACI: "Consulted" },
  { ID: "STK-004", Name: "Compliance Officer", Role: "Regulatory Assurance", Email: "compliance@bank.example", Department: "Compliance", RACI: "Consulted" },
  { ID: "STK-005", Name: "Head of Internal Audit", Role: "Assurance", Email: "audit@bank.example", Department: "Internal Audit", RACI: "Informed" },
];

const timeline = [
  { ID: "MS-01", Label: "Business case approved", Date: "2026-01-05", Status: "Completed", Description: "Cards steering committee approved the investment." },
  { ID: "MS-02", Label: "Requirements baselined", Date: "2026-02-10", Status: "Completed", Description: "Four requirements signed off with Operations and Compliance." },
  { ID: "MS-03", Label: "Functional specification approved", Date: "2026-03-06", Status: "In Progress", Description: "Field tables and error codes under review." },
  { ID: "MS-04", Label: "SIT and UAT", Date: "2026-05-15", Status: "Upcoming", Description: "Five test cases, two suites." },
  { ID: "MS-05", Label: "Go-live", Date: "2026-06-30", Status: "Upcoming", Description: "Pilot cohort first, then full rollout." },
];

const dependencies = [
  { ID: "DEP-01", Name: "Card scheme gateway", Type: "External Party", Owner: "Integration Team", Status: "On Track", Description: "Chargeback submission and arbitration messages." },
  { ID: "DEP-02", Name: "Core banking ledger", Type: "Internal System", Owner: "Core Banking", Status: "Resolved", Description: "Posting API for the provisional credit and its reversal." },
  { ID: "DEP-03", Name: "Document store", Type: "Vendor", Owner: "Platform Team", Status: "At Risk", Description: "Evidence files; the 10 MB limit is not yet enforced server-side." },
];

const risks = [
  { ID: "R-01", Description: "The provisional credit posts twice if the end-of-day run is replayed.", Likelihood: "Medium", Impact: "High", Mitigation: "Idempotency key on the posting instruction, checked by SQL-002.", Owner: OWNER },
  { ID: "R-02", Description: "The attachment limit is enforced only in the app, not the API.", Likelihood: "High", Impact: "Medium", Mitigation: "Move the check server-side before the March release; tracked by DEF-118.", Owner: OWNER },
  { ID: "R-03", Description: "Scheme rule changes in chapter 11 could shorten the dispute window.", Likelihood: "Low", Impact: "High", Mitigation: "Window held in configuration, not code.", Owner: "Compliance Officer" },
];

const SHEETS = [
  ["Project", projectInfo],
  ["Scope", scope],
  ["Stakeholders", stakeholders],
  ["Timeline", timeline],
  ["Dependencies", dependencies],
  ["Risks", risks],
  ["Requirements", requirements],
  ["Acceptance Criteria", acceptanceCriteria],
  ["Business Rules", businessRules],
  ["Actors", actors],
  ["Process Steps", processSteps],
  ["Spec Sections", specSections],
  ["Spec Fields", specFields],
  ["Spec Validations", specValidations],
  ["Spec Errors", specErrors],
  ["Spec Edge Cases", specEdgeCases],
  ["Diagrams", diagrams],
  ["Wireframes", wireframes],
  ["API Endpoints", apiEndpoints],
  ["SQL Validations", sqlValidations],
  ["Test Cases", testCases],
  ["Documents", documents],
];

const target = process.argv[2];
if (!target) {
  console.error("usage: node scripts/make-sample.mjs <output.xlsx>");
  process.exit(1);
}

const book = XLSX.utils.book_new();
for (const [name, rows] of SHEETS) {
  // Headers are taken from the widest row, so sheets whose later rows repeat
  // fewer columns (the process steps) still declare every column.
  const header = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const sheet = XLSX.utils.json_to_sheet(rows, { header });
  sheet["!cols"] = header.map((column) => ({ wch: column === "PlantUML" || column === "SQL" ? 60 : 26 }));
  XLSX.utils.book_append_sheet(book, sheet, name);
}

XLSX.writeFile(book, target);
console.log(`written ${target} — ${SHEETS.length} sheets`);
