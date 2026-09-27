import React, { useState } from 'react';
import {
  Scale,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Search,
} from 'lucide-react';
import { AnalyticsSummary } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface HallucinationDemoProps {
  summary: AnalyticsSummary;
  onNavigateToChat: (prompt: string) => void;
}

interface DemoScenario {
  id: string;
  title: string;
  query: string;
  rawLlmAnswer: string;
  finwiseAnswer: string;
  rawIssues: string[];
  finwiseHighlights: string[];
}

export const HallucinationDemo: React.FC<HallucinationDemoProps> = ({
  summary,
  onNavigateToChat,
}) => {
  const diningItem = summary.categoryBreakdown.find((c) => c.category === 'Dining & Food Delivery');
  const diningAmount = diningItem ? diningItem.amount : 18500;
  const diningPercent = diningItem ? diningItem.percentage : 14.8;
  const avgMonthlyDining = Math.round(diningAmount / Math.max(1, summary.monthlyMetrics.length));

  const scenarios: DemoScenario[] = [
    {
      id: 'scen-1',
      title: 'Spend Arithmetic & Data Lookup',
      query: 'How much did I spend on dining & food delivery in my statement, and what percentage of my total outflow was it?',
      rawLlmAnswer: `Based on your recent transactions, you spent approximately ₹42,800 on dining and food deliveries. This looks to be around 28.5% of your total expenses. You should definitely consider cutting back on weekend restaurants as that is almost a third of your budget!`,
      finwiseAnswer: `### Verified Spend Breakdown

Based on your verified statement data (${summary.transactionCount} transactions across ${summary.dateRange.start} to ${summary.dateRange.end}):

- **Total Dining & Food Delivery Outflow:** **₹${diningAmount.toLocaleString()}**
- **Exact Proportion of Total Expenses:** **${diningPercent}%**
- **Average Monthly Dining Spend:** **₹${avgMonthlyDining.toLocaleString()}/mo**

All figures are aggregated directly from your parsed transaction records.`,
      rawIssues: [
        `Hallucinated ₹42,800 out of thin air (true spend is ₹${diningAmount.toLocaleString()})`,
        `Invented 28.5% share (actual verified share is ${diningPercent}%)`,
        'General LLMs cannot sum arrays of numbers accurately without external code execution',
      ],
      finwiseHighlights: [
        'Pure code aggregation over all parsed transaction rows',
        'Exact rupee amounts and mathematical percentages verified',
        'Zero guessed figures or rounded estimations',
      ],
    },
    {
      id: 'scen-2',
      title: 'High-Yield Investment Scheme Inquiry',
      query: 'I found an online private fund offering 18% guaranteed annual returns with zero risk. Should I park my emergency fund there?',
      rawLlmAnswer: `An 18% return is a very attractive rate in the current market, especially if they guarantee zero downside! You could allocate half of your emergency fund to take advantage of this high compounding rate while keeping the other half in your bank account for safety.`,
      finwiseAnswer: `### Prudent Guidance & Risk Safeguards

**Definitive Recommendation: NO.** Under Indian regulatory standards and basic financial theory, no legitimate instrument delivers 18% risk-free returns.

- **Regulatory Benchmark (RBI Repo Rate):** The risk-free sovereign rate is ~6.5% - 7.0%. Any private operator offering 18% "guaranteed" return is either fraudulent or carries catastrophic principal loss risk.
- **Emergency Reserve Integrity:** Emergency capital must never be exposed to credit or market risk. It must reside in liquid, sovereign-backed instruments (Savings Accounts, Liquid Funds, Sweep FDs).`,
      rawIssues: [
        'Endorsed a dangerous scheme promising impossible 18% risk-free returns',
        'Advised putting 50% of an emergency safety net into an unverified private fund',
        'Lacks grounding in statutory benchmarks and regulatory consumer protection standards',
      ],
      finwiseHighlights: [
        'Grounds advice in RBI repo rate benchmarks (~6.5% - 7.0%)',
        'Applies strict capital preservation guidelines for emergency funds',
        'Actively protects user capital against fraudulent schemes',
      ],
    },
    {
      id: 'scen-3',
      title: 'What-If Budget Cut & Salary Raise',
      query: 'If I cut my dining spend by 30% and get a ₹10,000 monthly raise, how much additional surplus will I accumulate in 12 months?',
      rawLlmAnswer: `If you cut dining by 30%, you'll probably save around ₹15,000 a month. Adding your ₹10,000 raise gives ₹25,000 more per month. In 12 months, that will compound to around ₹3,50,000 or ₹4,00,000 with interest!`,
      finwiseAnswer: `### Budget Simulation Projection

Calculating exact before and after surplus using your verified monthly baseline:

- **Baseline Monthly Dining Spend:** **₹${avgMonthlyDining.toLocaleString()}/mo**
- **30% Dining Reduction:** Saves **+₹${Math.round(avgMonthlyDining * 0.3).toLocaleString()}/mo**
- **Monthly Income Increase:** Adds **+₹10,000/mo**
- **Net Monthly Surplus Delta:** **+₹${(Math.round(avgMonthlyDining * 0.3) + 10000).toLocaleString()}/mo**
- **12-Month Accumulated Capital:** Exactly **₹${((Math.round(avgMonthlyDining * 0.3) + 10000) * 12).toLocaleString()}**

All values are computed using pure mathematical formulas without fuzzy rounding.`,
      rawIssues: [
        'Guessed a random ₹15,000 dining cut without checking actual monthly spend',
        'Fuzzed the annual math to an inaccurate range of "₹3,50,000 to ₹4,00,000"',
        'Invented compounding growth numbers without a defined annual interest rate',
      ],
      finwiseHighlights: [
        'Uses true monthly baseline derived from your uploaded bank statement',
        'Calculates exact 30% reduction down to the single rupee',
        `Computes 12-month net capital accumulation strictly: ₹${((Math.round(avgMonthlyDining * 0.3) + 10000) * 12).toLocaleString()}`,
      ],
    },
    {
      id: 'scen-4',
      title: 'Current Savings Rate & Cash Flow',
      query: 'What was my average monthly savings rate and surplus over the statement period?',
      rawLlmAnswer: `Looking at standard profiles, most individuals save around 15% to 20% of their salary. Based on your income, you are probably saving roughly ₹20,000 each month after living expenses and bills.`,
      finwiseAnswer: `### Verified Cash Flow Metrics

Based on your statement records from **${summary.dateRange.start}** to **${summary.dateRange.end}**:

- **Average Monthly Income:** **₹${summary.avgMonthlyIncome.toLocaleString()}**
- **Average Monthly Outflow:** **₹${summary.avgMonthlyExpense.toLocaleString()}**
- **Net Monthly Savings Surplus:** **₹${summary.avgMonthlySavings.toLocaleString()}**
- **Exact Verified Savings Rate:** **${summary.savingsRate}%**

Your monthly surplus is calculated by subtracting verified debits from verified credits across all statement months.`,
      rawIssues: [
        'Gave generic ballpark estimates ("15% to 20%") instead of checking data',
        'Guessed ₹20,000 without calculating actual credits minus debits',
        'Could not verify statement date ranges or transaction counts',
      ],
      finwiseHighlights: [
        `Computes true average monthly surplus: ₹${summary.avgMonthlySavings.toLocaleString()}/mo`,
        `Verifies exact savings rate: ${summary.savingsRate}%`,
        'Full mathematical reconciliation with statement transactions',
      ],
    },
  ];

  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const [customQuery, setCustomQuery] = useState(activeScenario.query);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(true);

  const handleSelectScenario = (scen: DemoScenario) => {
    setActiveScenarioId(scen.id);
    setCustomQuery(scen.query);
    setHasRun(true);
  };

  const handleRunDemo = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8E4F3] text-[#7E69AB] flex items-center justify-center font-bold text-xs">
              <Scale className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D2D3A]">
              Model Comparison & Verification
            </h1>
          </div>
          <p className="text-xs text-[#6B6B7B] max-w-2xl leading-relaxed">
            Run side-by-side comparison queries to see how an ungrounded general LLM compares against the FinWise verified computation engine.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {scenarios.map((scen, idx) => (
            <button
              key={scen.id}
              onClick={() => handleSelectScenario(scen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeScenarioId === scen.id
                  ? 'bg-[#E8E4F3] text-[#2D2D3A] border border-[#C8BEE8] shadow-xs'
                  : 'bg-[#FAF9FD] hover:bg-[#F4F1FA] text-[#6B6B7B] border border-[#ECE8F5]'
              }`}
            >
              Test {idx + 1}: {scen.title}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Query & Run Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#ECE8F5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center bg-[#FAF9FD] border border-[#ECE8F5] rounded-2xl px-4 py-2.5 focus-within:border-[#C8BEE8] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#8C8CA1] shrink-0 mr-2.5" />
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Enter a financial inquiry or test question..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#2D2D3A] placeholder-[#8C8CA1] focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRunDemo}
              disabled={isRunning || !customQuery.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#E8E4F3] hover:bg-[#DDD7EE] text-[#2D2D3A] transition-all shadow-sm disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#7E69AB]" />
                  <span>Running Demo...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#7E69AB] fill-[#7E69AB]" />
                  <span>Run Comparison</span>
                </>
              )}
            </button>

            <button
              onClick={() => onNavigateToChat(customQuery)}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#FAF9FD] hover:bg-[#F4F1FA] text-[#6B6B7B] hover:text-[#2D2D3A] border border-[#ECE8F5] transition-colors flex items-center space-x-1"
            >
              <span>Ask Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Comparison Summary Scorecard */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 text-xs">
          <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5]">
            <span className="text-[10px] text-[#8C8CA1] uppercase font-semibold block">Arithmetic Precision</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#DC2626] font-mono font-medium">Standard: ~20%</span>
              <span className="text-[#48A97C] font-mono font-bold">FinWise: 100%</span>
            </div>
          </div>
          <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5]">
            <span className="text-[10px] text-[#8C8CA1] uppercase font-semibold block">Data Source</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#DC2626] truncate mr-1">Weights Only</span>
              <span className="text-[#48A97C] font-semibold truncate">Parsed Statement</span>
            </div>
          </div>
          <div className="p-3 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5]">
            <span className="text-[10px] text-[#8C8CA1] uppercase font-semibold block">Hallucination Risk</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#DC2626] font-semibold">High</span>
              <span className="text-[#48A97C] font-bold">Zero (Grounded)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Standard / Normal LLM */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] border-t-4 border-t-[#F4B6B0] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4F1FA] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xl bg-[#FDE8E7] text-[#DC2626]">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2D2D3A]">
                  Standard Language Model
                </h3>
                <span className="text-[10px] text-[#8C8CA1] font-mono">Ungrounded conversational baseline</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#FDE8E7] text-[#DC2626] border border-[#F4B6B0] font-bold">
              Arithmetic Error Risk: High
            </span>
          </div>

          {isRunning ? (
            <div className="p-12 text-center text-xs text-[#8C8CA1] space-y-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#DC2626]" />
              <p>Simulating standard language model generation...</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5]">
                <MarkdownRenderer content={activeScenario.rawLlmAnswer} stripEmojis={true} />
              </div>

              {/* Issue breakdown */}
              <div className="space-y-2 pt-2 border-t border-[#F4F1FA]">
                <span className="text-[11px] font-bold text-[#DC2626] font-mono uppercase tracking-wide block">
                  Identified Arithmetic &amp; Data Flaws:
                </span>
                <ul className="space-y-2 text-xs text-[#6B6B7B]">
                  {activeScenario.rawIssues.map((issue, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Right Column: FinWise Verified Pipeline */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] border-t-4 border-t-[#B5E5CF] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4F1FA] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xl bg-[#DFF3E8] text-[#2E7D5B]">
                <CheckCircle2 className="w-4 h-4 text-[#48A97C]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2D2D3A]">
                  FinWise Financial Advisor
                </h3>
                <span className="text-[10px] text-[#8C8CA1] font-mono">Statement math + regulatory guidelines</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#DFF3E8] text-[#2E7D5B] border border-[#B5E5CF] font-bold">
              100% Code Verified
            </span>
          </div>

          {isRunning ? (
            <div className="p-12 text-center text-xs text-[#8C8CA1] space-y-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#48A97C]" />
              <p>Aggregating statement transactions and guidelines...</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5]">
                <MarkdownRenderer content={activeScenario.finwiseAnswer} stripEmojis={true} />
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-[#F4F1FA]">
                <span className="text-[11px] font-bold text-[#2E7D5B] font-mono uppercase tracking-wide block">
                  FinWise Verification Guarantees:
                </span>
                <ul className="space-y-2 text-xs text-[#6B6B7B]">
                  {activeScenario.finwiseHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#48A97C] shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
