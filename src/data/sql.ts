import type { SqlTable, SqlValidationQuery } from "@/lib/types";

/** Physical data model touched by the instant payment flow. */
export const sqlTables: SqlTable[] = [
  {
    name: "PAYMENT_INSTRUCTION",
    schema: "IPH",
    description: "One row per instant payment instruction received from any channel.",
    columns: [
      { name: "PAYMENT_ID", type: "VARCHAR2(30)", nullable: false, description: "Primary key, IPH-P-<date>-<seq>." },
      { name: "END_TO_END_ID", type: "VARCHAR2(35)", nullable: false, description: "Customer reference propagated to the scheme." },
      { name: "DEBTOR_IBAN", type: "VARCHAR2(34)", nullable: false, description: "Account debited." },
      { name: "CREDITOR_IBAN", type: "VARCHAR2(34)", nullable: false, description: "Beneficiary account." },
      { name: "CREDITOR_NAME", type: "VARCHAR2(70)", nullable: false, description: "Beneficiary name as entered." },
      { name: "AMOUNT", type: "NUMBER(18,2)", nullable: false, description: "Payment amount in EUR." },
      { name: "STATUS", type: "VARCHAR2(12)", nullable: false, description: "Current payment state." },
      { name: "SCHEME_REFERENCE", type: "VARCHAR2(35)", nullable: true, description: "TIPS reference assigned on settlement." },
      { name: "CREATED_AT", type: "TIMESTAMP(3)", nullable: false, description: "Request intake timestamp." },
      { name: "SETTLED_AT", type: "TIMESTAMP(3)", nullable: true, description: "Scheme settlement timestamp." },
    ],
  },
  {
    name: "PAYMENT_CONTROL_RESULT",
    schema: "IPH",
    description: "Outcome of each in-path control (VoP, fraud, sanctions) with the rule and model versions applied.",
    columns: [
      { name: "CONTROL_ID", type: "VARCHAR2(30)", nullable: false, description: "Primary key." },
      { name: "PAYMENT_ID", type: "VARCHAR2(30)", nullable: false, description: "Foreign key to PAYMENT_INSTRUCTION." },
      { name: "CONTROL_TYPE", type: "VARCHAR2(20)", nullable: false, description: "VOP | FRAUD | SANCTIONS." },
      { name: "RESULT", type: "VARCHAR2(20)", nullable: false, description: "Control outcome." },
      { name: "SCORE", type: "NUMBER(3)", nullable: true, description: "Numeric score where applicable." },
      { name: "RULE_VERSION", type: "VARCHAR2(12)", nullable: false, description: "Version of the rule set or model." },
      { name: "LATENCY_MS", type: "NUMBER(6)", nullable: false, description: "Control response time in milliseconds." },
    ],
  },
  {
    name: "FUNDS_RESERVATION",
    schema: "IPH",
    description: "Two-phase ledger reservations and their release or conversion outcome.",
    columns: [
      { name: "RESERVATION_ID", type: "VARCHAR2(24)", nullable: false, description: "Ledger reservation identifier." },
      { name: "PAYMENT_ID", type: "VARCHAR2(30)", nullable: false, description: "Foreign key to PAYMENT_INSTRUCTION." },
      { name: "AMOUNT", type: "NUMBER(18,2)", nullable: false, description: "Reserved amount." },
      { name: "STATE", type: "VARCHAR2(12)", nullable: false, description: "HELD | CONVERTED | RELEASED | EXPIRED." },
      { name: "RESERVED_AT", type: "TIMESTAMP(3)", nullable: false, description: "Reservation creation time." },
      { name: "RESOLVED_AT", type: "TIMESTAMP(3)", nullable: true, description: "Conversion or release time." },
    ],
  },
  {
    name: "SCHEME_SETTLEMENT",
    schema: "IPH",
    description: "Settlement lines parsed from the daily camt.053 statement received from TIPS.",
    columns: [
      { name: "SETTLEMENT_ID", type: "VARCHAR2(30)", nullable: false, description: "Primary key." },
      { name: "SCHEME_REFERENCE", type: "VARCHAR2(35)", nullable: false, description: "Scheme transaction reference." },
      { name: "AMOUNT", type: "NUMBER(18,2)", nullable: false, description: "Settled amount." },
      { name: "DIRECTION", type: "VARCHAR2(3)", nullable: false, description: "OUT | IN." },
      { name: "VALUE_DATE", type: "DATE", nullable: false, description: "Settlement value date." },
    ],
  },
];

