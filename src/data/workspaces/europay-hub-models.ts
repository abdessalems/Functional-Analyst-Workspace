import type { Diagram, FunctionalSpecSection } from "@/lib/types";

/**
 * EuroPay Hub UML/BPMN models and functional specification, transcribed from
 * `docs/diagrams/plantuml/` and `docs/02-functional-specification.md`.
 *
 * The `.puml` sources are reproduced as written — they are the authoritative
 * artefact and render in any PlantUML tool.
 */

export const europayDiagrams: Diagram[] = [
  {
    id: "UML-EP-01",
    title: "Use Case Model",
    type: "Use Case",
    description:
      "Actors and use cases grouped by capability: identity and merchant, orders and customers, payments, and insights. Notes carry the governing rules directly on the diagram.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-1", "FR-2", "FR-3", "FR-4", "FR-7", "FR-12"],
    source: `@startuml EuroPayHub-UseCase
' EuroPay Hub — Use Case Diagram (Functional Analysis)
left to right direction
skinparam actorStyle awesome
skinparam packageStyle rectangle

actor "Merchant\\n(dashboard user)" as Merchant
actor "Merchant Server\\n(API key)"      as Server
actor "Customer"                        as Customer
actor "Payment Provider"                as Provider <<external>>
actor "Scheduler"                       as Scheduler <<system>>

rectangle "EuroPay Hub" {

  package "Identity & Merchant" {
    usecase "Register merchant"        as UC_Register
    usecase "Log in (JWT)"             as UC_Login
    usecase "Manage API keys"          as UC_ApiKeys
    usecase "Configure webhook"        as UC_Webhook
  }

  package "Orders & Customers" {
    usecase "Create order"             as UC_CreateOrder
    usecase "Cancel order"             as UC_CancelOrder
    usecase "View customers & history" as UC_Customers
  }

  package "Payments" {
    usecase "Create payment"           as UC_CreatePayment
    usecase "Approve payment"          as UC_Approve
    usecase "Refund payment"           as UC_Refund
    usecase "Cancel / retry payment"   as UC_CancelRetry
    usecase "View payments"            as UC_ViewPayments
  }

  package "Insights" {
    usecase "View dashboard metrics"   as UC_Dashboard
    usecase "View audit log"           as UC_Audit
    usecase "View webhook deliveries"  as UC_Deliveries
  }

  usecase "Deliver signed webhook"     as UC_Deliver
  usecase "Expire stale payments"      as UC_Expire
}

Merchant --> UC_Register
Merchant --> UC_Login
Merchant --> UC_ApiKeys
Merchant --> UC_Webhook
Merchant --> UC_CreateOrder
Merchant --> UC_CancelOrder
Merchant --> UC_Customers
Merchant --> UC_CreatePayment
Merchant --> UC_Approve
Merchant --> UC_Refund
Merchant --> UC_CancelRetry
Merchant --> UC_ViewPayments
Merchant --> UC_Dashboard
Merchant --> UC_Audit
Merchant --> UC_Deliveries

Server --> UC_CreatePayment
Customer ..> UC_Approve : approves\\n(account methods)

UC_CreatePayment ..> Provider : <<include>> submit
UC_Deliver --> Provider
Scheduler --> UC_Deliver
Scheduler --> UC_Expire

note bottom of UC_Refund
  Only SUCCESS / SETTLED payments (BR-022)
end note
note bottom of UC_CreatePayment
  Idempotency-Key dedup (BR-041)
end note
@enduml`,
  },
  {
    id: "UML-EP-02",
    title: "Domain Class Diagram",
    type: "Class",
    description:
      "Tactical DDD model: aggregate roots, the Money value object, status enumerations and the PaymentProvider port that keeps the rails swappable.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-4", "FR-5", "FR-7"],
    source: `@startuml EuroPayHub-ClassDiagram
' EuroPay Hub — Domain Class Diagram (tactical DDD)
skinparam classAttributeIconSize 0
hide empty members

enum Role { ADMIN \\n MERCHANT }
enum MerchantStatus { ACTIVE \\n SUSPENDED }
enum ApiKeyStatus { ACTIVE \\n REVOKED }
enum OrderStatus { CREATED \\n PAID \\n CANCELLED \\n EXPIRED }
enum PaymentMethod { WERO \\n BANCONTACT \\n VISA \\n MASTERCARD \\n SEPA_INSTANT \\n PAYPAL \\n APPLE_PAY }
enum PaymentStatus { CREATED \\n PENDING \\n AUTHORIZED \\n SUCCESS \\n FAILED \\n EXPIRED \\n CANCELLED \\n REFUNDED \\n SETTLED }
enum WebhookStatus { PENDING \\n DELIVERED \\n FAILED }

class Money <<value object>> {
  - amountMinor : long
  - currency : Currency
  + ofMajor(BigDecimal, Currency) : Money
  + isPositive() : boolean
}

class Merchant <<aggregate root>> {
  - id : UUID
  - legalName : String
  - email : String
  - status : MerchantStatus
  + register(legalName, email) : Merchant
}

class User <<aggregate root>> {
  - id : UUID
  - merchantId : UUID
  - email : String
  - passwordHash : String
  - role : Role
  + registerMerchantUser(...) : User
}

class ApiKey <<aggregate root>> {
  - id : UUID
  - merchantId : UUID
  - keyPrefix : String
  - keyHash : String
  - status : ApiKeyStatus
  + isUsable(now) : boolean
  + revoke()
}

class Customer <<aggregate root>> {
  - id : UUID
  - merchantId : UUID
  - email : String
  - fullName : String
}

class Order <<aggregate root>> {
  - id : UUID
  - merchantId : UUID
  - customerId : UUID
  - reference : String
  - amount : Money
  - status : OrderStatus
  + cancel()
  + markPaid()
}

class Payment <<aggregate root>> {
  - id : UUID
  - merchantId : UUID
  - orderId : UUID
  - method : PaymentMethod
  - amount : Money
  - status : PaymentStatus
  - providerReference : String
  + submit(ref) : void
  + authorize() / markSucceeded()
  + fail(reason) / refund() / cancel() / expire() / retry(ref)
}

class Refund <<aggregate root>> {
  - id : UUID
  - paymentId : UUID
  - amount : Money
  - reason : String
}

class WebhookEndpoint <<aggregate root>> {
  - id : UUID
  - merchantId : UUID
  - url : String
  - secret : String
  - active : boolean
}

class WebhookEvent <<aggregate root>> {
  - id : UUID
  - eventType : String
  - payload : String
  - status : WebhookStatus
  - attempts : int
  - nextAttemptAt : Instant
  + markDelivered(code)
  + recordFailure(code, error)
}

class WebhookDelivery {
  - id : UUID
  - attempt : int
  - statusCode : Integer
  - success : boolean
}

class AuditLog {
  - id : UUID
  - merchantId : UUID
  - actor : String
  - action : String
  - entityType : String
}

interface PaymentProvider <<port>> {
  + supportedMethod() : PaymentMethod
  + submit(Payment) : ProviderResult
}

Merchant "1" o-- "0..*" User
Merchant "1" o-- "0..*" ApiKey
Merchant "1" o-- "0..*" Customer
Merchant "1" o-- "0..*" WebhookEndpoint
Customer "1" -- "0..*" Order
Order "1" -- "1" Payment
Payment "1" o-- "0..*" Refund
Payment ..> PaymentStatus
Order ..> Money
Payment ..> Money
WebhookEvent "1" o-- "0..*" WebhookDelivery
PaymentProvider ..> Payment : submits
@enduml`,
  },
  {
    id: "UML-EP-03",
    title: "Entity Relationship Diagram",
    type: "ER",
    description:
      "Physical model as migrated by Flyway V1–V7, including the uniqueness constraints that enforce the business rules — customer per merchant, order reference per merchant, idempotency key per merchant.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-3", "FR-6", "FR-9", "FR-11"],
    source: `@startuml EuroPayHub-ERD
' EuroPay Hub — Entity Relationship Diagram (physical model, Flyway V1-V7)
skinparam linetype ortho
hide circle

entity MERCHANT {
  * id : UUID <<PK>>
  --
  legal_name
  email <<UK>>
  status
}
entity APP_USER {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK>>
  email <<UK>>
  password_hash
  role
}
entity API_KEY {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK>>
  key_prefix
  key_hash <<UK>>
  status
}
entity CUSTOMER {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK>>
  email
  full_name
  == unique(merchant_id, email) ==
}
entity ORDERS {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK>>
  customer_id : UUID <<FK>>
  reference
  amount_minor
  currency
  status
  == unique(merchant_id, reference) ==
}
entity PAYMENT {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK>>
  order_id : UUID <<FK>>
  payment_method
  amount_minor
  status
  provider_reference
}
entity REFUND {
  * id : UUID <<PK>>
  --
  payment_id : UUID <<FK>>
  amount_minor
  reason
}
entity IDEMPOTENCY_KEY {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK>>
  idempotency_key
  request_hash
  payment_id
  == unique(merchant_id, idempotency_key) ==
}
entity WEBHOOK_ENDPOINT {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK,UK>>
  url
  secret
  active
}
entity WEBHOOK_EVENT {
  * id : UUID <<PK>>
  --
  merchant_id : UUID <<FK>>
  event_type
  payload
  status
  attempts
  next_attempt_at
}
entity WEBHOOK_DELIVERY {
  * id : UUID <<PK>>
  --
  webhook_event_id : UUID <<FK>>
  attempt
  status_code
  success
}
entity AUDIT_LOG {
  * id : UUID <<PK>>
  --
  merchant_id : UUID
  actor
  action
  entity_type
}

MERCHANT ||--o{ APP_USER
MERCHANT ||--o{ API_KEY
MERCHANT ||--o{ CUSTOMER
MERCHANT ||--o{ ORDERS
MERCHANT ||--o{ WEBHOOK_ENDPOINT
MERCHANT ||--o{ WEBHOOK_EVENT
MERCHANT ||--o{ AUDIT_LOG
CUSTOMER ||--o{ ORDERS
ORDERS  ||--|| PAYMENT
PAYMENT ||--o{ REFUND
WEBHOOK_EVENT ||--o{ WEBHOOK_DELIVERY
@enduml`,
  },
  {
    id: "UML-EP-04",
    title: "Payment State Machine",
    type: "State",
    description:
      "The core invariant of the platform. Every permitted transition is named, and the notes bind the diagram to the rules that constrain it.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-5", "FR-7", "FR-8"],
    source: `@startuml EuroPayHub-PaymentState
' EuroPay Hub — Payment State Machine (the core invariant)
[*] --> CREATED : create()

CREATED   --> PENDING    : submit()
CREATED   --> CANCELLED  : cancel()
PENDING   --> AUTHORIZED : authorize()
PENDING   --> SUCCESS    : markSucceeded()
PENDING   --> FAILED     : fail()
PENDING   --> EXPIRED    : expire() [scheduler]
PENDING   --> CANCELLED  : cancel()
AUTHORIZED --> SUCCESS   : markSucceeded()
AUTHORIZED --> CANCELLED : cancel()
AUTHORIZED --> FAILED    : fail()
SUCCESS   --> SETTLED    : settle()
SUCCESS   --> REFUNDED   : refund()
SETTLED   --> REFUNDED   : refund()
FAILED    --> PENDING    : retry()

EXPIRED   --> [*]
CANCELLED --> [*]
REFUNDED  --> [*]
SETTLED   --> [*]

note right of SUCCESS
  Approving a SUCCESS payment
  marks the order PAID (BR-050)
end note
note right of REFUNDED
  Only from SUCCESS / SETTLED (BR-022)
end note
@enduml`,
  },
  {
    id: "UML-EP-05",
    title: "Sequence — Merchant Registration",
    type: "Sequence",
    description:
      "Registration flow showing the uniqueness check across both repositories, the atomic merchant and user creation, and the audit event published on success.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-1", "FR-11"],
    source: `@startuml EuroPayHub-Seq-Registration
' EuroPay Hub — Merchant registration (UC-001)
autonumber
actor Merchant
participant "AuthController" as C
participant "AuthService" as S
database "MerchantRepository" as MR
database "UserRepository" as UR
participant "AuditListener" as AU

Merchant -> C : POST /api/auth/register\\n{legalName, email, password}
C -> S : register(request)
S -> UR : existsByEmail(email)
S -> MR : existsByEmail(email)
alt email already used
  S --> C : EmailAlreadyInUseException
  C --> Merchant : 409 EMAIL_ALREADY_IN_USE
else unique
  S -> MR : save(Merchant.register)
  S -> UR : save(User + bcrypt(password))
  S ->> AU : publish AuditEvent(MERCHANT_REGISTERED)
  S --> C : RegisterResponse
  C --> Merchant : 201 {merchantId, userId, role}
end
@enduml`,
  },
  {
    id: "UML-EP-06",
    title: "Sequence — Create Payment",
    type: "Sequence",
    description:
      "Payment creation with idempotent replay and provider selection by Strategy. The replay branch returns the original payment before any provider call is made.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-4", "FR-6", "FR-5"],
    source: `@startuml EuroPayHub-Seq-CreatePayment
' EuroPay Hub — Create payment with idempotency + provider Strategy (UC-004)
autonumber
actor "Merchant / Server" as Client
participant "PaymentController" as C
participant "PaymentService" as S
database "IdempotencyStore" as I
database "OrderRepository" as O
participant "PaymentProvider\\n(Strategy)" as P
database "PaymentRepository" as PR
participant "Outbox + Audit\\nlisteners" as L

Client -> C : POST /api/payments\\n{orderId, method}  [Idempotency-Key]
C -> S : create(merchantId, request, key)
opt key present
  S -> I : find(merchant, key)
  alt same request already processed
    I --> S : record
    S --> Client : 201 original payment (replay)
  end
end
S -> O : load order (owned, CREATED)
S -> S : Payment.create(...)
S -> P : submit(payment)
P --> S : ProviderResult(ref, outcome)
S -> S : payment.submit(ref); apply outcome
S -> PR : save(payment)
S ->> L : publish PaymentDomainEvent(created, pending/authorized)
opt key present
  S -> I : save(record)
end
S --> Client : 201 PaymentResponse
@enduml`,
  },
  {
    id: "UML-EP-07",
    title: "Sequence — Webhook Delivery",
    type: "Sequence",
    description:
      "Transactional outbox written atomically with the payment, then asynchronous signed delivery with exponential backoff and a three-attempt ceiling.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-9", "FR-10"],
    source: `@startuml EuroPayHub-Seq-Webhook
' EuroPay Hub — Transactional outbox + signed delivery with retry (UC-023)
autonumber
participant "PaymentService" as PS
participant "OutboxListener" as OL
database "webhook_event\\n(outbox)" as DB
participant "DispatchScheduler" as SC
participant "HttpWebhookSender" as SND
actor "Merchant endpoint" as M

group same transaction (atomic)
  PS ->> OL : PaymentDomainEvent
  OL -> DB : INSERT WebhookEvent (PENDING)\\nif endpoint active
end

... later, asynchronously ...

SC -> SND : dispatchDue()
SND -> SND : sign = HMAC_SHA256(secret, body)
SND -> M : POST payload\\nX-EuroPay-Signature: sha256=<hmac>
alt 2xx
  M --> SND : 200
  SND -> DB : mark DELIVERED + log delivery
else non-2xx / timeout
  M --> SND : 5xx / error
  SND -> DB : recordFailure -> retry (30s,60s...)\\nor FAILED after 3
end
@enduml`,
  },
  {
    id: "UML-EP-08",
    title: "Payment Process — BPMN",
    type: "BPMN",
    description:
      "The payment collection process across four swimlanes — customer, merchant, hub and provider — including the idempotency short-circuit, the card versus account-method branch, and the outbox write inside the same transaction.",
    version: "1.0",
    author: "Saadaoui Abdessalem",
    lastUpdated: "2026-02-18",
    relatedRequirements: ["FR-4", "FR-5", "FR-6", "FR-9"],
    source: `@startuml EuroPayHub-BPMN-PaymentProcess
' EuroPay Hub — Payment business process (BPMN-style, swimlanes)
title Payment collection process

|Customer|
start
:Place order request;

|Merchant|
:Create order (CREATED);
:Request payment\\n(choose method);

|EuroPay Hub|
:Check Idempotency-Key;
if (duplicate request?) then (yes)
  :Return original payment;
  stop
else (no)
endif
:Create Payment (CREATED);
:Route to provider (Strategy);

|Payment Provider|
:Process transaction;

|EuroPay Hub|
if (provider outcome?) then (DECLINED)
  :Payment FAILED;
  :Emit payment.failed;
  stop
elseif (AUTHORIZED - cards) then
  :Payment AUTHORIZED;
else (PENDING - account methods)
  :Payment PENDING;
  |Customer|
  :Approve payment;
  |EuroPay Hub|
endif
:Payment SUCCESS;
:Mark order PAID;
:Write outbox event\\n(same transaction);

|EuroPay Hub|
:Dispatch signed webhook\\n(HMAC, 3x retry);

|Merchant|
:Receive payment.success\\nnotification;
stop
@enduml`,
  },
];

