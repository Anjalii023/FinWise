import { ParseResult, Transaction } from '../../types';

export interface SampleDataset {
  id: string;
  name: string;
  bank: 'HDFC' | 'SBI' | 'GENERIC_CSV';
  description: string;
  tag: string;
  data: ParseResult;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'hdfc_tech_pro',
    name: 'HDFC Tech Professional (6 Months)',
    bank: 'HDFC',
    description: 'Tech worker earning ₹1,20,000/mo. Balanced essential vs discretionary profile with monthly SIP, recurring OTT, Swiggy, and Rent.',
    tag: 'Recommended for Demo',
    data: generateHdfcTechProData(),
  },
  {
    id: 'sbi_family',
    name: 'SBI Salaried Family (6 Months)',
    bank: 'SBI',
    description: 'Senior engineer earning ₹1,65,000/mo with Home Loan EMI, school fees, family health insurance, and moderate lifestyle.',
    tag: 'High EMI & Family',
    data: generateSbiFamilyData(),
  },
  {
    id: 'lifestyle_drop',
    name: 'Lifestyle Inflation & Savings Drop (6 Months)',
    bank: 'HDFC',
    description: 'Dramatic drop in savings rate from 42% down to 14% over months 4-6 due to sudden dining, gadget shopping, and weekend trips.',
    tag: 'Ideal for Root-Cause Insight',
    data: generateLifestyleDropData(),
  },
];

