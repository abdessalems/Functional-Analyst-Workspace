import type { ApiEndpoint, ApiService } from "@/lib/types";

/**
 * EuroPay Hub API contracts, transcribed from `docs/06-api-contracts.md`.
 * Twenty-seven operations across identity, merchants, orders, customers,
 * payments, webhooks, dashboard and audit.
 */

const JWT_HEADER = {
  name: "Authorization",
  in: "header" as const,
  type: "string",
  required: true,
  description: "Bearer JWT issued by POST /api/auth/login.",
  example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...",
};

const EITHER_CREDENTIAL = {
  name: "Authorization | X-API-Key",
  in: "header" as const,
  type: "string",
  required: true,
  description: "Either a bearer JWT or a server-to-server API key.",
  example: "X-API-Key: epk_live_9f2c…",
};

const PAGE_PARAMS = [
  {
    name: "page",
    in: "query" as const,
    type: "integer",
    required: false,
    description: "Zero-based page index.",
    example: "0",
  },
  {
    name: "size",
    in: "query" as const,
    type: "integer",
    required: false,
    description: "Page size.",
    example: "20",
  },
];

const pageEnvelope = (item: string) => `{
  "content": [ ${item} ],
  "page": 0,
  "size": 20,
  "totalElements": 42,
  "totalPages": 3
}`;

const ORDER_JSON = `{
  "id": "8f1c…",
  "reference": "ORD-2026-000412",
  "status": "CREATED",
  "amount": 149.90,
  "currency": "EUR",
  "customerId": "b21e…",
  "createdAt": "2026-02-18T09:41:07Z"
}`;

const PAYMENT_JSON = `{
  "id": "3ac9…",
  "orderId": "8f1c…",
  "paymentMethod": "WERO",
  "amount": 149.90,
  "currency": "EUR",
  "status": "PENDING",
  "providerReference": "WERO-77410221",
  "failureReason": null,
  "createdAt": "2026-02-18T09:41:07Z"
}`;

const identity: ApiEndpoint[] = [
  {
    id: "API-EP-01",
    method: "POST",
    path: "/api/auth/register",
    summary: "Register a new merchant account",
    description:
      "Atomically creates the merchant and its first user. Email uniqueness is enforced platform-wide and the password is stored as a BCrypt hash.",
    tag: "Identity",
    operationId: "registerMerchant",
    auth: "Public",
    parameters: [],
    requestBody: `{
  "legalName": "Nordic Coffee Roasters BV",
  "email": "ops@nordiccoffee.example",
  "password": "••••••••"
}`,
    responses: [
      {
        status: 201,
        description: "Merchant and first user created.",
        body: `{
  "merchantId": "5c7a…",
  "userId": "9d20…",
  "email": "ops@nordiccoffee.example",
  "role": "MERCHANT",
  "status": "ACTIVE"
}`,
      },
      { status: 400, description: "VALIDATION_ERROR — request failed field validation." },
      { status: 409, description: "EMAIL_ALREADY_IN_USE — the email is already registered." },
    ],
    relatedRequirements: ["FR-1"],
  },
  {
    id: "API-EP-02",
    method: "POST",
    path: "/api/auth/login",
    summary: "Authenticate and obtain a JWT",
    description:
      "Returns a bearer token carrying the user's identity and role. Failures are deliberately indistinguishable so the endpoint cannot be used to enumerate accounts.",
    tag: "Identity",
    operationId: "login",
    auth: "Public",
    parameters: [],
    requestBody: `{
  "email": "ops@nordiccoffee.example",
  "password": "••••••••"
}`,
    responses: [
      {
        status: 200,
        description: "Authenticated.",
        body: `{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6…",
  "tokenType": "Bearer",
  "expiresInSeconds": 3600,
  "role": "MERCHANT"
}`,
      },
      {
        status: 401,
        description: "INVALID_CREDENTIALS — identical for unknown email and wrong password.",
      },
    ],
    relatedRequirements: ["FR-1"],
  },
  {
    id: "API-EP-03",
    method: "GET",
    path: "/api/merchants/me",
    summary: "Retrieve the authenticated merchant profile",
    description: "Returns the merchant record bound to the presented token.",
    tag: "Identity",
    operationId: "getMyMerchant",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    responses: [
      {
        status: 200,
        description: "Merchant profile.",
        body: `{
  "id": "5c7a…",
  "legalName": "Nordic Coffee Roasters BV",
  "email": "ops@nordiccoffee.example",
  "status": "ACTIVE",
  "createdAt": "2026-01-12T08:20:00Z"
}`,
      },
      { status: 401, description: "UNAUTHORIZED — missing or invalid token." },
    ],
    relatedRequirements: ["FR-1"],
  },
];

