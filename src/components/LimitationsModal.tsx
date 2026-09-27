import React from 'react';
import { ShieldAlert, X, Check, AlertOctagon } from 'lucide-react';

interface LimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LimitationsModal: React.FC<LimitationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D3A]/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#ECE8F5] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_12px_40px_rgba(45,45,58,0.08)] space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8C8CA1] hover:text-[#2D2D3A] p-1.5 rounded-xl hover:bg-[#FAF9FD] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#7E69AB]">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase font-sans">
              Platform Principles &amp; Scope
            </h2>
          </div>
          <p className="text-xs text-[#6B6B7B]">
            Clear boundaries on how FinWise analyzes your data and what falls outside our scope.
          </p>
        </div>

        <div className="space-y-4 text-xs font-sans">
          {/* What FinWise DOES */}
          <div className="p-4 bg-[#DFF3E8]/60 border border-[#B5E5CF] rounded-2xl space-y-2">
            <span className="font-bold text-[#2E7D5B] uppercase tracking-wider block text-xs">
              ✓ Core Platform Principles
            </span>
            <ul className="space-y-1.5 text-[#2D2D3A] text-xs">
              <li className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-[#48A97C] shrink-0 mt-0.5" />
                <span>
                  <strong>Accurate Math:</strong> All balances, averages, and ratios are calculated directly in code.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-[#48A97C] shrink-0 mt-0.5" />
                <span>
                  <strong>Authoritative Citations:</strong> Financial principles reference verified regulatory guidance (RBI, IRDAI, Income Tax Act).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-[#48A97C] shrink-0 mt-0.5" />
                <span>
                  <strong>Secure Processing:</strong> Statement transactions are parsed and analyzed offline without bank login credentials.
                </span>
              </li>
            </ul>
          </div>

          {/* What FinWise Deliberately Excludes */}
          <div className="p-4 bg-[#FDE8E7]/60 border border-[#F4B6B0] rounded-2xl space-y-2">
            <span className="font-bold text-[#DC2626] uppercase tracking-wider block text-xs">
              ✕ Outside Platform Scope
            </span>
            <ul className="space-y-1.5 text-[#2D2D3A] text-xs">
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                <span>
                  <strong>No Stock/Crypto Tips:</strong> We do not offer market speculation or predict stock price movements.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                <span>
                  <strong>No Brokerage or Payments:</strong> FinWise is an educational planning tool, not an execution broker or payment gateway.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Net Banking Access:</strong> We never ask for your passwords, PINs, or OTPs.
                </span>
              </li>
            </ul>
          </div>

          {/* Legal / Regulatory Disclaimer */}
          <div className="p-3 bg-[#FAF9FD] rounded-xl border border-[#ECE8F5] text-[11px] text-[#6B6B7B] leading-relaxed">
            <strong>Regulatory Notice:</strong> FinWise is designed for financial literacy, budgeting optimization, and cash-flow scenario modeling. It does not provide SEBI-registered investment advisory or personalized portfolio management services.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#E8E4F3] hover:bg-[#DDD7EE] text-[#2D2D3A] rounded-xl text-xs font-bold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
