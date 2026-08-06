import type { ApiEndpoint, ApiService } from "@/lib/types";

const initiatePaymentRequest = `{
  "endToEndId": "IPH-E2E-8842011",
  "debtorAccount": {
    "iban": "NL91NRTB0417164300"
  },
  "creditorAccount": {
    "iban": "DE89370400440532013000",
    "bic": "COBADEFFXXX"
  },
  "creditorName": "Helena Brandt",
  "instructedAmount": {
    "currency": "EUR",
    "amount": "1250.00"
  },
  "remittanceInformation": "Invoice 2025-0442",
  "verificationOfPayee": {
    "result": "CLOSE_MATCH",
    "customerConfirmed": true
  },
  "channel": "MOBILE_APP",
  "requestedExecutionType": "INSTANT"
}`;

const initiatePaymentResponse = `{
  "paymentId": "IPH-P-20250602-0093312",
  "endToEndId": "IPH-E2E-8842011",
  "status": "ACCP",
  "schemeReference": "TIPS20250602X0099183",
  "settlementDateTime": "2025-06-02T09:41:07.412Z",
  "instructedAmount": {
    "currency": "EUR",
    "amount": "1250.00"
  },
  "chargeBearer": "SLEV",
  "executionTimeMs": 3184,
  "stageTimings": {
    "validation": 118,
    "verificationOfPayee": 742,
    "limits": 41,
    "fraudScoring": 386,
    "sanctionsScreening": 604,
    "fundsReservation": 210,
    "schemeRoundTrip": 1083
  },
  "_links": {
    "self": "/payments/instant/v2/payments/IPH-P-20250602-0093312",
    "recall": "/payments/instant/v2/payments/IPH-P-20250602-0093312/recall"
  }
}`;

const initiatePaymentRejected = `{
  "type": "https://api.northbridge-bank.com/problems/limit-exceeded",
  "title": "Daily instant payment limit exceeded",
  "status": 422,
  "code": "IPH-LIM-002",
  "detail": "The payment exceeds the remaining daily instant payment allowance.",
  "remainingAllowance": {
    "currency": "EUR",
    "amount": "500.00"
  },
  "alternatives": ["STANDARD_SCT", "TEMPORARY_LIMIT_UPLIFT"],
  "traceId": "01JX3M9Q7K2P4R6T8V0Y"
}`;

const statusResponse = `{
  "paymentId": "IPH-P-20250602-0093312",
  "endToEndId": "IPH-E2E-8842011",
  "status": "ACCP",
  "statusHistory": [
    { "status": "RCVD", "timestamp": "2025-06-02T09:41:04.228Z" },
    { "status": "VALD", "timestamp": "2025-06-02T09:41:04.346Z" },
    { "status": "SCRN", "timestamp": "2025-06-02T09:41:05.732Z" },
    { "status": "RSVD", "timestamp": "2025-06-02T09:41:05.942Z" },
    { "status": "SUBM", "timestamp": "2025-06-02T09:41:06.108Z" },
    { "status": "ACCP", "timestamp": "2025-06-02T09:41:07.412Z" }
  ],
  "schemeReference": "TIPS20250602X0099183",
  "reasonCode": null,
  "recallEligible": true,
  "recallDeadline": "2025-06-16"
}`;

const recallRequest = `{
  "reasonCode": "FRAD",
  "reasonNarrative": "Customer reported an authorised push payment scam on 03 Jun 2025.",
  "requestedAmount": {
    "currency": "EUR",
    "amount": "1250.00"
  },
  "initiatedBy": "USR-FRD-2214",
  "secondAuthoriser": "USR-FRD-1180"
}`;

const recallResponse = `{
  "recallCaseId": "RCL-2025-0004412",
  "paymentId": "IPH-P-20250602-0093312",
  "status": "PENDING_BENEFICIARY_RESPONSE",
  "schemeMessage": "camt.056.001.08",
  "submittedAt": "2025-06-03T11:02:44.001Z",
  "responseDeadline": "2025-06-17",
  "reasonCode": "FRAD"
}`;

const vopRequest = `{
  "creditorAccount": {
    "iban": "DE89370400440532013000"
  },
  "creditorName": "Helena Brandt",
  "accountType": "PERSONAL"
}`;

