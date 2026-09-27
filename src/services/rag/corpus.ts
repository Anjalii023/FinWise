import { KnowledgeChunk } from '../../types';

export const FINANCIAL_CORPUS: KnowledgeChunk[] = [
  // Budgeting & Emergency Fund
  {
    id: 'kb-budget-01',
    title: 'The 50/30/20 Budgeting Rule',
    domain: 'Budgeting & Emergency Fund',
    source: 'RBI Financial Education & Standard Planning Frameworks',
    section: 'Cash Flow Management, §2.1',
    content:
      'The 50/30/20 rule divides net take-home income into three distinct buckets: 50% for Essential Needs (housing rent/EMI, groceries, utilities, basic insurance, mandatory loan payments), 30% for Discretionary Wants (dining out, streaming subscriptions, leisure travel, non-essential gadgets), and 20% for Savings and Debt Reduction (SIP investments, emergency fund contributions, retirement accounts). When essential expenses exceed 50%, discretionary spending must be trimmed rather than raiding the savings bucket.',
    keyTakeaway: 'Allocate 50% to needs, 30% to wants, 20% to savings. Never sacrifice savings for discretionary lifestyle creep.',
    tags: ['50/30/20', 'budgeting', 'savings rate', 'discretionary', 'essential'],
  },
  {
    id: 'kb-budget-02',
    title: 'Emergency Fund Sizing & Placement',
    domain: 'Budgeting & Emergency Fund',
    source: 'CFP Board Financial Standards & RBI Advisory',
    section: 'Liquidity Guidelines, §1.4',
    content:
      'An emergency fund must cover 3 to 6 months of pure essential living expenses (rent, groceries, utilities, EMIs). For salaried employees with dual-income households, 3-4 months is sufficient; for single earners, freelancers, or volatile sectors, 6-9 months is recommended. The capital must be parked in high-liquidity, capital-preserving instruments: a split between a dedicated high-yield savings account (instant access) and sweep-in Fixed Deposits or Liquid Mutual Funds (T+1 redemption). It should never be exposed to equities or long lock-in products.',
    keyTakeaway: 'Maintain 3-6 months of essential living expenses strictly in liquid instruments (Savings A/C, Liquid Funds, Sweep FDs).',
    tags: ['emergency fund', 'liquidity', 'runway', 'safety net', 'liquid funds'],
  },
  {
    id: 'kb-budget-03',
    title: 'Zero-Based Budgeting and Cash Leakage Detection',
    domain: 'Budgeting & Emergency Fund',
    source: 'Behavioral Finance Research Institute',
    section: 'Discretionary Tracking, §3.2',
    content:
      'Zero-based budgeting assigns every single rupee of monthly net income to a specific job before the month begins. Small recurring transactions—such as micro food delivery surcharges, digital app subscriptions, and frequent cab rides—exhibit the highest aggregate cash leakage over time due to low salience. Auditing expenses with a coefficient-of-variation filter separates predictable fixed overhead from volatile impulse consumption.',
    keyTakeaway: 'Assign every rupee a purpose upfront to plug micro-subscription leakages and delivery surcharges.',
    tags: ['zero based', 'cash leakage', 'micro transactions', 'subscriptions'],
  },

  // Credit & Debt Management
  {
    id: 'kb-credit-01',
    title: 'Debt Avalanche vs. Debt Snowball Strategies',
    domain: 'Credit & Debt Management',
    source: 'Journal of Financial Planning & Debt Advisory Council',
    section: 'Liability Liquidation, §4.3',
    content:
      'Two mathematical and behavioral approaches exist for eliminating multiple debts. The Debt Avalanche method targets debts in descending order of annual interest rate (e.g. paying credit cards at 42% first, then personal loans at 14%, then education loans at 9%). This minimizes total lifetime interest paid and accelerates debt freedom. The Debt Snowball method targets the smallest balance first regardless of interest rate to secure quick psychological wins. Mathematically, Avalanche is superior; behaviorally, Snowball aids those needing momentum.',
    keyTakeaway: 'Debt Avalanche saves the most money by targeting high-interest debt first. Snowball pays smallest balance for psychological wins.',
    tags: ['debt avalanche', 'debt snowball', 'credit cards', 'loan payoff', 'interest rate'],
  },
  {
    id: 'kb-credit-02',
    title: 'Credit Card Minimum Due Trap & Compound APR',
    domain: 'Credit & Debt Management',
    source: 'RBI Master Directions on Credit Card Operations 2022',
    section: 'Cardholder Protection, §6.1',
    content:
      'Paying only the "Minimum Amount Due" (typically 5% of outstanding balance) does not prevent exorbitant finance charges. Credit card interest compounds daily at 3.0% to 3.75% per month (effective APR of 42% to 52% per annum). Crucially, revolving a balance revokes the interest-free grace period on ALL subsequent transactions from the date of purchase. Cardholders should always pay the "Total Amount Due" in full prior to the due date.',
    keyTakeaway: 'Never pay only the minimum due; revolving credit card balances triggers 42%+ APR and forfeits interest-free periods.',
    tags: ['credit card', 'minimum due', 'APR', 'finance charges', 'revolving credit'],
  },
  {
    id: 'kb-credit-03',
    title: 'Credit Utilization Ratio and CIBIL Score Impact',
    domain: 'Credit & Debt Management',
    source: 'TransUnion CIBIL Scoring Standards',
    section: 'Credit Score Mechanics, §5.2',
    content:
      'Credit Utilization Ratio (CUR) is the proportion of total sanctioned revolving credit used in a billing cycle. To maximize your CIBIL score (aiming for 750+), CUR should consistently stay below 30% of your total credit limit. Exceeding 50% CUR signals credit hunger and negatively impacts your score even if paid in full before the due date, because issuers report the statement balance to credit bureaus on the statement generation date.',
    keyTakeaway: 'Keep credit card utilization below 30% to protect and boost your CIBIL credit score.',
    tags: ['cibil', 'credit score', 'credit utilization', 'limit', 'credit bureau'],
  },

  // Tax-Advantaged Instruments
  {
    id: 'kb-tax-01',
    title: 'Section 80C Deductions: ELSS vs PPF vs Fixed Deposits',
    domain: 'Tax-Advantaged Instruments',
    source: 'Income Tax Department of India & AMFI',
    section: 'Chapter VI-A Deductions, §80C',
    content:
      'Under the Old Tax Regime, Section 80C provides tax deductions up to ₹1,50,000 per financial year across approved instruments. Equity Linked Savings Schemes (ELSS) carry the shortest mandatory lock-in period (3 years) and offer long-term equity growth potential (taxed at 12.5% LTCG above ₹1.25L). Public Provident Fund (PPF) offers sovereign-backed guaranteed tax-free returns with an EEE (Exempt-Exempt-Exempt) status but has a 15-year tenure. 5-year Tax Saving FDs offer fixed interest that is fully taxable at your income slab.',
    keyTakeaway: 'ELSS has the shortest 3-year lock-in with equity upside; PPF offers 15-year risk-free EEE tax exemption.',
    tags: ['80C', 'ELSS', 'PPF', 'tax saving', 'old tax regime', 'fixed deposit'],
  },
  {
    id: 'kb-tax-02',
    title: 'National Pension System (NPS) & Additional ₹50,000 Deduction',
    domain: 'Tax-Advantaged Instruments',
    source: 'PFRDA Act & Income Tax Provisions',
    section: 'Retirement Tax Planning, §80CCD(1B)',
    content:
      'Section 80CCD(1B) provides an exclusive additional tax deduction of up to ₹50,000 for voluntary contributions to NPS Tier-1 accounts, over and above the ₹1,50,000 limit under Section 80C. Under the 30% tax slab, this delivers direct tax savings of ₹15,600 annually. At maturity (age 60), 60% of the accumulated corpus can be withdrawn tax-free as a lump sum, while the remaining 40% must be converted into a taxable monthly pension annuity.',
    keyTakeaway: 'NPS Section 80CCD(1B) provides ₹50,000 extra tax deduction over 80C, saving ₹15,600/yr for 30% slab payers.',
    tags: ['NPS', '80CCD', 'pension', 'tax saving', 'retirement'],
  },
  {
    id: 'kb-tax-03',
    title: 'Section 80D: Health Insurance Tax Deductions',
    domain: 'Tax-Advantaged Instruments',
    source: 'Income Tax Act 1961, Section 80D',
    section: 'Health Insurance Relief, §80D',
    content:
      'Section 80D allows tax deductions for health insurance premiums paid for self, spouse, dependent children, and parents. An individual can claim up to ₹25,000 for self/family (₹50,000 if senior citizen). An additional deduction of up to ₹25,000 is available for parents under 60, or up to ₹50,000 if parents are senior citizens (60+). Up to ₹5,000 within the overall cap can be claimed for preventive health check-ups.',
    keyTakeaway: 'Claim up to ₹25,000 for family health insurance + ₹50,000 for senior citizen parents under Section 80D.',
    tags: ['80D', 'health insurance', 'mediclaim', 'tax deduction', 'preventive health'],
  },
  {
    id: 'kb-tax-04',
    title: 'New Tax Regime vs. Old Tax Regime Decision Matrix',
    domain: 'Tax-Advantaged Instruments',
    source: 'Union Budget Finance Act (Section 115BAC)',
    section: 'Individual Taxation Framework',
    content:
      'The New Tax Regime offers lower concessional slab rates and an increased standard deduction (₹75,000) and rebate up to ₹7,75,000, but eliminates most Chapter VI-A deductions (80C, 80D, HRA, home loan interest on self-occupied property). The breakeven threshold is typically around ₹3.75 Lakhs in total deductions. If total eligible deductions (HRA + 80C + 80D + Home Loan Interest) exceed ₹3.75L - ₹4L, the Old Regime usually saves more tax; otherwise, the New Regime is superior.',
    keyTakeaway: 'If eligible deductions exceed ₹3.75L - ₹4L, Old Regime is usually better; otherwise New Regime offers lower tax without lock-ins.',
    tags: ['new tax regime', 'old tax regime', '80C', 'HRA', 'tax comparison'],
  },

  // Loans & Mortgages
  {
    id: 'kb-loan-01',
    title: 'Fixed vs. Floating Rate Loans and Prepayment Penalties',
    domain: 'Loans & Mortgages',
    source: 'Reserve Bank of India Master Directions on Lending',
    section: 'Consumer Lending Norms, §3.8',
    content:
      'Under RBI guidelines, banks and housing finance companies (HFCs) are strictly prohibited from levying foreclosure charges or prepayment penalties on floating-rate home loans and term loans sanctioned to individual borrowers. In contrast, fixed-rate loans often carry prepayment penalties (typically 2-3% + GST) unless funded from the borrower’s own verified sources. In India, floating-rate loans benchmarked to the external repo rate (EBLR) allow borrowers to aggressively prepay principal with zero penalty.',
    keyTakeaway: 'RBI prohibits prepayment penalties on floating-rate individual home loans. Prepay freely to eliminate interest.',
    tags: ['home loan', 'floating rate', 'prepayment', 'foreclosure', 'RBI norms'],
  },
  {
    id: 'kb-loan-02',
    title: 'Debt-to-Income (DTI) and Fixed Obligation to Income Ratio (FOIR)',
    domain: 'Loans & Mortgages',
    source: 'Indian Banks Association & Credit Underwriting Manuals',
    section: 'Prudent Solvency Ratios, §2.5',
    content:
      'The Fixed Obligation to Income Ratio (FOIR) measures the proportion of monthly net income committed to mandatory debts (Home Loan, Car Loan, Personal Loan EMIs, and minimum credit card dues). Financial prudence mandates that total EMIs should not exceed 40% to 50% of net monthly take-home pay. Exceeding 50% FOIR leaves inadequate buffers for medical emergencies or job disruptions and frequently leads to loan application rejection by lenders.',
    keyTakeaway: 'Total monthly loan EMIs should strictly remain below 40-50% of net income to maintain financial solvency.',
    tags: ['FOIR', 'DTI', 'debt to income', 'loan eligibility', 'EMI ratio'],
  },
  {
    id: 'kb-loan-03',
    title: 'Loan Prepayment Math: Reducing Tenure vs. Reducing EMI',
    domain: 'Loans & Mortgages',
    source: 'National Institute of Securities Markets (NISM)',
    section: 'Amortization Optimization, §7.1',
    content:
      'When making a lump-sum principal prepayment on a long-term home loan, borrowers can choose between reducing the loan tenure or reducing the monthly EMI. Choosing to reduce loan tenure produces exponentially greater lifetime interest savings because interest is calculated on the remaining outstanding principal over time. Reducing EMI provides immediate monthly cash flow relief but saves significantly less interest over the lifecycle.',
    keyTakeaway: 'Always choose tenure reduction over EMI reduction during loan prepayments to maximize interest savings.',
    tags: ['prepayment', 'tenure reduction', 'EMI reduction', 'interest savings', 'amortization'],
  },

  // Insurance & Protection
  {
    id: 'kb-ins-01',
    title: 'Pure Term Insurance vs. ULIPs and Endowment Policies',
    domain: 'Insurance & Protection',
    source: 'Insurance Regulatory and Development Authority of India (IRDAI)',
    section: 'Life Insurance Advisory Principles',
    content:
      'Never mix insurance with investment. Pure term life insurance provides high life cover (10x to 15x annual income) at low premium cost. For example, a 30-year-old can obtain ₹1 Crore term cover for approximately ₹10,000 to ₹14,000 annually. In contrast, Unit Linked Insurance Plans (ULIPs) and traditional endowment/money-back policies charge heavy mortality, fund management, and policy administration charges, delivering meager insurance cover (barely 10x premium) and historically lackluster 4-6% internal rates of return (IRR).',
    keyTakeaway: 'Buy pure term insurance for protection (10-15x income) and invest the remainder in transparent mutual funds.',
    tags: ['term insurance', 'ULIP', 'endowment', 'life cover', 'IRR'],
  },
  {
    id: 'kb-ins-02',
    title: 'Health Insurance: Base Policy vs. Super Top-Up Strategy',
    domain: 'Insurance & Protection',
    source: 'IRDAI Health Insurance Regulations',
    section: 'Comprehensive Cover Design, §4.2',
    content:
      'Relying solely on employer-provided group health insurance is risky because coverage terminates immediately upon job transitions or retirement. A robust personal health safety net combines a modest base health policy (e.g. ₹5 Lakh to ₹10 Lakh sum insured) with a high-deductible Super Top-Up policy (e.g. ₹20 Lakh to ₹50 Lakh cover with a ₹5 Lakh deductible). This dual-layer strategy delivers massive catastrophic hospitalization coverage at a fraction of the cost of a standalone high-sum base policy.',
    keyTakeaway: 'Combine a ₹5-10L base cover with a ₹25-50L Super Top-Up policy for maximum hospitalization protection at low cost.',
    tags: ['health insurance', 'super top up', 'deductible', 'hospitalization', 'mediclaim'],
  },

  // Investing Principles
  {
    id: 'kb-inv-01',
    title: 'Passive Index Investing vs. Active Mutual Funds',
    domain: 'Investing Principles',
    source: 'SPIVA India Scorecard & SEBI Advisory Guidelines',
    section: 'Asset Management Performance Studies',
    content:
      'Long-term empirical data consistently reveals that over 75% of actively managed large-cap mutual funds fail to beat their benchmark indices (Nifty 50 or BSE Sensex) over 5- to 10-year investment horizons after accounting for fund expense ratios. Low-cost passive Index Funds and Exchange Traded Funds (ETFs) replicate the underlying market index with rock-bottom total expense ratios (typically 0.1% to 0.2% vs 1.5% to 2.0% for active funds), compounding significant additional wealth over multi-decade compounding journeys.',
    keyTakeaway: 'Low-cost Nifty 50 Index Funds reliably beat most active large-cap funds over 10+ years due to microscopic expense ratios.',
    tags: ['index funds', 'passive investing', 'nifty 50', 'active funds', 'expense ratio'],
  },
  {
    id: 'kb-inv-02',
    title: 'Asset Allocation: The 100 Minus Age Rule & Rebalancing',
    domain: 'Investing Principles',
    source: 'Modern Portfolio Theory & Vanguard Research',
    section: 'Strategic Allocation Frameworks',
    content:
      'Asset allocation—the split between growth equities and stable debt instruments—determines over 90% of portfolio return volatility. A conventional rule of thumb is "100 minus age in equities" (e.g., at age 30, allocate 70% in equities and 30% in debt/fixed income). Rebalancing your portfolio annually by selling overperforming assets to buy underperforming ones systematically enforces buying low and selling high, preventing catastrophic drawdowns during market corrections.',
    keyTakeaway: 'Maintain equity/debt allocation matching your risk horizon and rebalance annually to buy low and sell high.',
    tags: ['asset allocation', 'rebalancing', 'equity debt', 'risk tolerance', 'portfolio'],
  },
  {
    id: 'kb-inv-03',
    title: 'Real vs. Nominal Returns and the Inflation Drag',
    domain: 'Investing Principles',
    source: 'Reserve Bank of India Monetary Policy Studies',
    section: 'Purchasing Power Mechanics, §1.2',
    content:
      'Nominal return is the raw interest rate earned before inflation and taxes. Real return is what truly matters: Real Return ≈ Nominal Return - Inflation Rate - Tax Drag. For instance, a Fixed Deposit offering 7% interest for an individual in the 30% tax bracket yields 4.9% post-tax. If consumer price inflation (CPI) is 5.5%, the real purchasing power return is negative (-0.6%). Portfolios lacking equity exposure steadily lose purchasing power to inflation over time.',
    keyTakeaway: 'Nominal returns do not equal wealth; after tax and 5-6% inflation, fixed deposits often produce negative real returns.',
    tags: ['real return', 'nominal return', 'inflation', 'purchasing power', 'tax drag'],
  },
  {
    id: 'kb-inv-04',
    title: 'Liquid Funds vs. Fixed Deposits for Short-Term Parking',
    domain: 'Investing Principles',
    source: 'Association of Mutual Funds in India (AMFI)',
    section: 'Short-Term Cash Instruments, §3.5',
    content:
      'For short-term horizons under 1 year, Liquid Mutual Funds invest in debt and money market securities with residual maturities of up to 91 days. Unlike bank Fixed Deposits, liquid funds have no lock-in, do not incur premature withdrawal penalty charges (after 7 days), and can be redeemed seamlessly. Both FDs and Debt/Liquid funds are taxed at the investor’s applicable marginal income tax slab.',
    keyTakeaway: 'Liquid funds offer flexible short-term parking with zero premature penalty after 7 days, ideal for emergency liquidity.',
    tags: ['liquid funds', 'fixed deposit', 'short term', 'liquidity', 'taxation'],
  },
  {
    id: 'kb-inv-05',
    title: 'Sovereign Gold Bonds (SGB) vs. Physical & Digital Gold',
    domain: 'Investing Principles',
    source: 'Reserve Bank of India SGB Operational Guidelines',
    section: 'Gold Investment Instruments',
    content:
      'Sovereign Gold Bonds (issued by RBI on behalf of the Government of India) are superior to physical jewelry or digital gold. SGBs eliminate making charges, storage locker fees, and purity risk, while paying a guaranteed 2.50% semi-annual interest per annum on the initial investment. Crucially, capital gains realized upon redemption at maturity (8 years) are 100% exempt from capital gains tax, making them the most tax-efficient gold holding vehicle.',
    keyTakeaway: 'SGBs pay 2.5% annual interest and offer 100% tax-free capital gains at maturity, outperforming physical gold.',
    tags: ['SGB', 'gold', 'sovereign gold bond', 'tax free', 'rbi'],
  },
];
