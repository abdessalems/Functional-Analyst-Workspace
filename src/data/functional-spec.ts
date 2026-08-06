import type { FunctionalSpecSection } from "@/lib/types";

/** Functional specification FS v2.3 — collapsible sections consumed by the FS page. */
export const functionalSpecSections: FunctionalSpecSection[] = [
  {
    id: "FS-001",
    title: "Payment Initiation & Request Intake",
    summary:
      "Defines how a payment instruction enters the hub from the digital channels, the canonical request contract and the synchronous orchestration sequence.",
    requirementRefs: ["REQ-001", "REQ-011", "REQ-016"],
    businessLogic: [
      "The channel submits a payment instruction to POST /payments with an idempotency key that is unique per customer instruction.",
      "The hub assigns an internal payment identifier (IPH-P-<yyyymmdd>-<sequence>) and persists the request in state RCVD before any downstream call.",
      "Orchestration is strictly sequential: structural validation → reachability → Verification of Payee → limit evaluation → fraud scoring → sanctions screening → funds reservation → scheme submission.",
      "Any stage returning a blocking outcome terminates the flow immediately; stages already completed are compensated in reverse order.",
      "The final status is returned synchronously to the channel; the hub never leaves a channel request unanswered, defaulting to RJCT with reason TIMEOUT after 25 seconds.",
    ],
    validations: [
      {
        field: "amount",
        rule: "Greater than 0.00 and less than or equal to 100,000.00, maximum 2 decimal places",
        errorCode: "IPH-VAL-001",
        severity: "Blocking",
      },
      {
        field: "currency",
        rule: "Must be the ISO 4217 code EUR",
        errorCode: "IPH-VAL-002",
        severity: "Blocking",
      },
      {
        field: "creditorAccount.iban",
        rule: "Valid IBAN structure and MOD-97 check digit, SEPA country only",
        errorCode: "IPH-VAL-003",
        severity: "Blocking",
      },
      {
        field: "creditorName",
        rule: "1 to 70 characters, SWIFT-permitted character set",
        errorCode: "IPH-VAL-005",
        severity: "Blocking",
      },
      {
        field: "remittanceInformation",
        rule: "Maximum 140 characters, unstructured",
        errorCode: "IPH-VAL-014",
        severity: "Blocking",
      },
      {
        field: "endToEndId",
        rule: "Maximum 35 characters, unique per debtor within a rolling 24 hours",
        errorCode: "IPH-DUP-011",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "IPH-VAL-001",
        httpStatus: 400,
        message: "Amount exceeds the instant payment scheme maximum of EUR 100,000.00.",
        handling:
          "Channel offers a standard SEPA credit transfer with the same beneficiary details pre-populated.",
      },
      {
        code: "IPH-VAL-003",
        httpStatus: 400,
        message: "The beneficiary IBAN is not valid.",
        handling: "Channel highlights the IBAN field and retains all other captured values.",
      },
      {
        code: "IPH-DUP-011",
        httpStatus: 409,
        message: "A payment with this end-to-end identification already exists.",
        handling:
          "Channel returns the status of the original payment rather than creating a duplicate.",
      },
    ],
    fields: [
      {
        name: "debtorAccount.iban",
        type: "String",
        length: "34",
        mandatory: true,
        description: "IBAN of the account to be debited; must belong to the authenticated customer.",
        example: "NL91NRTB0417164300",
      },
      {
        name: "creditorAccount.iban",
        type: "String",
        length: "34",
        mandatory: true,
        description: "IBAN of the beneficiary account.",
        example: "DE89370400440532013000",
      },
      {
        name: "creditorName",
        type: "String",
        length: "70",
        mandatory: true,
        description: "Beneficiary name as entered by the customer; used for Verification of Payee.",
        example: "Helena Brandt",
      },
      {
        name: "amount",
        type: "Decimal",
        length: "18,2",
        mandatory: true,
        description: "Payment amount in euro.",
        example: "1250.00",
      },
      {
        name: "endToEndId",
        type: "String",
        length: "35",
        mandatory: true,
        description: "Customer or channel supplied reference propagated end to end through the scheme.",
        example: "IPH-E2E-8842011",
      },
      {
        name: "remittanceInformation",
        type: "String",
        length: "140",
        mandatory: false,
        description: "Unstructured payment reference shown to the beneficiary.",
        example: "Invoice 2025-0442",
      },
    ],
    edgeCases: [
      {
        id: "EC-001",
        scenario: "The customer submits the same instruction twice after a channel timeout.",
        expectedBehaviour:
          "The idempotency key returns the original payment and its current status; no second payment is created.",
      },
      {
        id: "EC-002",
        scenario: "The debtor account is closed between authentication and submission.",
        expectedBehaviour:
          "Reservation fails with IPH-ACC-004, the flow terminates and the channel presents an account status message.",
      },
    ],
  },
  {
    id: "FS-002",
    title: "Verification of Payee",
    summary:
      "Beneficiary name matching against the account-holding institution prior to submission, including degraded-mode behaviour.",
    requirementRefs: ["REQ-002", "REQ-009"],
    businessLogic: [
      "Verification of Payee is invoked with the creditor IBAN and the customer-entered creditor name.",
      "The service returns MATCH, CLOSE_MATCH with the registered name, NO_MATCH, or NOT_SUPPORTED where the beneficiary bank does not offer the service.",
      "MATCH permits straight-through submission. CLOSE_MATCH requires the customer to confirm or amend. NO_MATCH blocks first use of a beneficiary and displays a scam warning.",
      "Results are cached for 24 hours per IBAN and name pair to avoid repeated lookups for recurring payments.",
      "Where the service is unavailable the customer is warned that verification could not be performed and must positively accept the risk; the acceptance is recorded in the audit trail.",
    ],
    validations: [
      {
        field: "vopResult",
        rule: "CLOSE_MATCH requires customerConfirmation = true",
        errorCode: "IPH-VOP-021",
        severity: "Blocking",
      },
      {
        field: "vopResult",
        rule: "NO_MATCH blocks submission when beneficiary.firstUse = true",
        errorCode: "IPH-VOP-022",
        severity: "Blocking",
      },
      {
        field: "vopResult",
        rule: "NOT_SUPPORTED proceeds with a recorded risk acceptance",
        errorCode: "IPH-VOP-023",
        severity: "Warning",
      },
    ],
    errors: [
      {
        code: "IPH-VOP-021",
        httpStatus: 422,
        message: "The beneficiary name does not exactly match the account records.",
        handling:
          "Channel displays the registered name and requires the customer to confirm or amend before continuing.",
      },
      {
        code: "IPH-VOP-022",
        httpStatus: 422,
        message: "The beneficiary name does not match the account records.",
        handling: "Submission is blocked and the customer is shown a scam-awareness interstitial.",
      },
    ],
    fields: [
      {
        name: "vopResult",
        type: "Enum",
        length: "—",
        mandatory: true,
        description: "MATCH | CLOSE_MATCH | NO_MATCH | NOT_SUPPORTED",
        example: "CLOSE_MATCH",
      },
      {
        name: "registeredName",
        type: "String",
        length: "70",
        mandatory: false,
        description: "Name held by the beneficiary institution; returned only for CLOSE_MATCH.",
        example: "H. M. Brandt",
      },
      {
        name: "matchScore",
        type: "Integer",
        length: "3",
        mandatory: false,
        description: "Similarity score from 0 to 100 supporting the returned outcome.",
        example: "87",
      },
    ],
    edgeCases: [
      {
        id: "EC-003",
        scenario: "The beneficiary account is held in a legal entity name that differs from the trading name.",
        expectedBehaviour:
          "CLOSE_MATCH is returned with the registered legal name; the customer confirms and the confirmation is retained for 7 years.",
      },
      {
        id: "EC-004",
        scenario: "Verification of Payee responds after the 1,500 ms budget.",
        expectedBehaviour:
          "The call is abandoned, treated as NOT_SUPPORTED and the risk-acceptance path is followed.",
      },
    ],
  },
  {
    id: "FS-003",
    title: "Screening, Fraud Scoring & Decisioning",
    summary:
      "In-path financial crime controls, their latency budgets, decision bands and the tip-off-safe customer messaging.",
    requirementRefs: ["REQ-003", "REQ-004", "REQ-018"],
    businessLogic: [
      "Fraud scoring is invoked before sanctions screening so that obviously fraudulent payments never consume screening capacity.",
      "The fraud engine receives amount, beneficiary novelty, device fingerprint, session behaviour and 30-day velocity features and returns a score from 0 to 100.",
      "Score bands: 0–59 allow, 60–84 step-up authentication then re-evaluate, 85–100 block and create a fraud case.",
      "Sanctions screening covers debtor name, creditor name, creditor address and any unstructured remittance text against the consolidated list set.",
      "A screening hit sets HELD_COMPLIANCE, retains the reservation and displays a neutral 'we are completing some checks' message with no indication that screening occurred.",
      "Where screening exceeds 1,200 ms the circuit breaker routes the payment to manual review; automatic approval on timeout is explicitly prohibited.",
    ],
    validations: [
      {
        field: "fraudScore",
        rule: "Score of 85 or above blocks the payment",
        errorCode: "IPH-FRD-031",
        severity: "Blocking",
      },
      {
        field: "fraudScore",
        rule: "Score between 60 and 84 requires successful step-up authentication",
        errorCode: "IPH-FRD-032",
        severity: "Warning",
      },
      {
        field: "screeningResult",
        rule: "A HIT places the payment in the compliance hold queue",
        errorCode: "IPH-SAN-041",
        severity: "Blocking",
      },
      {
        field: "beneficiaryAge",
        rule: "First use within 24 hours above EUR 5,000 triggers a 30 minute cooling-off hold",
        errorCode: "IPH-FRD-033",
        severity: "Warning",
      },
    ],
    errors: [
      {
        code: "IPH-FRD-031",
        httpStatus: 403,
        message: "This payment cannot be completed. Please contact us on the number on your card.",
        handling: "Fraud case created and assigned to the Fraud Operations queue with a 2-hour SLA.",
      },
      {
        code: "IPH-SAN-041",
        httpStatus: 202,
        message: "We are completing some checks on this payment.",
        handling:
          "Payment held, compliance alert raised, no further detail disclosed to the customer or the agent.",
      },
    ],
    fields: [
      {
        name: "fraudScore",
        type: "Integer",
        length: "3",
        mandatory: true,
        description: "Behavioural risk score returned by the decision engine.",
        example: "72",
      },
      {
        name: "modelVersion",
        type: "String",
        length: "12",
        mandatory: true,
        description: "Scoring model version recorded for audit and model governance.",
        example: "ARIC-v4.2",
      },
      {
        name: "screeningResult",
        type: "Enum",
        length: "—",
        mandatory: true,
        description: "CLEAR | HIT | TIMEOUT",
        example: "CLEAR",
      },
      {
        name: "alertReference",
        type: "String",
        length: "20",
        mandatory: false,
        description: "Compliance alert reference generated when the result is HIT.",
        example: "SAN-2025-0088142",
      },
    ],
    edgeCases: [
      {
        id: "EC-005",
        scenario: "The fraud engine is unavailable.",
        expectedBehaviour:
          "Static fallback rules apply: payments above EUR 2,000 or to first-use beneficiaries are challenged with step-up authentication.",
      },
      {
        id: "EC-006",
        scenario: "A customer cancels during the 30 minute cooling-off hold.",
        expectedBehaviour:
          "The reservation is released immediately, the payment is set to CANC and no charge is applied.",
      },
    ],
  },
  {
    id: "FS-004",
    title: "Funds Reservation & Ledger Posting",
    summary:
      "Two-phase commit against the core banking ledger, timer-based release and the compensating reconciliation job.",
    requirementRefs: ["REQ-005", "REQ-008"],
    businessLogic: [
      "The hub calls the ledger reservation API with the payment amount, the internal payment identifier and a 25-second expiry.",
      "The reservation reduces the available balance immediately but does not create an accounting entry.",
      "On a positive pacs.002 the reservation is converted to a booked debit carrying the scheme reference in the narrative.",
      "On rejection, timeout or downstream failure the reservation is released and the available balance is restored within 1 second.",
      "A compensating job runs every 60 seconds to release reservations older than 60 seconds that have no terminal payment state, and raises an operational alert for each occurrence.",
      "Inbound payments post an immediate credit with the settlement timestamp as the value date; no availability delay is permitted.",
    ],
    validations: [
      {
        field: "availableBalance",
        rule: "Available balance including agreed overdraft must cover the full amount",
        errorCode: "IPH-FND-007",
        severity: "Blocking",
      },
      {
        field: "accountStatus",
        rule: "Account must be ACTIVE with no debit, legal or deceased block",
        errorCode: "IPH-ACC-004",
        severity: "Blocking",
      },
      {
        field: "reservationAge",
        rule: "Reservations expire automatically after 25 seconds",
        errorCode: "IPH-RES-051",
        severity: "Warning",
      },
    ],
    errors: [
      {
        code: "IPH-FND-007",
        httpStatus: 422,
        message: "There are not enough available funds to make this payment.",
        handling: "Channel displays the available balance and offers to amend the amount.",
      },
      {
        code: "IPH-RES-051",
        httpStatus: 500,
        message: "The funds reservation could not be confirmed.",
        handling:
          "Reservation released, payment rejected, operational alert raised for the compensating job to verify.",
      },
    ],
    fields: [
      {
        name: "reservationId",
        type: "String",
        length: "24",
        mandatory: true,
        description: "Ledger reservation identifier used for conversion or release.",
        example: "RSV-20250602-0093312",
      },
      {
        name: "availableBalance",
        type: "Decimal",
        length: "18,2",
        mandatory: true,
        description: "Balance including agreed overdraft, net of existing holds.",
        example: "4820.55",
      },
      {
        name: "postingReference",
        type: "String",
        length: "35",
        mandatory: false,
        description: "Accounting reference of the booked debit or credit.",
        example: "T24-PST-77410221",
      },
    ],
    edgeCases: [
      {
        id: "EC-007",
        scenario: "The scheme confirms after the reservation has already expired.",
        expectedBehaviour:
          "The debit is posted directly against the account and a reconciliation break of type LATE_CONFIRMATION is raised for same-day review.",
      },
      {
        id: "EC-008",
        scenario: "The ledger is unavailable at release time.",
        expectedBehaviour:
          "The release is queued with exponential backoff and the compensating job guarantees release within 60 seconds.",
      },
    ],
  },
  {
    id: "FS-005",
    title: "Scheme Messaging & Status Management",
    summary:
      "ISO 20022 message construction, correlation, the payment state model and reason code translation.",
    requirementRefs: ["REQ-006", "REQ-007", "REQ-012"],
    businessLogic: [
      "Outbound payments are expressed as pacs.008.001.08 and correlated to the pacs.002.001.10 response by end-to-end identification and message identification.",
      "The payment state model is RCVD → VALD → SCRN → RSVD → SUBM → ACCP | RJCT | HELD, with CANC reachable only from COOLING_OFF.",
      "Scheme reason codes are translated into customer-facing text through a maintained mapping table owned by Payments Operations.",
      "Stage timestamps are captured for every transition and exposed through the status enquiry operation and the operations dashboard.",
      "Terminal states are immutable; any subsequent scheme message creates a linked exception record rather than mutating the payment.",
    ],
    validations: [
      {
        field: "pacs002.status",
        rule: "Must be ACCP or RJCT; any other value is treated as a protocol error",
        errorCode: "IPH-SCH-061",
        severity: "Blocking",
      },
      {
        field: "correlationId",
        rule: "Response end-to-end identification must match the submitted payment",
        errorCode: "IPH-SCH-062",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "IPH-SCH-061",
        httpStatus: 502,
        message: "The payment scheme returned an unexpected response.",
        handling:
          "Payment set to RJCT with reason SCHEME_PROTOCOL, reservation released, gateway alert raised.",
      },
      {
        code: "IPH-SCH-062",
        httpStatus: 502,
        message: "The scheme response could not be matched to a payment.",
        handling: "Message quarantined for Payments Operations investigation within 30 minutes.",
      },
    ],
    fields: [
      {
        name: "schemeReference",
        type: "String",
        length: "35",
        mandatory: false,
        description: "Transaction reference assigned by TIPS on settlement.",
        example: "TIPS20250602X0099183",
      },
      {
        name: "paymentStatus",
        type: "Enum",
        length: "—",
        mandatory: true,
        description: "RCVD | VALD | SCRN | RSVD | SUBM | ACCP | RJCT | HELD | CANC",
        example: "ACCP",
      },
      {
        name: "reasonCode",
        type: "String",
        length: "4",
        mandatory: false,
        description: "ISO external status reason code returned by the scheme.",
        example: "AC04",
      },
    ],
    edgeCases: [
      {
        id: "EC-009",
        scenario: "A duplicate pacs.002 arrives for a payment already in a terminal state.",
        expectedBehaviour:
          "The duplicate is logged and discarded; the payment state is not modified and no customer notification is sent.",
      },
      {
        id: "EC-010",
        scenario: "The scheme responds ACCP after the hub has already rejected on timeout.",
        expectedBehaviour:
          "An exception record of type LATE_ACCEPT is created, the debit is posted and Payments Operations contacts the customer within the same banking day.",
      },
    ],
  },
  {
    id: "FS-006",
    title: "Limits & Authentication Controls",
    summary:
      "Segment limit evaluation, temporary uplift handling and PSD2 Strong Customer Authentication including exemptions.",
    requirementRefs: ["REQ-010", "REQ-017"],
    businessLogic: [
      "Limits are evaluated after Verification of Payee and before fraud scoring so that limit rejections are cheap and fast.",
      "The rolling 24-hour window counts payments in ACCP and PDNG states; rejected and cancelled payments do not consume the allowance.",
      "A temporary uplift request requires step-up authentication, is capped at 48 hours and is subject to a fraud review for amounts above EUR 25,000.",
      "SCA applies dynamic linking: the challenge presents the exact amount and beneficiary name, and the authentication code is invalidated by any change to either value.",
      "Exemption usage is tracked per customer; the cumulative exempted amount and consecutive exemption counter reset on the next successful SCA.",
    ],
    validations: [
      {
        field: "cumulative24h",
        rule: "Sum of sent payments plus the current amount must not exceed the segment limit",
        errorCode: "IPH-LIM-002",
        severity: "Blocking",
      },
      {
        field: "scaExemption",
        rule: "Low-value exemption below EUR 500 with cumulative exempt at or below EUR 1,000 and fewer than 5 consecutive exemptions",
        errorCode: "IPH-SCA-071",
        severity: "Warning",
      },
      {
        field: "scaChallenge",
        rule: "Authentication code must be dynamically linked to amount and payee",
        errorCode: "IPH-SCA-072",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "IPH-LIM-002",
        httpStatus: 422,
        message: "This payment exceeds your daily instant payment limit.",
        handling:
          "Channel displays the remaining allowance and offers a temporary uplift or a standard SCT.",
      },
      {
        code: "IPH-SCA-072",
        httpStatus: 401,
        message: "Authentication failed for this payment.",
        handling:
          "Payment abandoned, no reservation taken, three consecutive failures lock the payment function for 30 minutes.",
      },
    ],
    fields: [
      {
        name: "segmentDailyLimit",
        type: "Decimal",
        length: "18,2",
        mandatory: true,
        description: "Rolling 24-hour cumulative limit for the customer segment.",
        example: "15000.00",
      },
      {
        name: "remainingAllowance",
        type: "Decimal",
        length: "18,2",
        mandatory: true,
        description: "Limit less payments already sent in the rolling window.",
        example: "500.00",
      },
      {
        name: "scaMethod",
        type: "Enum",
        length: "—",
        mandatory: false,
        description: "APP_BIOMETRIC | APP_PIN | SMS_OTP | EXEMPT_LOW_VALUE | EXEMPT_TRUSTED",
        example: "APP_BIOMETRIC",
      },
    ],
    edgeCases: [
      {
        id: "EC-011",
        scenario: "A payment in PDNG cooling-off state is cancelled after consuming the allowance.",
        expectedBehaviour:
          "The allowance is restored immediately on cancellation and the restored figure is reflected in the channel.",
      },
      {
        id: "EC-012",
        scenario: "The customer amends the amount after the SCA challenge is displayed.",
        expectedBehaviour:
          "The existing challenge is invalidated and a new dynamically linked challenge is issued.",
      },
    ],
  },
  {
    id: "FS-007",
    title: "Recall & Exception Handling",
    summary:
      "Outbound and inbound recall lifecycle, permitted reason codes, scheme deadlines and operational case management.",
    requirementRefs: ["REQ-013", "REQ-014", "REQ-023"],
    businessLogic: [
      "A recall is raised as camt.056 quoting the original end-to-end identification, the settlement date and a permitted reason code.",
      "Only DUPL (duplicate), TECH (technical problem) and FRAD (fraudulent origin) are accepted; any other code is rejected before submission.",
      "The recall window is 10 banking days from settlement, calculated on the TARGET2 calendar.",
      "Inbound recalls place a hold on the disputed amount where funds remain available and create an operations case with a 10 banking day response clock.",
      "The camt.029 response carries either full return, partial return with the recovered amount, or rejection with a scheme reason code.",
      "All recall decisions require four-eyes approval and are written to the immutable audit trail.",
    ],
    validations: [
      {
        field: "recallReasonCode",
        rule: "Must be DUPL, TECH or FRAD",
        errorCode: "IPH-RCL-002",
        severity: "Blocking",
      },
      {
        field: "recallWindow",
        rule: "Settlement must be within 10 banking days",
        errorCode: "IPH-RCL-003",
        severity: "Blocking",
      },
      {
        field: "approval",
        rule: "A second authoriser distinct from the initiator is required",
        errorCode: "IPH-RCL-004",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "IPH-RCL-003",
        httpStatus: 422,
        message: "The recall window for this payment has closed.",
        handling:
          "Operations user is directed to the bilateral claim process outside the scheme.",
      },
      {
        code: "IPH-RCL-004",
        httpStatus: 403,
        message: "A second authoriser is required to submit this recall.",
        handling: "Case remains in PENDING_APPROVAL and is routed to the supervisor queue.",
      },
    ],
    fields: [
      {
        name: "recallCaseId",
        type: "String",
        length: "20",
        mandatory: true,
        description: "Internal recall case reference.",
        example: "RCL-2025-0004412",
      },
      {
        name: "recallReasonCode",
        type: "Enum",
        length: "4",
        mandatory: true,
        description: "DUPL | TECH | FRAD",
        example: "FRAD",
      },
      {
        name: "recoveredAmount",
        type: "Decimal",
        length: "18,2",
        mandatory: false,
        description: "Amount returned by the beneficiary bank; may be less than the original amount.",
        example: "1800.00",
      },
    ],
    edgeCases: [
      {
        id: "EC-013",
        scenario: "The beneficiary has already spent part of the funds.",
        expectedBehaviour:
          "A partial return is accepted, the case records the shortfall and the customer is informed of the recovered amount.",
      },
      {
        id: "EC-014",
        scenario: "The beneficiary bank does not respond within 10 banking days.",
        expectedBehaviour:
          "The case is escalated to the scheme dispute process and flagged in the monthly scheme performance report.",
      },
    ],
  },
  {
    id: "FS-008",
    title: "Reconciliation, Audit & Reporting",
    summary:
      "Daily settlement reconciliation, break classification, audit record content and regulatory retention.",
    requirementRefs: ["REQ-021", "REQ-022", "REQ-023"],
    businessLogic: [
      "The camt.053 settlement statement is retrieved from TIPS at 05:30 CET and matched against internal payment records by scheme reference.",
      "Breaks are classified as MISSING_AT_SCHEME, MISSING_INTERNALLY, AMOUNT_MISMATCH, LATE_CONFIRMATION or DUPLICATE_SETTLEMENT.",
      "The exception report is published to Payments Operations by 07:00 CET and every break must be assigned within the same banking day.",
      "Audit records are append-only, capture the applied rule and model versions, and are retained for 10 years from the payment date.",
      "Operations console actions, including four-eyes approvals, are recorded with the user identity, timestamp and business justification.",
    ],
    validations: [
      {
        field: "reconciliationStatus",
        rule: "Every settled payment must appear exactly once in the scheme statement",
        errorCode: "IPH-REC-081",
        severity: "Blocking",
      },
      {
        field: "auditRecord",
        rule: "An audit record must exist for every payment state transition",
        errorCode: "IPH-AUD-091",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "IPH-REC-081",
        httpStatus: 500,
        message: "Reconciliation break detected.",
        handling:
          "Break raised with classification and assigned to the Payments Operations queue for same-day resolution.",
      },
    ],
    fields: [
      {
        name: "breakType",
        type: "Enum",
        length: "—",
        mandatory: true,
        description:
          "MISSING_AT_SCHEME | MISSING_INTERNALLY | AMOUNT_MISMATCH | LATE_CONFIRMATION | DUPLICATE_SETTLEMENT",
        example: "AMOUNT_MISMATCH",
      },
      {
        name: "auditEventId",
        type: "String",
        length: "26",
        mandatory: true,
        description: "Append-only audit event identifier.",
        example: "AUD-01JX3M9Q7K2P4R6T8V0Y",
      },
      {
        name: "retentionUntil",
        type: "Date",
        length: "10",
        mandatory: true,
        description: "Calculated retention expiry, 10 years from the payment date.",
        example: "2035-06-02",
      },
    ],
    edgeCases: [
      {
        id: "EC-015",
        scenario: "TIPS publishes a corrected settlement statement after reconciliation has completed.",
        expectedBehaviour:
          "Reconciliation is re-run against the corrected file and previously raised breaks are automatically closed where resolved.",
      },
      {
        id: "EC-016",
        scenario: "An audit record write fails.",
        expectedBehaviour:
          "The payment transition is rolled back; no state change may be committed without a durable audit record.",
      },
    ],
  },
];

export function getFunctionalSpecSectionById(id: string): FunctionalSpecSection | undefined {
  return functionalSpecSections.find((section) => section.id === id);
}
