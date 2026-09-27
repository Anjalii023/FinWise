import { Request, Response } from 'express';

export class RagController {
  public static retrieve(req: Request, res: Response): void {
    const { query } = req.body;
    res.json({
      status: 'ok',
      query,
      results: [
        {
          id: 'chunk_emergency_fund_rbi',
          source: 'RBI Master Circular - Financial Literacy & Prudence',
          section: 'Section 4.2 - Liquidity Reserves',
          title: 'Emergency Reserve Guidelines',
          keyTakeaway: 'Maintain 3 to 6 months of mandatory living expenses in sovereign-backed liquid deposits before taking market risk.',
          score: 0.94,
        },
      ],
    });
  }

  public static getSources(_req: Request, res: Response): void {
    res.json({
      count: 4,
      sources: [
        {
          id: 'rbi_liquidity',
          name: 'RBI Master Directions on Liquidity Management & Reserve Requirements',
          publisher: 'Reserve Bank of India',
          scope: 'Statutory emergency buffers and capital adequacy benchmarks',
        },
        {
          id: 'it_act_1961',
          name: 'Income Tax Act 1961 (Sections 80C, 80D, 80CCD, 115BAC)',
          publisher: 'Central Board of Direct Taxes (CBDT)',
          scope: 'Tax deduction thresholds, slab differentials, and retirement exemptions',
        },
        {
          id: 'cibil_underwriting',
          name: 'TransUnion CIBIL Scoring Model & Credit Underwriting Standards',
          publisher: 'TransUnion CIBIL',
          scope: 'Credit utilization ratios (<30%) and FOIR thresholds (<40-50%)',
        },
        {
          id: 'irdai_insurance',
          name: 'IRDAI Guidelines on Protection & Term Cover Multipliers',
          publisher: 'Insurance Regulatory and Development Authority of India',
          scope: 'Life insurance cover sizing (10-15x annual income) and health cover sizing',
        },
      ],
    });
  }

  public static getConflicts(_req: Request, res: Response): void {
    res.json({
      conflicts: [
        {
          id: 'conflict_debt_vs_sip',
          topic: 'High-Interest Debt Liquidation vs. Equity SIP Compounding',
          sourceA: {
            title: 'Mathematical Net Worth Optimization (Bogleheads / CFP Standards)',
            viewpoint: 'Liquidate all debt with interest >8-10% before equity allocation.',
          },
          sourceB: {
            title: 'Psychological Momentum Doctrine (Ramsey Snowball)',
            viewpoint: 'Build a small starter fund, then pay smallest balances first.',
          },
          resolution: 'Use statutory interest cost comparison: guaranteed liability cost exceeds expected equity returns.',
        },
      ],
    });
  }
}
