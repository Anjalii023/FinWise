/**
 * Standard Financial Planning Benchmarks and Guidelines
 */
export const FINANCIAL_BENCHMARKS = {
  /** Target percentage of monthly income to save */
  SAVINGS_RATE_TARGET_PERCENT: 20,
  /** Maximum recommended essential expense ratio (50/30/20 rule) */
  MAX_ESSENTIAL_RATIO_PERCENT: 50,
  /** Maximum recommended discretionary expense ratio */
  MAX_DISCRETIONARY_RATIO_PERCENT: 30,
  /** Minimum recommended months for liquid emergency fund */
  EMERGENCY_FUND_MIN_MONTHS: 3,
  /** Optimal months for liquid emergency fund */
  EMERGENCY_FUND_OPTIMAL_MONTHS: 6,
  /** Maximum recommended Fixed Obligation to Income Ratio (FOIR) */
  MAX_RECOMMENDED_FOIR_PERCENT: 40,
  /** Threshold for high-interest debt that should be liquidated before investing */
  HIGH_INTEREST_DEBT_APR_THRESHOLD: 10,
} as const;
