export interface LoanOption {
  name: string;
  principal: number;
  annualInterestRate: number; // e.g. 8.5%
  tenureYears: number; // e.g. 20
  processingFeePercent?: number; // e.g. 0.5%
}

export interface InvestmentOption {
  name: string;
  monthlyDeposit: number;
  expectedAnnualReturn: number; // e.g. 12%
  tenureYears: number;
  taxBracketPercent: number; // e.g. 20%
}

export interface ComparisonResult {
  title: string;
  optionA: {
    name: string;
    monthlyCashflow: number;
    totalPaidOrWealth: number;
    totalInterestOrGain: number;
    keyMetricLabel: string;
    keyMetricValue: string;
    verdictTag: string;
  };
  optionB: {
    name: string;
    monthlyCashflow: number;
    totalPaidOrWealth: number;
    totalInterestOrGain: number;
    keyMetricLabel: string;
    keyMetricValue: string;
    verdictTag: string;
  };
  delta: {
    monthlyDifference: number;
    lifetimeDifference: number;
    winner: 'A' | 'B' | 'TIE';
    summaryExplanation: string;
  };
}

export class InstrumentComparator {
  /**
   * Compares two loan structures (e.g. 8.5% for 20 yrs vs 8.75% for 15 yrs)
   */
  public static compareLoans(loanA: LoanOption, loanB: LoanOption): ComparisonResult {
    const calcLoan = (l: LoanOption) => {
      const r = l.annualInterestRate / (12 * 100);
      const n = l.tenureYears * 12;
      const emi = (l.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalRepayment = emi * n;
      const totalInterest = totalRepayment - l.principal;
      return { emi: Math.round(emi), totalRepayment: Math.round(totalRepayment), totalInterest: Math.round(totalInterest) };
    };

    const resA = calcLoan(loanA);
    const resB = calcLoan(loanB);

    const lifetimeDiff = Math.abs(resA.totalInterest - resB.totalInterest);
    const monthlyDiff = Math.abs(resA.emi - resB.emi);
    const winner = resA.totalInterest < resB.totalInterest ? 'A' : 'B';

    const cheaperName = winner === 'A' ? loanA.name : loanB.name;
    const expensiveName = winner === 'A' ? loanB.name : loanA.name;

    return {
      title: `Loan Comparison: ${loanA.name} vs ${loanB.name}`,
      optionA: {
        name: loanA.name,
        monthlyCashflow: resA.emi,
        totalPaidOrWealth: resA.totalRepayment,
        totalInterestOrGain: resA.totalInterest,
        keyMetricLabel: 'Monthly EMI',
        keyMetricValue: `₹${resA.emi.toLocaleString()}`,
        verdictTag: winner === 'A' ? 'Lower Total Interest' : 'Flexible Monthly Outflow',
      },
      optionB: {
        name: loanB.name,
        monthlyCashflow: resB.emi,
        totalPaidOrWealth: resB.totalRepayment,
        totalInterestOrGain: resB.totalInterest,
        keyMetricLabel: 'Monthly EMI',
        keyMetricValue: `₹${resB.emi.toLocaleString()}`,
        verdictTag: winner === 'B' ? 'Lower Total Interest' : 'Flexible Monthly Outflow',
      },
      delta: {
        monthlyDifference: monthlyDiff,
        lifetimeDifference: lifetimeDiff,
        winner,
        summaryExplanation: `${cheaperName} saves a total of ₹${lifetimeDiff.toLocaleString()} in lifetime interest compared to ${expensiveName}, with an EMI difference of ₹${monthlyDiff.toLocaleString()}/month.`,
      },
    };
  }

  /**
   * Compares Loan Prepayment vs Systematic Equity SIP
   */
  public static comparePrepayVsSip(
    loanInterestRate: number,
    sipExpectedReturn: number,
    monthlyAmount: number,
    tenureYears: number
  ): ComparisonResult {
    // Guaranteed savings rate vs variable market compounding
    const months = tenureYears * 12;
    const rSip = sipExpectedReturn / (12 * 100);
    // Future value of SIP: P * [((1 + r)^n - 1) / r] * (1 + r)
    const sipFutureValue = Math.round(monthlyAmount * ((Math.pow(1 + rSip, months) - 1) / rSip) * (1 + rSip));
    const totalDeposited = monthlyAmount * months;
    const sipGain = sipFutureValue - totalDeposited;

    // Guaranteed interest saved by prepaying loan
    const rLoan = loanInterestRate / (12 * 100);
    const loanFutureValue = Math.round(monthlyAmount * ((Math.pow(1 + rLoan, months) - 1) / rLoan) * (1 + rLoan));
    const interestSaved = loanFutureValue - totalDeposited;

    const lifetimeDiff = Math.abs(sipGain - interestSaved);
    const winner = sipGain > interestSaved ? 'B' : 'A';

    return {
      title: 'Strategy Comparison: Debt Prepayment vs Equity SIP',
      optionA: {
        name: `Prepay Loan (${loanInterestRate}% Guaranteed)`,
        monthlyCashflow: monthlyAmount,
        totalPaidOrWealth: totalDeposited + interestSaved,
        totalInterestOrGain: interestSaved,
        keyMetricLabel: 'Guaranteed Interest Saved',
        keyMetricValue: `₹${interestSaved.toLocaleString()}`,
        verdictTag: 'Zero Risk / Guaranteed ROI',
      },
      optionB: {
        name: `Systematic Equity SIP (~${sipExpectedReturn}% Long-term)`,
        monthlyCashflow: monthlyAmount,
        totalPaidOrWealth: sipFutureValue,
        totalInterestOrGain: sipGain,
        keyMetricLabel: 'Projected Wealth Creation',
        keyMetricValue: `₹${sipGain.toLocaleString()}`,
        verdictTag: 'Higher Upside / Market Risk',
      },
      delta: {
        monthlyDifference: 0,
        lifetimeDifference: lifetimeDiff,
        winner,
        summaryExplanation: `Equity SIP projects ₹${lifetimeDiff.toLocaleString()} greater gross wealth over ${tenureYears} years, but carries market volatility. Prepaying your ${loanInterestRate}% loan yields a 100% risk-free, post-tax guaranteed return equal to the borrowing rate.`,
      },
    };
  }
}
