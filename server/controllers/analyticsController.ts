import { Request, Response } from 'express';

export class AnalyticsController {
  public static getSummary(_req: Request, res: Response): void {
    res.json({
      status: 'ok',
      totalIncome: 720000,
      totalExpenses: 442000,
      netSavings: 278000,
      savingsRate: 38.6,
      avgMonthlyIncome: 120000,
      avgMonthlyExpense: 73667,
      avgMonthlySavings: 46333,
      essentialSpend: 286500,
      discretionarySpend: 155500,
      essentialRatio: 64.8,
      discretionaryRatio: 35.2,
    });
  }

  public static getRecurring(_req: Request, res: Response): void {
    res.json({
      status: 'ok',
      count: 4,
      recurring: [
        {
          merchant: 'NoBroker Rent',
          category: 'Housing & Rent',
          avgMonthly: 28000,
          totalSpent: 168000,
          transactionCount: 6,
          distinctMonthsCount: 6,
          classification: 'FIXED_SUBSCRIPTION',
          coefficientOfVariation: 0.0,
          standardDeviation: 0,
          variabilityTier: 'IDENTICAL_FIXED',
        },
        {
          merchant: 'Netflix',
          category: 'Subscriptions & Digital',
          avgMonthly: 649,
          totalSpent: 3894,
          transactionCount: 6,
          distinctMonthsCount: 6,
          classification: 'FIXED_SUBSCRIPTION',
          coefficientOfVariation: 0.0,
          standardDeviation: 0,
          variabilityTier: 'IDENTICAL_FIXED',
        },
        {
          merchant: 'Swiggy',
          category: 'Dining & Food Delivery',
          avgMonthly: 3890,
          totalSpent: 23340,
          transactionCount: 28,
          distinctMonthsCount: 6,
          classification: 'VARIABLE_RECURRING',
          coefficientOfVariation: 0.28,
          standardDeviation: 1089,
          variabilityTier: 'VARIABLE_COST',
        },
        {
          merchant: 'Blinkit',
          category: 'Groceries',
          avgMonthly: 3450,
          totalSpent: 20700,
          transactionCount: 16,
          distinctMonthsCount: 6,
          classification: 'VARIABLE_RECURRING',
          coefficientOfVariation: 0.22,
          standardDeviation: 759,
          variabilityTier: 'VARIABLE_COST',
        },
      ],
    });
  }

  public static calculateGoal(req: Request, res: Response): void {
    const { targetAmount, targetMonths, currentSaved, monthlySurplus = 46333 } = req.body;
    const net = Math.max(0, (targetAmount || 100000) - (currentSaved || 0));
    const reqMonthly = Math.round(net / (targetMonths || 12));
    const ratio = reqMonthly / monthlySurplus;
    const tier = ratio <= 0.7 ? 'FEASIBLE' : ratio <= 1.0 ? 'CHALLENGING' : 'DIFFICULT';

    res.json({
      targetAmount,
      targetMonths,
      requiredMonthlySavings: reqMonthly,
      currentMonthlySurplus: monthlySurplus,
      feasibilityTier: tier,
      savingsBufferRatio: parseFloat(ratio.toFixed(2)),
    });
  }

  public static simulate(req: Request, res: Response): void {
    const { categoryReductions = {}, incomeDelta = 0, newEmi = 0 } = req.body;
    const baseIncome = 120000;
    const baseExpense = 73667;

    let saved = 0;
    for (const [, cut] of Object.entries(categoryReductions)) {
      saved += Math.round((Number(cut) / 100) * 8000);
    }

    const projIncome = baseIncome + Number(incomeDelta);
    const projExpense = Math.max(0, baseExpense - saved + Number(newEmi));
    const projSavings = Math.max(0, projIncome - projExpense);
    const projRate = projIncome > 0 ? parseFloat(((projSavings / projIncome) * 100).toFixed(1)) : 0;

    res.json({
      projectedIncome: projIncome,
      projectedExpense: projExpense,
      projectedSavings: projSavings,
      projectedSavingsRate: projRate,
      annualSurplusChange: (projSavings - (baseIncome - baseExpense)) * 12,
    });
  }
}
