import { BankFormat, ParseResult, Transaction } from '../../types';
import { categorizeTransaction, IBankParser } from './base';

export class SBIParser implements IBankParser {
  format: BankFormat = 'SBI';

  detectFormat(rawContent: string, fileName?: string): boolean {
    const text = (rawContent + ' ' + (fileName || '')).toUpperCase();
    return (
      text.includes('STATE BANK OF INDIA') ||
      text.includes('SBI') ||
      (text.includes('TXN DATE') && text.includes('VALUE DATE') && text.includes('REF NO./CHEQUE NO.')) ||
      (text.includes('DEBIT') && text.includes('CREDIT') && text.includes('BALANCE') && text.includes('DESCRIPTION'))
    );
  }

  parse(rawContent: string, fileName?: string): ParseResult {
    const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const transactions: Transaction[] = [];
    const warnings: string[] = [];

    let headerFound = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upper = line.toUpperCase();

      if (upper.includes('TXN DATE') || (upper.includes('DATE') && upper.includes('DESCRIPTION') && upper.includes('DEBIT'))) {
        headerFound = true;
        continue;
      }

      if (!headerFound && !line.match(/^\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4}|^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/)) {
        continue;
      }

      let parts: string[];
      if (line.includes('\t')) {
        parts = line.split('\t').map((p) => p.trim());
      } else if (line.includes(',')) {
        parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      } else {
        parts = line.split(/\s{2,}/).map((p) => p.trim());
      }

      if (parts.length < 4) continue;

      const dateStr = parts[0];
      const normalizedDate = this.normalizeDate(dateStr);
      if (!normalizedDate) continue;

      // SBI format columns:
      // Txn Date, Value Date, Description, Ref No./Cheque No., Debit, Credit, Balance
      const description = parts[2] || parts[1] || 'SBI Transaction';
      const refNo = parts[3] || '';

      let debit = 0;
      let credit = 0;
      let balance = 0;

      if (parts.length >= 7) {
        debit = this.cleanAmount(parts[4]);
        credit = this.cleanAmount(parts[5]);
        balance = this.cleanAmount(parts[6]);
      } else if (parts.length >= 5) {
        debit = this.cleanAmount(parts[3]);
        credit = this.cleanAmount(parts[4]);
      } else {
        const num = this.cleanAmount(parts[parts.length - 1]);
        if (num > 0) debit = num;
      }

      const isCredit = credit > 0 && debit === 0;
      const amount = isCredit ? credit : debit;
      if (amount <= 0) continue;

      const type = isCredit ? 'CREDIT' : 'DEBIT';
      const { category, spendType, normalizedMerchant } = categorizeTransaction(description, type, amount);

      transactions.push({
        id: `sbi-${transactions.length + 1}-${normalizedDate}`,
        date: normalizedDate,
        rawDescription: description,
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
      format: 'SBI',
      formatConfidence: 0.94,
      dateRange,
      totalDebits,
      totalCredits,
      transactionCount: transactions.length,
      transactions,
      warnings,
    };
  }

  private normalizeDate(str: string): string | null {
    // Check "05 Jan 2024" or "05-Jan-24"
    const textMatch = str.match(/^(\d{1,2})[\s\-]+([A-Za-z]{3})[\s\-]+(\d{2,4})$/);
    if (textMatch) {
      const day = textMatch[1].padStart(2, '0');
      const monthNames: Record<string, string> = {
        JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
        JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
      };
      const month = monthNames[textMatch[2].toUpperCase()] || '01';
      let year = textMatch[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }

    // Check DD/MM/YYYY
    const numMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (numMatch) {
      const day = numMatch[1].padStart(2, '0');
      const month = numMatch[2].padStart(2, '0');
      let year = numMatch[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  private cleanAmount(val: string): number {
    if (!val) return 0;
    const cleaned = val.replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.abs(num);
  }
}