const apiKeys: ApiEndpoint[] = [
  {
    id: "API-EP-04",
    method: "POST",
    path: "/api/merchants/me/api-keys",
    summary: "Generate a server-to-server API key",
    description:
      "The plaintext secret is returned exactly once. Only the prefix and a BCrypt hash are persisted, so a leaked database cannot be used to authenticate.",
    tag: "API Keys",
    operationId: "createApiKey",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    requestBody: `{
  "name": "Checkout server",
  "expiresAt": null
}`,
    responses: [
      {
        status: 201,
        description: "Key created — the secret is shown only in this response.",
        body: `{
  "id": "a11f…",
  "name": "Checkout server",
  "prefix": "epk_live_9f2c",
  "secretKey": "epk_live_9f2c8b41d7e6…",
  "status": "ACTIVE",
  "createdAt": "2026-02-18T09:00:00Z",
  "expiresAt": null
}`,
      },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN — role does not permit key management." },
    ],
    relatedRequirements: ["FR-2"],
  },
  {
    id: "API-EP-05",
    method: "GET",
    path: "/api/merchants/me/api-keys",
    summary: "List API keys with secrets masked",
    description: "Returns prefixes and metadata only; the secret is never retrievable after creation.",
    tag: "API Keys",
    operationId: "listApiKeys",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    responses: [
      {
        status: 200,
        description: "Keys for this merchant.",
        body: `[
  {
    "id": "a11f…",
    "name": "Checkout server",
    "prefix": "epk_live_9f2c",
    "status": "ACTIVE",
    "createdAt": "2026-02-18T09:00:00Z",
    "lastUsedAt": "2026-02-18T09:41:07Z",
    "expiresAt": null
  }
]`,
      },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-2"],
  },
  {
    id: "API-EP-06",
    method: "DELETE",
    path: "/api/merchants/me/api-keys/{id}",
    summary: "Revoke an API key",
    description:
      "Revocation is immediate. A key belonging to another merchant returns 404 rather than 403, so the endpoint does not confirm that the key exists.",
    tag: "API Keys",
    operationId: "revokeApiKey",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [
      JWT_HEADER,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Identifier of the key to revoke.",
        example: "a11f…",
      },
    ],
    responses: [
      { status: 204, description: "Revoked — the key can no longer authenticate." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
      { status: 404, description: "NOT_FOUND — including keys owned by another merchant." },
    ],
    relatedRequirements: ["FR-2"],
  },
];

const orders: ApiEndpoint[] = [
  {
    id: "API-EP-07",
    method: "POST",
    path: "/api/orders",
    summary: "Create a new order",
    description:
      "Creates the commercial intent a payment is later raised against. The customer is reused when the email already exists for this merchant, and the reference is generated when not supplied.",
    tag: "Orders",
    operationId: "createOrder",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    requestBody: `{
  "customer": { "email": "lena@example.com", "fullName": "Lena Brandt" },
  "amount": 149.90,
  "reference": null
}`,
    responses: [
      { status: 201, description: "Order created in CREATED.", body: ORDER_JSON },
      { status: 400, description: "VALIDATION_ERROR." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
      { status: 409, description: "AMOUNT_EXCEEDS_MAX — above the configured maximum." },
      { status: 409, description: "REFERENCE_TAKEN — reference already used by this merchant." },
    ],
    relatedRequirements: ["FR-3"],
  },
  {
    id: "API-EP-08",
    method: "GET",
    path: "/api/orders/{id}",
    summary: "Retrieve a single order",
    description: "Scoped to the calling merchant; another merchant's order returns 404.",
    tag: "Orders",
    operationId: "getOrder",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [
      JWT_HEADER,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Order identifier.",
        example: "8f1c…",
      },
    ],
    responses: [
      { status: 200, description: "Order.", body: ORDER_JSON },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
      { status: 404, description: "NOT_FOUND." },
    ],
    relatedRequirements: ["FR-3"],
  },
  {
    id: "API-EP-09",
    method: "GET",
    path: "/api/orders",
    summary: "List orders with pagination",
    description: "Newest first, wrapped in the standard page envelope.",
    tag: "Orders",
    operationId: "listOrders",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER, ...PAGE_PARAMS],
    responses: [
      { status: 200, description: "Paged orders.", body: pageEnvelope("{ …order… }") },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-3"],
  },
  {
    id: "API-EP-10",
    method: "POST",
    path: "/api/orders/{id}/cancel",
    summary: "Cancel an order",
    description: "Permitted only while the order is still in CREATED.",
    tag: "Orders",
    operationId: "cancelOrder",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [
      JWT_HEADER,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Order identifier.",
        example: "8f1c…",
      },
    ],
    responses: [
      { status: 200, description: "Order moved to CANCELLED." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
      { status: 404, description: "NOT_FOUND." },
      { status: 409, description: "ORDER_NOT_CANCELLABLE — the order has left CREATED." },
    ],
    relatedRequirements: ["FR-3"],
  },
];

const customers: ApiEndpoint[] = [
  {
    id: "API-EP-11",
    method: "GET",
    path: "/api/customers",
    summary: "List customers with pagination",
    description: "Customers are owned by the merchant and identified by the email and merchant tuple.",
    tag: "Customers",
    operationId: "listCustomers",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER, ...PAGE_PARAMS],
    responses: [
      {
        status: 200,
        description: "Paged customers.",
        body: pageEnvelope(
          `{ "id": "b21e…", "email": "lena@example.com", "fullName": "Lena Brandt", "createdAt": "2026-01-30T11:02:00Z" }`,
        ),
      },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-3"],
  },
  {
    id: "API-EP-12",
    method: "GET",
    path: "/api/customers/{id}",
    summary: "Retrieve a single customer",
    description: "Scoped to the calling merchant.",
    tag: "Customers",
    operationId: "getCustomer",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [
      JWT_HEADER,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Customer identifier.",
        example: "b21e…",
      },
    ],
    responses: [
      { status: 200, description: "Customer." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
      { status: 404, description: "NOT_FOUND." },
    ],
    relatedRequirements: ["FR-3"],
  },
  {
    id: "API-EP-13",
    method: "GET",
    path: "/api/customers/{id}/orders",
    summary: "List a customer's orders",
    description: "Order history for one customer, paginated.",
    tag: "Customers",
    operationId: "listCustomerOrders",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [
      JWT_HEADER,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Customer identifier.",
        example: "b21e…",
      },
      ...PAGE_PARAMS,
    ],
    responses: [
      { status: 200, description: "Paged orders for the customer." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
      { status: 404, description: "NOT_FOUND." },
    ],
    relatedRequirements: ["FR-3"],
  },
];

const payments: ApiEndpoint[] = [
  {
    id: "API-EP-14",
    method: "POST",
    path: "/api/payments",
    summary: "Initiate a payment for an order",
    description:
      "The provider is resolved from the registry by payment method, so Wero, Bancontact and Visa are configuration rather than branching logic. Amount and currency are inherited from the order. Supplying an Idempotency-Key makes the call safe to retry.",
    tag: "Payments",
    operationId: "createPayment",
    auth: "Bearer JWT or X-API-Key",
    parameters: [
      EITHER_CREDENTIAL,
      {
        name: "Idempotency-Key",
        in: "header",
        type: "string",
        required: false,
        description: "Replaying the same key returns the original payment instead of creating a second.",
        example: "idem-8842011-20260218",
      },
    ],
    requestBody: `{
  "orderId": "8f1c…",
  "paymentMethod": "WERO"
}`,
    responses: [
      { status: 201, description: "Payment created (PENDING, or AUTHORIZED for Visa).", body: PAYMENT_JSON },
      { status: 400, description: "VALIDATION_ERROR." },
      { status: 401, description: "UNAUTHORIZED / INVALID_CREDENTIALS." },
      { status: 404, description: "NOT_FOUND — unknown order." },
      { status: 409, description: "ORDER_NOT_PAYABLE — the order is not in a payable state." },
      { status: 409, description: "IDEMPOTENCY_KEY_REUSED — same key, different request." },
    ],
    relatedRequirements: ["FR-4", "FR-6"],
  },
  {
    id: "API-EP-15",
    method: "GET",
    path: "/api/payments/{id}",
    summary: "Retrieve a single payment",
    description: "Authoritative state of one payment.",
    tag: "Payments",
    operationId: "getPayment",
    auth: "Bearer JWT or X-API-Key",
    parameters: [
      EITHER_CREDENTIAL,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Payment identifier.",
        example: "3ac9…",
      },
    ],
    responses: [
      { status: 200, description: "Payment.", body: PAYMENT_JSON },
      { status: 401, description: "UNAUTHORIZED / INVALID_CREDENTIALS." },
      { status: 404, description: "NOT_FOUND." },
    ],
    relatedRequirements: ["FR-4", "FR-5"],
  },
  {
    id: "API-EP-16",
    method: "GET",
    path: "/api/payments",
    summary: "List payments with pagination",
    description: "Newest first.",
    tag: "Payments",
    operationId: "listPayments",
    auth: "Bearer JWT or X-API-Key",
    parameters: [EITHER_CREDENTIAL, ...PAGE_PARAMS],
    responses: [
      { status: 200, description: "Paged payments.", body: pageEnvelope("{ …payment… }") },
      { status: 401, description: "UNAUTHORIZED / INVALID_CREDENTIALS." },
    ],
    relatedRequirements: ["FR-4", "FR-12"],
  },
  {
    id: "API-EP-17",
    method: "POST",
    path: "/api/payments/{id}/approve",
    summary: "Confirm a pending or authorised payment",
    description: "Marks the payment SUCCESS and moves the associated order to PAID.",
    tag: "Payments",
    operationId: "approvePayment",
    auth: "Bearer JWT or X-API-Key",
    parameters: [
      EITHER_CREDENTIAL,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Payment identifier.",
        example: "3ac9…",
      },
    ],
    responses: [
      { status: 200, description: "Payment SUCCESS; order PAID." },
      { status: 401, description: "UNAUTHORIZED / INVALID_CREDENTIALS." },
      { status: 404, description: "NOT_FOUND." },
      { status: 409, description: "Illegal state transition — rejected by the state machine." },
    ],
    relatedRequirements: ["FR-5", "FR-8"],
  },
  {
    id: "API-EP-18",
    method: "POST",
    path: "/api/payments/{id}/cancel",
    summary: "Cancel a payment",
    description: "Permitted only before completion.",
    tag: "Payments",
    operationId: "cancelPayment",
    auth: "Bearer JWT or X-API-Key",
    parameters: [
      EITHER_CREDENTIAL,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Payment identifier.",
        example: "3ac9…",
      },
    ],
    responses: [
      { status: 200, description: "Payment CANCELLED." },
      { status: 401, description: "UNAUTHORIZED / INVALID_CREDENTIALS." },
      { status: 404, description: "NOT_FOUND." },
      { status: 409, description: "CANCEL_NOT_ALLOWED." },
    ],
    relatedRequirements: ["FR-8", "FR-5"],
  },
  {
    id: "API-EP-19",
    method: "POST",
    path: "/api/payments/{id}/refund",
    summary: "Refund a successful or settled payment",
    description: "Full refund only, and only from SUCCESS or SETTLED.",
    tag: "Payments",
    operationId: "refundPayment",
    auth: "Bearer JWT or X-API-Key",
    parameters: [
      EITHER_CREDENTIAL,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Payment identifier.",
        example: "3ac9…",
      },
    ],
    requestBody: `{
  "reason": "Customer returned the goods"
}`,
    responses: [
      { status: 200, description: "Payment REFUNDED and a refund record created." },
      { status: 401, description: "UNAUTHORIZED / INVALID_CREDENTIALS." },
      { status: 404, description: "NOT_FOUND." },
      { status: 409, description: "REFUND_NOT_ALLOWED — payment is not SUCCESS or SETTLED." },
    ],
    relatedRequirements: ["FR-7"],
  },
  {
    id: "API-EP-20",
    method: "POST",
    path: "/api/payments/{id}/retry",
    summary: "Resubmit a failed payment to the provider",
    description: "Bounded retry for a payment that failed at the provider.",
    tag: "Payments",
    operationId: "retryPayment",
    auth: "Bearer JWT or X-API-Key",
    parameters: [
      EITHER_CREDENTIAL,
      {
        name: "id",
        in: "path",
        type: "uuid",
        required: true,
        description: "Payment identifier.",
        example: "3ac9…",
      },
    ],
    responses: [
      { status: 200, description: "Payment resubmitted." },
      { status: 401, description: "UNAUTHORIZED / INVALID_CREDENTIALS." },
      { status: 404, description: "NOT_FOUND." },
      { status: 409, description: "RETRY_NOT_ALLOWED." },
    ],
    relatedRequirements: ["FR-8"],
  },
];

