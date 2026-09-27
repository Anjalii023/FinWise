import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Scale,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  User,
  ShieldCheck,
} from 'lucide-react';
import {
  AnalyticsSummary,
  ChatMessage,
  QueryClass,
  UserFinancialProfile,
} from '../types';
import { QueryClassifier } from '../services/rag/classifier';
import { HybridRAGRetriever } from '../services/rag/retriever';
import { GroqGenerationService } from '../services/ai/groqService';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatViewProps {
  summary: AnalyticsSummary;
  userProfile: UserFinancialProfile;
  initialPrompt?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  summary,
  userProfile,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `Hello! I'm your FinWise advisor. I can answer questions about your monthly spending, evaluate financial trade-offs (such as paying down debt vs investing in SIPs), or explain tax rules and guidelines.

Select a mode above: **Ask** (guidelines & concepts), **Decide** (financial trade-offs), or **Simulate** (budget projections).`,
      confidenceLabel: 'HIGH',
      rerankScore: 0.96,
      queryClass: 'knowledge',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'Ask' | 'Decide' | 'Simulate'>('Ask');

  // Track collapsed state for the 3 sections per message: answer, evidence, confidence
  const [collapsedSections, setCollapsedSections] = useState<Record<string, { answer?: boolean; evidence?: boolean; confidence?: boolean }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retrieverRef = useRef(new HybridRAGRetriever());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const toggleSection = (msgId: string, section: 'answer' | 'evidence' | 'confidence') => {
    setCollapsedSections((prev) => ({
      ...prev,
      [msgId]: {
        ...prev[msgId],
        [section]: !prev[msgId]?.[section],
      },
    }));
  };

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    setInput('');

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 1. Classify Query based on mode or text
      let queryClass: QueryClass = QueryClassifier.classify(text);
      if (chatMode === 'Decide') queryClass = 'decision';
      else if (chatMode === 'Simulate') queryClass = 'what_if';

      // 2. Hybrid RAG retrieval
      const retrievalResult = retrieverRef.current.retrieve(text, 3);

      // 3. Groq / Server Generation
      const genResponse = await GroqGenerationService.generateExplanation({
        query: text,
        queryClass,
        analytics: summary,
        evidence: retrievalResult.evidence,
        conflict: retrievalResult.conflict,
        explanationLevel: 'beginner',
        userProfile,
      });

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: genResponse.answer,
        queryClass,
        confidenceLabel: genResponse.confidenceLabel,
        rerankScore: genResponse.rerankScore,
        evidence: genResponse.evidenceUsed,
        conflict: retrievalResult.conflict,
        isOutOfScope: retrievalResult.isOutOfScope,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Unable to process query: ${err.message || 'Service unavailable'}. Please verify statement context.`,
        confidenceLabel: 'LOW',
        rerankScore: 0.2,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadge = (confidence?: 'HIGH' | 'MEDIUM' | 'LOW', score?: number) => {
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DFF3E8] text-[#2E7D5B] border border-[#B5E5CF]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High Confidence {score ? `(${(score * 100).toFixed(0)}%)` : ''}</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDEBDD] text-[#D97706] border border-[#F9D3B4]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Medium Confidence {score ? `(${(score * 100).toFixed(0)}%)` : ''}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDE8E7] text-[#DC2626] border border-[#F4B6B0]">
            <XCircle className="w-3.5 h-3.5" />
            <span>Low Confidence / Caution</span>
          </span>
        );
    }
  };

  const quickPromptsByMode: Record<'Ask' | 'Decide' | 'Simulate', string[]> = {
    Ask: [
      'What is the 50/30/20 budgeting rule and how does my statement compare?',
      'Explain Section 80C vs 80CCD(1B) NPS tax deductions',
      'How large should my emergency fund be for my expenses?',
    ],
    Decide: [
      'Should I pay off my personal loan or invest in an equity SIP?',
      'Old Tax Regime vs New Tax Regime: which saves me more?',
      'Keep emergency money in a savings account or liquid fund?',
    ],
    Simulate: [
      'What if I cut dining and food delivery spend by 25%?',
      'Simulate saving an extra ₹10,000 monthly with a new salary appraisal',
      'What if I take a new car EMI of ₹12,000?',
    ],
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col bg-white rounded-3xl border border-[#ECE8F5] shadow-[0_4px_24px_rgba(45,45,58,0.03)] overflow-hidden">
      {/* Top Header with Mode Selector: Ask / Decide / Simulate */}
      <div className="px-6 py-4 bg-[#FAF9FD] border-b border-[#ECE8F5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8E4F3] text-[#7E69AB] flex items-center justify-center font-bold text-xs">
            FW
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#2D2D3A]">Financial Advisor</h2>
            <p className="text-[11px] text-[#6B6B7B]">Personalized insights based on your bank data and regulatory guidelines</p>
          </div>
        </div>

        {/* Mode Selector (Ask / Decide / Simulate) */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-[#ECE8F5] shadow-xs text-xs">
          {(['Ask', 'Decide', 'Simulate'] as const).map((mode) => {
            const isSelected = chatMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setChatMode(mode)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? mode === 'Ask'
                      ? 'bg-[#DFF3E8] text-[#2E7D5B] shadow-xs'
                      : mode === 'Decide'
                      ? 'bg-[#E8E4F3] text-[#7E69AB] shadow-xs'
                      : 'bg-[#FDEBDD] text-[#D97706] shadow-xs'
                    : 'text-[#6B6B7B] hover:text-[#2D2D3A]'
                }`}
              >
                {mode === 'Ask' && <BookOpen className="w-3.5 h-3.5" />}
                {mode === 'Decide' && <Scale className="w-3.5 h-3.5" />}
                {mode === 'Simulate' && <Sliders className="w-3.5 h-3.5" />}
                <span>{mode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message Thread Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isAnswerCollapsed = collapsedSections[msg.id]?.answer;
          const isEvidenceCollapsed = collapsedSections[msg.id]?.evidence !== false; // collapsed by default
          const isConfidenceCollapsed = collapsedSections[msg.id]?.confidence;

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-[#E8E4F3] text-[#2D2D3A] font-bold text-xs'
                    : 'bg-[#DFF3E8] text-[#2D2D3A] font-bold text-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4 text-[#7E69AB]" /> : <Sparkles className="w-4 h-4 text-[#48A97C]" />}
              </div>

              {/* Message Content Container */}
              <div className={`max-w-2xl w-full space-y-3 ${isUser ? 'items-end' : ''}`}>
                {/* User Message Bubble */}
                {isUser ? (
                  <div className="p-4 rounded-2xl rounded-tr-none bg-[#E8E4F3] text-[#2D2D3A] text-xs sm:text-sm font-medium leading-relaxed shadow-xs">
                    <MarkdownRenderer content={msg.text} stripEmojis={false} />
                  </div>
                ) : (
                  <div className="bg-white border border-[#ECE8F5] rounded-3xl rounded-tl-sm p-4 sm:p-5 shadow-[0_2px_12px_rgba(45,45,58,0.03)] space-y-3">
                    {/* Clean Formatted Message */}
                  <MarkdownRenderer content={msg.text} stripEmojis={true} />

                  {/* Minimalist Verification & Source Bar */}
                  {(msg.evidence?.length || msg.confidenceLabel) && (
                    <div className="pt-2 border-t border-[#F4F1FA] flex items-center justify-between text-xs text-[#8C8CA1]">
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#48A97C]" />
                        <span className="text-[11px] text-[#6B6B7B]">Verified with statement data</span>
                      </div>

                      {msg.evidence && msg.evidence.length > 0 && (
                        <button
                          onClick={() => toggleSection(msg.id, 'evidence')}
                          className="text-[11px] font-medium text-[#7E69AB] hover:text-[#5B4886] flex items-center space-x-1 transition-colors"
                        >
                          <span>
                            {collapsedSections[msg.id]?.evidence === false
                              ? 'Hide Sources'
                              : `View Sources (${msg.evidence.length})`}
                          </span>
                          {collapsedSections[msg.id]?.evidence === false ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expandable Source Notes (Only when user clicks View Sources) */}
                  {collapsedSections[msg.id]?.evidence === false && msg.evidence && msg.evidence.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#F4F1FA] space-y-2 bg-[#FAF9FD] p-3 rounded-2xl animate-in fade-in duration-150">
                      <span className="text-[10px] font-semibold text-[#8C8CA1] uppercase tracking-wider block">
                        Reference Sources
                      </span>
                      {msg.evidence.map((ev, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-[#ECE8F5] text-xs space-y-0.5 shadow-2xs">
                          <div className="flex items-center justify-between font-semibold text-[#2D2D3A]">
                            <span>{ev.chunk.title}</span>
                            <span className="text-[10px] text-[#7E69AB] font-mono">
                              {(ev.rerankScore * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <span className="text-[10px] text-[#48A97C] font-mono block">
                            {ev.chunk.source} · {ev.chunk.section}
                          </span>
                          <p className="text-[11px] text-[#6B6B7B] italic">"{ev.chunk.content}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#DFF3E8] flex items-center justify-center text-[#48A97C]">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-3 bg-white rounded-2xl border border-[#ECE8F5] text-xs text-[#6B6B7B] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#48A97C] animate-pulse" />
              <span>Analyzing statement data and guidelines...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips for Active Mode */}
      <div className="px-6 py-2 bg-[#FAF9FD] border-t border-[#ECE8F5] flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-[#8C8CA1] shrink-0">
          {chatMode} Prompts:
        </span>
        {quickPromptsByMode[chatMode].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-xl text-xs bg-white hover:bg-[#FAF9FD] text-[#2D2D3A] border border-[#ECE8F5] hover:border-[#C8BEE8] whitespace-nowrap transition-colors shrink-0 font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box at Bottom */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 bg-white border-t border-[#ECE8F5] flex items-center space-x-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about financial rules, trade-offs, or your statement in ${chatMode} mode...`}
          className="flex-1 bg-[#FAF9FD] border border-[#ECE8F5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#2D2D3A] placeholder-[#8C8CA1] focus:outline-none focus:border-[#C8BEE8] focus:bg-white transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 bg-[#E8E4F3] hover:bg-[#DDD7EE] disabled:opacity-50 text-[#2D2D3A] rounded-2xl transition-all shadow-sm shrink-0 font-bold"
        >
          <Send className="w-4 h-4 text-[#7E69AB]" />
        </button>
      </form>
    </div>
  );
};
