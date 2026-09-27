import {
  AnalyticsSummary,
  QueryClass,
  RetrievedEvidence,
  SourceConflict,
  UserFinancialProfile,
} from '../../types';
import { chatApi } from '../../api';

export interface GenerationRequest {
  query: string;
  queryClass: QueryClass;
  analytics: AnalyticsSummary;
  evidence: RetrievedEvidence[];
  conflict?: SourceConflict;
  explanationLevel?: 'beginner' | 'advanced';
  userProfile?: UserFinancialProfile;
}

export interface GenerationResponse {
  answer: string;
  modelUsed: string;
  evidenceUsed: RetrievedEvidence[];
  confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW';
  rerankScore: number;
}

export class GroqGenerationService {
  public static async generateExplanation(req: GenerationRequest): Promise<GenerationResponse> {
    const { query, queryClass, analytics, evidence, conflict, explanationLevel = 'beginner', userProfile } = req;

    const topEvidence = evidence[0];
    const confidenceLabel = topEvidence ? topEvidence.confidenceLabel : 'LOW';
    const rerankScore = topEvidence ? topEvidence.rerankScore : 0.4;

    // Handle out of scope immediately
    if (queryClass === 'out_of_scope') {
      return {
        answer:
          '**Topic Outside Financial Scope**\n\nFinWise operates strictly within verified personal finance, cash flow analytics, and established regulatory financial planning frameworks. Your question appears to be outside this domain.\n\nWe provide verified guidance on:\n- Cash flow and statement analytics\n- What-if expense simulations and goal feasibility\n- Debt elimination strategies (Avalanche and Snowball methods)\n- Tax regimes and deductions (Section 80C, 80D, 80CCD, Old vs New Regime)\n- Emergency fund planning and prudent asset allocation.',
        modelUsed: 'FinWise-Guardrail',
        evidenceUsed: [],
        confidenceLabel: 'HIGH',
        rerankScore: 1.0,
      };
    }

    // Prepare context
    const contextPrompt = this.buildContextPrompt({
      query,
      queryClass,
      analytics,
      evidence,
      conflict,
      explanationLevel,
      userProfile,
    });

    // Try backend AI service proxy
    try {
      const data = await chatApi.sendMessage({
        prompt: contextPrompt,
        queryClass,
        explanationLevel,
      });

      if (data && data.answer) {
        return {
          answer: data.answer,
          modelUsed: data.model || 'Google Gemini 3.8 Flash',
          evidenceUsed: evidence,
          confidenceLabel,
          rerankScore,
        };
      }
    } catch {
      // Backend may be in offline mode; continue to deterministic synthesizer fallback
    }

    // High-fidelity deterministic synthesis engine (ensures 100% uptime and exact numbers)
    const synthesizedAnswer = this.deterministicSynthesis({
      query,
      queryClass,
      analytics,
      evidence,
      conflict,
      explanationLevel,
      userProfile,
    });

    return {
      answer: synthesizedAnswer,
      modelUsed: 'FinWise Grounded Engine (Groq-Compatible)',
      evidenceUsed: evidence,
      confidenceLabel,
      rerankScore,
    };
  }

