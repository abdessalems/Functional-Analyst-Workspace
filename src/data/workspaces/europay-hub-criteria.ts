import type { AcceptanceCriterion } from "@/lib/types";

/**
 * Acceptance criteria transcribed from `docs/05-acceptance-criteria.md`,
 * keyed to the functional requirement each user story belongs to. The AC
 * numbering (AC-001.1 …) is the project's own, so a criterion here can be
 * matched to the test case that references it.
 */
export const europayCriteria: Record<string, AcceptanceCriterion[]> = {
  "FR-1": [
    {
      id: "AC-001.1",
      given: "a unique email",
      when: "I register with valid data",
      then: "a merchant and owner user are created and I receive 201 with merchantId, userId, role MERCHANT, status ACTIVE",
    },
    {
      id: "AC-001.2",
      given: "an email already registered",
      when: "I register again",
      then: "I receive 409 with code EMAIL_ALREADY_IN_USE",
    },
    {
      id: "AC-001.3",
      given: "an invalid email or a password shorter than 8 characters",
      when: "I register",
      then: "I receive 400 with code VALIDATION_ERROR and field details",
    },
    {
      id: "AC-002.1",
      given: "valid credentials",
      when: "I log in",
      then: "I receive 200 with an accessToken, tokenType=Bearer and expiresInSeconds",
    },
    {
      id: "AC-002.2",
      given: "a wrong password",
      when: "I log in",
      then: "I receive 401 with code INVALID_CREDENTIALS",
    },
    {
      id: "AC-002.3",
      given: "an unknown email",
      when: "I log in",
      then: "I receive the same 401 INVALID_CREDENTIALS — no user enumeration",
    },
    {
      id: "AC-002.4",
      given: "an issued token",
      when: "it is parsed back",
      then: "it round-trips to the same principal, and is rejected if signed with a different secret",
    },
    {
      id: "AC-003.1",
      given: "no token",
      when: "I call GET /api/merchants/me",
      then: "I receive 401",
    },
    {
      id: "AC-003.2",
      given: "a valid MERCHANT token",
      when: "I call GET /api/merchants/me",
      then: "I receive 200 with my merchant id, legalName, email and status",
    },
  ],
  "FR-2": [
    {
      id: "AC-004.1",
      given: "a valid token",
      when: "I create a key",
      then: "I receive 201 with a secretKey starting epk_live_ and its prefix",
    },
    {
      id: "AC-004.2",
      given: "a created key",
      when: "the stored record is inspected",
      then: "it contains a hash (not the secret) and only the prefix; the secret is never returned again",
    },
    {
      id: "AC-005.1",
      given: "I have keys",
      when: "I list them",
      then: "I receive 200 with each key's metadata and no secretKey field",
    },
    {
      id: "AC-006.1",
      given: "one of my keys",
      when: "I revoke it",
      then: "I receive 204 and the key can no longer authenticate",
    },
    {
      id: "AC-006.2",
      given: "a key that is not mine",
      when: "I revoke it",
      then: "I receive 404 — its existence is not revealed",
    },
  ],
  "FR-3": [
    {
      id: "AC-007.1",
      given: "a valid customer and amount",
      when: "I create an order",
      then: "I receive 201 with status CREATED, the amount, currency EUR, a customerId and a reference",
    },
    {
      id: "AC-007.2",
      given: "no reference",
      when: "I create an order",
      then: "a unique reference is generated",
    },
    {
      id: "AC-007.3",
      given: "an amount above the maximum",
      when: "I create an order",
      then: "I receive 409 AMOUNT_EXCEEDS_MAX",
    },
    {
      id: "AC-007.4",
      given: "a customer email that already exists for me",
      when: "I create another order",
      then: "the existing customer is reused, not duplicated",
    },
    {
      id: "AC-008.1",
      given: "one of my orders",
      when: "I GET it",
      then: "I receive 200 with its details",
    },
    {
      id: "AC-009.1",
      given: "I have orders",
      when: "I list them",
      then: "I receive a paginated envelope (content, page, size, totalElements, totalPages), newest first",
    },
    {
      id: "AC-009.2",
      given: "an order that is not mine",
      when: "I GET it",
      then: "I receive 404",
    },
    {
      id: "AC-010.1",
      given: "a CREATED order",
      when: "I cancel it",
      then: "I receive 200 with status CANCELLED",
    },
    {
      id: "AC-010.2",
      given: "an already-cancelled order",
      when: "I cancel it again",
      then: "I receive 409 ORDER_NOT_CANCELLABLE",
    },
    {
      id: "AC-011.1",
      given: "I created orders",
      when: "I list customers",
      then: "the customers appear paginated, and a customer not mine returns 404",
    },
    {
      id: "AC-012.1",
      given: "a customer with orders",
      when: "I GET their orders",
      then: "I receive that customer's orders, paginated",
    },
  ],
  "FR-4": [
    {
      id: "AC-013.1",
      given: "a CREATED order",
      when: "I pay with WERO",
      then: "I receive 201 with status PENDING and a providerReference starting WERO-",
    },
    {
      id: "AC-013.2",
      given: "a CREATED order",
      when: "I pay with VISA",
      then: "the payment is AUTHORIZED immediately, with reference VISA-",
    },
    {
      id: "AC-013.3",
      given: "no JWT and no API key",
      when: "I create a payment",
      then: "I receive 401",
    },
    {
      id: "AC-013.4",
      given: "a valid X-API-Key",
      when: "I create a payment",
      then: "it succeeds — server-to-server authentication",
    },
    {
      id: "AC-013.5",
      given: "an order that is not CREATED",
      when: "I pay it",
      then: "I receive 409 ORDER_NOT_PAYABLE",
    },
    {
      id: "AC-015.1",
      given: "one of my payments",
      when: "I GET it",
      then: "I receive its status and provider reference; a payment not mine returns 404",
    },
    {
      id: "AC-016.1",
      given: "I have payments",
      when: "I list them",
      then: "I receive a paginated envelope, newest first",
    },
  ],
  "FR-5": [
    {
      id: "AC-017.1",
      given: "a PENDING payment",
      when: "I approve it",
      then: "it becomes SUCCESS and its order becomes PAID",
    },
    {
      id: "AC-021.1",
      given: "a PENDING payment older than the expiry window",
      when: "the scheduler runs",
      then: "the payment becomes EXPIRED and can no longer be approved",
    },
  ],
  "FR-6": [
    {
      id: "AC-014.1",
      given: "I create a payment with Idempotency-Key: K",
      when: "I repeat the identical request with K",
      then: "I receive the same payment — no duplicate",
    },
    {
      id: "AC-014.2",
      given: "key K was used",
      when: "I send a different body with K",
      then: "I receive 409 IDEMPOTENCY_KEY_REUSED",
    },
  ],
  "FR-7": [
    {
      id: "AC-018.1",
      given: "a SUCCESS payment",
      when: "I refund it",
      then: "it becomes REFUNDED and a refund record is stored",
    },
    {
      id: "AC-018.2",
      given: "a payment that is not SUCCESS or SETTLED",
      when: "I refund it",
      then: "I receive 409 REFUND_NOT_ALLOWED",
    },
  ],
  "FR-8": [
    {
      id: "AC-019.1",
      given: "a PENDING payment",
      when: "I cancel it",
      then: "it becomes CANCELLED",
    },
    {
      id: "AC-020.1",
      given: "a payment that is not FAILED",
      when: "I retry it",
      then: "I receive 409 RETRY_NOT_ALLOWED",
    },
  ],
  "FR-9": [
    {
      id: "AC-022.1",
      given: "I configure a webhook",
      when: "I PUT the URL",
      then: "I receive 200 and the signing secret once; a later GET returns it masked",
    },
    {
      id: "AC-023.1",
      given: "an active endpoint",
      when: "a payment changes state",
      then: "a webhook event is queued in the outbox in the same transaction",
    },
    {
      id: "AC-023.2",
      given: "a queued event",
      when: "the dispatcher runs",
      then: "it POSTs an HMAC-signed payload and marks the event DELIVERED on a 2xx",
    },
  ],
  "FR-10": [
    {
      id: "AC-023.3",
      given: "the endpoint returns a non-2xx",
      when: "delivery fails",
      then: "the event is retried up to 3 times with backoff, then FAILED",
    },
    {
      id: "AC-024.1",
      given: "events exist",
      when: "I list them",
      then: "I see each event's type, status, attempts and last status code",
    },
  ],
  "FR-11": [
    {
      id: "AC-025.1",
      given: "I log in",
      when: "I view the audit log",
      then: "a USER_LOGIN entry exists; order, payment, API-key and webhook actions are recorded too",
    },
    {
      id: "AC-025.2",
      given: "audit entries exist for several merchants",
      when: "I read the audit log",
      then: "entries are scoped to my merchant only",
    },
  ],
  "FR-12": [
    {
      id: "AC-026.1",
      given: "I have orders and payments",
      when: "I GET /api/dashboard",
      then: "I receive revenue, order and payment counts, success rate, and the by-method, by-status and revenue-by-day series",
    },
  ],
};
