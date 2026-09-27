import { AnalyticsSummary, Category, WhatIfAdjustment, WhatIfResult } from '../../types';

export class SimulatorEngine {
  public static simulate(
    summary: AnalyticsSummary,
    adjustment: WhatIfAdjustment
  ): WhatIfResult {
    const baseIncome = summary.avgMonthlyIncome;
    const baseExpense = summary.avgMonthlyExpense;
    const baseSavings = summary.avgMonthlySavings;
    const baseRate = summary.savingsRate;

    // Category cuts
    let totalCutSavings = 0;
    const categoryChanges: WhatIfResult['categoryChanges'] = [];

    // Map monthly spend per category
    const monthlyCategoryMap = new Map<Category, number>();
    for (const item of summary.categoryBreakdown) {
      // average monthly for this category
      const monthlyAmount = summary.monthlyMetrics.length > 0
        ? Math.round(item.amount / summary.monthlyMetrics.length)
        : item.amount;
      monthlyCategoryMap.set(item.category, monthlyAmount);
    }

    for (const [cat, cutPercent] of Object.entries(adjustment.categoryReductions)) {
      const category = cat as Category;
      const currentMonthly = monthlyCategoryMap.get(category) || 0;
      const pct = Math.max(0, Math.min(100, cutPercent || 0));
      const saved = Math.round((pct / 100) * currentMonthly);
      totalCutSavings += saved;

      categoryChanges.push({
        category,
        before: currentMonthly,
        after: currentMonthly - saved,
        saved,
      });
    }

    // Extended adjustments
    const incomeDelta = adjustment.monthlyIncomeDelta || 0;
    const newEmi = adjustment.newMonthlyEmi || 0;
    const sipDelta = adjustment.monthlySipDelta || 0;

    const projectedIncome = baseIncome + incomeDelta;
    // New expenses: baseExpense - categoryCuts + newEmi
    const projectedExpense = Math.max(0, baseExpense - totalCutSavings + newEmi);

    // Projected savings: income - expenses - sipDelta
    const projectedSavings = Math.max(0, projectedIncome - projectedExpense);
    const projectedSavingsRate = projectedIncome > 0
      ? parseFloat(((projectedSavings / projectedIncome) * 100).toFixed(1))
      : 0;

    const monthlySavingsDelta = projectedSavings - baseSavings;
    const savingsRateDelta = parseFloat((projectedSavingsRate - baseRate).toFixed(1));
    const annualSurplusChange = monthlySavingsDelta * 12;

    return {
      baseline: {
        monthlyIncome: baseIncome,
        monthlyExpense: baseExpense,
        monthlySavings: baseSavings,
        savingsRate: baseRate,
      },
      projected: {
        monthlyIncome: projectedIncome,
        monthlyExpense: projectedExpense,
        monthlySavings: projectedSavings,
        savingsRate: projectedSavingsRate,
      },
      delta: {
        monthlySavingsDelta,
        savingsRateDelta,
        annualSurplusChange,
      },
      categoryChanges,
    };
  }
}