  private static buildContextPrompt(params: {
    query: string;
    queryClass: QueryClass;
    analytics: AnalyticsSummary;
    evidence: RetrievedEvidence[];
    conflict?: SourceConflict;
    explanationLevel: 'beginner' | 'advanced';
    userProfile?: UserFinancialProfile;
  }): string {
    const { query, queryClass, analytics, evidence, conflict, explanationLevel, userProfile } = params;

    const evidenceText = evidence
      .map(
        (e, i) =>
          `[Source ${i + 1}: ${e.chunk.source} | ${e.chunk.section}]\nTitle: ${e.chunk.title}\nKey Takeaway: ${e.chunk.keyTakeaway}\nExcerpt: ${e.chunk.content}`
      )
      .join('\n\n');

    const topCategories = analytics.categoryBreakdown
      .slice(0, 5)
      .map((c) => `- ${c.category}: ₹${c.amount.toLocaleString()} (${c.percentage}% of expenses)`)
      .join('\n');

    const recurringText = analytics.recurringExpenses
      .slice(0, 4)
      .map((r) => `- ${r.merchant} (${r.classification === 'FIXED_SUBSCRIPTION' ? 'Fixed Subscription' : 'Variable Recurring'}): avg ₹${r.averageAmount.toLocaleString()}/mo, total ₹${r.totalSpent.toLocaleString()}`)
      .join('\n');

    return `SYSTEM GOVERNING PRINCIPLE:
You are the FinWise Financial Advisor.
1. NEVER perform arithmetic or invent a number. Every number you state MUST come from the PRE-COMPUTED DETERMINISTIC CONTEXT below.
2. NEVER recommend individual stocks, crypto, or speculative trading.
3. Every financial claim must cite the corresponding source doc.
4. Explanation Level: ${explanationLevel.toUpperCase()} (${explanationLevel === 'beginner' ? 'Clear, jargon-free analogies and straightforward takeaways' : 'Precise financial metrics, ratios, statutory sections, and operational mechanics'}).

FORMATTING RULES:
- STRICTLY DO NOT USE EMOJIS. Maintain a professional, clean financial advisory tone.
- Start with a direct, informative 1-2 sentence paragraph answering the user's question.
- Use clear bullet points (- item) to break down all numbers, categories, steps, or trade-offs.
- Use bolding (**bold**) for key metrics, amounts, category names, and core principles.
- End with a concise actionable takeaway paragraph.

=== PRE-COMPUTED USER FINANCIAL METRICS (DETERMINISTIC) ===
- Total Income: ₹${analytics.totalIncome.toLocaleString()}
- Total Expenses: ₹${analytics.totalExpenses.toLocaleString()}
- Net Savings: ₹${analytics.netSavings.toLocaleString()} (Savings Rate: ${analytics.savingsRate}%)
- Avg Monthly Income: ₹${analytics.avgMonthlyIncome.toLocaleString()}
- Avg Monthly Expense: ₹${analytics.avgMonthlyExpense.toLocaleString()}
- Avg Monthly Savings: ₹${analytics.avgMonthlySavings.toLocaleString()}
- Essential Spend: ₹${analytics.essentialSpend.toLocaleString()} (${analytics.essentialRatio}%)
- Discretionary Spend: ₹${analytics.discretionarySpend.toLocaleString()} (${analytics.discretionaryRatio}%)
Top Expense Categories:
${topCategories}
Recurring Outflows Detected:
${recurringText}

${userProfile ? `User Profile: Income ₹${userProfile.monthlyIncome}, EMIs ₹${userProfile.existingEmis}, Sips ₹${userProfile.existingSips}, Risk: ${userProfile.riskTolerance}` : ''}

=== RETRIEVED KNOWLEDGE EVIDENCE (HYBRID RAG) ===
${evidenceText}

${conflict?.detected ? `STRATEGIC CONFLICT DETECTED:
Topic: ${conflict.topic}
Source A: ${conflict.sourceA.title} -> ${conflict.sourceA.viewpoint}
Source B: ${conflict.sourceB.title} -> ${conflict.sourceB.viewpoint}
Resolution: ${conflict.nuanceExplanation}` : ''}

USER QUERY: "${query}"
QUERY CLASS: ${queryClass}

Provide a well-structured response following the formatting rules.`;
  }

