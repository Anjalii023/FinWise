import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { AnalyticsSummary, Category, WhatIfAdjustment } from '../types';
import { SimulatorEngine } from '../services/simulation/simulator';

interface SimulatorViewProps {
  summary: AnalyticsSummary;
  onNavigateToChat: (prompt: string) => void;
  onNavigateToGoals: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  summary,
  onNavigateToChat,
  onNavigateToGoals,
}) => {
  const adjustableCategories: Category[] = [
    'Dining & Food Delivery',
    'Shopping & Retail',
    'Entertainment & Leisure',
    'Subscriptions & Digital',
    'Travel & Commute',
    'Miscellaneous',
  ];

  const [categoryReductions, setCategoryReductions] = useState<Partial<Record<Category, number>>>({
    'Dining & Food Delivery': 25,
    'Shopping & Retail': 20,
    'Entertainment & Leisure': 0,
    'Subscriptions & Digital': 15,
    'Travel & Commute': 0,
    'Miscellaneous': 0,
  });

  const [incomeDelta, setIncomeDelta] = useState<number>(0);
  const [newEmi, setNewEmi] = useState<number>(0);
  const [sipDelta, setSipDelta] = useState<number>(0);

  const adjustment: WhatIfAdjustment = useMemo(
    () => ({
      categoryReductions,
      monthlyIncomeDelta: incomeDelta,
      newMonthlyEmi: newEmi,
      monthlySipDelta: sipDelta,
    }),
    [categoryReductions, incomeDelta, newEmi, sipDelta]
  );

  const result = useMemo(() => {
    return SimulatorEngine.simulate(summary, adjustment);
  }, [summary, adjustment]);

  const handleSliderChange = (cat: Category, val: number) => {
    setCategoryReductions((prev) => ({
      ...prev,
      [cat]: val,
    }));
  };

  const resetSimulation = () => {
    setCategoryReductions({
      'Dining & Food Delivery': 0,
      'Shopping & Retail': 0,
      'Entertainment & Leisure': 0,
      'Subscriptions & Digital': 0,
      'Travel & Commute': 0,
      'Miscellaneous': 0,
    });
    setIncomeDelta(0);
    setNewEmi(0);
    setSipDelta(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#FDEBDD] text-[#2D2D3A] flex items-center justify-center font-bold text-xs">
              <Sliders className="w-4 h-4 text-[#D97706]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D2D3A]">
              What-If Cash Flow Simulator
            </h1>
          </div>
          <p className="text-xs text-[#6B6B7B] max-w-xl">
            Test how discretionary spend cuts, salary raises, or new loan EMIs will impact your monthly savings and surplus.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF9FD] hover:bg-[#F4F1FA] text-[#6B6B7B] hover:text-[#2D2D3A] border border-[#ECE8F5] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sliders</span>
        </button>
      </div>

      {/* Main 2-Column Grid: Inputs on Left, Before/After Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Extended Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category % Sliders */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-5">
            <div className="border-b border-[#F4F1FA] pb-3">
              <h2 className="text-sm font-bold text-[#2D2D3A] flex items-center space-x-2">
                <Percent className="w-4 h-4 text-[#7E69AB]" />
                <span>Discretionary Category Reductions</span>
              </h2>
              <p className="text-xs text-[#6B6B7B] mt-0.5">
                Adjust spend cuts for non-essential lifestyle categories
              </p>
            </div>

            <div className="space-y-4">
              {adjustableCategories.map((cat) => {
                const percent = categoryReductions[cat] || 0;
                const catSummary = summary.categoryBreakdown.find((c) => c.category === cat);
                const monthlyAvg = catSummary
                  ? Math.round(catSummary.amount / Math.max(1, summary.monthlyMetrics.length))
                  : 0;
                const saved = Math.round((percent / 100) * monthlyAvg);

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#2D2D3A]">{cat}</span>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-[#8C8CA1]">Current: ₹{monthlyAvg.toLocaleString()}/mo</span>
                        <span className="text-[#48A97C] font-bold">
                          -{percent}% (Save ₹{saved.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={percent}
                        onChange={(e) => handleSliderChange(cat, parseInt(e.target.value, 10))}
                        className="flex-1 accent-[#7E69AB] bg-[#FAF9FD] h-2 rounded-lg cursor-pointer"
                      />
                      <span className="w-10 text-right text-xs font-mono font-bold text-[#2D2D3A]">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extended What-If Inputs */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-4">
            <div className="border-b border-[#F4F1FA] pb-3">
              <h2 className="text-sm font-bold text-[#2D2D3A] flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-[#0284C7]" />
                <span>Extended Financial Variables</span>
              </h2>
              <p className="text-xs text-[#6B6B7B] mt-0.5">
                Simulate salary hikes, new loan EMIs, or monthly SIP commitments
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#FAF9FD] border border-[#ECE8F5] rounded-2xl space-y-1.5">
                <label className="text-[#2D2D3A] font-semibold block">Monthly Income Change (₹)</label>
                <input
                  type="number"
                  step="2500"
                  value={incomeDelta || ''}
                  onChange={(e) => setIncomeDelta(parseInt(e.target.value, 10) || 0)}
                  placeholder="+/- e.g. 15000"
                  className="w-full bg-white border border-[#ECE8F5] rounded-xl px-3 py-2 text-[#2D2D3A] font-mono text-xs focus:outline-none focus:border-[#C8BEE8]"
                />
                <span className="text-[10px] text-[#8C8CA1] block">Promotion or secondary income</span>
              </div>

              <div className="p-3 bg-[#FAF9FD] border border-[#ECE8F5] rounded-2xl space-y-1.5">
                <label className="text-[#2D2D3A] font-semibold block">New Monthly EMI (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={newEmi || ''}
                  onChange={(e) => setNewEmi(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="e.g. 8500"
                  className="w-full bg-white border border-[#ECE8F5] rounded-xl px-3 py-2 text-[#2D2D3A] font-mono text-xs focus:outline-none focus:border-[#C8BEE8]"
                />
                <span className="text-[10px] text-[#8C8CA1] block">New car or personal loan</span>
              </div>

              <div className="p-3 bg-[#FAF9FD] border border-[#ECE8F5] rounded-2xl space-y-1.5">
                <label className="text-[#2D2D3A] font-semibold block">Monthly SIP Delta (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={sipDelta || ''}
                  onChange={(e) => setSipDelta(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="e.g. 5000"
                  className="w-full bg-white border border-[#ECE8F5] rounded-xl px-3 py-2 text-[#2D2D3A] font-mono text-xs focus:outline-none focus:border-[#C8BEE8]"
                />
                <span className="text-[10px] text-[#8C8CA1] block">Mutual fund investment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Before / After Comparison Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(45,45,58,0.04)] border border-[#ECE8F5] border-t-4 border-t-[#B5E5CF] space-y-5">
            <div className="flex items-center justify-between border-b border-[#F4F1FA] pb-3">
              <h2 className="text-base font-bold text-[#2D2D3A]">Before vs After Comparison</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#DFF3E8] text-[#2E7D5B] font-bold">
                Projected Impact
              </span>
            </div>

            {/* Savings Rate Progression */}
            <div className="p-4 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#6B6B7B]">Savings Rate Impact</span>
                <span className="font-mono text-[#2D2D3A]">
                  {result.baseline.savingsRate}% →{' '}
                  <span className="text-[#48A97C] font-bold text-sm">
                    {result.projected.savingsRate}%
                  </span>{' '}
                  ({result.delta.savingsRateDelta >= 0 ? '+' : ''}{result.delta.savingsRateDelta}%)
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#ECE8F5]">
                <div
                  className="h-full bg-[#B5E5CF] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (result.projected.savingsRate / 50) * 100)}%` }}
                />
              </div>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#FAF9FD] rounded-xl border border-[#ECE8F5]">
                <span className="text-[#8C8CA1] block text-[10px]">Monthly Outflow</span>
                <div className="text-[#8C8CA1] line-through mt-0.5">
                  ₹{result.baseline.monthlyExpense.toLocaleString()}
                </div>
                <div className="text-[#2D2D3A] font-bold text-sm">
                  ₹{result.projected.monthlyExpense.toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-[#FAF9FD] rounded-xl border border-[#ECE8F5]">
                <span className="text-[#8C8CA1] block text-[10px]">Monthly Surplus</span>
                <div className="text-[#8C8CA1] line-through mt-0.5">
                  ₹{result.baseline.monthlySavings.toLocaleString()}
                </div>
                <div className="text-[#48A97C] font-bold text-sm">
                  ₹{result.projected.monthlySavings.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Annual Capital Surplus Highlight */}
            <div className="p-5 bg-gradient-to-br from-[#DFF3E8]/70 to-[#FAF9FD] rounded-2xl border border-[#B5E5CF] space-y-1">
              <span className="text-xs font-bold text-[#2E7D5B] uppercase tracking-wider block">
                1-Year Additional Surplus
              </span>
              <div className="text-2xl font-black text-[#2D2D3A] font-mono">
                {result.delta.annualSurplusChange >= 0 ? '+' : ''}₹
                {result.delta.annualSurplusChange.toLocaleString()}
                <span className="text-xs text-[#6B6B7B] font-normal ml-1">/year</span>
              </div>
              <p className="text-[11px] text-[#6B6B7B] leading-relaxed pt-1">
                Frees up ₹{Math.abs(result.delta.monthlySavingsDelta).toLocaleString()}/month in liquid capital without touching your essential commitments.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() =>
                  onNavigateToChat(
                    `I simulated saving ₹${result.delta.monthlySavingsDelta.toLocaleString()} extra monthly. How should I allocate this between emergency fund and mutual fund SIPs?`
                  )
                }
                className="w-full py-2.5 px-4 bg-[#E8E4F3] hover:bg-[#DDD7EE] text-[#2D2D3A] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7E69AB]" />
                <span>Ask Advisor How to Deploy ₹{result.delta.monthlySavingsDelta.toLocaleString()}</span>
              </button>

              <button
                onClick={onNavigateToGoals}
                className="w-full py-2.5 px-4 bg-[#FAF9FD] hover:bg-[#F4F1FA] text-[#2D2D3A] rounded-xl text-xs font-semibold transition-all border border-[#ECE8F5] flex items-center justify-center space-x-1.5"
              >
                <span>Check Impact on Financial Goals</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2D2D3A]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
