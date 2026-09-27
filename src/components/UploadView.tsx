import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileSpreadsheet,
  FileType,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ParseResult } from '../types';
import { ParserFactory } from '../services/parsers/factory';
import { SAMPLE_DATASETS, SampleDataset } from '../services/parsers/samples';

interface UploadViewProps {
  onSelectDataset: (dataset: SampleDataset) => void;
  onIngestParsedData: (result: ParseResult, name: string) => void;
  activeDatasetName: string;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onSelectDataset,
  onIngestParsedData,
  activeDatasetName,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [pendingResult, setPendingResult] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const processFile = async (file: File) => {
    setError(null);
    setImportSuccess(false);
    setFileName(file.name);
    setIsProcessing(true);
    setProcessingStatus(`Ingesting ${file.name}...`);

    try {
      const lower = file.name.toLowerCase();

      if (lower.endsWith('.pdf')) {
        setProcessingStatus('Extracting table rows from PDF via client-side PDF.js...');
        const buffer = await file.arrayBuffer();
        const result = await ParserFactory.parseBinaryFile(buffer, file.name);
        handleParseSuccess(result);
      } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        setProcessingStatus('Reading Excel sheets...');
        const buffer = await file.arrayBuffer();
        const result = await ParserFactory.parseBinaryFile(buffer, file.name);
        handleParseSuccess(result);
      } else {
        // Text / CSV
        setProcessingStatus('Parsing CSV columns...');
        const text = await file.text();
        const result = ParserFactory.detectAndParse(text, file.name);
        handleParseSuccess(result);
      }
    } catch (err: any) {
      console.error('File parse error:', err);
      setError(
        err.message ||
          'Failed to parse statement. Please ensure the file is an unencrypted PDF, CSV, or Excel sheet with date, narration, and amount fields.'
      );
      setPendingResult(null);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleParseSuccess = (result: ParseResult) => {
    if (result.transactions.length === 0) {
      setError(
        result.warnings[0] ||
          'No valid transaction rows found. Please check that the statement includes transaction dates and debit/credit amounts.'
      );
      setPendingResult(null);
    } else {
      setPendingResult(result);
      setError(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    setError(null);
    setImportSuccess(false);
    setIsProcessing(true);
    setProcessingStatus('Parsing statement text...');

    try {
      const result = ParserFactory.detectAndParse(pastedText, 'Pasted_Statement.txt');
      handleParseSuccess(result);
      setFileName('Pasted Bank Statement');
    } catch (err: any) {
      setError(err.message || 'Could not parse pasted text.');
      setPendingResult(null);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleConfirmIngestion = () => {
    if (!pendingResult) return;
    onIngestParsedData(pendingResult, fileName || 'Uploaded Statement');
    setImportSuccess(true);
    setPendingResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#DFF3E8] text-[#2D2D3A] flex items-center justify-center font-bold text-xs">
              <UploadCloud className="w-4 h-4 text-[#48A97C]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D2D3A]">
              Upload Bank Statement
            </h1>
          </div>
          <p className="text-xs text-[#6B6B7B] max-w-xl">
            Import your bank statement in CSV, Excel, or PDF format to populate your dashboard and financial analysis. Currently active: <strong className="text-[#2D2D3A]">{activeDatasetName}</strong>.
          </p>
        </div>
      </div>

      {importSuccess && (
        <div className="p-4 bg-[#DFF3E8] border border-[#B5E5CF] rounded-2xl flex items-center justify-between text-xs text-[#2E7D5B] font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#48A97C]" />
            <span>Statement imported successfully! Your dashboard, spending breakdown, and trends have been updated.</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(45,45,58,0.03)] border border-[#ECE8F5] space-y-6">
        {/* Method Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-[#FAF9FD] p-1 rounded-2xl border border-[#ECE8F5] text-xs">
          <button
            onClick={() => {
              setActiveTab('upload');
              setPendingResult(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-[#2D2D3A] shadow-xs'
                : 'text-[#6B6B7B] hover:text-[#2D2D3A]'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-[#7E69AB]" />
            <span>Upload File (CSV / XLSX / PDF)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('paste');
              setPendingResult(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'paste'
                ? 'bg-white text-[#2D2D3A] shadow-xs'
                : 'text-[#6B6B7B] hover:text-[#2D2D3A]'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-[#D97706]" />
            <span>Paste Text Rows</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('samples');
              setPendingResult(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'samples'
                ? 'bg-white text-[#2D2D3A] shadow-xs'
                : 'text-[#6B6B7B] hover:text-[#2D2D3A]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#48A97C]" />
            <span>Sample Datasets (3)</span>
          </button>
        </div>

        {/* Tab 1: File Upload (Drag and Drop Zone) */}
        {activeTab === 'upload' && !pendingResult && (
          <div className="space-y-4">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all text-center ${
                isDragOver
                  ? 'border-[#7E69AB] bg-[#E8E4F3]/30'
                  : 'border-[#ECE8F5] hover:border-[#C8BEE8] bg-[#FAF9FD]/50 hover:bg-[#FAF9FD]'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-[#E8E4F3] text-[#7E69AB] rounded-2xl">
                  <FileType className="w-5 h-5" />
                </div>
                <div className="p-3 bg-[#DFF3E8] text-[#48A97C] rounded-2xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="p-3 bg-[#E1F0FA] text-[#0284C7] rounded-2xl">
                  <UploadCloud className="w-5 h-5" />
                </div>
              </div>

              <span className="text-sm font-bold text-[#2D2D3A]">
                Drag & drop your bank statement here, or <span className="text-[#7E69AB] underline">browse files</span>
              </span>
              <p className="text-xs text-[#6B6B7B] mt-1 max-w-md">
                Accepts <strong className="text-[#2D2D3A]">CSV (.csv)</strong>, <strong className="text-[#2D2D3A]">Excel (.xlsx, .xls)</strong>, and <strong className="text-[#2D2D3A]">PDF (.pdf)</strong> bank statements.
              </p>

              <div className="flex items-center space-x-2 mt-4 text-[10px] text-[#8C8CA1] font-mono">
                <span className="px-2.5 py-1 bg-white rounded-lg border border-[#ECE8F5]">Client-Side Ingestion</span>
                <span className="px-2.5 py-1 bg-white rounded-lg border border-[#ECE8F5]">Zero Banking Credential Requirements</span>
              </div>

              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf,.txt"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </div>
        )}

        {/* Tab 2: Paste Statement Text */}
        {activeTab === 'paste' && !pendingResult && (
          <form onSubmit={handlePasteSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2D3A] block">
                Paste tabular statement rows or exported text:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`01/10/2024   SALARY CREDIT INFOSYS           120000.00   CR   145000.00
02/10/2024   UPI-NOBROKER RENT-HOUSE         28000.00    DR   117000.00
05/10/2024   SWIGGY FOOD BANGALORE             640.00    DR   116360.00
08/10/2024   BESCOM ELECTRICITY BILL          1850.00    DR   114510.00`}
                rows={8}
                className="w-full bg-[#FAF9FD] border border-[#ECE8F5] rounded-2xl p-4 text-xs text-[#2D2D3A] font-mono focus:outline-none focus:border-[#C8BEE8] focus:bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isProcessing || !pastedText.trim()}
                className="px-5 py-2.5 bg-[#E8E4F3] hover:bg-[#DDD7EE] disabled:opacity-50 text-[#2D2D3A] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
              >
                <span>Parse Statement Text</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2D2D3A]" />
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Sample Datasets (1-Click) */}
        {activeTab === 'samples' && !pendingResult && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#6B6B7B] uppercase tracking-wide block">
              Pre-loaded Realistic Statements for Testing:
            </span>
            <div className="grid grid-cols-1 gap-3">
              {SAMPLE_DATASETS.map((dataset) => (
                <button
                  key={dataset.id}
                  onClick={() => {
                    onSelectDataset(dataset);
                    setImportSuccess(true);
                  }}
                  className="w-full p-4 bg-[#FAF9FD] hover:bg-[#F4F1FA] border border-[#ECE8F5] hover:border-[#C8BEE8] rounded-2xl text-left transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#2D2D3A] text-xs group-hover:text-[#7E69AB] transition-colors">
                        {dataset.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white text-[#6B6B7B] border border-[#ECE8F5]">
                        {dataset.bank}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#DFF3E8] text-[#2E7D5B]">
                        {dataset.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B6B7B] max-w-lg leading-relaxed">
                      {dataset.description}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white group-hover:bg-[#E8E4F3] text-[#6B6B7B] group-hover:text-[#2D2D3A] border border-[#ECE8F5] transition-all shrink-0 ml-3">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="p-8 bg-[#FAF9FD] border border-[#ECE8F5] rounded-3xl flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#7E69AB] animate-spin" />
            <span className="text-xs text-[#2D2D3A] font-semibold">{processingStatus}</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 bg-[#FDE8E7] border border-[#F4B6B0] rounded-2xl text-xs text-[#2D2D3A] flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
            <div>
              <span className="font-bold block">Ingestion Warning</span>
              <p className="text-[11px] text-[#6B6B7B] mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Mandatory Confirmation Step Before Final Import */}
        {pendingResult && (
          <div className="bg-[#FAF9FD] border border-[#B5E5CF] rounded-3xl p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#ECE8F5] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-[#48A97C]" />
                  <span className="text-xs font-bold text-[#2D2D3A] uppercase tracking-wider">
                    Format Detected: {fileName || 'Statement'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B7B]">
                  Confirm the detected transactions and totals before final import
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#DFF3E8] text-[#2E7D5B] font-bold border border-[#B5E5CF]">
                {pendingResult.format} ({(pendingResult.formatConfidence * 100).toFixed(0)}% Match)
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8F5]">
                <span className="text-[#8C8CA1] block text-[10px]">Total Records</span>
                <span className="text-[#2D2D3A] font-bold text-sm">{pendingResult.transactionCount}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8F5]">
                <span className="text-[#8C8CA1] block text-[10px]">Date Range</span>
                <span className="text-[#2D2D3A] font-bold text-xs truncate block">
                  {pendingResult.dateRange.start} → {pendingResult.dateRange.end}
                </span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8F5]">
                <span className="text-[#8C8CA1] block text-[10px]">Total Debits</span>
                <span className="text-[#D97706] font-bold text-sm">
                  ₹{pendingResult.totalDebits.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8F5]">
                <span className="text-[#8C8CA1] block text-[10px]">Total Credits</span>
                <span className="text-[#48A97C] font-bold text-sm">
                  ₹{pendingResult.totalCredits.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Live Rows Preview Table */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8CA1] font-bold block">
                Sample Extracted Rows Preview:
              </span>
              <div className="bg-white border border-[#ECE8F5] rounded-2xl overflow-x-auto text-[11px] font-mono shadow-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#ECE8F5] text-[#8C8CA1] text-[10px]">
                      <th className="p-2.5 font-semibold">Date</th>
                      <th className="p-2.5 font-semibold">Description</th>
                      <th className="p-2.5 font-semibold">Category</th>
                      <th className="p-2.5 font-semibold text-right">Amount</th>
                      <th className="p-2.5 font-semibold text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F1FA]">
                    {pendingResult.transactions.slice(0, 4).map((t, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF9FD]">
                        <td className="p-2.5 text-[#6B6B7B]">{t.date}</td>
                        <td className="p-2.5 text-[#2D2D3A] font-sans max-w-[200px] truncate" title={t.rawDescription}>
                          {t.rawDescription}
                        </td>
                        <td className="p-2.5 text-[#6B6B7B]">{t.category}</td>
                        <td
                          className={`p-2.5 text-right font-bold ${
                            t.type === 'CREDIT' ? 'text-[#48A97C]' : 'text-[#2D2D3A]'
                          }`}
                        >
                          ₹{t.amount.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                              t.type === 'CREDIT'
                                ? 'bg-[#DFF3E8] text-[#2E7D5B]'
                                : 'bg-[#FDEBDD] text-[#D97706]'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingResult(null)}
                className="w-1/3 py-2.5 bg-white hover:bg-[#FAF9FD] text-[#6B6B7B] hover:text-[#2D2D3A] rounded-xl text-xs font-semibold border border-[#ECE8F5] transition-colors"
              >
                Cancel & Re-upload
              </button>
              <button
                type="button"
                onClick={handleConfirmIngestion}
                className="w-2/3 py-2.5 bg-[#DFF3E8] hover:bg-[#D0ECDD] text-[#2D2D3A] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#48A97C]" />
                <span>Confirm & Import Statement</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
