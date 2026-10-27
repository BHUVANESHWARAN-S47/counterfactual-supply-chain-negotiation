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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#d2b0bd] rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d8de] bg-[#fdf2f8]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#8e3a59] text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Supply Chain AI Co-Pilot
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    status?.ollama_connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {status?.ollama_connected ? 'Local LLaMA Active' : 'Heuristic Engine Active'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Grounded in active orders, CNT simulations, and inventory positions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#e8d8de] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fdf2f8]/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="h-8 w-8 rounded-lg bg-[#8e3a59] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#8e3a59] text-white shadow-xs'
                    : 'bg-white border border-[#d2b0bd] text-slate-900 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Model badge & Context Accordion */}
                {m.sender === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-[#e8d8de] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Model: {m.modelUsed || 'Heuristic Fallback'}</span>
                      {m.contextRetrieved && (
                        <button
                          onClick={() =>
                            setExpandedContextIndex(expandedContextIndex === idx ? null : idx)
                          }
                          className="flex items-center gap-1 text-[#8e3a59] hover:underline font-bold"
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
                      <pre className="p-2.5 rounded-xl bg-[#fdf2f8] border border-[#d2b0bd] text-[10px] text-slate-800 overflow-x-auto max-h-36 font-mono">
                        {JSON.stringify(m.contextRetrieved, null, 2)}
                      </pre>
                    )}

                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {m.suggestedActions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            onClick={() => handleSend(act)}
                            className="px-2.5 py-1 rounded-lg bg-[#fdf2f8] hover:bg-[#e8d8de] text-[11px] text-[#8e3a59] border border-[#d2b0bd] transition-colors font-bold shadow-2xs cursor-pointer"
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
                <div className="h-8 w-8 rounded-lg bg-[#e8d8de] text-[#8e3a59] flex items-center justify-center flex-shrink-0 border border-[#d2b0bd]">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="h-8 w-8 rounded-lg bg-[#fdf2f8] border border-[#d2b0bd] flex items-center justify-center text-[#8e3a59] animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <span className="animate-pulse">Retrieving supply chain context and formulating response...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#e8d8de] bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about inventory shortages, CNT recommendations, or supplier scores..."
              className="flex-1 bg-[#fdf2f8] border border-[#d2b0bd] rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8e3a59] transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] disabled:opacity-50 text-white font-semibold transition shadow-sm cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
