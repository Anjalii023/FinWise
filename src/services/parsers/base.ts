import { BankFormat, Category, ParseResult, SpendType, Transaction, TransactionType } from '../../types';

export interface IBankParser {
  format: BankFormat;
  detectFormat(rawContent: string, fileName?: string): boolean;
  parse(rawContent: string, fileName?: string): ParseResult;
}

// Category keyword matching rules
const CATEGORY_RULES: { category: Category; spendType: SpendType; keywords: string[] }[] = [
  {
    category: 'Salary & Income',
    spendType: 'INCOME',
    keywords: ['SALARY', 'SAL CREDIT', 'PAYROLL', 'MONTHLY PAY', 'NEFT CR', 'IMPS CR', 'DIRECT DEP', 'EMPLOYER'],
  },
  {
    category: 'Freelance & Business',
    spendType: 'INCOME',
    keywords: ['UPWORK', 'CLIENT', 'FREELANCE', 'STRIPE', 'PAYPAL', 'CONSULTING', 'INVOICE', 'STIPEND'],
  },
  {
    category: 'Investments & Savings',
    spendType: 'INVESTMENT',
    keywords: ['ZERODHA', 'GROWW', 'KUVERA', 'MUTUAL FUND', 'SIP', 'INDMONEY', 'COIN', 'UPSTOX', 'PPF', 'NPS', 'FD DEP', 'RD DEP'],
  },
  {
    category: 'Housing & Rent',
    spendType: 'ESSENTIAL',
    keywords: ['RENT', 'NOBROKER', 'MAINTENANCE', 'HOUSING', 'APARTMENT', 'LANDLORD', 'PROPERTY TAX'],
  },
  {
    category: 'Groceries',
    spendType: 'ESSENTIAL',
    keywords: ['BLINKIT', 'ZEPTO', 'BIGBASKET', 'DMART', 'SPENCERS', 'NATURE BASKET', 'VEGETABLES', 'PROVISION', 'SUPERMARKET', 'RELIANCE SMART'],
  },
  {
    category: 'Utilities & Bills',
    spendType: 'ESSENTIAL',
    keywords: ['BESCOM', 'ELECTRICITY', 'POWER', 'TATA POWER', 'AIRTEL', 'JIO', 'VODAFONE', 'WATER BOARD', 'BWSSB', 'GAS', 'ADANI GAS', 'BROADBAND', 'ACT FIBERNET'],
  },
  {
    category: 'Healthcare & Medical',
    spendType: 'ESSENTIAL',
    keywords: ['APOLLO', 'NETMEDS', 'PHARMEASY', 'HOSPITAL', 'CLINIC', 'DENTAL', 'MEDPLUS', 'PRACTO', 'DR LAL', 'MAX HEALTH', 'DIAGNOSTICS'],
  },
  {
    category: 'Debt & EMI',
    spendType: 'ESSENTIAL',
    keywords: ['EMI', 'LOAN', 'HDFC LOAN', 'BAJAJ FIN', 'CREDIT CARD PYMT', 'HOME LOAN', 'CAR LOAN', 'PERSONAL LOAN', 'NACH'],
  },
  {
    category: 'Education',
    spendType: 'ESSENTIAL',
    keywords: ['SCHOOL', 'COLLEGE', 'TUITION', 'FEES', 'COURSERA', 'UDEMY', 'UNACADEMY', 'EXAM FEE'],
  },
  {
    category: 'Insurance',
    spendType: 'ESSENTIAL',
    keywords: ['HDFC ERGO', 'ICICI PRU', 'MAX LIFE', 'STAR HEALTH', 'LIC', 'POLICYBAZAAR', 'PREMIUM'],
  },
  {
    category: 'Dining & Food Delivery',
    spendType: 'DISCRETIONARY',
    keywords: ['SWIGGY', 'ZOMATO', 'STARBUCKS', 'MCDONALDS', 'DOMINOS', 'RESTAURANT', 'CAFE', 'PUB', 'BREWERY', 'PIZZA', 'KFC', 'BURGER KING'],
  },
  {
    category: 'Shopping & Retail',
    spendType: 'DISCRETIONARY',
    keywords: ['AMAZON', 'FLIPKART', 'MYNTRA', 'ZARA', 'H&M', 'AJIO', 'UNIQLO', 'DECATHLON', 'NYKAA', 'TATA CLIQ'],
  },
  {
    category: 'Entertainment & Leisure',
    spendType: 'DISCRETIONARY',
    keywords: ['BOOKMYSHOW', 'PVR', 'INOX', 'STEAM', 'PLAYSTATION', 'CONCERT', 'MOVIE', 'GAMING'],
  },
  {
    category: 'Subscriptions & Digital',
    spendType: 'DISCRETIONARY',
    keywords: ['NETFLIX', 'SPOTIFY', 'YOUTUBE PREMIUM', 'AMAZON PRIME', 'ICLOUD', 'GOOGLE ONE', 'APPLE.COM', 'HOTSTAR', 'DISNEY', 'CHATGPT'],
  },
  {
    category: 'Travel & Commute',
    spendType: 'DISCRETIONARY',
    keywords: ['UBER', 'OLA', 'RAPIDO', 'SHELL', 'PETROL', 'HPCL', 'BPCL', 'INDIAN OIL', 'METRO', 'IRCTC', 'MAKEMYTRIP', 'INDIGO', 'AIR INDIA'],
  },
];