const vopResponse = `{
  "result": "CLOSE_MATCH",
  "matchScore": 87,
  "registeredName": "H. M. Brandt",
  "reachableForInstant": true,
  "beneficiaryBic": "COBADEFFXXX",
  "cacheExpiry": "2025-06-03T09:40:12.000Z"
}`;

const limitsResponse = `{
  "customerId": "CUS-4471902",
  "segment": "RETAIL_PLUS",
  "perTransactionLimit": { "currency": "EUR", "amount": "30000.00" },
  "dailyLimit": { "currency": "EUR", "amount": "30000.00" },
  "usedLast24h": { "currency": "EUR", "amount": "14500.00" },
  "remainingAllowance": { "currency": "EUR", "amount": "15500.00" },
  "schemeMaximum": { "currency": "EUR", "amount": "100000.00" },
  "temporaryUplift": {
    "active": false,
    "maximumAmount": { "currency": "EUR", "amount": "50000.00" },
    "requiresStepUp": true
  }
}`;

const standardHeaders = [
  {
    name: "Authorization",
    in: "header" as const,
    type: "string",
    required: true,
    description: "OAuth 2.0 bearer token issued to the calling channel.",
    example: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  },
  {
    name: "X-Request-ID",
    in: "header" as const,
    type: "string (uuid)",
    required: true,
    description: "Correlation identifier propagated through all downstream calls and logs.",
    example: "5f9c2b1e-8d3a-4a77-9c21-6b0f4a1e2d33",
  },
];

const paymentEndpoints: ApiEndpoint[] = [
  {
    id: "API-001",
    method: "POST",
    path: "/payments",
    summary: "Initiate an instant payment",
    description:
      "Executes a SEPA Instant Credit Transfer synchronously. The call returns only once a terminal or held status has been reached, or the 25-second orchestration deadline expires.",
    tag: "Payments",
    operationId: "initiateInstantPayment",
    auth: "OAuth 2.0 — scope payments:initiate + SCA assurance claim",
    parameters: [
      ...standardHeaders,
      {
        name: "X-Idempotency-Key",
        in: "header",
        type: "string",
        required: true,
        description:
          "Unique per customer instruction. A repeat call with the same key returns the original payment.",
        example: "idem-8842011-20250602",
      },
      {
        name: "PSU-Device-ID",
        in: "header",
        type: "string",
        required: true,
        description: "Device fingerprint forwarded to the fraud decision engine.",
        example: "dev-9f22a1c7",
      },
    ],
    requestBody: initiatePaymentRequest,
    responses: [
      { status: 201, description: "Payment settled at the scheme.", body: initiatePaymentResponse },
      {
        status: 202,
        description: "Payment held for compliance review; no further detail is disclosed.",
      },
      { status: 400, description: "Structural validation failure (IPH-VAL-*)." },
      { status: 401, description: "Authentication or Strong Customer Authentication failure." },
      { status: 403, description: "Blocked by the fraud decision engine (IPH-FRD-031)." },
      { status: 409, description: "Duplicate end-to-end identification (IPH-DUP-011)." },
      {
        status: 422,
        description: "Business rule rejection — limits, funds or Verification of Payee.",
        body: initiatePaymentRejected,
      },
      { status: 502, description: "Scheme gateway protocol error (IPH-SCH-061)." },
    ],
    relatedRequirements: ["REQ-001", "REQ-003", "REQ-004", "REQ-005", "REQ-006", "REQ-011"],
  },
  {
    id: "API-002",
    method: "GET",
    path: "/payments/{paymentId}",
    summary: "Retrieve payment status",
    description:
      "Returns the authoritative status of a payment together with the stage-level transition history, the scheme reference and the recall eligibility window.",
    tag: "Payments",
    operationId: "getInstantPaymentStatus",
    auth: "OAuth 2.0 — scope payments:read",
    parameters: [
      ...standardHeaders,
      {
        name: "paymentId",
        in: "path",
        type: "string",
        required: true,
        description: "Internal payment identifier returned by the initiation call.",
        example: "IPH-P-20250602-0093312",
      },
      {
        name: "includeHistory",
        in: "query",
        type: "boolean",
        required: false,
        description: "When true, includes the full status transition history. Defaults to true.",
        example: "true",
      },
    ],
    responses: [
      { status: 200, description: "Current payment status.", body: statusResponse },
      { status: 404, description: "No payment exists for the supplied identifier." },
    ],
    relatedRequirements: ["REQ-012", "REQ-015", "REQ-021"],
  },
  {
    id: "API-003",
    method: "POST",
    path: "/payments/{paymentId}/recall",
    summary: "Raise a recall request",
    description:
      "Submits a camt.056 recall to the beneficiary bank for a settled payment. Restricted to Payments Operations and Fraud Operations roles and requires a second authoriser.",
    tag: "Recalls",
    operationId: "createPaymentRecall",
    auth: "OAuth 2.0 — scope payments:recall + four-eyes approval",
    parameters: [
      ...standardHeaders,
      {
        name: "paymentId",
        in: "path",
        type: "string",
        required: true,
        description: "Identifier of the settled payment to be recalled.",
        example: "IPH-P-20250602-0093312",
      },
    ],
    requestBody: recallRequest,
    responses: [
      { status: 201, description: "Recall case created and submitted.", body: recallResponse },
      { status: 403, description: "Second authoriser required (IPH-RCL-004)." },
      { status: 422, description: "Outside the 10 banking day window or invalid reason code." },
    ],
    relatedRequirements: ["REQ-013", "REQ-014"],
  },
];