export const europayFunctionalSpec: FunctionalSpecSection[] = [
  {
    id: "FS-EP-01",
    title: "Identity & Access (IAM)",
    summary:
      "Registration, login and authorisation: how a merchant obtains an identity the platform can trust, and how that identity is checked on every call.",
    requirementRefs: ["FR-1"],
    businessLogic: [
      "Registration creates a merchant and its owner user (role MERCHANT) atomically; passwords are BCrypt-hashed.",
      "Login verifies the hash and returns a stateless JWT (HS256).",
      "The token carries the user id, merchant id, email and role.",
      "A JWT is required for dashboard access, and role validation is applied with @PreAuthorize.",
    ],
    validations: [
      {
        field: "email",
        rule: "Unique across users and merchants",
        errorCode: "EMAIL_ALREADY_IN_USE",
        severity: "Blocking",
      },
      {
        field: "credentials",
        rule: "Password must match the stored BCrypt hash",
        errorCode: "INVALID_CREDENTIALS",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "UNAUTHORIZED",
        httpStatus: 401,
        message: "Unauthenticated — no valid token or credential was presented.",
        handling: "Identical response for unknown email and wrong password, to prevent enumeration.",
      },
      {
        code: "FORBIDDEN",
        httpStatus: 403,
        message: "Insufficient permissions for this operation.",
        handling: "Role checked with @PreAuthorize before the handler runs.",
      },
    ],
    fields: [
      {
        name: "role",
        type: "Enum",
        length: "—",
        mandatory: true,
        description: "ADMIN | MERCHANT",
        example: "MERCHANT",
      },
      {
        name: "passwordHash",
        type: "String",
        length: "60",
        mandatory: true,
        description: "BCrypt hash; the plaintext password is never stored.",
        example: "$2a$10$…",
      },
    ],
    edgeCases: [
      {
        id: "EC-EP-01",
        scenario: "An attacker probes the login endpoint to discover registered emails.",
        expectedBehaviour:
          "Unknown email and wrong password return identical 401 responses, so no account can be enumerated.",
      },
    ],
  },
  {
    id: "FS-EP-02",
    title: "Merchant & API Keys",
    summary:
      "Server-to-server credentials: generation, one-time display, storage as prefix and hash, and dual authentication alongside the JWT.",
    requirementRefs: ["FR-2"],
    businessLogic: [
      "Keys are generated using a CSPRNG.",
      "The secret is shown once, and stored as a prefix plus a BCrypt hash.",
      "Listing returns metadata only; revocation is immediate.",
      "Endpoints support dual authentication: a JWT, or the X-API-Key header for server-to-server calls.",
    ],
    validations: [
      {
        field: "apiKey",
        rule: "Must be active, unexpired and owned by the calling merchant",
        errorCode: "UNAUTHORIZED",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "NOT_FOUND",
        httpStatus: 404,
        message: "The API key does not exist.",
        handling:
          "Returned instead of 403 for another merchant's key, so the response leaks nothing about its existence.",
      },
    ],
    fields: [
      {
        name: "keyPrefix",
        type: "String",
        length: "16",
        mandatory: true,
        description: "Non-secret prefix used to identify the key in listings and logs.",
        example: "epk_live_9f2c",
      },
      {
        name: "keyHash",
        type: "String",
        length: "60",
        mandatory: true,
        description: "BCrypt hash of the secret; the secret itself is never persisted.",
        example: "$2a$10$…",
      },
    ],
    edgeCases: [
      {
        id: "EC-EP-02",
        scenario: "The merchant loses the secret after creation.",
        expectedBehaviour:
          "It cannot be recovered — a new key must be generated and the old one revoked.",
      },
    ],
  },
  {
    id: "FS-EP-03",
    title: "Customers & Orders",
    summary:
      "The commercial intent a payment is raised against: order creation, the order state machine and customer reuse.",
    requirementRefs: ["FR-3"],
    businessLogic: [
      "An order is associated with a customer, located by email or created if new.",
      "The amount is in EUR, must be positive and must not exceed the configured maximum.",
      "References are unique per merchant and auto-generated when not supplied.",
      "Order state machine: CREATED → PAID | CANCELLED | EXPIRED.",
      "Only CREATED orders may be cancelled; an order becomes PAID when its payment succeeds.",
    ],
    validations: [
      {
        field: "amount",
        rule: "Positive and at or below the configured maximum",
        errorCode: "AMOUNT_EXCEEDS_MAX",
        severity: "Blocking",
      },
      {
        field: "reference",
        rule: "Unique per merchant",
        errorCode: "REFERENCE_TAKEN",
        severity: "Blocking",
      },
      {
        field: "status",
        rule: "Cancellation permitted only from CREATED",
        errorCode: "ORDER_NOT_CANCELLABLE",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "ORDER_NOT_CANCELLABLE",
        httpStatus: 409,
        message: "The order can no longer be cancelled.",
        handling: "Returned when the order has left CREATED.",
      },
    ],
    fields: [
      {
        name: "reference",
        type: "String",
        length: "—",
        mandatory: false,
        description: "Merchant order reference; generated when not supplied, unique per merchant.",
        example: "ORD-2026-000412",
      },
      {
        name: "amount_minor",
        type: "Long",
        length: "—",
        mandatory: true,
        description: "Amount in minor units, held by the Money value object to avoid float error.",
        example: "14990",
      },
    ],
    edgeCases: [
      {
        id: "EC-EP-03",
        scenario: "The same customer email is used on a second order.",
        expectedBehaviour:
          "The existing customer is reused — customers are unique on the merchant and email tuple.",
      },
    ],
  },
  {
    id: "FS-EP-04",
    title: "Payments",
    summary:
      "Payment creation across seven mock providers, idempotent retry safety, and the state machine that makes the lifecycle deterministic.",
    requirementRefs: ["FR-4", "FR-5", "FR-6", "FR-8"],
    businessLogic: [
      "A payment is created for a CREATED order using one of seven mock providers: Wero, Bancontact, Visa, Mastercard, SEPA Instant, PayPal and Apple Pay.",
      "The provider is resolved by a Strategy factory rather than by branching logic.",
      "Card methods authorise immediately; account-based methods remain pending until the customer approves.",
      "An Idempotency-Key makes creation retry-safe — the same key and body return the same payment.",
      "Lifecycle: CREATED → PENDING → AUTHORIZED → SUCCESS → SETTLED, with FAILED (retryable), EXPIRED, CANCELLED and REFUNDED.",
      "A hand-rolled state machine permits only legal transitions.",
      "Approving a payment marks the corresponding order paid, and a scheduler expires stale pending payments.",
    ],
    validations: [
      {
        field: "Idempotency-Key",
        rule: "Same key with a different body is a conflict",
        errorCode: "IDEMPOTENCY_KEY_REUSED",
        severity: "Blocking",
      },
      {
        field: "order.status",
        rule: "The order must be payable",
        errorCode: "ORDER_NOT_PAYABLE",
        severity: "Blocking",
      },
      {
        field: "transition",
        rule: "Only transitions permitted by the state machine are accepted",
        errorCode: "ILLEGAL_TRANSITION",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "IDEMPOTENCY_KEY_REUSED",
        httpStatus: 409,
        message: "The idempotency key has already been used with a different request.",
        handling: "Caller must use a new key for a genuinely new payment.",
      },
      {
        code: "ORDER_NOT_PAYABLE",
        httpStatus: 409,
        message: "The order is not in a state that accepts payment.",
        handling: "Order must be CREATED.",
      },
    ],
    fields: [
      {
        name: "paymentMethod",
        type: "Enum",
        length: "—",
        mandatory: true,
        description: "WERO | BANCONTACT | VISA | MASTERCARD | SEPA_INSTANT | PAYPAL | APPLE_PAY",
        example: "WERO",
      },
      {
        name: "providerReference",
        type: "String",
        length: "—",
        mandatory: false,
        description: "Reference returned by the provider on submission.",
        example: "WERO-77410221",
      },
      {
        name: "status",
        type: "Enum",
        length: "—",
        mandatory: true,
        description:
          "CREATED | PENDING | AUTHORIZED | SUCCESS | FAILED | EXPIRED | CANCELLED | REFUNDED | SETTLED",
        example: "PENDING",
      },
    ],
    edgeCases: [
      {
        id: "EC-EP-04",
        scenario: "A pending account-method payment is never approved by the customer.",
        expectedBehaviour: "The scheduler expires it; an EXPIRED payment can no longer be approved.",
      },
      {
        id: "EC-EP-05",
        scenario: "The network drops after the provider call but before the response is received.",
        expectedBehaviour:
          "Replaying with the same Idempotency-Key returns the original payment; no second charge is created.",
      },
    ],
  },
  {
    id: "FS-EP-05",
    title: "Webhooks",
    summary:
      "Reliable outbound notification: transactional outbox, HMAC signing, bounded retry with backoff and a full delivery log.",
    requirementRefs: ["FR-9", "FR-10"],
    businessLogic: [
      "The merchant registers a callback URL and a secret.",
      "A payment state change writes a transactional outbox row, atomically with the payment.",
      "The POST body is signed with HMAC-SHA256.",
      "Delivery is retried up to 3 attempts with exponential backoff, and every attempt is logged.",
    ],
    validations: [
      {
        field: "response",
        rule: "Only a 2xx response counts as delivered",
        errorCode: "DELIVERY_FAILED",
        severity: "Warning",
      },
      {
        field: "attempts",
        rule: "Maximum of 3 attempts before the event is marked FAILED",
        errorCode: "DELIVERY_EXHAUSTED",
        severity: "Warning",
      },
    ],
    errors: [
      {
        code: "DELIVERY_EXHAUSTED",
        httpStatus: 200,
        message: "Event marked FAILED after three unsuccessful attempts.",
        handling:
          "Recorded against the event with each attempt's status code; the merchant can inspect the delivery log.",
      },
    ],
    fields: [
      {
        name: "X-EuroPay-Signature",
        type: "String",
        length: "—",
        mandatory: true,
        description: "HMAC-SHA256 of the body, computed with the merchant's secret.",
        example: "sha256=4f1c8a…",
      },
      {
        name: "nextAttemptAt",
        type: "Instant",
        length: "—",
        mandatory: false,
        description: "Scheduled time of the next retry, following the backoff sequence.",
        example: "2026-02-18T09:42:07Z",
      },
    ],
    edgeCases: [
      {
        id: "EC-EP-06",
        scenario: "The transaction rolls back after the event was prepared.",
        expectedBehaviour:
          "The outbox row is written in the same transaction, so it rolls back too — no event is emitted for work that did not happen.",
      },
    ],
  },
  {
    id: "FS-EP-06",
    title: "Audit & Dashboard",
    summary:
      "Append-only audit of significant actions, and server-computed metrics scoped to the merchant.",
    requirementRefs: ["FR-11", "FR-12"],
    businessLogic: [
      "Every important action is recorded in an append-only audit log.",
      "Audit writing is event-driven and happens in the same transaction as the triggering action.",
      "The dashboard returns server-computed KPIs and chart series using SQL aggregates.",
      "Every query is scoped to the calling merchant.",
    ],
    validations: [
      {
        field: "merchantId",
        rule: "Every read is filtered to the calling merchant",
        errorCode: "NOT_FOUND",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "NOT_FOUND",
        httpStatus: 404,
        message: "The record does not exist for this merchant.",
        handling: "Cross-merchant access returns 404 rather than 403.",
      },
    ],
    fields: [
      {
        name: "action",
        type: "String",
        length: "—",
        mandatory: true,
        description: "The audited action.",
        example: "PAYMENT_SUCCESS",
      },
      {
        name: "successRate",
        type: "Integer",
        length: "3",
        mandatory: true,
        description: "Percentage of payments reaching SUCCESS, aggregated in SQL.",
        example: "93",
      },
    ],
    edgeCases: [
      {
        id: "EC-EP-07",
        scenario: "A merchant requests another merchant's record by id.",
        expectedBehaviour: "404 is returned; ownership filtering is applied in the query itself.",
      },
    ],
  },
  {
    id: "FS-EP-07",
    title: "Cross-Cutting Concerns",
    summary:
      "The conventions that hold across every module: response envelope, error handling, pagination, documentation, migrations and architecture enforcement.",
    requirementRefs: ["FR-5", "FR-12"],
    businessLogic: [
      "A consistent ApiResponse<T> envelope and an ErrorResponse carrying error codes.",
      "Global exception handling, so no handler leaks a stack trace.",
      "Pagination through PageResponse<T>.",
      "OpenAPI/Swagger documentation generated for all endpoints.",
      "Flyway database migrations.",
      "Clean Architecture boundaries validated automatically by ArchUnit.",
    ],
    validations: [
      {
        field: "architecture",
        rule: "Domain must not depend on Spring, JPA or web packages",
        errorCode: "ARCH_VIOLATION",
        severity: "Blocking",
      },
    ],
    errors: [
      {
        code: "VALIDATION_ERROR",
        httpStatus: 400,
        message: "The request failed field validation.",
        handling: "Returned by the global handler with the offending fields.",
      },
    ],
    fields: [
      {
        name: "PageResponse<T>",
        type: "Envelope",
        length: "—",
        mandatory: true,
        description: "content, page, size, totalElements, totalPages",
        example: '{ "content": [], "page": 0, "size": 20 }',
      },
    ],
    edgeCases: [
      {
        id: "EC-EP-08",
        scenario: "A developer adds a JPA import to a domain class.",
        expectedBehaviour: "The ArchUnit test fails in CI before the change can merge.",
      },
    ],
  },
];
