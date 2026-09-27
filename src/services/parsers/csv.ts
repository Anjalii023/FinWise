import Papa from 'papaparse';
import { BankFormat, ParseResult, Transaction } from '../../types';
import { categorizeTransaction, IBankParser } from './base';

export class GenericCSVParser implements IBankParser {
  format: BankFormat = 'GENERIC_CSV';

  detectFormat(rawContent: string, fileName?: string): boolean {
    // If it's a CSV and doesn't explicitly match HDFC/SBI, generic CSV matches
    return fileName?.endsWith('.csv') || rawContent.includes(',');
  }

  parse(rawContent: string, fileName?: string): ParseResult {
    const parsed = Papa.parse<Record<string, string>>(rawContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const rows = parsed.data;
    const transactions: Transaction[] = [];
    const warnings: string[] = [];

    if (!rows || rows.length === 0) {
      return {
        format: 'GENERIC_CSV',
        formatConfidence: 0.5,
        dateRange: { start: '', end: '' },
        totalDebits: 0,
        totalCredits: 0,
        transactionCount: 0,
        transactions: [],
        warnings: ['No data rows found in CSV.'],
      };
    }

    // Inspect headers
    const headers = Object.keys(rows[0] || {});
    const dateHeader = this.findHeader(headers, ['date', 'txn date', 'transaction date', 'posting date', 'value date']);
    const descHeader = this.findHeader(headers, ['description', 'narration', 'particulars', 'details', 'merchant', 'payee']);
    const debitHeader = this.findHeader(headers, ['debit', 'withdrawal', 'dr', 'expense', 'spent']);
    const creditHeader = this.findHeader(headers, ['credit', 'deposit', 'cr', 'income', 'received']);
    const amountHeader = this.findHeader(headers, ['amount', 'txn amount', 'transaction amount']);
    const typeHeader = this.findHeader(headers, ['type', 'txn type', 'transaction type', 'cr/dr']);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawDate = dateHeader ? row[dateHeader] : (Object.values(row)[0] as string);
      const normalizedDate = this.normalizeDate(rawDate);
      if (!normalizedDate) continue;

      const rawDesc = descHeader ? row[descHeader] : 'Transaction';
      let debit = debitHeader ? this.cleanAmount(row[debitHeader]) : 0;
      let credit = creditHeader ? this.cleanAmount(row[creditHeader]) : 0;

      if (!debitHeader && !creditHeader && amountHeader) {
        const rawAmt = this.cleanAmount(row[amountHeader]);
        const typeVal = typeHeader ? (row[typeHeader] || '').toUpperCase() : '';
        if (typeVal.includes('CR') || typeVal.includes('INCOME') || typeVal.includes('CREDIT')) {
          credit = rawAmt;
        } else {
          debit = rawAmt;
        }
      }

      const isCredit = credit > 0 && debit === 0;
      const amount = isCredit ? credit : debit;
      if (amount <= 0) continue;

      const type = isCredit ? 'CREDIT' : 'DEBIT';
      const { category, spendType, normalizedMerchant } = categorizeTransaction(rawDesc, type, amount);

      transactions.push({
        id: `csv-${transactions.length + 1}-${normalizedDate}`,
        date: normalizedDate,
        rawDescription: rawDesc,
        normalizedMerchant,
        amount,
        type,
        category,
        spendType,
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
      format: 'GENERIC_CSV',
      formatConfidence: 0.85,
      dateRange,
      totalDebits,
      totalCredits,
      transactionCount: transactions.length,
      transactions,
      warnings,
    };
  }

  private findHeader(headers: string[], candidates: string[]): string | undefined {
    return headers.find((h) => candidates.includes(h.toLowerCase().trim()));
  }

  private normalizeDate(str: string | undefined): string | null {
    if (!str) return null;
    const clean = str.trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      let year = dmy[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }

    // Try Date.parse
    const ts = Date.parse(clean);
    if (!isNaN(ts)) {
      return new Date(ts).toISOString().slice(0, 10);
    }
    return null;
  }

  private cleanAmount(val: string | undefined): number {
    if (!val) return 0;
    const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.abs(num);
  }
}
