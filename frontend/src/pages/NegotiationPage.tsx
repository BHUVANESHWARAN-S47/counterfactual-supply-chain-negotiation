import React, { useState, useEffect } from 'react';
import { NegotiationSession } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { MessagesSquare, Sparkles, Send, CheckCircle2, AlertCircle, ArrowRight, Shield, RefreshCw } from 'lucide-react';

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
  const [counterPrice, setCounterPrice] = useState<number>(41.5);
  const [counterLead, setCounterLead] = useState<number>(6);
  const [customMsg, setCustomMsg] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSessions = async (keepActiveId?: number) => {
    try {
      const data = await api.getNegotiations();
      setSessions(data);
      if (data.length > 0) {
        const targetId = keepActiveId || activeSession?.id || data[0].id;
        const matched = data.find((s) => s.id === targetId) || data[0];
        setActiveSession(matched);
        setCounterPrice(matched.current_buyer_offer || 41.5);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSendCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const priceNum = Number(counterPrice);
      const leadNum = Number(counterLead);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Please enter a valid counter price');
      }
      if (isNaN(leadNum) || leadNum <= 0) {
        throw new Error('Please enter valid lead days');
      }

      const msg =
        customMsg.trim() ||
        `We submit a formal counteroffer of $${priceNum.toFixed(2)}/unit (${leadNum}d lead time) based on guaranteed volume commitments.`;

      const updated = await api.counteroffer(activeSession.id, priceNum, leadNum, msg);
      setActiveSession(updated);
      setCustomMsg('');
      setFeedback({
        type: 'success',
        text: updated.agreement_reached
          ? `Agreement confirmed! Binding rate agreed at $${updated.final_price}/unit (${updated.final_lead_days}d lead).`
          : `Counteroffer submitted! Supplier responded with $${updated.current_supplier_offer}/unit in Round ${updated.current_round}.`,
      });
      await fetchSessions(activeSession.id);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: `Counteroffer submission error: ${err.message || 'Please check session status'}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Multi-Agent Negotiation Arena</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Automated multi-round bargaining between Buyer Agent and Supplier Agent bounded by enterprise budget thresholds.
          </p>
        </div>
        <button
          onClick={() => fetchSessions()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d2b0bd] bg-white hover:bg-[#fdf2f8] text-xs font-semibold text-[#8e3a59] transition shadow-2xs self-start"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Arena</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
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
        <div className="bg-white rounded-2xl p-4 border border-[#d2b0bd] shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
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
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  activeSession?.id === s.id
                    ? 'bg-[#fdf2f8] border-[#8e3a59] text-[#8e3a59] font-semibold shadow-2xs'
                    : 'bg-white border-[#e8d8de] text-slate-700 hover:border-[#d2b0bd]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{s.session_number}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="text-xs font-medium truncate text-slate-800">{s.supplier_name}</div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 pt-1 border-t border-[#f7eef3]">
                  <span>Round {s.current_round}/{s.max_rounds}</span>
                  <span className="font-bold text-emerald-700">${s.current_supplier_offer}/unit</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Negotiation Stage */}
        <div className="lg:col-span-3 space-y-4">
          {activeSession ? (
            <div className="bg-white rounded-2xl border border-[#d2b0bd] shadow-sm flex flex-col h-[650px] overflow-hidden">
              {/* Session Top Bar */}
              <div className="p-4 border-b border-[#e8d8de] bg-[#fdf2f8] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {activeSession.session_number}: {activeSession.supplier_name}
                    </h3>
                    <StatusBadge status={activeSession.status} />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Target Concession: <span className="text-[#8e3a59] font-bold">${activeSession.target_price}</span> • Current Offer: <span className="text-emerald-700 font-bold">${activeSession.current_supplier_offer}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium">
                  <div className="text-center px-3 py-1 rounded-xl bg-white border border-[#d2b0bd]">
                    <span className="text-[10px] text-slate-500 block uppercase">Round</span>
                    <span className="text-slate-900 font-bold">{activeSession.current_round} / {activeSession.max_rounds}</span>
                  </div>
                  <div className="text-center px-3 py-1 rounded-xl bg-white border border-[#d2b0bd]">
                    <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                    <span className={activeSession.agreement_reached ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {activeSession.agreement_reached ? '✓ AGREED' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agreement Achieved Banner */}
              {activeSession.agreement_reached && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between px-6 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Binding Agreement Confirmed at <strong>${activeSession.final_price}/unit</strong> ({activeSession.final_lead_days}d lead time).
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ready for PO
                  </span>
                </div>
              )}

              {/* Message History Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
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
                            ? 'bg-[#8e3a59] text-white shadow-sm'
                            : 'bg-white border border-[#d2b0bd] text-slate-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] opacity-90 pb-1 border-b border-black/10">
                          <span className="font-bold">{m.sender_name}</span>
                          <span>Round {m.round_number}</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-base font-extrabold tracking-tight">
                            ${m.offered_price.toFixed(2)}/unit
                          </span>
                          <span className="text-[11px] opacity-90 font-medium">{m.offered_lead_days} days lead</span>
                        </div>
                        <p className="text-xs opacity-95">{m.message}</p>

                        {m.ai_suggestion && (
                          <div
                            className={`p-2 rounded-xl text-[11px] flex items-start gap-1.5 ${
                              isBuyer
                                ? 'bg-black/15 text-pink-100'
                                : 'bg-[#fdf2f8] border border-[#e8d8de] text-[#8e3a59]'
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
              </div>

              {/* Action / Counteroffer Bar */}
              <div className="p-4 border-t border-[#e8d8de] bg-white space-y-3">
                <form onSubmit={handleSendCounter} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="w-full sm:w-1/3">
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                        Buyer Counter Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#d2b0bd] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59] font-bold"
                        required
                      />
                    </div>
                    <div className="w-full sm:w-1/3">
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                        Requested Lead (Days)
                      </label>
                      <input
                        type="number"
                        value={counterLead}
                        onChange={(e) => setCounterLead(parseInt(e.target.value) || 1)}
                        min={1}
                        className="w-full bg-white border border-[#d2b0bd] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                        required
                      />
                    </div>
                    <div className="w-full sm:w-1/3 flex items-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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
                      className="w-full bg-[#fdf2f8] border border-[#e8d8de] rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#8e3a59]"
                    />
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-[#d2b0bd]">
              Select or initiate a negotiation session to launch multi-agent counteroffers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