/** Validation queries executed by the analyst during SIT and UAT evidence gathering. */
export const sqlValidations: SqlValidationQuery[] = [
  {
    id: "SQL-001",
    title: "Payments breaching the 10-second scheme deadline",
    purpose:
      "Evidence for REQ-020: confirm that no settled payment exceeded the scheme execution deadline during the UAT window.",
    database: "IPH_UAT (Oracle 19c)",
    status: "Validated",
    lastRun: "2025-05-15",
    executedBy: "Sofia Marchetti",
    sql: `-- REQ-020 / NFR evidence: end-to-end execution time distribution
SELECT p.PAYMENT_ID,
       p.END_TO_END_ID,
       p.AMOUNT,
       p.STATUS,
       ROUND((CAST(p.SETTLED_AT AS DATE) - CAST(p.CREATED_AT AS DATE)) * 86400, 3) AS EXEC_SECONDS
  FROM IPH.PAYMENT_INSTRUCTION p
 WHERE p.STATUS = 'ACCP'
   AND p.CREATED_AT >= TIMESTAMP '2025-05-01 00:00:00'
   AND (CAST(p.SETTLED_AT AS DATE) - CAST(p.CREATED_AT AS DATE)) * 86400 > 10
 ORDER BY EXEC_SECONDS DESC
 FETCH FIRST 20 ROWS ONLY;`,
    columns: ["PAYMENT_ID", "END_TO_END_ID", "AMOUNT", "STATUS", "EXEC_SECONDS"],
    rows: [],
    notes: [
      "Zero rows returned across 41,882 settled UAT payments — the acceptance threshold is met.",
      "The 95th percentile execution time measured separately was 4.62 seconds against a 5.00 second target.",
      "Query re-run after the 12 May gateway patch with an identical result.",
    ],
    relatedRequirements: ["REQ-020", "REQ-006"],
    relatedRules: ["BR-011"],
  },
  {
    id: "SQL-002",
    title: "Orphaned funds reservations",
    purpose:
      "Evidence for REQ-005 and BR-011: confirm that no reservation remains held beyond the 25-second expiry without a terminal payment state.",
    database: "IPH_UAT (Oracle 19c)",
    status: "Validated",
    lastRun: "2025-05-15",
    executedBy: "Priya Raghunathan",
    sql: `-- BR-011: reservations must never outlive the payment they secure
SELECT r.RESERVATION_ID,
       r.PAYMENT_ID,
       r.AMOUNT,
       r.STATE,
       p.STATUS AS PAYMENT_STATUS,
       ROUND((SYSTIMESTAMP - r.RESERVED_AT) * 86400) AS AGE_SECONDS
  FROM IPH.FUNDS_RESERVATION r
  JOIN IPH.PAYMENT_INSTRUCTION p
    ON p.PAYMENT_ID = r.PAYMENT_ID
 WHERE r.STATE = 'HELD'
   AND r.RESERVED_AT < SYSTIMESTAMP - INTERVAL '25' SECOND
 ORDER BY AGE_SECONDS DESC;`,
    columns: ["RESERVATION_ID", "PAYMENT_ID", "AMOUNT", "STATE", "PAYMENT_STATUS", "AGE_SECONDS"],
    rows: [],
    notes: [
      "Zero rows returned — the compensating release job is functioning as specified.",
      "Two rows were returned on 08 May before defect DEF-1142 was fixed in build 2.3.4.",
    ],
    relatedRequirements: ["REQ-005"],
    relatedRules: ["BR-004", "BR-011"],
  },
  {
    id: "SQL-003",
    title: "Payments exceeding the segment daily limit",
    purpose:
      "Evidence for BR-005: verify that no customer exceeded the rolling 24-hour cumulative limit for their segment.",
    database: "IPH_UAT (Oracle 19c)",
    status: "Validated",
    lastRun: "2025-05-14",
    executedBy: "Sofia Marchetti",
    sql: `-- BR-005: rolling 24h cumulative limit per customer segment
WITH sent AS (
  SELECT c.CUSTOMER_ID,
         c.SEGMENT,
         SUM(p.AMOUNT) AS SENT_24H
    FROM IPH.PAYMENT_INSTRUCTION p
    JOIN IPH.CUSTOMER_ACCOUNT c
      ON c.IBAN = p.DEBTOR_IBAN
   WHERE p.STATUS IN ('ACCP', 'PDNG')
     AND p.CREATED_AT > SYSTIMESTAMP - INTERVAL '24' HOUR
   GROUP BY c.CUSTOMER_ID, c.SEGMENT
)
SELECT s.CUSTOMER_ID,
       s.SEGMENT,
       s.SENT_24H,
       l.DAILY_LIMIT
  FROM sent s
  JOIN IPH.SEGMENT_LIMIT l
    ON l.SEGMENT = s.SEGMENT
 WHERE s.SENT_24H > l.DAILY_LIMIT
 ORDER BY s.SENT_24H DESC;`,
    columns: ["CUSTOMER_ID", "SEGMENT", "SENT_24H", "DAILY_LIMIT"],
    rows: [],
    notes: [
      "Zero breaches across the UAT population of 2,140 customers.",
      "Cancelled and rejected payments are correctly excluded from the cumulative total.",
    ],
    relatedRequirements: ["REQ-010"],
    relatedRules: ["BR-005"],
  },
  {
    id: "SQL-004",
    title: "Control latency against the in-path budget",
    purpose:
      "Evidence for REQ-003 and REQ-004: confirm the fraud and sanctions controls respond within their allocated latency budgets.",
    database: "IPH_UAT (Oracle 19c)",
    status: "Needs Review",
    lastRun: "2025-05-16",
    executedBy: "Tobias Lindqvist",
    sql: `-- REQ-003 / REQ-004: in-path control latency profile
SELECT c.CONTROL_TYPE,
       COUNT(*)                                            AS EXECUTIONS,
       ROUND(AVG(c.LATENCY_MS))                            AS AVG_MS,
       ROUND(PERCENTILE_CONT(0.95)
             WITHIN GROUP (ORDER BY c.LATENCY_MS))         AS P95_MS,
       MAX(c.LATENCY_MS)                                   AS MAX_MS,
       SUM(CASE WHEN c.CONTROL_TYPE = 'SANCTIONS'
                 AND c.LATENCY_MS > 1200 THEN 1 ELSE 0 END) AS BUDGET_BREACHES
  FROM IPH.PAYMENT_CONTROL_RESULT c
 WHERE c.CONTROL_TYPE IN ('FRAUD', 'SANCTIONS', 'VOP')
 GROUP BY c.CONTROL_TYPE
 ORDER BY P95_MS DESC;`,
    columns: ["CONTROL_TYPE", "EXECUTIONS", "AVG_MS", "P95_MS", "MAX_MS", "BUDGET_BREACHES"],
    rows: [
      ["VOP", "41882", "689", "1412", "1498", "0"],
      ["SANCTIONS", "41882", "574", "1108", "1974", "38"],
      ["FRAUD", "41882", "312", "604", "902", "0"],
    ],
    notes: [
      "38 sanctions screening calls exceeded the 1,200 ms budget; all 38 correctly routed to manual review rather than auto-approving.",
      "Breaches cluster between 12:00 and 12:04 CET, coinciding with the vendor list refresh window.",
      "Raised as observation OBS-07 — vendor to move the list refresh outside peak hours before the next release.",
    ],
    relatedRequirements: ["REQ-003", "REQ-004", "REQ-020"],
    relatedRules: ["BR-008", "BR-009"],
  },
  {
    id: "SQL-005",
    title: "Daily settlement reconciliation breaks",
    purpose:
      "Evidence for REQ-022: identify payments settled internally that are absent from, or mismatched against, the scheme statement.",
    database: "IPH_UAT (Oracle 19c)",
    status: "Validated",
    lastRun: "2025-05-16",
    executedBy: "Marcus Delacroix",
    sql: `-- REQ-022: reconcile internal settlements against camt.053
SELECT p.PAYMENT_ID,
       p.SCHEME_REFERENCE,
       p.AMOUNT             AS INTERNAL_AMOUNT,
       s.AMOUNT             AS SCHEME_AMOUNT,
       CASE
         WHEN s.SETTLEMENT_ID IS NULL           THEN 'MISSING_AT_SCHEME'
         WHEN s.AMOUNT <> p.AMOUNT              THEN 'AMOUNT_MISMATCH'
         ELSE 'MATCHED'
       END                  AS BREAK_TYPE
  FROM IPH.PAYMENT_INSTRUCTION p
  LEFT JOIN IPH.SCHEME_SETTLEMENT s
    ON s.SCHEME_REFERENCE = p.SCHEME_REFERENCE
 WHERE p.STATUS = 'ACCP'
   AND TRUNC(p.SETTLED_AT) = DATE '2025-05-15'
   AND (s.SETTLEMENT_ID IS NULL OR s.AMOUNT <> p.AMOUNT);`,
    columns: ["PAYMENT_ID", "SCHEME_REFERENCE", "INTERNAL_AMOUNT", "SCHEME_AMOUNT", "BREAK_TYPE"],
    rows: [
      [
        "IPH-P-20250515-0041188",
        "TIPS20250515X0044901",
        "2400.00",
        "—",
        "MISSING_AT_SCHEME",
      ],
    ],
    notes: [
      "One break raised and resolved the same banking day: a late pacs.002 accepted after the statement cut-off.",
      "Break was correctly classified as LATE_CONFIRMATION by the reconciliation service and cleared on the 16 May statement.",
    ],
    relatedRequirements: ["REQ-022", "REQ-005"],
    relatedRules: ["BR-016"],
  },
  {
    id: "SQL-006",
    title: "Duplicate end-to-end identification detection",
    purpose:
      "Evidence for BR-016: confirm that no duplicate end-to-end identification was accepted for the same debtor within 24 hours.",
    database: "IPH_UAT (Oracle 19c)",
    status: "Validated",
    lastRun: "2025-05-14",
    executedBy: "Sofia Marchetti",
    sql: `-- BR-016: duplicate detection on end-to-end identification
SELECT p.DEBTOR_IBAN,
       p.END_TO_END_ID,
       COUNT(*)          AS OCCURRENCES,
       MIN(p.CREATED_AT) AS FIRST_SEEN,
       MAX(p.CREATED_AT) AS LAST_SEEN
  FROM IPH.PAYMENT_INSTRUCTION p
 WHERE p.STATUS NOT IN ('RJCT', 'CANC')
   AND p.CREATED_AT > SYSTIMESTAMP - INTERVAL '24' HOUR
 GROUP BY p.DEBTOR_IBAN, p.END_TO_END_ID
HAVING COUNT(*) > 1;`,
    columns: ["DEBTOR_IBAN", "END_TO_END_ID", "OCCURRENCES", "FIRST_SEEN", "LAST_SEEN"],
    rows: [],
    notes: [
      "Zero rows returned — idempotency handling correctly suppresses duplicate submissions.",
      "Test TC-003 confirms that a repeated idempotency key returns the original payment rather than creating a second instruction.",
    ],
    relatedRequirements: ["REQ-012", "REQ-001"],
    relatedRules: ["BR-016"],
  },
];

export function getSqlValidationById(id: string): SqlValidationQuery | undefined {
  return sqlValidations.find((query) => query.id === id);
}
