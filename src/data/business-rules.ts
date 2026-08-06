import type { BusinessRule } from "@/lib/types";

/** Rule catalogue governing the instant payment decision path (16 rules). */
export const businessRules: BusinessRule[] = [
  {
    id: "BR-001",
    description: "An instant payment must not exceed the scheme maximum of EUR 100,000.00.",
    logic:
      "IF payment.amount > 100000.00 THEN reject WITH IPH-VAL-001 AND offer standard SCT fallback",
    priority: "Critical",
    source: "EPC SCT Inst Rulebook 2024 v1.1 §2.4",
    status: "Implemented",
    category: "Limits",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-001", "REQ-011", "REQ-016"],
  },
  {
    id: "BR-002",
    description: "Instant payments are permitted in EUR only.",
    logic: "IF payment.currency <> 'EUR' THEN reject WITH IPH-VAL-002",
    priority: "Critical",
    source: "EPC SCT Inst Rulebook 2024 v1.1 §2.2",
    status: "Implemented",
    category: "Validation",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-001", "REQ-011"],
  },
  {
    id: "BR-003",
    description:
      "The debtor account must be open, in an active status, and free of debit blocks or legal holds.",
    logic:
      "IF account.status <> 'ACTIVE' OR account.blocks CONTAINS ('DEBIT','LEGAL','DECEASED') THEN reject WITH IPH-ACC-004",
    priority: "Critical",
    source: "Account Servicing Policy AS-11",
    status: "Implemented",
    category: "Account",
    owner: "Priya Raghunathan",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-001", "REQ-005"],
  },
  {
    id: "BR-004",
    description:
      "The available balance, including any agreed overdraft facility, must cover the full payment amount. Partial execution is not permitted.",
    logic:
      "available := ledger.balance - holds + overdraft.agreedLimit; IF available < payment.amount THEN reject WITH IPH-FND-007",
    priority: "Critical",
    source: "Credit Risk Policy CR-04",
    status: "Implemented",
    category: "Funds",
    owner: "Priya Raghunathan",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-001", "REQ-005"],
  },
  {
    id: "BR-005",
    description:
      "Rolling 24-hour cumulative instant payment limits apply per customer segment: Retail EUR 15,000, Retail Plus EUR 30,000, SME EUR 75,000.",
    logic:
      "sent24h := SUM(payments WHERE status IN ('ACCP','PDNG') AND createdAt > NOW()-24h); IF sent24h + payment.amount > segment.dailyLimit THEN reject WITH IPH-LIM-002",
    priority: "High",
    source: "Fraud Risk Appetite Statement FR-2025-03",
    status: "Implemented",
    category: "Limits",
    owner: "Tobias Lindqvist",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-010", "REQ-024"],
  },
  {
    id: "BR-006",
    description:
      "A Verification of Payee CLOSE_MATCH requires the customer to explicitly confirm or amend the beneficiary name before submission.",
    logic:
      "IF vop.result = 'CLOSE_MATCH' THEN require customerConfirmation = TRUE ELSE block submission WITH IPH-VOP-021",
    priority: "High",
    source: "EU Instant Payments Regulation (EU) 2024/886 Art. 5c",
    status: "Implemented",
    category: "Verification",
    owner: "Hannah Okafor",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-002"],
  },
  {
    id: "BR-007",
    description:
      "A Verification of Payee NO_MATCH blocks straight-through submission for a beneficiary used for the first time.",
    logic:
      "IF vop.result = 'NO_MATCH' AND beneficiary.firstUse = TRUE THEN block WITH IPH-VOP-022 AND display scam warning",
    priority: "High",
    source: "Fraud Risk Appetite Statement FR-2025-03",
    status: "Implemented",
    category: "Verification",
    owner: "Tobias Lindqvist",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-002", "REQ-018"],
  },
  {
    id: "BR-008",
    description:
      "A confirmed sanctions match places the payment in a compliance hold; funds remain reserved and no partial release is permitted.",
    logic:
      "IF screening.result = 'HIT' THEN status := 'HELD_COMPLIANCE' AND retain reservation AND raise alert AND suppress tip-off messaging",
    priority: "Critical",
    source: "EU Funds Transfer Regulation 2015/847",
    status: "Implemented",
    category: "Compliance",
    owner: "Tobias Lindqvist",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-003", "REQ-008", "REQ-023"],
  },
  {
    id: "BR-009",
    description:
      "Fraud score bands determine the outcome: 0–59 allow, 60–84 step-up authentication, 85–100 block and refer.",
    logic:
      "IF score >= 85 THEN block WITH IPH-FRD-031 ELSE IF score >= 60 THEN require stepUpAuthentication ELSE allow",
    priority: "High",
    source: "Fraud Decision Model IPH-ARIC v4.2",
    status: "Implemented",
    category: "Fraud",
    owner: "Tobias Lindqvist",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-004"],
  },
  {
    id: "BR-010",
    description:
      "The first payment to a beneficiary registered less than 24 hours ago and above EUR 5,000 is held for 30 minutes and is cancellable by the customer.",
    logic:
      "IF beneficiary.ageHours < 24 AND payment.amount > 5000 THEN status := 'COOLING_OFF' FOR 30 MINUTES",
    priority: "High",
    source: "Fraud Risk Appetite Statement FR-2025-03",
    status: "Implemented",
    category: "Fraud",
    owner: "Tobias Lindqvist",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-004", "REQ-018"],
  },
  {
    id: "BR-011",
    description:
      "A funds reservation must be released automatically if no scheme confirmation is received within 25 seconds.",
    logic:
      "IF reservation.age > 25s AND scheme.response IS NULL THEN release reservation AND status := 'RJCT' WITH reason 'TIMEOUT'",
    priority: "Critical",
    source: "Functional Specification FS-004 §3.2",
    status: "Implemented",
    category: "Settlement",
    owner: "Priya Raghunathan",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-005", "REQ-006", "REQ-007"],
  },
  {
    id: "BR-012",
    description:
      "If the beneficiary institution is not present in the daily TIPS reachability directory, the instant rail must not be used.",
    logic:
      "IF reachability.lookup(creditorBIC) = FALSE THEN reject WITH IPH-RCH-009 AND offer standard SCT fallback",
    priority: "High",
    source: "TIPS Participant Directory (daily)",
    status: "Implemented",
    category: "Routing",
    owner: "Saadaoui Abdessalem",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-007", "REQ-009", "REQ-016"],
  },
  {
    id: "BR-013",
    description:
      "A recall may only be raised within 10 banking days of settlement and only with reason codes DUPL, TECH or FRAD.",
    logic:
      "IF bankingDaysSince(settlement) > 10 OR reasonCode NOT IN ('DUPL','TECH','FRAD') THEN reject WITH IPH-RCL-003",
    priority: "High",
    source: "EPC SCT Inst Rulebook 2024 v1.1 §4.3",
    status: "Implemented",
    category: "Exceptions",
    owner: "Marcus Delacroix",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-013", "REQ-014"],
  },
  {
    id: "BR-014",
    description:
      "Inbound instant payments are credited with immediate availability; value-dating or deferred availability is not permitted.",
    logic: "credit.valueDate := settlementTimestamp AND credit.availability := 'IMMEDIATE'",
    priority: "Critical",
    source: "EPC SCT Inst Rulebook 2024 v1.1 §3.1",
    status: "Implemented",
    category: "Settlement",
    owner: "Priya Raghunathan",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-008", "REQ-015"],
  },
  {
    id: "BR-015",
    description:
      "The low-value SCA exemption applies below EUR 500 provided the cumulative exempted amount since the last SCA does not exceed EUR 1,000 and no more than five consecutive exemptions have been used.",
    logic:
      "IF amount < 500 AND cumulativeExempt + amount <= 1000 AND consecutiveExemptions < 5 THEN exemptSca ELSE require SCA",
    priority: "High",
    source: "PSD2 RTS on SCA Art. 16",
    status: "Implemented",
    category: "Security",
    owner: "Tobias Lindqvist",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-017"],
  },
  {
    id: "BR-016",
    description:
      "A payment whose end-to-end identification has already been used by the same debtor within 24 hours is treated as a duplicate.",
    logic:
      "IF EXISTS(payment WHERE endToEndId = request.endToEndId AND debtorAccount = request.debtorAccount AND createdAt > NOW()-24h) THEN reject WITH IPH-DUP-011",
    priority: "Medium",
    source: "Payments Operations Standard OPS-19",
    status: "Approved",
    category: "Validation",
    owner: "Marcus Delacroix",
    effectiveFrom: "2025-06-02",
    impactedRequirements: ["REQ-012", "REQ-021", "REQ-022"],
  },
];

export function getBusinessRuleById(id: string): BusinessRule | undefined {
  return businessRules.find((rule) => rule.id === id);
}

export const businessRuleCategories = Array.from(
  new Set(businessRules.map((rule) => rule.category)),
).sort();