  /**
   * Deterministic synthesis engine:
   * Formats exact calculated metrics and retrieved knowledge into clean, professional paragraphs and bullet points without emojis.
   */
  private static deterministicSynthesis(params: {
    query: string;
    queryClass: QueryClass;
    analytics: AnalyticsSummary;
    evidence: RetrievedEvidence[];
    conflict?: SourceConflict;
    explanationLevel: 'beginner' | 'advanced';
    userProfile?: UserFinancialProfile;
  }): string {
    const { query, queryClass, analytics, evidence, conflict, explanationLevel } = params;
    const isBeginner = explanationLevel === 'beginner';

    if (queryClass === 'analytics') {
      const topCat = analytics.categoryBreakdown[0];
      const secondCat = analytics.categoryBreakdown[1];

      return `### Financial Summary & Breakdown

Based on your verified bank statement spanning **${analytics.transactionCount} transactions** from **${analytics.dateRange.start}** to **${analytics.dateRange.end}**, here is an overview of your monthly cash flow:

- **Average Monthly Income:** ₹${analytics.avgMonthlyIncome.toLocaleString()}
- **Average Monthly Outflow:** ₹${analytics.avgMonthlyExpense.toLocaleString()}
- **Net Monthly Savings:** ₹${analytics.avgMonthlySavings.toLocaleString()} (reflecting a **${analytics.savingsRate}%** savings rate)

#### Spend Composition

- **Essential Commitments:** ₹${analytics.essentialSpend.toLocaleString()} (**${analytics.essentialRatio}%** of total expenses), covering non-negotiable living costs.
- **Discretionary Spending:** ₹${analytics.discretionarySpend.toLocaleString()} (**${analytics.discretionaryRatio}%** of total expenses), representing flexible lifestyle choices.

#### Top Outflow Categories

1. **${topCat?.category || 'Housing & Rent'}**: ₹${topCat?.amount.toLocaleString()} (**${topCat?.percentage}%** of total outflows)
2. **${secondCat?.category || 'Groceries'}**: ₹${secondCat?.amount.toLocaleString()} (**${secondCat?.percentage}%** of total outflows)

${
  analytics.recurringExpenses.length > 0
    ? `#### Detected Recurring Outflows

${analytics.recurringExpenses
  .slice(0, 3)
  .map(
    (r) =>
      `- **${r.merchant}** (${r.classification === 'FIXED_SUBSCRIPTION' ? 'Fixed Subscription' : 'Variable Outflow'}): Averaging **₹${r.averageAmount.toLocaleString()}/mo** over ${r.distinctMonthsCount} statement cycles.`
  )
  .join('\n')}`
    : ''
}

#### Key Takeaway

${
  isBeginner
    ? `Under the standard **50/30/20 guideline**, essential expenses should ideally remain within 50% and discretionary wants under 30%. Your current allocation stands at **${analytics.essentialRatio}% essential** and **${analytics.discretionaryRatio}% discretionary**, providing a solid foundation for regular monthly savings.`
    : `Your essential-to-income ratio is **${((analytics.essentialSpend / Math.max(1, analytics.totalIncome)) * 100).toFixed(1)}%**, and discretionary drag accounts for **${analytics.discretionaryRatio}%** of total disbursements. Maintaining your current **${analytics.savingsRate}%** savings rate supports steady capital accumulation.`
}`;
    }

    if (queryClass === 'decision') {
      const topDoc = evidence[0]?.chunk;
      return `### Trade-Off & Decision Analysis

${
  conflict?.detected
    ? `> **Strategic Consideration: ${conflict.topic}**\n>\n> - **Approach 1 (${conflict.sourceA.title}):** ${conflict.sourceA.viewpoint}\n> - **Approach 2 (${conflict.sourceB.title}):** ${conflict.sourceB.viewpoint}\n>\n> **Prudent Resolution:** ${conflict.nuanceExplanation}`
    : 'When weighing financial options such as debt repayment versus systematic investing, priority is governed by the interest cost of liabilities relative to post-tax investment yields.'
}

#### Cash Flow Context

- **Monthly Surplus:** **₹${analytics.avgMonthlySavings.toLocaleString()}/mo** available for allocation.
- **Discretionary Cushion:** **₹${analytics.discretionarySpend.toLocaleString()}** (**${analytics.discretionaryRatio}%** of monthly expenses).

#### Regulatory & Analytical Guidance

${
  topDoc
    ? `According to **${topDoc.source}** (${topDoc.section}):\n\n- **Core Principle:** ${topDoc.keyTakeaway}\n- **Details:** ${topDoc.content}`
    : '- Financial planning doctrine mandates eliminating high-interest liabilities (>10% APR like credit cards and personal loans) before allocating capital toward equity investments.'
}

#### Recommendation

${
  isBeginner
    ? `Prioritize maintaining an emergency reserve of **3 to 6 months of living expenses** (approximately **₹${(analytics.avgMonthlyExpense * 3).toLocaleString()}**) in a liquid account before taking market risks.`
    : `Maintain your Fixed Obligation to Income Ratio (FOIR) comfortably below **40% to 50%** to preserve borrowing capacity and financial flexibility.`
}`;
    }

    // Default Knowledge response
    const topDoc = evidence[0]?.chunk;
    const secondDoc = evidence[1]?.chunk;

    if (!topDoc) {
      return `### Financial Guidance

According to standard financial planning principles, maintaining a healthy savings rate above **20%** and preserving an emergency reserve of **3 to 6 months of essential living expenses** (approximately **₹${(analytics.avgMonthlyExpense * 3).toLocaleString()}** at your current spend level) forms the bedrock of personal financial security.`;
    }

    return `### ${topDoc.title}

*Source: ${topDoc.source} | ${topDoc.section}*

${topDoc.content}

#### Core Principle

> **${topDoc.keyTakeaway}**

${
  secondDoc
    ? `#### Additional Context: ${secondDoc.title}

*Source: ${secondDoc.source}*

${secondDoc.keyTakeaway}`
    : ''
}

#### Applied to Your Financial Metrics

- **Average Monthly Outflow:** **₹${analytics.avgMonthlyExpense.toLocaleString()}**
- **Recommended 3-Month Emergency Reserve:** **₹${Math.round(analytics.avgMonthlyExpense * 3).toLocaleString()}**
- **Current Verified Savings Rate:** **${analytics.savingsRate}%**`;
  }
}
