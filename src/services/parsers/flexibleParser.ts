import { BankFormat, ParseResult, Transaction } from '../../types';
import { categorizeTransaction, IBankParser } from './base';

export class FlexibleBankParser implements IBankParser {
  format: BankFormat = 'UNKNOWN';

  detectFormat(rawContent: string, fileName?: string): boolean {
    // Matches if there are structured transaction rows
    const lines = rawContent.split(/\r?\n/).slice(0, 100);
    const dateCount = lines.filter((l) => this.containsDatePattern(l)).length;
    return dateCount >= 2;
  }

  parse(rawContent: string, fileName?: string): ParseResult {
    const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const transactions: Transaction[] = [];
    const warnings: string[] = [];

    // Detect format hints from raw content
    const upperContent = (rawContent + ' ' + (fileName || '')).toUpperCase();
    let detectedFormat: BankFormat = 'UNKNOWN';
    if (upperContent.includes('HDFC')) detectedFormat = 'HDFC';
    else if (upperContent.includes('STATE BANK OF INDIA') || upperContent.includes('SBI')) detectedFormat = 'SBI';
    else if (fileName?.endsWith('.csv')) detectedFormat = 'GENERIC_CSV';
    else if (fileName?.endsWith('.xlsx') || fileName?.endsWith('.xls')) detectedFormat = 'GENERIC_XLSX';

    // Header column indices
    let dateCol = 0;
    let descCol = 1;
    let debitCol = -1;
    let creditCol = -1;
    let amountCol = -1;
    let typeCol = -1;
    let balanceCol = -1;

    let tableStarted = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upper = line.toUpperCase();

      // Check if this line is a table header row
      if (
        (upper.includes('DATE') || upper.includes('TXN')) &&
        (upper.includes('NARRATION') || upper.includes('DESCRIPTION') || upper.includes('PARTICULAR') || upper.includes('DETAILS')) &&
        (upper.includes('DEBIT') || upper.includes('WITHDRAWAL') || upper.includes('AMOUNT') || upper.includes('CR/DR') || upper.includes('CREDIT') || upper.includes('DEPOSIT'))
      ) {
        tableStarted = true;
        const cols = this.splitLine(line);
        cols.forEach((col, idx) => {
          const c = col.toUpperCase().trim();
          if (c.includes('DATE') && !c.includes('VALUE')) dateCol = idx;
          else if (c.includes('VALUE DATE') && dateCol === 0) dateCol = idx;
          else if (c.includes('DESCRIPTION') || c.includes('NARRATION') || c.includes('PARTICULAR') || c.includes('DETAILS') || c.includes('REMARKS')) descCol = idx;
          else if (c.includes('DEBIT') || c.includes('WITHDRAWAL') || c === 'DR') debitCol = idx;
          else if (c.includes('CREDIT') || c.includes('DEPOSIT') || c === 'CR') creditCol = idx;
          else if (c.includes('AMOUNT') && debitCol === -1) amountCol = idx;
          else if (c.includes('TYPE') || c.includes('CR/DR')) typeCol = idx;
          else if (c.includes('BALANCE')) balanceCol = idx;
        });
        continue;
      }

      // Check if this line starts with or contains a valid transaction date
      if (!this.containsDatePattern(line)) {
        continue;
      }

      const cols = this.splitLine(line);
      if (cols.length < 2) continue;

      // Extract date
      let dateStr = '';
      let dateIdxFound = -1;

      // Try finding the date in the expected dateCol first, or search all cols
      const candidateDate = this.normalizeDate(cols[dateCol]);
      if (candidateDate) {
        dateStr = candidateDate;
        dateIdxFound = dateCol;
      } else {
        for (let c = 0; c < Math.min(3, cols.length); c++) {
          const norm = this.normalizeDate(cols[c]);
          if (norm) {
            dateStr = norm;
            dateIdxFound = c;
            break;
          }
        }
      }

      if (!dateStr) continue;

      // Extract description
      let description = '';
      if (descCol !== dateIdxFound && descCol < cols.length && cols[descCol]?.length > 2) {
        description = cols[descCol];
      } else {
        // Look for the longest text column that isn't a date or number
        const textCols = cols.filter(
          (_, idx) => idx !== dateIdxFound && !this.isPureNumeric(cols[idx])
        );
        description = textCols[0] || 'Transaction';
      }

      // Extract amounts
      let debit = 0;
      let credit = 0;
      let balance: number | undefined;

      if (debitCol !== -1 && debitCol < cols.length) {
        debit = this.cleanAmount(cols[debitCol]);
      }
      if (creditCol !== -1 && creditCol < cols.length) {
        credit = this.cleanAmount(cols[creditCol]);
      }
      if (balanceCol !== -1 && balanceCol < cols.length) {
        balance = this.cleanAmount(cols[balanceCol]) || undefined;
      }

      // If amounts weren't found by headers, scan numeric columns from right to left
      if (debit === 0 && credit === 0) {
        const numericValues = cols
          .map((c) => this.cleanAmount(c))
          .filter((v) => v > 0);

        if (numericValues.length >= 2) {
          // Typically: [Amount, Balance] or [Debit, Credit, Balance]
          if (typeCol !== -1 && cols[typeCol]) {
            const tVal = cols[typeCol].toUpperCase();
            if (tVal.includes('CR') || tVal.includes('CREDIT') || tVal.includes('DEP')) {
              credit = numericValues[0];
            } else {
              debit = numericValues[0];
            }
          } else {
            // Check if line contains "CR" or "CREDIT"
            const upperLine = line.toUpperCase();
            if (upperLine.includes(' CR ') || upperLine.includes('CREDIT') || upperLine.includes('BY SALARY') || upperLine.includes('NEFT CR')) {
              credit = numericValues[0];
            } else {
              debit = numericValues[0];
            }
          }
        } else if (numericValues.length === 1) {
          const upperLine = line.toUpperCase();
          if (upperLine.includes(' CR ') || upperLine.includes('CREDIT') || upperLine.includes('BY SALARY') || upperLine.includes('REFUND')) {
            credit = numericValues[0];
          } else {
            debit = numericValues[0];
          }
        }
      }

      const isCredit = credit > 0 && debit === 0;
      const amount = isCredit ? credit : debit;
      if (amount <= 0) continue;

      const type = isCredit ? 'CREDIT' : 'DEBIT';
      const { category, spendType, normalizedMerchant } = categorizeTransaction(
        description,
        type,
        amount
      );

      transactions.push({
        id: `stmt-${transactions.length + 1}-${dateStr}`,
        date: dateStr,
        rawDescription: description,
        normalizedMerchant,
        amount,
        type,
        category,
        spendType,
        balance,
      });
    }

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    const totalDebits = transactions
      .filter((t) => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredits = transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const dateRange = {
      start: transactions[0]?.date || new Date().toISOString().slice(0, 10),
      end: transactions[transactions.length - 1]?.date || new Date().toISOString().slice(0, 10),
    };

    return {
      format: detectedFormat,
      formatConfidence: transactions.length > 0 ? 0.92 : 0.2,
      dateRange,
      totalDebits,
      totalCredits,
      transactionCount: transactions.length,
      transactions,
      warnings,
    };
  }

