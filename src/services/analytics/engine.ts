import {
  AnalyticsSummary,
  Category,
  MonthlyMetric,
  RecurringMerchant,
  SpendType,
  Transaction,
} from '../../types';

export class DeterministicAnalyticsEngine {
  public static computeSummary(transactions: Transaction[]): AnalyticsSummary {
    if (!transactions || transactions.length === 0) {
      return this.emptySummary();
    }

    const debits = transactions.filter((t) => t.type === 'DEBIT');
    const credits = transactions.filter((t) => t.type === 'CREDIT');

    // Total income: all credit transactions
    const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0);

    // Total expenses: all debit transactions EXCLUDING pure investments/self-transfers
    const pureExpenses = debits.filter((t) => t.spendType !== 'INVESTMENT');
    const totalExpenses = pureExpenses.reduce((sum, t) => sum + t.amount, 0);

    // Net savings = totalIncome - totalExpenses
    const netSavings = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Monthly breakdown
    const monthlyMap = new Map<string, { income: number; expenses: number; essential: number; discretionary: number; categories: Record<Category, number> }>();

    for (const t of transactions) {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          income: 0,
          expenses: 0,
          essential: 0,
          discretionary: 0,
          categories: {} as Record<Category, number>,
        });
      }

      const mData = monthlyMap.get(month)!;
      if (!mData.categories[t.category]) {
        mData.categories[t.category] = 0;
      }
      mData.categories[t.category] += t.amount;

      if (t.type === 'CREDIT') {
        mData.income += t.amount;
      } else if (t.spendType !== 'INVESTMENT') {
        mData.expenses += t.amount;
        if (t.spendType === 'ESSENTIAL') {
          mData.essential += t.amount;
        } else {
          mData.discretionary += t.amount;
        }
      }
    }

    const sortedMonths = Array.from(monthlyMap.keys()).sort();
    const monthlyCount = Math.max(1, sortedMonths.length);

    const monthlyMetrics: MonthlyMetric[] = sortedMonths.map((m) => {
      const data = monthlyMap.get(m)!;
      const sav = Math.max(0, data.income - data.expenses);
      const rate = data.income > 0 ? (sav / data.income) * 100 : 0;
      return {
        month: m,
        income: Math.round(data.income),
        expenses: Math.round(data.expenses),
        savings: Math.round(sav),
        savingsRate: parseFloat(rate.toFixed(1)),
        essentialSpend: Math.round(data.essential),
        discretionarySpend: Math.round(data.discretionary),
        categoryTotals: data.categories,
      };
    });

    const avgMonthlyIncome = Math.round(totalIncome / monthlyCount);
    const avgMonthlyExpense = Math.round(totalExpenses / monthlyCount);
    const avgMonthlySavings = Math.round(netSavings / monthlyCount);

    // Essential vs Discretionary
    const essentialSpend = debits
      .filter((t) => t.spendType === 'ESSENTIAL')
      .reduce((sum, t) => sum + t.amount, 0);

    const discretionarySpend = debits
      .filter((t) => t.spendType === 'DISCRETIONARY')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalTrackedSpend = essentialSpend + discretionarySpend;
    const essentialRatio = totalTrackedSpend > 0 ? (essentialSpend / totalTrackedSpend) * 100 : 50;
    const discretionaryRatio = totalTrackedSpend > 0 ? (discretionarySpend / totalTrackedSpend) * 100 : 50;

    // Category breakdown
    const catMap = new Map<Category, { amount: number; spendType: SpendType }>();
    for (const t of debits) {
      if (t.spendType === 'INVESTMENT') continue;
      const current = catMap.get(t.category) || { amount: 0, spendType: t.spendType };
      current.amount += t.amount;
      catMap.set(t.category, current);
    }

    const categoryBreakdown = Array.from(catMap.entries())
      .map(([cat, val]) => ({
        category: cat,
        amount: Math.round(val.amount),
        percentage: totalExpenses > 0 ? parseFloat(((val.amount / totalExpenses) * 100).toFixed(1)) : 0,
        spendType: val.spendType,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Recurring-expense detection (>= 3 distinct months + CV check)
    const recurringExpenses = this.detectRecurringExpenses(debits);

    const dateRange = {
      start: transactions[0]?.date || '',
      end: transactions[transactions.length - 1]?.date || '',
    };

    return {
      totalIncome: Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      netSavings: Math.round(netSavings),
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      avgMonthlyIncome,
      avgMonthlyExpense,
      avgMonthlySavings,
      essentialSpend: Math.round(essentialSpend),
      discretionarySpend: Math.round(discretionarySpend),
      essentialRatio: parseFloat(essentialRatio.toFixed(1)),
      discretionaryRatio: parseFloat(discretionaryRatio.toFixed(1)),
      categoryBreakdown,
      monthlyMetrics,
      recurringExpenses,
      dateRange,
      transactionCount: transactions.length,
    };
  }

  /**
   * Amount-aware recurring expense detection:
   * 1. Identifies merchants appearing in >= 3 distinct calendar months.
   * 2. Computes arithmetic mean (μ), unbiased sample standard deviation (σ),
   *    and Coefficient of Variation (CV = σ / μ).
   * 3. Uses a 10% CV threshold (CV = 0.10) along with domain category awareness
   *    to mathematically distinguish fixed subscriptions from variable-cost categories
   *    (such as fuel, groceries, utilities, and food delivery).
   */
  private static detectRecurringExpenses(debits: Transaction[]): RecurringMerchant[] {
    const VARIABLE_COST_CATEGORIES: Set<Category> = new Set([
      'Dining & Food Delivery',
      'Groceries',
      'Travel & Commute',
      'Utilities & Bills',
      'Shopping & Retail',
      'Healthcare & Medical',
      'Entertainment & Leisure',
      'Miscellaneous',
    ]);

    const merchantMap = new Map<
      string,
      {
        category: Category;
        amounts: number[];
        monthlyMap: Map<string, number>;
      }
    >();

    for (const t of debits) {
      if (t.spendType === 'INVESTMENT') continue; // Exclude pure investments from recurring operational expenses

      const merchant = (t.normalizedMerchant || t.rawDescription || 'Unknown Merchant').trim();
      const month = t.date.slice(0, 7);

      if (!merchantMap.has(merchant)) {
        merchantMap.set(merchant, {
          category: t.category,
          amounts: [],
          monthlyMap: new Map(),
        });
      }

      const item = merchantMap.get(merchant)!;
      item.amounts.push(t.amount);
      item.monthlyMap.set(month, (item.monthlyMap.get(month) || 0) + t.amount);
    }

    const recurring: RecurringMerchant[] = [];
    const CV_THRESHOLD = 0.10; // 10% relative standard deviation threshold

    for (const [merchant, data] of merchantMap.entries()) {
      const distinctMonthsCount = data.monthlyMap.size;

      // Must appear in at least 3 distinct calendar months
      if (distinctMonthsCount >= 3) {
        const count = data.amounts.length;
        const total = data.amounts.reduce((sum, a) => sum + a, 0);
        const mean = total / count;
        const monthlyAverage = Math.round(total / distinctMonthsCount);
        const minAmount = Math.min(...data.amounts);
        const maxAmount = Math.max(...data.amounts);

        // Unbiased sample standard deviation: sqrt( sum(x - mean)^2 / (N - 1) )
        let stdDev = 0;
        if (count > 1) {
          const sumSquaredDiffs = data.amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0);
          stdDev = Math.sqrt(sumSquaredDiffs / (count - 1));
        }

        // Coefficient of Variation: CV = σ / μ
        const cv = mean > 0 ? stdDev / mean : 0;
        const cvPercent = parseFloat((cv * 100).toFixed(1));

        const isVariableCostCategory = VARIABLE_COST_CATEGORIES.has(data.category);

        // Amount-aware classification:
        // - FIXED_SUBSCRIPTION: CV < 0.10 with tight price stability (e.g. Netflix ₹649, Rent ₹28,000, Gym ₹2,500)
        // - VARIABLE_RECURRING: CV >= 0.10 or variable-cost categories with fluctuating transaction tickets (e.g. Fuel, Groceries, Dining, Utility bills)
        let isFixed = false;
        let variabilityTier: 'IDENTICAL_FIXED' | 'PREDICTABLE_SUBSCRIPTION' | 'VARIABLE_COST';

        if (cv <= 0.01) {
          isFixed = true;
          variabilityTier = 'IDENTICAL_FIXED';
        } else if (cv < CV_THRESHOLD && !isVariableCostCategory) {
          isFixed = true;
          variabilityTier = 'PREDICTABLE_SUBSCRIPTION';
        } else {
          isFixed = false;
          variabilityTier = 'VARIABLE_COST';
        }

        const classification: 'FIXED_SUBSCRIPTION' | 'VARIABLE_RECURRING' = isFixed
          ? 'FIXED_SUBSCRIPTION'
          : 'VARIABLE_RECURRING';

        let cvExplanation = '';
        if (variabilityTier === 'IDENTICAL_FIXED') {
          cvExplanation = `Fixed subscription: Zero variance (CV: 0.0%, σ: ₹0). Exact ₹${Math.round(mean).toLocaleString()} billed across ${distinctMonthsCount} monthly cycles.`;
        } else if (variabilityTier === 'PREDICTABLE_SUBSCRIPTION') {
          cvExplanation = `Fixed subscription: Highly predictable billing (CV: ${cvPercent}% < 10% threshold, σ: ₹${Math.round(stdDev).toLocaleString()}) across ${distinctMonthsCount} months.`;
        } else {
          cvExplanation = `Variable-cost recurring: Fluctuates from ₹${minAmount.toLocaleString()} to ₹${maxAmount.toLocaleString()} (CV: ${cvPercent}% >= 10% threshold, σ: ₹${Math.round(stdDev).toLocaleString()}) in variable category ${data.category}.`;
        }

        recurring.push({
          merchant,
          category: data.category,
          averageAmount: Math.round(mean),
          monthlyAverage,
          totalSpent: Math.round(total),
          transactionCount: count,
          distinctMonths: Array.from(data.monthlyMap.keys()).sort(),
          distinctMonthsCount,
          standardDeviation: parseFloat(stdDev.toFixed(2)),
          coefficientOfVariation: parseFloat(cv.toFixed(3)),
          minAmount,
          maxAmount,
          classification,
          cvExplanation,
          cvThreshold: CV_THRESHOLD,
          variabilityTier,
          isVariableCostCategory,
        });
      }
    }

    return recurring.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  private static emptySummary(): AnalyticsSummary {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      savingsRate: 0,
      avgMonthlyIncome: 0,
      avgMonthlyExpense: 0,
      avgMonthlySavings: 0,
      essentialSpend: 0,
      discretionarySpend: 0,
      essentialRatio: 50,
      discretionaryRatio: 50,
      categoryBreakdown: [],
      monthlyMetrics: [],
      recurringExpenses: [],
      dateRange: { start: '', end: '' },
      transactionCount: 0,
    };
  }
}
