import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Scale,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  X,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { AnalyticsSummary } from '../types';
import { RootCauseEngine } from '../services/analytics/rootCause';

interface InsightsViewProps {
  summary: AnalyticsSummary;
  onNavigateToChat: (prompt: string) => void;
  onNavigateToSimulator: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  summary,
  onNavigateToChat,
  onNavigateToSimulator,
}) => {
  const rootCause = useMemo(() => {
    return RootCauseEngine.analyze(summary);
  }, [summary]);

  // Dismissible source conflict banner state
  const [showConflictBanner, setShowConflictBanner] = useState(true);

  // Prepare chart data for root cause culprits
  const culpritChartData = (rootCause?.topCulprits || []).map((c, i) => ({
    category: c.category.split('&')[0].trim(),
    fullName: c.category,
    excessSpike: c.absoluteDelta,
    contribution: c.contributionToDrop,
    color: ['#F9D3B4', '#F4B6B0', '#C8BEE8', '#B5E5CF'][i % 4],
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#FDEBDD] text-[#2D2D3A] flex items-center justify-center font-bold text-xs">
              <TrendingDown className="w-4 h-4 text-[#D97706]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D2D3A]">
              Spending Insights & Trends
            </h1>
          </div>
          <p className="text-xs text-[#6B6B7B] max-w-xl">
            Analyze monthly changes in your savings rate and identify the primary categories driving spending shifts.
          </p>
        </div>
      </div>

      {/* Dismissible Source-Conflict Banner (Conditionally Shown) */}
      {showConflictBanner && (
        <div className="p-5 bg-gradient-to-r from-[#FAF9FD] via-[#FDFBF7] to-[#FAF9FD] border border-[#ECE8F5] rounded-3xl shadow-[0_2px_12px_rgba(45,45,58,0.03)] relative animate-in fade-in duration-200">
          <button
            onClick={() => setShowConflictBanner(false)}
            className="absolute top-4 right-4 text-[#8C8CA1] hover:text-[#2D2D3A] p-1 rounded-lg hover:bg-white transition-colors"
            title="Dismiss Banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start space-x-3.5 pr-8">
            <div className="p-2 bg-[#E8E4F3] text-[#7E69AB] rounded-2xl shrink-0 mt-0.5">
              <Scale className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#2D2D3A] text-sm">
                  Financial Strategy: Debt Repayment vs. Equity SIP Compounding
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#E8E4F3] text-[#7E69AB] font-bold">
                  Rule of Thumb
                </span>
              </div>
              <p className="text-[#6B6B7B] leading-relaxed">
                When deciding between debt prepayment and mutual fund investing, financial guidelines prioritize eliminating high-interest liabilities (&gt;10% APR like credit cards and personal loans) first. Guaranteed debt interest savings consistently beat unpredictable market returns.
              </p>
              <div className="pt-1 flex items-center space-x-3">
                <button
                  onClick={() =>
                    onNavigateToChat(
                      'Explain the mathematical difference between Debt Avalanche and Debt Snowball with my current cash flow.'
                    )
                  }
                  className="font-bold text-[#7E69AB] hover:underline flex items-center space-x-1"
                >
                  <span>Ask Advisor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Root-Cause Savings Breakdown Chart & Culprits Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#F4F1FA] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#2D2D3A]">
              Root-Cause Savings Rate Breakdown
            </h2>
            <p className="text-xs text-[#6B6B7B]">
              Decomposing the savings drop between{' '}
              <span className="font-mono text-[#2D2D3A] font-bold">{rootCause?.baselineMonth || 'Month 1'}</span> and{' '}
              <span className="font-mono text-[#2D2D3A] font-bold">{rootCause?.dropMonth || 'Month 2'}</span>
            </p>
          </div>

          {rootCause && (
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF9FD] text-[#6B6B7B] border border-[#ECE8F5]">
                Baseline: {rootCause.baselineSavingsRate}%
              </span>
              <span className="text-[#D97706] font-bold">
                → Drop: {rootCause.dropSavingsRate}% (-{rootCause.savingsRateDrop}%)
              </span>
            </div>
          )}
        </div>

        {/* Recharts Chart for Excess Spike Breakdown */}
        {culpritChartData.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#6B6B7B] block">
              Top Category Culprits by Excess Spend Spike (₹)
            </span>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={culpritChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F1FA" />
                  <XAxis dataKey="category" stroke="#8C8CA1" fontSize={11} tickLine={false} axisLine={{ stroke: '#ECE8F5' }} />
                  <YAxis stroke="#8C8CA1" fontSize={11} tickLine={false} axisLine={{ stroke: '#ECE8F5' }} tickFormatter={(val) => `₹${Math.round(val / 1000)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #ECE8F5',
                      boxShadow: '0 4px 16px rgba(45,45,58,0.08)',
                      fontSize: '12px',
                      color: '#2D2D3A',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Excess Outflow']}
                  />
                  <Bar dataKey="excessSpike" radius={[8, 8, 0, 0]}>
                    {culpritChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Ranked Culprits Table */}
        {rootCause && rootCause.topCulprits.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ECE8F5] text-[#8C8CA1] font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Rank & Category</th>
                    <th className="pb-3 font-semibold text-right">Baseline Spend</th>
                    <th className="pb-3 font-semibold text-right">Drop Month Spend</th>
                    <th className="pb-3 font-semibold text-right">Excess Spike (Δ)</th>
                    <th className="pb-3 font-semibold text-right">% Contribution</th>
                    <th className="pb-3 font-semibold">Diagnostic Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F1FA] font-mono">
                  {rootCause.topCulprits.map((item, idx) => (
                    <tr key={item.category} className="hover:bg-[#FAF9FD] transition-colors">
                      <td className="py-3.5 font-bold text-[#2D2D3A] font-sans flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-[#E8E4F3] text-[#7E69AB] text-[10px] flex items-center justify-center font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span>{item.category}</span>
                      </td>
                      <td className="py-3.5 text-right text-[#6B6B7B]">
                        ₹{item.baselineSpend.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right text-[#2D2D3A] font-bold">
                        ₹{item.currentSpend.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right text-[#D97706] font-bold">
                        +₹{item.absoluteDelta.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right text-[#7E69AB] font-bold">
                        {item.contributionToDrop}%
                      </td>
                      <td className="py-3.5 text-[#6B6B7B] font-sans text-[11px] max-w-xs">
                        {item.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Suggested Fix Callout */}
            <div className="p-4 bg-[#DFF3E8]/60 border border-[#B5E5CF] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#2E7D5B] uppercase tracking-wide">
                  Suggested Budget Adjustment
                </span>
                <p className="text-xs text-[#2D2D3A]">
                  Trimming <strong className="text-[#2E7D5B]">{rootCause.automatedWhatIfFix.category}</strong> by{' '}
                  <strong>{rootCause.automatedWhatIfFix.cutPercentage}%</strong> frees up{' '}
                  <strong className="font-mono">₹{rootCause.automatedWhatIfFix.monthlySaved.toLocaleString()}/mo</strong>,
                  bringing your savings rate back to{' '}
                  <strong className="text-[#2E7D5B] font-mono">{rootCause.automatedWhatIfFix.projectedSavingsRate}%</strong>.
                </p>
              </div>

              <button
                onClick={onNavigateToSimulator}
                className="px-4 py-2 bg-white hover:bg-[#FAF9FD] text-[#2D2D3A] rounded-xl text-xs font-bold border border-[#ECE8F5] transition-all shadow-xs shrink-0 flex items-center space-x-1"
              >
                <span>Test in Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#8C8CA1]">
            No significant drop in savings detected between consecutive months.
          </div>
        )}
      </div>

      {/* Always-Visible "What this system won't do" Limitations Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-4">
        <div className="flex items-center space-x-2 text-[#7E69AB]">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h2 className="text-sm font-bold tracking-tight uppercase font-sans">
            Platform Scope & Usage Boundaries
          </h2>
        </div>
        <p className="text-xs text-[#6B6B7B] leading-relaxed">
          FinWise focuses on transparent cash flow analytics and budgeting education. We maintain clear operational boundaries:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5] space-y-1">
            <span className="text-[#D97706] font-bold block">Accurate Statement Math</span>
            <p className="text-[#6B6B7B] text-[11px] leading-relaxed">
              Every balance, category sum, and percentage is aggregated in verified code, ensuring data precision.
            </p>
          </div>

          <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5] space-y-1">
            <span className="text-[#D97706] font-bold block">No Stock or Crypto Advice</span>
            <p className="text-[#6B6B7B] text-[11px] leading-relaxed">
              We do not predict market movements, recommend individual equities, or promote crypto investments.
            </p>
          </div>

          <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5] space-y-1">
            <span className="text-[#D97706] font-bold block">Zero Credential Access</span>
            <p className="text-[#6B6B7B] text-[11px] leading-relaxed">
              We process offline statements only. We never ask for your net banking login, PINs, or OTPs.
            </p>
          </div>

          <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5] space-y-1">
            <span className="text-[#D97706] font-bold block">No Brokerage Execution</span>
            <p className="text-[#6B6B7B] text-[11px] leading-relaxed">
              FinWise is an educational budgeting and cash flow planning tool, not an authorized portfolio manager or broker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
