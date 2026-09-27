export type NavPage =
  | 'dashboard'
  | 'chat'
  | 'goals'
  | 'simulator'
  | 'insights'
  | 'upload'
  | 'demo';

export interface RouteConfig {
  id: NavPage;
  label: string;
  path: string;
  description: string;
}

export const APP_ROUTES: RouteConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Comprehensive cash flow, spending breakdown, and savings overview',
  },
  {
    id: 'chat',
    label: 'Financial Advisor',
    path: '/advisor',
    description: 'Conversational financial guidance grounded in verified statement data',
  },
  {
    id: 'goals',
    label: 'Goal Planner',
    path: '/goals',
    description: 'Target savings feasibility modeling and monthly allocation',
  },
  {
    id: 'simulator',
    label: 'What-If Simulator',
    path: '/simulator',
    description: 'Dynamic budget scenario simulation for expense cuts and raises',
  },
  {
    id: 'insights',
    label: 'Spending Insights',
    path: '/insights',
    description: 'Month-over-month variances, category trends, and recurring costs',
  },
  {
    id: 'upload',
    label: 'Upload Statement',
    path: '/upload',
    description: 'Upload bank statements (PDF, Excel, CSV) for local analysis',
  },
  {
    id: 'demo',
    label: 'Model Comparison',
    path: '/compare',
    description: 'Side-by-side verification benchmark comparing general LLMs vs. verified math',
  },
];
