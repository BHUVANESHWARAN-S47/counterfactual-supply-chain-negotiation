import React, { useState, useEffect } from 'react';
import { Quotation, ProcurementRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { FileText, Trophy, Plus, ArrowRight, Cpu, MessagesSquare, CheckCircle, BarChart2 } from 'lucide-react';

interface QuotationsPageProps {
  onNavigateToNegotiation?: (procId: number, supId: number) => void;
  onNavigateToCNT?: (procId: number) => void;
}

export const QuotationsPage: React.FC<QuotationsPageProps> = ({
  onNavigateToNegotiation,
  onNavigateToCNT,
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [selectedProcId, setSelectedProcId] = useState<number | undefined>(undefined);
  const [comparisonModal, setComparisonModal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const [qData, prData] = await Promise.all([
        api.getQuotations(selectedProcId),
        api.getProcurementRequests(),
      ]);
      setQuotations(qData);
      setProcurements(prData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [selectedProcId]);

  const handleOpenComparison = async (procId: number) => {
    try {
      const compData = await api.compareQuotations(procId);
      setComparisonModal(compData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Supplier Quotations & Multi-Criteria Ranking</h2>
          <p className="text-xs text-slate-400">
            Automated ranking using normalized weighted scoring: Price (30%), Lead Time (20%), Quality (20%), Reliability (15%), Risk (15%).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProcId || ''}
            onChange={(e) => setSelectedProcId(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Procurement Requisitions</option>
            {procurements.map((p) => (
              <option key={p.id} value={p.id}>
                {p.request_number} ({p.product_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotations Ranking Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            Ranked Candidate Quotations
          </h3>
          <span className="text-xs text-slate-500">{quotations.length} Quotations Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-center">Rank</th>
                <th className="py-3 px-4 font-semibold">Quote ID</th>
                <th className="py-3 px-4 font-semibold">Supplier Name</th>
                <th className="py-3 px-4 font-semibold text-right">Offered Unit Price</th>
                <th className="py-3 px-4 font-semibold text-right">Offered Qty</th>
                <th className="py-3 px-4 font-semibold text-right">Lead Days</th>
                <th className="py-3 px-4 font-semibold text-center">Quality</th>
                <th className="py-3 px-4 font-semibold text-center">Reliability</th>
                <th className="py-3 px-4 font-semibold text-center">Disruption Risk</th>
                <th className="py-3 px-4 font-semibold text-center text-blue-400">Total Score</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-bold text-xs ${
                        q.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : q.rank === 2
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {q.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{q.quotation_number}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{q.supplier_name}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-base text-emerald-400">
                    ${q.unit_price.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                    {q.offered_quantity} units
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                    {q.delivery_lead_days} days
                  </td>
                  <td className="py-3.5 px-4 text-center text-amber-300 font-semibold">
                    ★ {q.quality_rating.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold">
                    {(q.reliability_score * 100).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                    {(q.risk_score * 100).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-extrabold text-blue-400 text-sm">
                      {q.total_score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500"> / 100</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenComparison(q.procurement_request_id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
                        title="View Score Breakdown"
                      >
                        <BarChart2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          onNavigateToNegotiation &&
                          onNavigateToNegotiation(q.procurement_request_id, q.supplier_id)
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                      >
                        Negotiate
                      </button>
                      <button
                        onClick={() =>
                          onNavigateToCNT && onNavigateToCNT(q.procurement_request_id)
                        }
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
                      >
                        Simulate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Breakdown Modal */}
      {comparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-blue-400" />
                  Multi-Criteria Scoring Weight Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Mathematical normalized breakdown for {comparisonModal.product_name} (Need: {comparisonModal.required_quantity} units)
                </p>
              </div>
              <button onClick={() => setComparisonModal(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {comparisonModal.comparison.map((c: any) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">
                      #{c.rank} {c.supplier_name}
                    </span>
                    <span className="font-extrabold text-blue-400 text-base">
                      {c.total_score} / 100
                    </span>
                  </div>

                  {c.score_breakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-slate-400 block">Price (30% weight):</span>
                        <span className="font-bold text-slate-200">{c.score_breakdown.price_score}%</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-slate-400 block">Lead Time (20% weight):</span>
                        <span className="font-bold text-slate-200">{c.score_breakdown.lead_time_score}%</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-slate-400 block">Quality (20% weight):</span>
                        <span className="font-bold text-slate-200">{c.score_breakdown.quality_score}%</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-slate-400 block">Reliability (15% weight):</span>
                        <span className="font-bold text-slate-200">{c.score_breakdown.reliability_score}%</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-slate-400 block">Risk Inversion (15% weight):</span>
                        <span className="font-bold text-slate-200">{c.score_breakdown.risk_score}%</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60">
                        <span className="text-slate-400 block">Capacity Compliance:</span>
                        <span className="font-bold text-emerald-400">{(c.score_breakdown.capacity_multiplier * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
