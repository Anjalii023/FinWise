import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Target,
  Sliders,
  TrendingUp,
  UploadCloud,
  LogOut,
  X,
  FileCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { BankFormat } from '../types';
import { NavPage } from '../routes';

export type { NavPage };

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeDatasetName: string;
  bankFormat: BankFormat;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onOpenLimitations: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
  activeDatasetName,
  bankFormat,
  userName,
  userEmail,
  onLogout,
  onOpenLimitations,
}) => {
  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'Financial Advisor', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'goals', label: 'Goal Planner', icon: <Target className="w-4 h-4" /> },
    { id: 'simulator', label: 'What-If Simulator', icon: <Sliders className="w-4 h-4" /> },
    { id: 'insights', label: 'Spending Insights', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload Statement', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'demo', label: 'Model Comparison', icon: <Scale className="w-4 h-4" /> },
  ];

  const content = (
    <div className="w-[240px] h-screen bg-[#FFFFFF] border-r border-[#ECE8F5] flex flex-col justify-between shrink-0 select-none shadow-[2px_0_12px_rgba(45,45,58,0.02)]">
      {/* Top Section: Brand + Links */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo & Name */}
        <div className="p-6 pb-5 flex items-center justify-between border-b border-[#F4F1FA]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#DFF3E8] flex items-center justify-center shadow-sm">
              <span className="font-bold text-[#2D2D3A] text-base font-sans">FW</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-[#2D2D3A] text-base tracking-tight">FinWise</span>
              </div>
              <p className="text-[10px] text-[#6B6B7B] font-medium tracking-tight">
                Personal Finance
              </p>
            </div>
          </div>

          {/* Close for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-lg text-[#8C8CA1] hover:text-[#2D2D3A] hover:bg-[#FAF9FD]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Statement Pill */}
        <div className="px-4 py-3 bg-[#FAF9FD] mx-3 my-3 rounded-2xl border border-[#ECE8F5] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <FileCheck className="w-3.5 h-3.5 text-[#48A97C] shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#2D2D3A] truncate block">
                {activeDatasetName}
              </span>
              <span className="text-[10px] font-mono text-[#8C8CA1] block">
                {bankFormat} Verified
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              onSelectPage('upload');
              onCloseMobile();
            }}
            className="text-[10px] font-semibold text-[#6B6B7B] hover:text-[#2D2D3A] underline shrink-0 ml-1"
          >
            Change
          </button>
        </div>

        {/* Navigation Items (Stacked Vertically) */}
        <nav className="px-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-[#E8E4F3] text-[#2D2D3A] border-l-4 border-[#7E69AB] shadow-[0_2px_8px_rgba(232,228,243,0.5)]'
                    : 'text-[#6B6B7B] hover:text-[#2D2D3A] hover:bg-[#FAF9FD]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-[#7E69AB]' : 'text-[#8C8CA1]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#DFF3E8] text-[#2D2D3A] font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Limitations & User Profile */}
      <div className="p-4 border-t border-[#F4F1FA] space-y-3 bg-[#FCFBFE]">
        {/* Limitations modal button */}
        <button
          onClick={onOpenLimitations}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-[11px] text-[#6B6B7B] hover:text-[#2D2D3A] hover:bg-[#F4F1FA] transition-colors font-medium text-left"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#F4B6B0]" />
          <span>System Limitations</span>
        </button>

        {/* User Profile Pill */}
        <div className="p-2.5 bg-white rounded-2xl border border-[#ECE8F5] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#E1F0FA] text-[#2D2D3A] flex items-center justify-center font-bold text-xs shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#2D2D3A] block truncate">{userName}</span>
              <span className="text-[10px] text-[#8C8CA1] block truncate">{userEmail}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 text-[#8C8CA1] hover:text-[#F4B6B0] hover:bg-[#FAF9FD] rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-screen z-20">
        {content}
      </aside>

      {/* Mobile Drawer (hamburger triggered) */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2D2D3A]/20 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
