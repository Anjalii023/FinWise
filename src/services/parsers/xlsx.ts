import * as XLSX from 'xlsx';
import { BankFormat, ParseResult } from '../../types';
import { GenericCSVParser } from './csv';

export class XLSXParser {
  public static parse(data: ArrayBuffer | Uint8Array, fileName?: string): ParseResult {
    try {
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        return {
          format: 'GENERIC_XLSX',
          formatConfidence: 0.5,
          dateRange: { start: '', end: '' },
          totalDebits: 0,
          totalCredits: 0,
          transactionCount: 0,
          transactions: [],
          warnings: ['The Excel workbook contains no visible sheets.'],
        };
      }

      const sheet = workbook.Sheets[firstSheetName];
      // Convert sheet to CSV formatted text
      const csvText = XLSX.utils.sheet_to_csv(sheet);

      // Now pass this CSV text into GenericCSVParser or specialized parsers
      const csvParser = new GenericCSVParser();
      const result = csvParser.parse(csvText, fileName);

      return {
        ...result,
        format: 'GENERIC_XLSX',
        formatConfidence: Math.max(0.9, result.formatConfidence),
      };
    } catch (err: any) {
      console.error('Error parsing Excel statement:', err);
      throw new Error(`Excel Parsing Error: ${err.message || 'Could not parse XLSX statement.'}`);
    }
  }
}
