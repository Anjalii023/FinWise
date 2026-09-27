import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker for Vite/modern browser environment
if (typeof window !== 'undefined') {
  try {
    // Set worker source to CDN matching the installed version, or inline
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Failed to set pdfjs workerSrc:', e);
  }
}

export class PDFExtractor {
  /**
   * Extracts clean text lines from a PDF ArrayBuffer or File
   */
  public static async extractText(data: ArrayBuffer): Promise<string> {
    try {
      const loadingTask = pdfjsLib.getDocument({
        data,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const extractedLines: string[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group items by vertical position (Y-coordinate) to preserve rows in tables
        const items = textContent.items as Array<{
          str: string;
          transform: number[];
          width: number;
          height: number;
        }>;

        if (!items || items.length === 0) continue;

        // Group text items by their approximate Y coordinate (with small tolerance)
        const rowMap = new Map<number, Array<{ x: number; text: string }>>();

        for (const item of items) {
          if (!item.str || item.str.trim() === '') continue;

          const x = item.transform[4];
          const y = Math.round(item.transform[5]); // Y coordinate

          // Find an existing row within a 4px tolerance
          let matchedY = y;
          for (const existingY of rowMap.keys()) {
            if (Math.abs(existingY - y) <= 4) {
              matchedY = existingY;
              break;
            }
          }

          if (!rowMap.has(matchedY)) {
            rowMap.set(matchedY, []);
          }
          rowMap.get(matchedY)!.push({ x, text: item.str });
        }

        // Sort rows top-to-bottom (in PDF coordinate system, Y increases upwards, so descending Y)
        const sortedY = Array.from(rowMap.keys()).sort((a, b) => b - a);

        for (const y of sortedY) {
          const rowItems = rowMap.get(y)!;
          // Sort items in this row left-to-right (increasing X)
          rowItems.sort((a, b) => a.x - b.x);

          // Join with tab or spaces to preserve columns
          const line = rowItems.map((item) => item.text.trim()).join('\t');
          if (line.trim().length > 0) {
            extractedLines.push(line);
          }
        }
      }

      return extractedLines.join('\n');
    } catch (err: any) {
      console.error('Error extracting text from PDF:', err);
      throw new Error(`PDF Parsing Error: ${err.message || 'Could not extract text from PDF statement.'}`);
    }
  }
}
