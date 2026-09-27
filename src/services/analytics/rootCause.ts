import {
  AnalyticsSummary,
  Category,
  MonthlyMetric,
  RootCauseAnalysis,
  RootCauseItem,
} from '../../types';

export class RootCauseEngine {
  /**
   * Identifies the most significant savings-rate drop between months
   * or analyzes user-specified baseline and drop months.
   */
  public static analyze(
    summary: AnalyticsSummary,
    customBaselineMonth?: string,
    customDropMonth?: string
  ): RootCauseAnalysis | null {
    const months = summary.monthlyMetrics;
    if (months.length < 2) return null;

    let baseline: MonthlyMetric;
    let drop: MonthlyMetric;

    if (customBaselineMonth && customDropMonth) {
      baseline = months.find((m) => m.month === customBaselineMonth) || months[0];
      drop = months.find((m) => m.month === customDropMonth) || months[months.length - 1];
    } else {
      // Find the two consecutive months with the largest drop in savings rate
      let maxDrop = -1;
      let bestBaseIdx = 0;
      let bestDropIdx = 1;

      for (let i = 0; i < months.length - 1; i++) {
        const diff = months[i].savingsRate - months[i + 1].savingsRate;
        if (diff > maxDrop) {
          maxDrop = diff;
          bestBaseIdx = i;
          bestDropIdx = i + 1;
        }
      }

      // If no consecutive drop found, compare peak month to latest month
      if (maxDrop <= 0) {
        const peakIdx = months.reduce((maxI, cur, i, arr) => (cur.savingsRate > arr[maxI].savingsRate ? i : maxI), 0);
        bestBaseIdx = peakIdx;
        bestDropIdx = months.length - 1;
      }

      baseline = months[bestBaseIdx];
      drop = months[bestDropIdx];
    }

    const baselineSavingsRate = baseline.savingsRate;
    const dropSavingsRate = drop.savingsRate;
    const rateDiff = parseFloat((baselineSavingsRate - dropSavingsRate).toFixed(1));
    const savingsDeficit = Math.max(0, baseline.savings - drop.savings);

    // Compute category level deltas
    const allCategories = new Set<Category>([
      ...(Object.keys(baseline.categoryTotals) as Category[]),
      ...(Object.keys(drop.categoryTotals) as Category[]),
    ]);

    const culprits: RootCauseItem[] = [];
    let totalExcessSpend = 0;

    for (const cat of allCategories) {
      const baseSpend = baseline.categoryTotals[cat] || 0;
      const currSpend = drop.categoryTotals[cat] || 0;
      const delta = currSpend - baseSpend;

      if (delta > 0) {
        totalExcessSpend += delta;
      }
    }

    for (const cat of allCategories) {
      const baseSpend = baseline.categoryTotals[cat] || 0;
      const currSpend = drop.categoryTotals[cat] || 0;
      const delta = currSpend - baseSpend;

      if (delta > 0) {
        const pctChange = baseSpend > 0 ? ((delta / baseSpend) * 100) : 100;
        const contrib = totalExcessSpend > 0 ? (delta / totalExcessSpend) * 100 : 0;

        let recommendation = '';
        if (cat === 'Dining & Food Delivery') {
          recommendation = `Dining escalated by ₹${delta.toLocaleString()} (+${pctChange.toFixed(0)}%). Cutting online delivery by 30% claws back ₹${Math.round(currSpend * 0.3).toLocaleString()}.`;
        } else if (cat === 'Shopping & Retail') {
          recommendation = `Shopping spiked by ₹${delta.toLocaleString()}. Enforcing a 48-hour delay rule on discretionary buys would recover substantial buffer.`;
        } else if (cat === 'Travel & Commute') {
          recommendation = `Commute/Travel increased by ₹${delta.toLocaleString()}. Consider transit passes or pooling to offset peak surges.`;
        } else {
          recommendation = `${cat} increased by ₹${delta.toLocaleString()} over baseline month.`;
        }

        culprits.push({
          category: cat,
          baselineSpend: baseSpend,
          currentSpend: currSpend,
          absoluteDelta: delta,
          percentageChange: parseFloat(pctChange.toFixed(1)),
          contributionToDrop: parseFloat(contrib.toFixed(1)),
          recommendation,
        });
      }
    }

    culprits.sort((a, b) => b.absoluteDelta - a.absoluteDelta);

    // Automated What-If Fix: suggest cutting top culprit to recover most of the deficit
    const topCulprit = culprits[0] || {
      category: 'Dining & Food Delivery' as Category,
      currentSpend: 15000,
      absoluteDelta: 5000,
    };

    // Calculate cut percentage needed to reclaim 70% of the drop or at least 25%
    const desiredCutAmount = Math.min(topCulprit.currentSpend * 0.4, topCulprit.absoluteDelta > 0 ? topCulprit.absoluteDelta * 0.8 : topCulprit.currentSpend * 0.25);
    const cutPercentage = topCulprit.currentSpend > 0 ? Math.round((desiredCutAmount / topCulprit.currentSpend) * 100) : 25;
    const monthlySaved = Math.round((cutPercentage / 100) * topCulprit.currentSpend);

    const projectedExpense = drop.expenses - monthlySaved;
    const projectedSavings = Math.max(0, drop.income - projectedExpense);
    const projectedSavingsRate = drop.income > 0 ? parseFloat(((projectedSavings / drop.income) * 100).toFixed(1)) : dropSavingsRate;

    return {
      baselineMonth: baseline.month,
      dropMonth: drop.month,
      baselineSavingsRate,
      dropSavingsRate,
      savingsRateDrop: rateDiff,
      savingsDeficit,
      topCulprits: culprits.slice(0, 5),
      automatedWhatIfFix: {
        category: topCulprit.category,
        cutPercentage,
        monthlySaved,
        projectedSavingsRate,
      },
    };
  }
}
