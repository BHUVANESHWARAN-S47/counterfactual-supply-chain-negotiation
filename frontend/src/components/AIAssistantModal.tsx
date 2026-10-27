import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, X, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  modelUsed?: string;
  isFallback?: boolean;
  suggestedActions?: string[];
  contextRetrieved?: any;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your Supply Chain AI Co-Pilot. Grounded in live verified operational data across inventory shortages, supplier quotations, and Counterfactual Negotiation Twin simulations. How can I assist your department today?`,
      modelUsed: 'Deterministic Heuristic Engine (Ollama Fallback)',
      isFallback: true,
      suggestedActions: [
        'Explain latest CNT simulation recommendation',
        'Check current warehouse shortages',
        'Show top ranked supplier scorecard',
        'Recommend buyer negotiation strategy',
      ],
    },
  ]);
  const [status, setStatus] = useState<any>(null);
  const [expandedContextIndex, setExpandedContextIndex] = useState<number | null>(null);

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
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await api.queryAssistant(queryText, role);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: resp.answer,
        modelUsed: resp.model_used,
        isFallback: resp.is_fallback,
        suggestedActions: resp.suggested_actions,
        contextRetrieved: resp.context_retrieved,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error connecting to assistant service: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden text-[#111827]">
        {/* Header (Soft Purple Accent) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F5F7FB]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7C3AED] text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                Supply Chain AI Co-Pilot
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    status?.ollama_connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}
                >
                  {status?.ollama_connected ? 'Local LLaMA Active' : 'Heuristic Engine Active'}
                </span>
              </h3>
              <p className="text-xs text-[#6B7280]">
                Grounded in active orders, CNT simulations, and inventory positions
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

                {/* Model badge & Context Accordion */}
                {m.sender === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-[#F3F4F6] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                      <span>Model: {m.modelUsed || 'Heuristic Fallback'}</span>
                      {m.contextRetrieved && (
                        <button
                          onClick={() =>
                            setExpandedContextIndex(expandedContextIndex === idx ? null : idx)
                          }
                          className="flex items-center gap-1 text-[#7C3AED] hover:underline font-bold cursor-pointer"
                        >
                          {expandedContextIndex === idx ? (
                            <>Hide Context <ChevronUp className="h-3 w-3" /></>
                          ) : (
                            <>Inspect Context <ChevronDown className="h-3 w-3" /></>
                          )}
                        </button>
                      )}
                    </div>

                    {expandedContextIndex === idx && m.contextRetrieved && (
                      <pre className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] text-[10px] text-[#374151] overflow-x-auto max-h-36 font-mono">
                        {JSON.stringify(m.contextRetrieved, null, 2)}
                      </pre>
                    )}

                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {m.suggestedActions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            onClick={() => handleSend(act)}
                            className="px-2.5 py-1 rounded-lg bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[11px] text-[#7C3AED] border border-[#E9D5FF] transition-colors font-bold shadow-2xs cursor-pointer"
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    )}
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
              <span className="animate-pulse">Retrieving supply chain context and formulating response...</span>
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
              placeholder="Ask about inventory shortages, CNT recommendations, or supplier scores..."
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