const customerServiceEndpoints: ApiEndpoint[] = [
  {
    id: "API-004",
    method: "POST",
    path: "/verification-of-payee",
    summary: "Verify a beneficiary name",
    description:
      "Compares the customer-entered beneficiary name against the name registered at the account-holding institution and reports instant reachability in the same response.",
    tag: "Verification",
    operationId: "verifyPayee",
    auth: "OAuth 2.0 — scope beneficiaries:verify",
    parameters: [
      ...standardHeaders,
      {
        name: "X-Timeout-Budget-Ms",
        in: "header",
        type: "integer",
        required: false,
        description: "Caller latency budget; the service abandons the lookup when exceeded.",
        example: "1500",
      },
    ],
    requestBody: vopRequest,
    responses: [
      { status: 200, description: "Verification outcome.", body: vopResponse },
      { status: 404, description: "The beneficiary institution does not support verification." },
      { status: 504, description: "Verification timed out; treat as NOT_SUPPORTED." },
    ],
    relatedRequirements: ["REQ-002", "REQ-009"],
  },
  {
    id: "API-005",
    method: "GET",
    path: "/customers/{customerId}/instant-limits",
    summary: "Retrieve instant payment limits",
    description:
      "Returns the per-transaction and rolling 24-hour limits for the customer segment, the amount already used and any active temporary uplift.",
    tag: "Limits",
    operationId: "getInstantPaymentLimits",
    auth: "OAuth 2.0 — scope customers:limits:read",
    parameters: [
      ...standardHeaders,
      {
        name: "customerId",
        in: "path",
        type: "string",
        required: true,
        description: "Customer identifier from the customer master.",
        example: "CUS-4471902",
      },
    ],
    responses: [
      { status: 200, description: "Applicable limits and remaining allowance.", body: limitsResponse },
      { status: 404, description: "Customer not found." },
    ],
    relatedRequirements: ["REQ-010", "REQ-024"],
  },
];

export const apiServices: ApiService[] = [
  {
    id: "SVC-001",
    name: "Instant Payments API",
    basePath: "https://api.northbridge-bank.com/payments/instant/v2",
    version: "2.3.0",
    description:
      "Synchronous initiation, status enquiry and recall of SEPA Instant Credit Transfers for the bank's digital and servicing channels.",
    owner: "Payments Change Delivery",
    status: "Live",
    endpoints: paymentEndpoints,
  },
  {
    id: "SVC-002",
    name: "Payment Services Support API",
    basePath: "https://api.northbridge-bank.com/payment-services/v1",
    version: "1.4.0",
    description:
      "Supporting capabilities consumed during payment capture: beneficiary verification, reachability and customer limit enquiry.",
    owner: "Digital Banking",
    status: "Live",
    endpoints: customerServiceEndpoints,
  },
];

export const apiEndpoints: ApiEndpoint[] = apiServices.flatMap((service) => service.endpoints);

export function getApiEndpointById(id: string): ApiEndpoint | undefined {
  return apiEndpoints.find((endpoint) => endpoint.id === id);
}
