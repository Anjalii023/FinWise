import React from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Repeat,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from 'recharts';
import { AnalyticsSummary, Category } from '../types';

interface DashboardViewProps {
  summary: AnalyticsSummary;
  datasetName: string;
  onNavigateToChat: (prompt?: string) => void;
  onNavigateToSimulator: () => void;
  onNavigateToInsights: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  datasetName,
  onNavigateToChat,
  onNavigateToSimulator,
  onNavigateToInsights,
}) => {
  const isHealthySavings = summary.savingsRate >= 20;

  // Coordinated pastel palette across categories & charts
  const pastelColors = [
    '#B5E5CF', // Mint
    '#F9D3B4', // Peach
    '#BCE2F7', // Sky blue
    '#C8BEE8', // Lavender
    '#F4B6B0', // Soft coral
    '#E8D7F1', // Lilac
    '#D7ECD9', // Pale sage
    '#FEE4D7', // Cream peach
  ];

  // Prepare chart data for category breakdown
  const categoryData = summary.categoryBreakdown.slice(0, 6).map((c, i) => ({
    name: c.category.split('&')[0].trim(),
    fullName: c.category,
    amount: c.amount,
    percentage: c.percentage,
    color: pastelColors[i % pastelColors.length],
  }));

  // Prepare monthly trend data for Recharts
  const monthlyTrendData = summary.monthlyMetrics.map((m) => ({
    month: m.month,
    income: m.income,
    expenses: m.expenses,
    savings: m.savings,
    savingsRate: m.savingsRate,
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B5E5CF]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D2D3A]">
              Financial Health & Cash Flow
            </h1>
            <span className="px-2.5 py-0.5 text-xs bg-[#FAF9FD] text-[#6B6B7B] font-mono rounded-full border border-[#ECE8F5]">
              {datasetName}
            </span>
          </div>
          <p className="text-xs text-[#6B6B7B] font-sans max-w-2xl leading-relaxed">
            Overview calculated from {summary.transactionCount} transactions between {summary.dateRange.start} and {summary.dateRange.end}.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => onNavigateToChat('Provide a structured summary of my spending habits and surplus.')}
            className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#E8E4F3] hover:bg-[#DDD7EE] text-[#2D2D3A] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7E69AB]" />
            <span>Ask Advisor</span>
          </button>
          <button
            onClick={onNavigateToSimulator}
            className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FDEBDD] hover:bg-[#FCE1CE] text-[#2D2D3A] transition-all shadow-sm"
          >
            <span>Simulate Budget</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#2D2D3A]" />
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards with Thin Pastel Accent Stripes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Income Card (Mint Accent) */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] border-t-4 border-t-[#B5E5CF] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6B6B7B] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Avg Monthly Income</span>
            <div className="p-1.5 rounded-xl bg-[#DFF3E8] text-[#2D2D3A]">
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#48A97C]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2D3A] font-sans">
            ₹{summary.avgMonthlyIncome.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs text-[#8C8CA1] mt-2 font-mono">
            <span>Total: ₹{summary.totalIncome.toLocaleString()}</span>
            <span className="text-[#48A97C] font-sans font-medium">Credits</span>
          </div>
        </div>

        {/* Expenses Card (Peach Accent) */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] border-t-4 border-t-[#F9D3B4] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6B6B7B] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Avg Monthly Outflow</span>
            <div className="p-1.5 rounded-xl bg-[#FDEBDD] text-[#2D2D3A]">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D97706]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2D3A] font-sans">
            ₹{summary.avgMonthlyExpense.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs text-[#8C8CA1] mt-2 font-mono">
            <span>Total: ₹{summary.totalExpenses.toLocaleString()}</span>
            <span className="text-[#D97706] font-sans font-medium">Expenses</span>
          </div>
        </div>

        {/* Net Surplus Card (Sky Blue Accent) */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] border-t-4 border-t-[#BCE2F7] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6B6B7B] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Avg Monthly Savings</span>
            <div className="p-1.5 rounded-xl bg-[#E1F0FA] text-[#2D2D3A]">
              <TrendingUp className="w-3.5 h-3.5 text-[#0284C7]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2D3A] font-sans">
            ₹{summary.avgMonthlySavings.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs text-[#8C8CA1] mt-2 font-mono">
            <span>6-Mo Net: ₹{summary.netSavings.toLocaleString()}</span>
            <span className="text-[#0284C7] font-sans font-medium">Retained</span>
          </div>
        </div>

        {/* Savings Rate Card (Lavender Accent) */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] border-t-4 border-t-[#C8BEE8] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#6B6B7B] mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Savings Rate</span>
            <div className="p-1.5 rounded-xl bg-[#E8E4F3] text-[#2D2D3A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7E69AB]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#2D2D3A] font-sans">{summary.savingsRate}%</span>
            <span className="text-xs text-[#8C8CA1]">/ 20% benchmark</span>
          </div>
          <div className="w-full bg-[#FAF9FD] rounded-full h-1.5 mt-3 overflow-hidden border border-[#ECE8F5]">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#C8BEE8]"
              style={{ width: `${Math.min(100, (summary.savingsRate / 50) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Charts Grid using Recharts with Coordinated Pastel Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spend Chart (Recharts Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4F1FA] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#2D2D3A]">Category Spend Breakdown</h2>
              <p className="text-xs text-[#6B6B7B]">Top outflows across tracked banking statements</p>
            </div>
            <span className="text-xs font-mono text-[#8C8CA1] px-2 py-0.5 bg-[#FAF9FD] rounded-lg border border-[#ECE8F5]">
              {categoryData.length} categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F1FA" />
                <XAxis
                  dataKey="name"
                  stroke="#8C8CA1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#ECE8F5' }}
                />
                <YAxis
                  stroke="#8C8CA1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#ECE8F5' }}
                  tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #ECE8F5',
                    boxShadow: '0 4px 16px rgba(45,45,58,0.08)',
                    fontSize: '12px',
                    color: '#2D2D3A',
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spent']}
                  labelFormatter={(name) => `${name}`}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Chips Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F4F1FA] text-xs">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9FD] border border-[#ECE8F5]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[#2D2D3A] font-medium">{c.name}:</span>
                <span className="text-[#6B6B7B] font-mono">₹{c.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Chart (Recharts Area Chart) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4F1FA] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#2D2D3A]">Monthly Trend Trajectory</h2>
              <p className="text-xs text-[#6B6B7B]">Income, expenses, and retained savings over time</p>
            </div>
            <button
              onClick={onNavigateToInsights}
              className="text-xs font-semibold text-[#7E69AB] hover:underline flex items-center space-x-1"
            >
              <span>View Diagnostics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <defs>
                  <linearGradient id="incomePastel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B5E5CF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#B5E5CF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expensesPastel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F9D3B4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#F9D3B4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="savingsPastel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BCE2F7" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#BCE2F7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F1FA" />
                <XAxis
                  dataKey="month"
                  stroke="#8C8CA1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#ECE8F5' }}
                />
                <YAxis
                  stroke="#8C8CA1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#ECE8F5' }}
                  tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #ECE8F5',
                    boxShadow: '0 4px 16px rgba(45,45,58,0.08)',
                    fontSize: '12px',
                    color: '#2D2D3A',
                  }}
                  formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings']}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#48A97C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomePastel)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#D97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expensesPastel)"
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#0284C7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#savingsPastel)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 pt-2 border-t border-[#F4F1FA] text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#48A97C]" />
              <span className="text-[#6B6B7B]">Income</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              <span className="text-[#6B6B7B]">Expenses</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
              <span className="text-[#6B6B7B]">Net Savings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recurring-Expenses List */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#F4F1FA] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#DFF3E8] text-[#2D2D3A]">
              <Repeat className="w-4 h-4 text-[#48A97C]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D2D3A]">Amount-Aware Recurring Detection</h2>
              <p className="text-xs text-[#6B6B7B]">
                Uses Coefficient of Variation (CV = σ / μ) to distinguish fixed subscriptions from variable-cost categories
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-[#E8E4F3] text-[#7E69AB] rounded-lg font-bold border border-[#C8BEE8]/50">
              Fixed: CV &lt; 10%
            </span>
            <span className="px-2.5 py-1 bg-[#FDEBDD] text-[#D97706] rounded-lg font-bold border border-[#F9D3B4]/50">
              Variable: CV ≥ 10%
            </span>
          </div>
        </div>

        {summary.recurringExpenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8C8CA1]">
            No recurring merchants spanning ≥ 3 months found in current statement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ECE8F5] text-[#8C8CA1] font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Merchant / Service</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold text-right">Avg Monthly</th>
                  <th className="pb-3 font-semibold text-right">Range (Min - Max)</th>
                  <th className="pb-3 font-semibold text-right">Total Spent</th>
                  <th className="pb-3 font-semibold text-center">Frequency</th>
                  <th className="pb-3 font-semibold text-right">Std Dev (σ) &amp; CV</th>
                  <th className="pb-3 font-semibold text-right">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1FA]">
                {summary.recurringExpenses.map((rec) => {
                  const isFixed = rec.classification === 'FIXED_SUBSCRIPTION';
                  const cvPercent = (rec.coefficientOfVariation * 100).toFixed(1);
                  return (
                    <tr key={rec.merchant} className="hover:bg-[#FAF9FD] transition-colors">
                      <td className="py-3.5">
                        <span className="font-bold text-[#2D2D3A] block">{rec.merchant}</span>
                        <span className="text-[10px] text-[#8C8CA1] font-mono block mt-0.5">
                          {rec.cvExplanation}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#6B6B7B]">{rec.category}</td>
                      <td className="py-3.5 text-right font-mono text-[#2D2D3A]">
                        ₹{rec.monthlyAverage ? rec.monthlyAverage.toLocaleString() : rec.averageAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right font-mono text-xs">
                        {rec.minAmount !== undefined && rec.maxAmount !== undefined ? (
                          isFixed ? (
                            <span className="text-[#48A97C] font-semibold">Fixed ₹{rec.minAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-[#6B6B7B]">₹{rec.minAmount.toLocaleString()} – ₹{rec.maxAmount.toLocaleString()}</span>
                          )
                        ) : (
                          <span className="text-[#8C8CA1]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-[#2D2D3A]">
                        ₹{rec.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-center text-[#8C8CA1] font-mono">
                        <span className="font-bold text-[#2D2D3A]">{rec.distinctMonthsCount}</span> mos
                        <span className="text-[10px] text-[#8C8CA1] block">({rec.transactionCount} txs)</span>
                      </td>
                      <td className="py-3.5 text-right font-mono">
                        <span className="text-[#2D2D3A] block font-semibold">σ: ₹{Math.round(rec.standardDeviation).toLocaleString()}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            isFixed ? 'text-[#48A97C]' : 'text-[#D97706]'
                          }`}
                        >
                          CV: {cvPercent}% ({rec.coefficientOfVariation.toFixed(3)})
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase ${
                            isFixed
                              ? 'bg-[#E8E4F3] text-[#7E69AB] border border-[#C8BEE8]/40'
                              : 'bg-[#FDEBDD] text-[#D97706] border border-[#F9D3B4]/40'
                          }`}
                        >
                          {isFixed ? 'Fixed Subscription' : 'Variable Recurring'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
