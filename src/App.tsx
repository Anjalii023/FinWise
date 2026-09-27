/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import {
  Sidebar,
  NavPage,
  LoginPage,
  DashboardView,
  ChatView,
  GoalsView,
  SimulatorView,
  InsightsView,
  UploadView,
  HallucinationDemo,
  LimitationsModal,
} from './components';
import { useAuthSession, useStatementData } from './hooks';
import { UserFinancialProfile } from './types';

const DEFAULT_USER_PROFILE: UserFinancialProfile = {
  monthlyIncome: 120000,
  existingEmis: 0,
  existingSips: 15000,
  emergencyFundMonths: 3,
  riskTolerance: 'MODERATE',
  primaryGoal: 'Wealth Accumulation & Tax Minimization',
};

export default function App() {
  // Authentication & Session Hook
  const { isAuthenticated, currentUser, handleLoginSuccess, handleLogout } = useAuthSession();

  // Statement Data & Deterministic Analytics Hook
  const {
    activeStatement,
    activeDatasetName,
    analyticsSummary,
    selectSampleDataset,
    ingestParsedData,
  } = useStatementData();

  // Navigation & Modal State
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLimitationsOpen, setIsLimitationsOpen] = useState(false);

  // Cross-page prompt handoff
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);

  const handleNavigateToChat = (prompt?: string) => {
    if (prompt) {
      setChatPrompt(prompt);
    }
    setCurrentPage('chat');
  };

  // If unauthenticated, display the standalone Login/Register screen
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9FD] text-[#2D2D3A] flex antialiased font-sans selection:bg-[#E8E4F3] selection:text-[#2D2D3A]">
      {/* 1. Persistent Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeDatasetName={activeDatasetName}
        bankFormat={activeStatement.format}
        userName={currentUser.name}
        userEmail={currentUser.email}
        onLogout={handleLogout}
        onOpenLimitations={() => setIsLimitationsOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 md:pl-[240px] flex flex-col min-h-screen min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#ECE8F5] px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-xl text-[#2D2D3A] hover:bg-[#FAF9FD] border border-[#ECE8F5]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 rounded-xl bg-[#DFF3E8] flex items-center justify-center font-bold text-xs text-[#2D2D3A]">
                FW
              </span>
              <span className="font-bold text-sm text-[#2D2D3A]">FinWise</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-mono text-[11px] text-[#6B6B7B] bg-[#FAF9FD] px-2 py-0.5 rounded-md border border-[#ECE8F5]">
              {activeStatement.format}
            </span>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardView
              summary={analyticsSummary}
              datasetName={activeDatasetName}
              onNavigateToChat={handleNavigateToChat}
              onNavigateToSimulator={() => setCurrentPage('simulator')}
              onNavigateToInsights={() => setCurrentPage('insights')}
            />
          )}

          {currentPage === 'chat' && (
            <ChatView
              summary={analyticsSummary}
              userProfile={DEFAULT_USER_PROFILE}
              initialPrompt={chatPrompt}
            />
          )}

          {currentPage === 'goals' && (
            <GoalsView
              summary={analyticsSummary}
              onNavigateToChat={handleNavigateToChat}
              onNavigateToSimulator={() => setCurrentPage('simulator')}
            />
          )}

          {currentPage === 'simulator' && (
            <SimulatorView
              summary={analyticsSummary}
              onNavigateToChat={handleNavigateToChat}
              onNavigateToGoals={() => setCurrentPage('goals')}
            />
          )}

          {currentPage === 'insights' && (
            <InsightsView
              summary={analyticsSummary}
              onNavigateToChat={handleNavigateToChat}
              onNavigateToSimulator={() => setCurrentPage('simulator')}
            />
          )}

          {currentPage === 'upload' && (
            <UploadView
              onSelectDataset={selectSampleDataset}
              onIngestParsedData={ingestParsedData}
              activeDatasetName={activeDatasetName}
            />
          )}

          {currentPage === 'demo' && (
            <HallucinationDemo
              summary={analyticsSummary}
              onNavigateToChat={handleNavigateToChat}
            />
          )}
        </main>
      </div>

      {/* Disclaimers & Limitations Modal */}
      <LimitationsModal
        isOpen={isLimitationsOpen}
        onClose={() => setIsLimitationsOpen(false)}
      />
    </div>
  );
}
