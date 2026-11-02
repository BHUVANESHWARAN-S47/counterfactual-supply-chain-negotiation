import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, X, Bot, User, Shield, Briefcase, Truck, UserCheck } from 'lucide-react';
import { api } from '../services/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  suggestedActions?: string[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  // Role Configuration Definitions
  const roleConfigs: Record<string, {
    title: string;
    subtitle: string;
    badge: string;
    icon: any;
    greeting: string;
    prompts: string[];
  }> = {
    ADMIN: {
      title: 'AI Assistant',
      subtitle: 'Track orders, review approvals, and monitor system tasks',
      badge: 'Admin Assistant',
      icon: Shield,
      greeting: `Hello! I can help you check orders, review supplier quotations, track purchasing tasks, and understand supply chain reports. What would you like to know?`,
      prompts: [
        'Which decisions need approval?',
        'Show suppliers that need attention.',
        'Summarize recent system issues.',
        'Show inventory shortages.',
      ],
    },
    PROCUREMENT: {
      title: 'AI Assistant',
      subtitle: 'Supplier comparison, quotation analysis, and purchasing requests',
      badge: 'Purchasing Assistant',
      icon: Briefcase,
      greeting: `Hello! I can help you compare supplier quotations, identify stock shortages, and review purchasing requests. What would you like to know?`,
      prompts: [
        'Which requests need suppliers?',
        'Compare quotations for an order.',
        'Show inventory shortages.',
        'Explain the latest supplier recommendation.',
      ],
    },
    SUPPLIER: {
      title: 'AI Assistant',
      subtitle: 'Quotation requests, purchase orders, and delivery lead times',
      badge: 'Supplier Assistant',
      icon: Truck,
      greeting: `Hello! I can help you review quotation requests, check open purchase orders, and track delivery dates. What would you like to review?`,
      prompts: [
        'Which quotation requests need my response?',
        'Show my open purchase orders.',
        'Which deliveries need an update?',
      ],
    },
    CUSTOMER: {
      title: 'AI Assistant',
      subtitle: 'Order tracking, delivery dates, and status inquiries',
      badge: 'Customer Assistant',
      icon: UserCheck,
      greeting: `Hello! I can help you track your orders, check expected delivery dates, and review shipment status. What would you like to know?`,
      prompts: [
        'Track my order.',
        'Show my recent orders.',
        'When is my next delivery expected?',
      ],
    },
  };

  const currentConfig = roleConfigs[role] || roleConfigs['ADMIN'];

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: currentConfig.greeting,
      suggestedActions: currentConfig.prompts,
    },
  ]);

  useEffect(() => {
    const cfg = roleConfigs[role] || roleConfigs['ADMIN'];
    setMessages([
      {
        sender: 'assistant',
        text: cfg.greeting,
        suggestedActions: cfg.prompts,
      },
    ]);
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      api.getAssistantStatus().then(setStatus).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: queryText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Pass previous conversational exchanges for follow-up resolution
      const history = updatedMessages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const resp = await api.queryAssistant(queryText, role, undefined, history);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: resp.answer,
        suggestedActions: resp.suggested_actions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `I'm temporarily unable to retrieve this information. Please try again shortly.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const CurrentRoleIcon = currentConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col h-[670px] overflow-hidden text-[#111827]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F5F7FB]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#7C3AED] text-white shadow-sm">
                <CurrentRoleIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  {currentConfig.title}
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ready
                  </span>
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {currentConfig.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F7FB]/60">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="h-8 w-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white border border-[#E5E7EB] text-[#111827] shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Suggested Action Prompts */}
                {m.sender === 'assistant' && m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#F3F4F6]">
                    {m.suggestedActions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleSend(act)}
                        className="px-2.5 py-1 rounded-lg bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[11px] text-[#7C3AED] border border-[#E9D5FF] transition-colors font-bold shadow-2xs cursor-pointer text-left"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 border border-[#DBEAFE]">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-[#6B7280]">
              <div className="h-8 w-8 rounded-lg bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-center text-[#7C3AED] animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <span className="animate-pulse">Checking records and preparing response...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI Assistant anything..."
              className="flex-1 bg-[#F5F7FB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED] transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-semibold transition shadow-sm cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