function generateHdfcTechProData(): ParseResult {
  const transactions: Transaction[] = [];
  const months = ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10'];

  let idCounter = 1;

  for (const m of months) {
    // Salary credit on 1st of month
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-01`,
      rawDescription: 'NEFT CR-INFOSYS TECHNOLOGIES-MONTHLY SALARY',
      normalizedMerchant: 'Salary Credit',
      amount: 120000,
      type: 'CREDIT',
      category: 'Salary & Income',
      spendType: 'INCOME',
    });

    // Rent on 2nd of month (Fixed: 28,000)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-02`,
      rawDescription: 'UPI/NoBroker Rent Payment/HouseRent@icici',
      normalizedMerchant: 'NoBroker Rent',
      amount: 28000,
      type: 'DEBIT',
      category: 'Housing & Rent',
      spendType: 'ESSENTIAL',
    });

    // Monthly SIP to Zerodha / Mutual Fund on 5th (Fixed: 15,000)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-05`,
      rawDescription: 'ACH DR-ZERODHA BROKING LTD-MONTHLY SIP',
      normalizedMerchant: 'Zerodha',
      amount: 15000,
      type: 'DEBIT',
      category: 'Investments & Savings',
      spendType: 'INVESTMENT',
    });

    // Electricity / Utility on 7th (Slight variance: ~1,850)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-07`,
      rawDescription: 'BESCOM ONLINE BILL PAYMENT BANGALORE',
      normalizedMerchant: 'Bescom',
      amount: 1750 + Math.floor(Math.sin(idCounter) * 150),
      type: 'DEBIT',
      category: 'Utilities & Bills',
      spendType: 'ESSENTIAL',
    });

    // Broadband on 8th (Fixed: 999)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-08`,
      rawDescription: 'ACT FIBERNET BROADBAND MONTHLY',
      normalizedMerchant: 'ACT Fibernet',
      amount: 999,
      type: 'DEBIT',
      category: 'Utilities & Bills',
      spendType: 'ESSENTIAL',
    });

    // Netflix Subscription on 10th (Fixed: 649)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-10`,
      rawDescription: 'POS 4012 NETFLIX DIGITAL ENTERTAINMENT',
      normalizedMerchant: 'Netflix',
      amount: 649,
      type: 'DEBIT',
      category: 'Subscriptions & Digital',
      spendType: 'DISCRETIONARY',
    });

    // Spotify Subscription on 12th (Fixed: 119)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-12`,
      rawDescription: 'RECURRING SPOTIFY PREMIUM INDIVIDUAL',
      normalizedMerchant: 'Spotify',
      amount: 119,
      type: 'DEBIT',
      category: 'Subscriptions & Digital',
      spendType: 'DISCRETIONARY',
    });

    // Cult.fit Gym Membership on 14th (Fixed: 2,400)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-14`,
      rawDescription: 'CULT.FIT HEALTH AND FITNESS SUBSCRIPTION',
      normalizedMerchant: 'Gym Membership',
      amount: 2400,
      type: 'DEBIT',
      category: 'Healthcare & Medical',
      spendType: 'ESSENTIAL',
    });

    // Blinkit Groceries (Variable: ~3 times per month, amounts 800 - 1500)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-06`,
      rawDescription: 'UPI/Blinkit Commerce Pvt Ltd/Blinkit@icici',
      normalizedMerchant: 'Blinkit',
      amount: 950 + ((idCounter * 73) % 400),
      type: 'DEBIT',
      category: 'Groceries',
      spendType: 'ESSENTIAL',
    });
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-18`,
      rawDescription: 'UPI/Blinkit Commerce Pvt Ltd/Blinkit@icici',
      normalizedMerchant: 'Blinkit',
      amount: 1320 + ((idCounter * 41) % 350),
      type: 'DEBIT',
      category: 'Groceries',
      spendType: 'ESSENTIAL',
    });
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-26`,
      rawDescription: 'UPI/Zepto Quick Delivery/Zepto@hdfc',
      normalizedMerchant: 'Zepto',
      amount: 880 + ((idCounter * 67) % 250),
      type: 'DEBIT',
      category: 'Groceries',
      spendType: 'ESSENTIAL',
    });

    // Swiggy & Zomato Dining (Variable: ~4-5 orders per month, amounts 320 - 750)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-04`,
      rawDescription: 'UPI/SWIGGY FOOD ORDER/Swiggy@axis',
      normalizedMerchant: 'Swiggy',
      amount: 420 + ((idCounter * 31) % 300),
      type: 'DEBIT',
      category: 'Dining & Food Delivery',
      spendType: 'DISCRETIONARY',
    });
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-11`,
      rawDescription: 'UPI/ZOMATO LIMITED RESTAURANT/Zomato@paytm',
      normalizedMerchant: 'Zomato',
      amount: 580 + ((idCounter * 83) % 280),
      type: 'DEBIT',
      category: 'Dining & Food Delivery',
      spendType: 'DISCRETIONARY',
    });
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-21`,
      rawDescription: 'UPI/SWIGGY FOOD ORDER/Swiggy@axis',
      normalizedMerchant: 'Swiggy',
      amount: 690 + ((idCounter * 53) % 200),
      type: 'DEBIT',
      category: 'Dining & Food Delivery',
      spendType: 'DISCRETIONARY',
    });
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-28`,
      rawDescription: 'UPI/TOIT BREWERY BANGALORE DINING',
      normalizedMerchant: 'Dining & Restaurant',
      amount: 2200 + ((idCounter * 97) % 600),
      type: 'DEBIT',
      category: 'Dining & Food Delivery',
      spendType: 'DISCRETIONARY',
    });

    // Uber / Commute (Variable: ~3 rides, 280 - 450)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-09`,
      rawDescription: 'UPI/UBER INDIA SYSTEMS PVT LTD/Uber@icici',
      normalizedMerchant: 'Uber',
      amount: 340 + ((idCounter * 17) % 150),
      type: 'DEBIT',
      category: 'Travel & Commute',
      spendType: 'DISCRETIONARY',
    });
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-23`,
      rawDescription: 'UPI/UBER INDIA SYSTEMS PVT LTD/Uber@icici',
      normalizedMerchant: 'Uber',
      amount: 410 + ((idCounter * 29) % 120),
      type: 'DEBIT',
      category: 'Travel & Commute',
      spendType: 'DISCRETIONARY',
    });

    // Amazon Shopping (Discretionary: ~3,500 - 6,000)
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-16`,
      rawDescription: 'POS 4012 AMAZON RETAIL INDIA PVT LTD',
      normalizedMerchant: 'Amazon',
      amount: 3200 + ((idCounter * 113) % 2500),
      type: 'DEBIT',
      category: 'Shopping & Retail',
      spendType: 'DISCRETIONARY',
    });

    // Occasional weekend cinema/entertainment
    transactions.push({
      id: `tx-${idCounter++}`,
      date: `${m}-22`,
      rawDescription: 'BOOKMYSHOW PVR CINEMAS FORUM',
      normalizedMerchant: 'BookMyShow',
      amount: 750 + ((idCounter * 37) % 300),
      type: 'DEBIT',
      category: 'Entertainment & Leisure',
      spendType: 'DISCRETIONARY',
    });
  }

  return assembleResult('HDFC', transactions);
}

