import { request } from './client';

export interface SimulationParams {
  categoryReductions: Record<string, number>;
  incomeDelta?: number;
  newEmi?: number;
}

export interface SimulationResult {
  projectedIncome: number;
  projectedExpense: number;
  projectedSavings: number;
  projectedSavingsRate: number;
  annualSurplusChange: number;
}

export interface GoalParams {
  targetAmount: number;
  targetMonths: number;
  currentSaved?: number;
  monthlySurplus?: number;
}

export interface GoalResult {
  targetAmount: number;
  targetMonths: number;
  requiredMonthlySavings: number;
  currentMonthlySurplus: number;
  feasibilityTier: 'FEASIBLE' | 'CHALLENGING' | 'DIFFICULT';
  savingsBufferRatio: number;
}

export const analyticsApi = {
  async getSummary(): Promise<any> {
    return request('/summary', { method: 'GET' });
  },

  async getRecurring(): Promise<any> {
    return request('/recurring', { method: 'GET' });
  },

  async simulate(params: SimulationParams): Promise<SimulationResult> {
    return request<SimulationResult>('/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async calculateGoal(params: GoalParams): Promise<GoalResult> {
    return request<GoalResult>('/goal', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
