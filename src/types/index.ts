export type TransactionType = 'DEBIT' | 'CREDIT';

export type Category =
  | 'Housing & Rent'
  | 'Groceries'
  | 'Utilities & Bills'
  | 'Healthcare & Medical'
  | 'Debt & EMI'
  | 'Education'
  | 'Insurance'
  | 'Dining & Food Delivery'
  | 'Shopping & Retail'
  | 'Entertainment & Leisure'
  | 'Subscriptions & Digital'
  | 'Travel & Commute'
  | 'Investments & Savings'
  | 'Salary & Income'
  | 'Freelance & Business'
  | 'Miscellaneous';

export type SpendType = 'ESSENTIAL' | 'DISCRETIONARY' | 'INVESTMENT' | 'INCOME';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  rawDescription: string;
  normalizedMerchant: string;
  amount: number;
  type: TransactionType;
  category: Category;
  spendType: SpendType;
  balance?: number;
  referenceNo?: string;
}

export type BankFormat = 'HDFC' | 'SBI' | 'GENERIC_CSV' | 'GENERIC_XLSX' | 'UNKNOWN';

export interface ParseResult {
  format: BankFormat;
  formatConfidence: number; // 0 to 1
  accountHolder?: string;
  accountNumber?: string;
  dateRange: { start: string; end: string };
  totalDebits: number;
  totalCredits: number;
  transactionCount: number;
  transactions: Transaction[];
  warnings: string[];
}

export interface MonthlyMetric {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number; // percentage (0-100)
  essentialSpend: number;
  discretionarySpend: number;
  categoryTotals: Record<Category, number>;
}

export interface RecurringMerchant {
  merchant: string;
  category: Category;
  averageAmount: number;
  monthlyAverage: number;
  totalSpent: number;
  transactionCount: number;
  distinctMonths: string[]; // List of YYYY-MM
  distinctMonthsCount: number;
  standardDeviation: number;
  coefficientOfVariation: number; // CV = stdDev / mean
  minAmount: number;
  maxAmount: number;
  classification: 'FIXED_SUBSCRIPTION' | 'VARIABLE_RECURRING'; // CV < 0.10 = Fixed
  cvExplanation: string;
  cvThreshold?: number;
  variabilityTier?: 'IDENTICAL_FIXED' | 'PREDICTABLE_SUBSCRIPTION' | 'VARIABLE_COST';
  isVariableCostCategory?: boolean;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  avgMonthlySavings: number;
  essentialSpend: number;
  discretionarySpend: number;
  essentialRatio: number; // percentage of total expenses
  discretionaryRatio: number; // percentage of total expenses
  categoryBreakdown: {
    category: Category;
    amount: number;
    percentage: number;
    spendType: SpendType;
  }[];
  monthlyMetrics: MonthlyMetric[];
  recurringExpenses: RecurringMerchant[];
  dateRange: { start: string; end: string };
  transactionCount: number;
}

export interface RootCauseItem {
  category: Category;
  baselineSpend: number;
  currentSpend: number;
  absoluteDelta: number;
  percentageChange: number;
  contributionToDrop: number; // percentage of total deficit caused by this category
  recommendation: string;
}

export interface RootCauseAnalysis {
  baselineMonth: string;
  dropMonth: string;
  baselineSavingsRate: number;
  dropSavingsRate: number;
  savingsRateDrop: number; // baseline - drop
  savingsDeficit: number; // in currency
  topCulprits: RootCauseItem[];
  automatedWhatIfFix: {
    category: Category;
    cutPercentage: number;
    monthlySaved: number;
    projectedSavingsRate: number;
  };
}

export interface WhatIfAdjustment {
  categoryReductions: Partial<Record<Category, number>>; // e.g. { 'Dining & Food Delivery': 25 }
  monthlyIncomeDelta: number; // e.g. +10000
  newMonthlyEmi: number; // e.g. 5000
  monthlySipDelta: number; // e.g. 3000
}

export interface WhatIfResult {
  baseline: {
    monthlyIncome: number;
    monthlyExpense: number;
    monthlySavings: number;
    savingsRate: number;
  };
  projected: {
    monthlyIncome: number;
    monthlyExpense: number;
    monthlySavings: number;
    savingsRate: number;
  };
  delta: {
    monthlySavingsDelta: number;
    savingsRateDelta: number;
    annualSurplusChange: number;
  };
  categoryChanges: {
    category: Category;
    before: number;
    after: number;
    saved: number;
  }[];
}

export type FeasibilityTier = 'FEASIBLE' | 'CHALLENGING' | 'DIFFICULT';

export interface GoalPlan {
  id: string;
  title: string;
  targetAmount: number;
  targetMonths: number;
  currentSaved: number;
  requiredMonthlySavings: number;
  currentAvgMonthlySavings: number;
  feasibilityTier: FeasibilityTier;
  savingsBufferRatio: number; // required / currentMonthlySavings
  feasibilityRationale: string;
  suggestedExtensionMonths?: number;
  suggestedSpendCut?: {
    category: Category;
    cutPercentage: number;
    monthlyRelief: number;
  };
}

export interface KnowledgeChunk {
  id: string;
  title: string;
  domain:
    | 'Budgeting & Emergency Fund'
    | 'Credit & Debt Management'
    | 'Tax-Advantaged Instruments'
    | 'Loans & Mortgages'
    | 'Insurance & Protection'
    | 'Investing Principles';
  source: string;
  section: string;
  content: string;
  keyTakeaway: string;
  tags: string[];
}

export interface RetrievedEvidence {
  chunk: KnowledgeChunk;
  bm25Score: number;
  denseScore: number;
  rrfScore: number;
  rerankScore: number; // 0 to 1
  confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SourceConflict {
  detected: boolean;
  topic: string;
  sourceA: { title: string; viewpoint: string };
  sourceB: { title: string; viewpoint: string };
  nuanceExplanation: string;
}

export type QueryClass =
  | 'analytics'
  | 'what_if'
  | 'goal_planning'
  | 'knowledge'
  | 'decision'
  | 'out_of_scope';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  queryClass?: QueryClass;
  confidenceLabel?: 'HIGH' | 'MEDIUM' | 'LOW';
  rerankScore?: number;
  evidence?: RetrievedEvidence[];
  conflict?: SourceConflict;
  contextSummary?: string;
  isOutOfScope?: boolean;
}

export interface UserFinancialProfile {
  monthlyIncome: number;
  existingEmis: number;
  existingSips: number;
  emergencyFundMonths: number;
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  primaryGoal: string;
}
