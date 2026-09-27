import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AnalyticsSummary, FeasibilityTier, GoalPlan } from '../types';
import { GoalPlannerEngine } from '../services/simulation/goalPlanner';

interface GoalsViewProps {
  summary: AnalyticsSummary;
  onNavigateToChat: (prompt: string) => void;
  onNavigateToSimulator: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  summary,
  onNavigateToChat,
  onNavigateToSimulator,
}) => {
  const [goals, setGoals] = useState<GoalPlan[]>([
    GoalPlannerEngine.plan(summary, {
      id: 'g-1',
      title: '6-Month Emergency Buffer Fund',
      targetAmount: Math.round(summary.avgMonthlyExpense * 6),
      targetMonths: 12,
      currentSaved: Math.round(summary.avgMonthlyExpense * 2),
    }),
    GoalPlannerEngine.plan(summary, {
      id: 'g-2',
      title: 'Electric Vehicle Down-Payment',
      targetAmount: 300000,
      targetMonths: 10,
      currentSaved: 60000,
    }),
  ]);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [targetMonths, setTargetMonths] = useState<number | ''>(12);
  const [currentSaved, setCurrentSaved] = useState<number | ''>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Active feasibility preview for newly created/edited goal
  const [feasibilityResult, setFeasibilityResult] = useState<GoalPlan | null>(null);

  const handleCalculateFeasibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !targetMonths) return;

    const plan = GoalPlannerEngine.plan(summary, {
      title,
      targetAmount: Number(targetAmount),
      targetMonths: Number(targetMonths),
      currentSaved: Number(currentSaved) || 0,
    });

    setFeasibilityResult(plan);
  };

  const handleSaveGoal = () => {
    if (!feasibilityResult) return;
    setGoals((prev) => [feasibilityResult, ...prev]);
    setTitle('');
    setTargetAmount('');
    setTargetMonths(12);
    setCurrentSaved('');
    setFeasibilityResult(null);
    setShowAddForm(false);
  };

  const getTierBadge = (tier: FeasibilityTier) => {
    switch (tier) {
      case 'FEASIBLE':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DFF3E8] text-[#2E7D5B] border border-[#B5E5CF]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Feasible Goal</span>
          </span>
        );
      case 'CHALLENGING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDEBDD] text-[#D97706] border border-[#F9D3B4]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Challenging / Tight</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDE8E7] text-[#DC2626] border border-[#F4B6B0]">
            <XCircle className="w-3.5 h-3.5" />
            <span>Difficult / Deficit</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#DFF3E8] text-[#2D2D3A] flex items-center justify-center font-bold text-xs">
              <Target className="w-4 h-4 text-[#48A97C]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D2D3A]">
              Goal Planner
            </h1>
          </div>
          <p className="text-xs text-[#6B6B7B] max-w-xl">
            Track feasibility and target timelines based on your current monthly surplus of ₹{summary.avgMonthlySavings.toLocaleString()}/mo.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFeasibilityResult(null);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#E8E4F3] hover:bg-[#DDD7EE] text-[#2D2D3A] rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#7E69AB]" />
          <span>{showAddForm ? 'Hide Form' : 'New Financial Goal'}</span>
        </button>
      </div>

      {/* Goal Creation Form & Feasibility Result Card */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-5">
          <div className="border-b border-[#F4F1FA] pb-3">
            <h2 className="text-sm font-bold text-[#2D2D3A]">Define Financial Target</h2>
            <p className="text-xs text-[#6B6B7B]">Input target amount, current savings, and desired months</p>
          </div>

          <form onSubmit={handleCalculateFeasibility} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#2D2D3A]">Goal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vacation to Japan"
                className="w-full bg-[#FAF9FD] border border-[#ECE8F5] rounded-xl px-3.5 py-2.5 text-[#2D2D3A] focus:outline-none focus:border-[#C8BEE8] focus:bg-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#2D2D3A]">Target Amount (₹)</label>
              <input
                type="number"
                required
                min="5000"
                step="5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(parseInt(e.target.value, 10) || '')}
                placeholder="e.g. 250000"
                className="w-full bg-[#FAF9FD] border border-[#ECE8F5] rounded-xl px-3.5 py-2.5 text-[#2D2D3A] font-mono focus:outline-none focus:border-[#C8BEE8] focus:bg-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#2D2D3A]">Timeline (Months)</label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={targetMonths}
                onChange={(e) => setTargetMonths(parseInt(e.target.value, 10) || '')}
                placeholder="e.g. 12"
                className="w-full bg-[#FAF9FD] border border-[#ECE8F5] rounded-xl px-3.5 py-2.5 text-[#2D2D3A] font-mono focus:outline-none focus:border-[#C8BEE8] focus:bg-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#2D2D3A]">Current Savings Allocated (₹)</label>
              <input
                type="number"
                min="0"
                step="5000"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(parseInt(e.target.value, 10) || '')}
                placeholder="e.g. 30000"
                className="w-full bg-[#FAF9FD] border border-[#ECE8F5] rounded-xl px-3.5 py-2.5 text-[#2D2D3A] font-mono focus:outline-none focus:border-[#C8BEE8] focus:bg-white text-xs"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6B6B7B] hover:text-[#2D2D3A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#E8E4F3] hover:bg-[#DDD7EE] text-[#2D2D3A] rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Evaluate Feasibility
              </button>
            </div>
          </form>

          {/* Feasibility Result Card */}
          {feasibilityResult && (
            <div className="p-5 rounded-2xl bg-[#FAF9FD] border border-[#ECE8F5] space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#ECE8F5] pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#2D2D3A]">Feasibility Evaluation Result</span>
                  <p className="text-[11px] text-[#6B6B7B]">
                    Requires saving ₹{feasibilityResult.requiredMonthlySavings.toLocaleString()}/mo over {feasibilityResult.targetMonths} months
                  </p>
                </div>
                {getTierBadge(feasibilityResult.feasibilityTier)}
              </div>

              <p className="text-xs text-[#2D2D3A] leading-relaxed">
                {feasibilityResult.feasibilityRationale}
              </p>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  className="px-4 py-2 bg-[#DFF3E8] hover:bg-[#D0ECDD] text-[#2D2D3A] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48A97C]" />
                  <span>Add to Active Goals List</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List of Existing Goals with Progress Bars */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progressPercent = Math.min(
            100,
            Math.round((goal.currentSaved / goal.targetAmount) * 100)
          );

          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F4F1FA] pb-3">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#2D2D3A]">{goal.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-[#6B6B7B] font-mono">
                    <span>Target: ₹{goal.targetAmount.toLocaleString()}</span>
                    <span>·</span>
                    <span>Timeline: {goal.targetMonths} mos</span>
                    <span>·</span>
                    <span>Saved: ₹{goal.currentSaved.toLocaleString()} ({progressPercent}%)</span>
                  </div>
                </div>

                <div>{getTierBadge(goal.feasibilityTier)}</div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8C8CA1]">Capital Progress</span>
                  <span className="font-bold text-[#2D2D3A]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#FAF9FD] rounded-full h-2.5 overflow-hidden border border-[#ECE8F5]">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-[#B5E5CF]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Key Metric Triplets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#FAF9FD] rounded-xl border border-[#ECE8F5]">
                  <span className="text-[11px] text-[#8C8CA1] block">Required Monthly Outflow</span>
                  <span className="text-sm font-bold text-[#2D2D3A]">
                    ₹{goal.requiredMonthlySavings.toLocaleString()}/mo
                  </span>
                </div>
                <div className="p-3 bg-[#FAF9FD] rounded-xl border border-[#ECE8F5]">
                  <span className="text-[11px] text-[#8C8CA1] block">Your Verified Cash Surplus</span>
                  <span className="text-sm font-bold text-[#48A97C]">
                    ₹{goal.currentAvgMonthlySavings.toLocaleString()}/mo
                  </span>
                </div>
                <div className="p-3 bg-[#FAF9FD] rounded-xl border border-[#ECE8F5]">
                  <span className="text-[11px] text-[#8C8CA1] block">Surplus Buffer Utilization</span>
                  <span className="text-sm font-bold text-[#2D2D3A]">
                    {Math.round(goal.savingsBufferRatio * 100)}%
                  </span>
                </div>
              </div>

              {/* Rationale & Remediation */}
              <div className="p-3.5 bg-[#FAF9FD] rounded-2xl border border-[#ECE8F5] text-xs text-[#6B6B7B] space-y-1.5">
                <p className="leading-relaxed text-[#2D2D3A]">{goal.feasibilityRationale}</p>
                {goal.suggestedSpendCut && (
                  <div className="flex items-center space-x-2 text-[11px] text-[#D97706]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Remediation: Cutting {goal.suggestedSpendCut.category} by {goal.suggestedSpendCut.cutPercentage}% frees up ₹{goal.suggestedSpendCut.monthlyRelief.toLocaleString()}/mo to maintain a safe buffer.
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-1 text-xs">
                <button
                  onClick={onNavigateToSimulator}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FAF9FD] hover:bg-[#F4F1FA] text-[#2D2D3A] font-semibold border border-[#ECE8F5] transition-colors"
                >
                  Adjust In Simulator
                </button>
                <button
                  onClick={() =>
                    onNavigateToChat(
                      `How can I realistically achieve my goal "${goal.title}" requiring ₹${goal.requiredMonthlySavings.toLocaleString()}/mo with my verified surplus?`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-[#E8E4F3] hover:bg-[#DDD7EE] text-[#2D2D3A] font-bold transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7E69AB]" />
                  <span>RAG Action Plan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