function generateSbiFamilyData(): ParseResult {
  const transactions: Transaction[] = [];
  const months = ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10'];
  let idCounter = 1000;

  for (const m of months) {
    // Monthly Salary
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-01`,
      rawDescription: 'BY SALARY CREDIT-TCS LTD-CHENNAI CORP',
      normalizedMerchant: 'Salary Credit',
      amount: 165000,
      type: 'CREDIT',
      category: 'Salary & Income',
      spendType: 'INCOME',
    });

    // Home Loan EMI on 5th (Fixed: 46,500)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-05`,
      rawDescription: 'TO LOAN DEBIT SBI HOME LOAN HL3982001',
      normalizedMerchant: 'SBI Home Loan',
      amount: 46500,
      type: 'DEBIT',
      category: 'Debt & EMI',
      spendType: 'ESSENTIAL',
    });

    // Car Loan EMI on 10th (Fixed: 12,200)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-10`,
      rawDescription: 'TO NACH DEBIT HDFC BANK CAR LOAN',
      normalizedMerchant: 'Car Loan EMI',
      amount: 12200,
      type: 'DEBIT',
      category: 'Debt & EMI',
      spendType: 'ESSENTIAL',
    });

    // DMart Monthly Groceries (Fixed-ish essential: 11,500)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-07`,
      rawDescription: 'POS AVENUE SUPERMARTS DMART RETAIL',
      normalizedMerchant: 'DMart',
      amount: 10800 + ((idCounter * 43) % 900),
      type: 'DEBIT',
      category: 'Groceries',
      spendType: 'ESSENTIAL',
    });

    // School Fees / Education (Quarterly / Monthly averaged: 9,000)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-12`,
      rawDescription: 'NEFT DELHI PUBLIC SCHOOL TUITION FEES',
      normalizedMerchant: 'Delhi Public School',
      amount: 9000,
      type: 'DEBIT',
      category: 'Education',
      spendType: 'ESSENTIAL',
    });

    // Electricity Tata Power
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-15`,
      rawDescription: 'TATA POWER UTILITY ONLINE PAYMENT',
      normalizedMerchant: 'Tata Power',
      amount: 2450 + ((idCounter * 19) % 300),
      type: 'DEBIT',
      category: 'Utilities & Bills',
      spendType: 'ESSENTIAL',
    });

    // Health Insurance Premium on 18th (Star Health: 3,800/mo)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-18`,
      rawDescription: 'NACH DEBIT STAR HEALTH FAMILY OPTIMA',
      normalizedMerchant: 'Star Health',
      amount: 3800,
      type: 'DEBIT',
      category: 'Insurance',
      spendType: 'ESSENTIAL',
    });

    // Fuel Shell Petrol (Variable: ~4,500/mo)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-14`,
      rawDescription: 'POS SHELL PETROL STATION WHITEFIELD',
      normalizedMerchant: 'Shell Petrol',
      amount: 2300 + ((idCounter * 61) % 400),
      type: 'DEBIT',
      category: 'Travel & Commute',
      spendType: 'DISCRETIONARY',
    });
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-26`,
      rawDescription: 'POS SHELL PETROL STATION WHITEFIELD',
      normalizedMerchant: 'Shell Petrol',
      amount: 2100 + ((idCounter * 31) % 350),
      type: 'DEBIT',
      category: 'Travel & Commute',
      spendType: 'DISCRETIONARY',
    });

    // Family Dining (Moderate: ~4,000/mo)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-20`,
      rawDescription: 'BARBEQUE NATION RESTAURANT DINING',
      normalizedMerchant: 'Barbeque Nation',
      amount: 3600 + ((idCounter * 71) % 800),
      type: 'DEBIT',
      category: 'Dining & Food Delivery',
      spendType: 'DISCRETIONARY',
    });

    // PPF / Mutual Fund Investment (25,000/mo)
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-08`,
      rawDescription: 'TRF TO PUBLIC PROVIDENT FUND A/C',
      normalizedMerchant: 'PPF Deposit',
      amount: 15000,
      type: 'DEBIT',
      category: 'Investments & Savings',
      spendType: 'INVESTMENT',
    });
    transactions.push({
      id: `sbi-${idCounter++}`,
      date: `${m}-09`,
      rawDescription: 'ACH SBI MUTUAL FUND NIFTY 50 INDEX SIP',
      normalizedMerchant: 'SBI Mutual Fund',
      amount: 10000,
      type: 'DEBIT',
      category: 'Investments & Savings',
      spendType: 'INVESTMENT',
    });
  }

  return assembleResult('SBI', transactions);
}

function generateLifestyleDropData(): ParseResult {
  const transactions: Transaction[] = [];
  const months = ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10'];
  let idCounter = 5000;

  for (let idx = 0; idx < months.length; idx++) {
    const m = months[idx];
    const isDropPeriod = idx >= 3; // Months 8, 9, 10 have massive lifestyle creep

    // Salary: 1,35,000
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-01`,
      rawDescription: 'SALARY CREDIT GOOGLE INDIA PRIVATE LTD',
      normalizedMerchant: 'Salary Credit',
      amount: 135000,
      type: 'CREDIT',
      category: 'Salary & Income',
      spendType: 'INCOME',
    });

    // Rent: 30,000
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-02`,
      rawDescription: 'UPI RENT TRANSFER APARTMENT INDIRANAGAR',
      normalizedMerchant: 'Apartment Rent',
      amount: 30000,
      type: 'DEBIT',
      category: 'Housing & Rent',
      spendType: 'ESSENTIAL',
    });

    // Groceries: ~6,000
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-05`,
      rawDescription: 'BLINKIT GROCERIES ORDER',
      normalizedMerchant: 'Blinkit',
      amount: 3200,
      type: 'DEBIT',
      category: 'Groceries',
      spendType: 'ESSENTIAL',
    });
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-18`,
      rawDescription: 'NATURES BASKET GOURMET GROCERY',
      normalizedMerchant: 'Natures Basket',
      amount: 2800,
      type: 'DEBIT',
      category: 'Groceries',
      spendType: 'ESSENTIAL',
    });

    // Bills: ~2,500
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-08`,
      rawDescription: 'BESCOM POWER & AIRTEL BROADBAND',
      normalizedMerchant: 'Bescom & Airtel',
      amount: 2500,
      type: 'DEBIT',
      category: 'Utilities & Bills',
      spendType: 'ESSENTIAL',
    });

    // In baseline period (months 0-2): Dining is ~₹6,000. In drop period: Dining leaps to ₹22,000!
    const diningAmount = isDropPeriod ? 22400 : 5800;
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-12`,
      rawDescription: 'SWIGGY GOURMET & LUXURY RESTAURANT EXPERIENCES',
      normalizedMerchant: 'Dining & Food Delivery',
      amount: diningAmount,
      type: 'DEBIT',
      category: 'Dining & Food Delivery',
      spendType: 'DISCRETIONARY',
    });

    // In baseline period: Shopping is ~₹4,500. In drop period: Shopping leaps to ₹26,000! (New iPhone EMI, designer clothing)
    const shoppingAmount = isDropPeriod ? 26200 : 4500;
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-16`,
      rawDescription: 'APPLE STORE ONLINE & ZARA FASHION RETAIL',
      normalizedMerchant: 'Apple Store & Zara',
      amount: shoppingAmount,
      type: 'DEBIT',
      category: 'Shopping & Retail',
      spendType: 'DISCRETIONARY',
    });

    // In baseline period: Travel is ~₹2,000. In drop period: Weekend trips leap to ₹18,000!
    const travelAmount = isDropPeriod ? 18500 : 2200;
    transactions.push({
      id: `drop-${idCounter++}`,
      date: `${m}-24`,
      rawDescription: 'MAKEMYTRIP RESORT BOOKING & INDIGO FLIGHTS',
      normalizedMerchant: 'MakeMyTrip & Indigo',
      amount: travelAmount,
      type: 'DEBIT',
      category: 'Travel & Commute',
      spendType: 'DISCRETIONARY',
    });
  }

  return assembleResult('HDFC', transactions);
}

function assembleResult(format: 'HDFC' | 'SBI', transactions: Transaction[]): ParseResult {
  transactions.sort((a, b) => a.date.localeCompare(b.date));
  const totalDebits = transactions.filter((t) => t.type === 'DEBIT').reduce((acc, t) => acc + t.amount, 0);
  const totalCredits = transactions.filter((t) => t.type === 'CREDIT').reduce((acc, t) => acc + t.amount, 0);
  return {
    format,
    formatConfidence: 0.98,
    dateRange: {
      start: transactions[0]?.date || '2024-05-01',
      end: transactions[transactions.length - 1]?.date || '2024-10-31',
    },
    totalDebits,
    totalCredits,
    transactionCount: transactions.length,
    transactions,
    warnings: [],
  };
}
