import { AnalyticsSummary, Category, FeasibilityTier, GoalPlan } from '../../types';

export class GoalPlannerEngine {
  public static plan(
    summary: AnalyticsSummary,
    params: {
      id?: string;
      title: string;
      targetAmount: number;
      targetMonths: number;
      currentSaved?: number;
    }
  ): GoalPlan {
    const id = params.id || `goal-${Date.now()}`;
    const targetAmount = Math.max(1000, params.targetAmount);
    const targetMonths = Math.max(1, params.targetMonths);
    const currentSaved = Math.max(0, params.currentSaved || 0);

    const netTarget = Math.max(0, targetAmount - currentSaved);
    const requiredMonthlySavings = Math.round(netTarget / targetMonths);

    const currentAvgMonthlySavings = summary.avgMonthlySavings > 0
      ? summary.avgMonthlySavings
      : 1000; // minimum fallback

    const ratio = requiredMonthlySavings / currentAvgMonthlySavings;

    let feasibilityTier: FeasibilityTier;
    let rationale = '';
    let suggestedExtensionMonths: number | undefined;
    let suggestedSpendCut: GoalPlan['suggestedSpendCut'] = undefined;

    if (ratio <= 0.70) {
      feasibilityTier = 'FEASIBLE';
      rationale = `Comfortably feasible. Requires ₹${requiredMonthlySavings.toLocaleString()}/mo, which is ${(ratio * 100).toFixed(0)}% of your existing monthly savings surplus (₹${currentAvgMonthlySavings.toLocaleString()}/mo), retaining a healthy buffer of ${(100 - ratio * 100).toFixed(0)}%.`;
    } else if (ratio <= 1.0) {
      feasibilityTier = 'CHALLENGING';
      rationale = `Challenging. Requires ₹${requiredMonthlySavings.toLocaleString()}/mo (${(ratio * 100).toFixed(0)}% of your monthly surplus). Leaves less than 30% margin for unforeseen expenses. Recommended to trim discretionary spends.`;

      // Suggest cutting discretionary category
      const topDiscretionary = summary.categoryBreakdown.find((c) => c.spendType === 'DISCRETIONARY');
      if (topDiscretionary) {
        const avgMonthlyCat = Math.round(topDiscretionary.amount / Math.max(1, summary.monthlyMetrics.length));
        suggestedSpendCut = {
          category: topDiscretionary.category,
          cutPercentage: 20,
          monthlyRelief: Math.round(avgMonthlyCat * 0.2),
        };
      }
    } else {
      feasibilityTier = 'DIFFICULT';
      const gap = requiredMonthlySavings - currentAvgMonthlySavings;
      const feasibleMonths = Math.ceil(netTarget / Math.max(1, currentAvgMonthlySavings * 0.85));
      suggestedExtensionMonths = feasibleMonths;

      rationale = `Difficult / Over-stretched. Monthly requirement of ₹${requiredMonthlySavings.toLocaleString()}/mo exceeds current monthly surplus of ₹${currentAvgMonthlySavings.toLocaleString()}/mo by a deficit of ₹${gap.toLocaleString()}/mo. To achieve without debt, extend horizon from ${targetMonths} to ${feasibleMonths} months, or cut discretionary spends.`;

      const topDiscretionary = summary.categoryBreakdown.find((c) => c.spendType === 'DISCRETIONARY');
      if (topDiscretionary) {
        const avgMonthlyCat = Math.round(topDiscretionary.amount / Math.max(1, summary.monthlyMetrics.length));
        suggestedSpendCut = {
          category: topDiscretionary.category,
          cutPercentage: 35,
          monthlyRelief: Math.round(avgMonthlyCat * 0.35),
        };
      }
    }

    return {
      id,
      title: params.title,
      targetAmount,
      targetMonths,
      currentSaved,
      requiredMonthlySavings,
      currentAvgMonthlySavings,
      feasibilityTier,
      savingsBufferRatio: parseFloat(ratio.toFixed(2)),
      feasibilityRationale: rationale,
      suggestedExtensionMonths,
      suggestedSpendCut,
    };
  }
}