export function categorizeTransaction(
  description: string,
  type: TransactionType,
  amount: number
): { category: Category; spendType: SpendType; normalizedMerchant: string } {
  const upper = description.toUpperCase();

  // If Credit and not explicitly categorized as something else, check salary/income
  if (type === 'CREDIT') {
    if (upper.includes('SALARY') || upper.includes('SAL CREDIT') || upper.includes('PAYROLL') || amount >= 30000) {
      return {
        category: 'Salary & Income',
        spendType: 'INCOME',
        normalizedMerchant: extractMerchant(description, 'Salary Credit'),
      };
    }
    if (upper.includes('INTEREST') || upper.includes('DIVIDEND') || upper.includes('REFUND')) {
      return {
        category: 'Salary & Income',
        spendType: 'INCOME',
        normalizedMerchant: extractMerchant(description, 'Bank Interest / Refund'),
      };
    }
    return {
      category: 'Freelance & Business',
      spendType: 'INCOME',
      normalizedMerchant: extractMerchant(description, 'Incoming Credit'),
    };
  }

  // Check debit rules
  for (const rule of CATEGORY_RULES) {
    if (rule.spendType === 'INCOME') continue;
    for (const kw of rule.keywords) {
      if (upper.includes(kw)) {
        return {
          category: rule.category,
          spendType: rule.spendType,
          normalizedMerchant: extractMerchant(description, kw),
        };
      }
    }
  }

  // Fallback
  return {
    category: 'Miscellaneous',
    spendType: 'DISCRETIONARY',
    normalizedMerchant: extractMerchant(description, 'Miscellaneous Debit'),
  };
}

export function extractMerchant(desc: string, fallback: string): string {
  const clean = desc.replace(/[0-9]{6,}/g, '').trim();
  const up = clean.toUpperCase();

  // Common UPI patterns: "UPI-SWIGGY-1234@OKAXIS" or "POS 4012 AMAZON PAY"
  const upiMatch = clean.match(/UPI(?:-|\/)([A-Za-z0-9_\s]+?)(?:-[0-9]|@|\/)/i);
  if (upiMatch && upiMatch[1]) {
    return upiMatch[1].trim();
  }

  const brands = [
    'Netflix', 'Spotify', 'Amazon Prime', 'Swiggy', 'Zomato', 'Blinkit', 'Zepto',
    'BigBasket', 'Uber', 'Ola', 'Rapido', 'Bescom', 'Airtel', 'Jio', 'Starbucks',
    'DMart', 'Zerodha', 'Groww', 'Myntra', 'Flipkart', 'Shell Petrol', 'Apollo Pharmacy',
    'NoBroker Rent', 'HDFC Home Loan', 'Tata Power', 'BookMyShow', 'Gym Membership',
  ];

  for (const brand of brands) {
    if (up.includes(brand.toUpperCase())) {
      return brand;
    }
  }

  const words = clean.split(/[\s\/-]+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    return words.slice(0, 2).join(' ');
  }

  return fallback;
}