const webhooks: ApiEndpoint[] = [
  {
    id: "API-EP-21",
    method: "PUT",
    path: "/api/webhooks/endpoint",
    summary: "Configure or update the webhook endpoint",
    description:
      "Registers the merchant HTTPS endpoint that receives signed payment lifecycle events. The signing secret is shown once and masked on every later read.",
    tag: "Webhooks",
    operationId: "putWebhookEndpoint",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    requestBody: `{
  "url": "https://merchant.example/hooks/europay",
  "secret": null
}`,
    responses: [
      {
        status: 200,
        description: "Endpoint stored; secret returned once.",
        body: `{
  "url": "https://merchant.example/hooks/europay",
  "active": true,
  "secret": "whsec_2f81c4…",
  "createdAt": "2026-02-18T09:00:00Z"
}`,
      },
      { status: 400, description: "VALIDATION_ERROR." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-9"],
  },
  {
    id: "API-EP-22",
    method: "GET",
    path: "/api/webhooks/endpoint",
    summary: "Retrieve the webhook endpoint configuration",
    description: "The secret is masked in this response.",
    tag: "Webhooks",
    operationId: "getWebhookEndpoint",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    responses: [
      { status: 200, description: "Endpoint with masked secret." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
      { status: 404, description: "NOT_FOUND — no endpoint configured." },
    ],
    relatedRequirements: ["FR-9"],
  },
  {
    id: "API-EP-23",
    method: "DELETE",
    path: "/api/webhooks/endpoint",
    summary: "Disable webhook delivery",
    description: "Stops delivery without deleting the historical event log.",
    tag: "Webhooks",
    operationId: "deleteWebhookEndpoint",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    responses: [
      { status: 204, description: "Delivery disabled." },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-9"],
  },
  {
    id: "API-EP-24",
    method: "GET",
    path: "/api/webhooks/events",
    summary: "List webhook delivery events",
    description:
      "Every attempt is logged with its status code and attempt count, which is what makes a failed delivery diagnosable.",
    tag: "Webhooks",
    operationId: "listWebhookEvents",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER, ...PAGE_PARAMS],
    responses: [
      {
        status: 200,
        description: "Paged delivery events.",
        body: pageEnvelope(
          `{ "id": "e77a…", "eventType": "payment.success", "status": "DELIVERED", "attempts": 1, "lastStatusCode": 200, "paymentId": "3ac9…", "createdAt": "2026-02-18T09:41:09Z" }`,
        ),
      },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-10"],
  },
];

const reporting: ApiEndpoint[] = [
  {
    id: "API-EP-25",
    method: "GET",
    path: "/api/dashboard",
    summary: "Retrieve merchant dashboard metrics",
    description:
      "Aggregated server-side and scoped to the calling merchant — the query never loads full tables into memory.",
    tag: "Dashboard",
    operationId: "getDashboard",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER],
    responses: [
      {
        status: 200,
        description: "Metrics for this merchant.",
        body: `{
  "revenue": 18420.50,
  "orderCount": 142,
  "paymentCount": 151,
  "pendingCount": 4,
  "successRate": 93,
  "paymentsByMethod": [ { "key": "WERO", "count": 88 }, { "key": "VISA", "count": 51 } ],
  "paymentsByStatus": [ { "key": "SUCCESS", "count": 133 }, { "key": "FAILED", "count": 14 } ],
  "revenueByDay": [ { "date": "2026-02-17", "amount": 1420.00 } ]
}`,
      },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-12"],
  },
  {
    id: "API-EP-26",
    method: "GET",
    path: "/api/audit-logs",
    summary: "List audit trail events",
    description:
      "Append-only record of significant actions, newest first, filtered to the calling merchant.",
    tag: "Audit",
    operationId: "listAuditLogs",
    auth: "OAuth 2.0 bearer JWT",
    parameters: [JWT_HEADER, ...PAGE_PARAMS],
    responses: [
      {
        status: 200,
        description: "Paged audit events.",
        body: pageEnvelope(
          `{ "id": "aud1…", "actor": "ops@nordiccoffee.example", "action": "PAYMENT_SUCCESS", "entityType": "Payment", "entityId": "3ac9…", "metadata": {}, "createdAt": "2026-02-18T09:41:08Z" }`,
        ),
      },
      { status: 401, description: "UNAUTHORIZED." },
      { status: 403, description: "FORBIDDEN." },
    ],
    relatedRequirements: ["FR-11"],
  },
];

export const europayApiServices: ApiService[] = [
  {
    id: "SVC-EP-01",
    name: "EuroPay Hub API",
    basePath: "https://api.europay-hub.example",
    version: "1.0.0",
    description:
      "One consistent contract in front of several payment rails. Identity and key management, orders and customers, the payment lifecycle, webhooks, dashboard metrics and the audit trail.",
    owner: "Saadaoui Abdessalem",
    status: "Live",
    endpoints: [
      ...identity,
      ...apiKeys,
      ...orders,
      ...customers,
      ...payments,
      ...webhooks,
      ...reporting,
    ],
  },
];
