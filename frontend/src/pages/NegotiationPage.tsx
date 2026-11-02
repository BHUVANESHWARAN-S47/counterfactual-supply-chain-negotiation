import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NegotiationSession } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  ShieldAlert,
} from 'lucide-react';

interface NegotiationPageProps {
  initialProcId?: number;
  initialSupplierId?: number;
}

export const NegotiationPage: React.FC<NegotiationPageProps> = ({
  initialProcId,
  initialSupplierId,
}) => {
  const [sessions, setSessions] = useState<NegotiationSession[]>([]);
  const [activeSession, setActiveSession] = useState<NegotiationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [counterPrice, setCounterPrice] = useState<number>(41.5);
  const [counterLead, setCounterLead] = useState<number>(6);
  const [customMsg, setCustomMsg] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async (targetSessionId?: number) => {
    try {
      const data = await api.getNegotiations();
      setSessions(data);
      if (data.length > 0) {
        let match = data[0];
        const desiredId = targetSessionId || activeSession?.id;
        if (desiredId) {
          const found = data.find((s) => s.id === desiredId);
          if (found) match = found;
        } else if (initialProcId && initialSupplierId) {
          const found = data.find(
            (s) => s.procurement_request_id === initialProcId && s.supplier_id === initialSupplierId
          );
          if (found) match = found;
        }
        setActiveSession(match);
        setCounterPrice(match.current_buyer_offer || 41.0);
      }
    } catch (err) {
      console.error('Failed to load negotiations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [initialProcId, initialSupplierId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const handleSendCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const cleanPrice = Number(counterPrice);
      const cleanLead = Number(counterLead);
      if (isNaN(cleanPrice) || cleanPrice <= 0) {
        throw new Error('Please enter a valid counter price');
      }
      if (isNaN(cleanLead) || cleanLead <= 0) {
        throw new Error('Please enter a valid lead time in days');
      }

      const res = await api.counteroffer(
        activeSession.id,
        cleanPrice,
        cleanLead,
        customMsg || undefined
      );

      const msg = res.agreement_reached
        ? `✓ Agreement reached at ₹${res.final_price || res.current_supplier_offer}/unit in Round ${res.current_round}!`
        : `Counteroffer submitted! Round ${res.current_round} recorded. Supplier countered with ₹${res.current_supplier_offer}/unit.`;

      setFeedback({
        type: 'success',
        text: msg,
      });
      setCustomMsg('');
      setActiveSession(res);
      setSessions((prev) => prev.map((s) => (s.id === res.id ? res : s)));
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to submit counteroffer',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-[#6B7280]">
        <span className="animate-pulse font-medium text-[#2563EB]">
          Loading Multi-Agent Negotiation Arena...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">AI Multi-Agent Negotiation Arena</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Automated multi-round bargaining between Buyer Agent and Supplier Agent bounded by enterprise budget thresholds.
          </p>
        </div>
        <button
          onClick={() => fetchSessions()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#2563EB] transition shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Arena</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[#10B981] flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-[#EF4444] flex-shrink-0" />
            )}
            <span className="font-semibold">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions Sidebar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] px-1">
            Negotiation Sessions
          </div>
          <div className="space-y-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSession(s);
                  setCounterPrice(s.current_buyer_offer || 41.5);
                  setFeedback(null);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  activeSession?.id === s.id
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-semibold shadow-2xs'
                    : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{s.session_number}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="text-xs font-medium truncate text-[#111827]">{s.supplier_name}</div>
                <div className="flex justify-between items-center text-[11px] text-[#6B7280] mt-1.5 pt-1 border-t border-[#F3F4F6]">
                  <span>Round {s.current_round}/{s.max_rounds}</span>
                  <span className="font-bold text-[#10B981]">₹{s.current_supplier_offer}/unit</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Arena Thread & Controls */}
        <div className="lg:col-span-3 space-y-4">
          {activeSession ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col h-[560px]">
              {/* Arena Header */}
              <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F7FB] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#111827]">{activeSession.session_number}</span>
                    <span className="text-xs text-[#6B7280]">— {activeSession.supplier_name}</span>
                    <StatusBadge status={activeSession.status} />
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    Target Concession: <span className="text-[#2563EB] font-bold">₹{activeSession.target_price}</span> • Current Offer: <span className="text-[#10B981] font-bold">₹{activeSession.current_supplier_offer}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#DBEAFE]">
                    Round {activeSession.current_round} / {activeSession.max_rounds}
                  </span>
                </div>
              </div>

              {/* Message History Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F7FB]/50">
                {activeSession.messages.map((m) => {
                  const isBuyer = m.sender_role === 'BUYER_AGENT' || m.sender_role === 'HUMAN_BUYER';
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${isBuyer ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                          isBuyer
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : 'bg-white border border-[#E5E7EB] text-[#111827] shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] opacity-90 pb-1 border-b border-black/10">
                          <span className="font-bold">{m.sender_name}</span>
                          <span>Round {m.round_number}</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-base font-extrabold tracking-tight">
                            ₹{m.offered_price.toFixed(2)}/unit
                          </span>
                          <span className="text-[11px] opacity-90 font-medium">{m.offered_lead_days} days lead</span>
                        </div>
                        <p className="text-xs opacity-95">{m.message}</p>

                        {m.ai_suggestion && (
                          <div
                            className={`p-2 rounded-xl text-[11px] flex items-start gap-1.5 ${
                              isBuyer
                                ? 'bg-black/15 text-blue-100'
                                : 'bg-[#F3E8FF] border border-[#E9D5FF] text-[#7C3AED]'
                            }`}
                          >
                            <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span>{m.ai_suggestion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Status Notice if Agreed */}
              {activeSession.status === 'AGREED' && (
                <div className="px-4 py-2.5 bg-[#ECFDF5] border-t border-[#A7F3D0] flex items-center justify-between text-xs text-[#065F46]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span className="font-bold">
                      Binding Agreement Concluded at ₹{activeSession.final_price || activeSession.current_supplier_offer}/unit ({activeSession.final_lead_days || 6} days lead).
                    </span>
                  </div>
                  <span className="text-[11px] text-[#047857]">You may still submit another counteroffer to reopen bargaining.</span>
                </div>
              )}

              {/* Action / Counteroffer Bar */}
              <div className="p-4 border-t border-[#E5E7EB] bg-white space-y-3">
                <form onSubmit={handleSendCounter} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="w-full sm:w-1/3">
                      <label className="block text-[11px] text-[#4B5563] font-semibold mb-1">
                        Buyer Counter Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#2563EB] font-bold"
                        required
                      />
                    </div>
                    <div className="w-full sm:w-1/3">
                      <label className="block text-[11px] text-[#4B5563] font-semibold mb-1">
                        Requested Lead (Days)
                      </label>
                      <input
                        type="number"
                        value={counterLead}
                        onChange={(e) => setCounterLead(parseInt(e.target.value) || 1)}
                        min={1}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#2563EB]"
                        required
                      />
                    </div>
                    <div className="w-full sm:w-1/3 flex items-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{submitting ? 'Negotiating...' : 'Submit Counteroffer'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={customMsg}
                      onChange={(e) => setCustomMsg(e.target.value)}
                      placeholder="Optional custom negotiation message or volume commitment notes..."
                      className="w-full bg-[#F5F7FB] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-[#6B7280] border border-[#E5E7EB]">
              Select or initiate a negotiation session to launch multi-agent counteroffers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
