import { BankFormat, ParseResult } from '../../types';
import { IBankParser } from './base';
import { GenericCSVParser } from './csv';
import { FlexibleBankParser } from './flexibleParser';
import { HDFCParser } from './hdfc';
import { PDFExtractor } from './pdfExtractor';
import { SBIParser } from './sbi';
import { XLSXParser } from './xlsx';

export class ParserFactory {
  private static bankParsers: IBankParser[] = [
    new HDFCParser(),
    new SBIParser(),
    new GenericCSVParser(),
    new FlexibleBankParser(),
  ];

  /**
   * Main entrypoint for text, CSV, or already-extracted string content
   */
  public static detectAndParse(content: string, fileName?: string): ParseResult {
    // 1. Try bank-specific parsers
    for (const parser of this.bankParsers) {
      if (parser.format !== 'GENERIC_CSV' && parser.format !== 'UNKNOWN' && parser.detectFormat(content, fileName)) {
        try {
          const result = parser.parse(content, fileName);
          if (result.transactions.length > 0) {
            return result;
          }
        } catch (e) {
          console.warn(`Parser ${parser.format} failed:`, e);
        }
      }
    }

    // 2. Try Generic CSV parser
    try {
      const csvResult = new GenericCSVParser().parse(content, fileName);
      if (csvResult.transactions.length > 0) {
        return csvResult;
      }
    } catch {
      // Fallback
    }

    // 3. Try Flexible heuristic parser (handles multi-column layout, tab-separated lines from PDFs, unknown banks)
    try {
      const flexibleResult = new FlexibleBankParser().parse(content, fileName);
      if (flexibleResult.transactions.length > 0) {
        return flexibleResult;
      }
    } catch (e) {
      console.warn('Flexible parser failed:', e);
    }

    // 4. Direct fallbacks for HDFC and SBI
    try {
      const hdfcResult = new HDFCParser().parse(content, fileName);
      if (hdfcResult.transactions.length > 0) return hdfcResult;
    } catch {
      // Ignore
    }

    try {
      const sbiResult = new SBIParser().parse(content, fileName);
      if (sbiResult.transactions.length > 0) return sbiResult;
    } catch {
      // Ignore
    }

    return {
      format: 'UNKNOWN',
      formatConfidence: 0.1,
      dateRange: { start: '', end: '' },
      totalDebits: 0,
      totalCredits: 0,
      transactionCount: 0,
      transactions: [],
      warnings: ['Could not detect recognized transaction rows. Please ensure your statement has dates, descriptions, and debit/credit amounts.'],
    };
  }

  /**
   * Parses binary file types: PDF (.pdf) or Excel (.xlsx, .xls)
   */
  public static async parseBinaryFile(
    fileBuffer: ArrayBuffer,
    fileName: string
  ): Promise<ParseResult> {
    const lowerName = fileName.toLowerCase();

    // Excel workbook
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      return XLSXParser.parse(fileBuffer, fileName);
    }

    // PDF statement
    if (lowerName.endsWith('.pdf')) {
      // Extract text with preserved table coordinates
      const extractedText = await PDFExtractor.extractText(fileBuffer);
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('PDF contains no readable text or is image-scanned. Please upload a digital text-based statement or export as CSV.');
      }
      return this.detectAndParse(extractedText, fileName);
    }

    // Default to decoding text
    const text = new TextDecoder('utf-8').decode(fileBuffer);
    return this.detectAndParse(text, fileName);
  }
}