  private splitLine(line: string): string[] {
    if (line.includes('\t')) {
      return line.split('\t').map((c) => c.trim()).filter(Boolean);
    }
    if (line.includes(',')) {
      // Split on comma not inside quotes
      return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
    // Multiple spaces
    return line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
  }

  private containsDatePattern(str: string): boolean {
    return (
      /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/.test(str) ||
      /\b\d{1,2}[\s\-]+[A-Za-z]{3}[\s\-]+\d{2,4}\b/.test(str) ||
      /\b\d{4}[\/\-]\d{2}[\/\-]\d{2}\b/.test(str)
    );
  }

  private normalizeDate(str: string | undefined): string | null {
    if (!str) return null;
    const clean = str.trim();

    // YYYY-MM-DD
    const isoMatch = clean.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    // DD-MMM-YYYY or DD MMM YYYY (e.g. 15-Jan-2024, 05-May-24)
    const textMatch = clean.match(/^(\d{1,2})[\s\-]+([A-Za-z]{3})[\s\-]+(\d{2,4})/);
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

    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      let year = dmyMatch[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  private isPureNumeric(str: string | undefined): boolean {
    if (!str) return false;
    const cleaned = str.replace(/[,\s₹$€]/g, '');
    return /^-?\d+(\.\d+)?$/.test(cleaned);
  }

  private cleanAmount(val: string | undefined): number {
    if (!val) return 0;
    const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.abs(num);
  }
}
