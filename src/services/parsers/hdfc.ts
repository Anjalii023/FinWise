import { BankFormat, ParseResult, Transaction } from '../../types';
import { categorizeTransaction, IBankParser } from './base';

export class HDFCParser implements IBankParser {
  format: BankFormat = 'HDFC';

  detectFormat(rawContent: string, fileName?: string): boolean {
    const text = (rawContent + ' ' + (fileName || '')).toUpperCase();
    return (
      text.includes('HDFC') ||
      (text.includes('VALUE DT') && text.includes('WITHDRAWAL AMT')) ||
      (text.includes('NARRATION') && text.includes('CHQ./REF.NO.'))
    );
  }

  parse(rawContent: string, fileName?: string): ParseResult {
    const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const transactions: Transaction[] = [];
    const warnings: string[] = [];

    // HDFC formats usually have CSV/tab or column structure:
    // Date, Narration, Chq/Ref No, Value Dt, Withdrawal Amt, Deposit Amt, Closing Balance
    let headerFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upper = line.toUpperCase();

      if (upper.includes('DATE') && (upper.includes('NARRATION') || upper.includes('WITHDRAWAL'))) {
        headerFound = true;
        continue;
      }

      if (!headerFound && !line.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/)) {
        continue;
      }

      // Try split by comma, tab, or double space
      let parts: string[];
      if (line.includes(',')) {
        parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      } else if (line.includes('\t')) {
        parts = line.split('\t').map((p) => p.trim());
      } else {
        parts = line.split(/\s{2,}/).map((p) => p.trim());
      }

      if (parts.length < 4) continue;

      const dateStr = parts[0];
      const normalizedDate = this.normalizeDate(dateStr);
      if (!normalizedDate) continue;

      const narration = parts[1] || 'HDFC Transaction';
      const refNo = parts[2] || '';

      // Find amounts in remaining columns
      let withdrawal = 0;
      let deposit = 0;
      let balance = 0;

      if (parts.length >= 6) {
        withdrawal = this.cleanAmount(parts[4] || parts[3]);
        deposit = this.cleanAmount(parts[5] || parts[4]);
        balance = this.cleanAmount(parts[6] || parts[5]);
      } else {
        // Find whichever part is a valid number
        const num1 = this.cleanAmount(parts[2]);
        const num2 = this.cleanAmount(parts[3]);
        if (num1 > 0) withdrawal = num1;
        else if (num2 > 0) deposit = num2;
      }

      const isCredit = deposit > 0 && withdrawal === 0;
      const amount = isCredit ? deposit : withdrawal;

      if (amount <= 0) continue;

      const type = isCredit ? 'CREDIT' : 'DEBIT';
      const { category, spendType, normalizedMerchant } = categorizeTransaction(narration, type, amount);

      transactions.push({
        id: `hdfc-${transactions.length + 1}-${normalizedDate}`,
        date: normalizedDate,
        rawDescription: narration,
        normalizedMerchant,
        amount,
        type,
        category,
        spendType,
        balance: balance > 0 ? balance : undefined,
        referenceNo: refNo,
      });
    }

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    const totalDebits = transactions.filter((t) => t.type === 'DEBIT').reduce((acc, t) => acc + t.amount, 0);
    const totalCredits = transactions.filter((t) => t.type === 'CREDIT').reduce((acc, t) => acc + t.amount, 0);
    const dateRange = {
      start: transactions[0]?.date || new Date().toISOString().slice(0, 10),
      end: transactions[transactions.length - 1]?.date || new Date().toISOString().slice(0, 10),
    };

    return {
      format: 'HDFC',
      formatConfidence: 0.96,
      dateRange,
      totalDebits,
      totalCredits,
      transactionCount: transactions.length,
      transactions,
      warnings,
    };
  }

  private normalizeDate(str: string): string | null {
    // Matches DD/MM/YYYY or DD-MM-YYYY or DD/MM/YY
    const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (!match) return null;
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    let year = match[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  private cleanAmount(val: string): number {
    if (!val) return 0;
    const cleaned = val.replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.abs(num);
  }
}
