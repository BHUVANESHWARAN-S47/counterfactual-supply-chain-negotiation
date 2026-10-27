import React, { useState, useEffect } from 'react';
import { ProcurementRequest, Quotation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { Layers, ArrowRight, ShieldAlert, Cpu, FileText, Trophy, BarChart2, CheckCircle, MessagesSquare, X } from 'lucide-react';

interface ProcurementPageProps {
  onNavigateToCNT?: (procId: number) => void;
  onNavigateToNegotiation?: (procId: number, supId?: number) => void;
}

export const ProcurementPage: React.FC<ProcurementPageProps> = ({
  onNavigateToCNT,
  onNavigateToNegotiation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'quotations'>('requests');
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedProcId, setSelectedProcId] = useState<number | undefined>(undefined);
  const [comparisonModal, setComparisonModal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [prData, qData] = await Promise.all([
        api.getProcurementRequests(),
        api.getQuotations(selectedProcId),
      ]);
      setProcurements(prData);
      setQuotations(qData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Procurement Requisitions & Quotation Ranking
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Automated RFQ generation formulated by the Buyer Agent and multi-criteria quotation scoring.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#d2b0bd] shadow-2xs self-start">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-[#8e3a59] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-[#fdf2f8]'
            }`}
          >
            Procurement Requests ({procurements.length})
          </button>
          <button
            onClick={() => setActiveSubTab('quotations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'quotations'
                ? 'bg-[#8e3a59] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-[#fdf2f8]'
            }`}
          >
            Quotation Scorecards ({quotations.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'requests' ? (
        <div className="bg-white rounded-2xl border border-[#d2b0bd] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#e8d8de] bg-[#fdf2f8] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#8e3a59]" />
              Active Procurement Requests
            </h3>
            <span className="text-xs text-slate-500 font-medium">{procurements.length} Requisitions Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-[#fdf2f8] text-[11px] uppercase tracking-wider text-slate-600 border-b border-[#e8d8de]">
                <tr>
                  <th className="py-3 px-4 font-bold">PR Number</th>
                  <th className="py-3 px-4 font-bold">Related Order</th>
                  <th className="py-3 px-4 font-bold">Product Sourced</th>
                  <th className="py-3 px-4 font-bold text-right">Order Need</th>
                  <th className="py-3 px-4 font-bold text-right text-rose-700">Shortage to Buy</th>
                  <th className="py-3 px-4 font-bold">Required By</th>
                  <th className="py-3 px-4 font-bold text-right">Est. Budget</th>
                  <th className="py-3 px-4 font-bold text-center">Quotes</th>
                  <th className="py-3 px-4 font-bold text-center">Priority</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8d8de]">
                {procurements.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fdf2f8] transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.request_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {p.order_number || `Order #${p.order_id}`}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.product_name || `Product #${p.product_id}`}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">{p.required_quantity}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      {p.shortage_quantity}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.required_by_date ? new Date(p.required_by_date).toLocaleDateString() : 'ASAP'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ${p.estimated_budget ? p.estimated_budget.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-[#8e3a59] bg-[#fdf2f8] px-2 py-0.5 rounded border border-[#d2b0bd]">
                        {p.quotations_count || 0} Quotes
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.priority} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProcId(p.id);
                            setActiveSubTab('quotations');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#d2b0bd] text-[11px] font-semibold text-[#8e3a59] hover:bg-[#fdf2f8] transition cursor-pointer"
                        >
                          View Quotes
                        </button>
                        {onNavigateToCNT && (
                          <button
                            onClick={() => onNavigateToCNT(p.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8e3a59] text-[11px] font-bold text-white hover:bg-[#752d48] transition shadow-2xs cursor-pointer"
                          >
                            <Cpu className="h-3 w-3" />
                            <span>Simulate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quotations Scorecard View */}
          <div className="bg-white rounded-2xl border border-[#d2b0bd] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e8d8de] bg-[#fdf2f8] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#8e3a59]" />
                  Multi-Criteria Scoring & Ranking
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Normalized weights: Price (30%), Lead Time (20%), Quality (20%), Reliability (15%), Risk (15%).
                </p>
              </div>

              {selectedProcId && (
                <button
                  onClick={() => handleOpenComparison(selectedProcId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8e3a59] text-white text-xs font-bold hover:bg-[#752d48] shadow-xs transition cursor-pointer"
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>Compare Sourcing Scenarios</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-[#fdf2f8] text-[11px] uppercase tracking-wider text-slate-600 border-b border-[#e8d8de]">
                  <tr>
                    <th className="py-3 px-4 font-bold text-center">Rank</th>
                    <th className="py-3 px-4 font-bold">Quote #</th>
                    <th className="py-3 px-4 font-bold">Supplier</th>
                    <th className="py-3 px-4 font-bold text-right">Unit Price</th>
                    <th className="py-3 px-4 font-bold text-right">Lead Time</th>
                    <th className="py-3 px-4 font-bold text-right">Quality</th>
                    <th className="py-3 px-4 font-bold text-right">Reliability</th>
                    <th className="py-3 px-4 font-bold text-right">Disruption Risk</th>
                    <th className="py-3 px-4 font-bold text-center">MCDM Score</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8d8de]">
                  {quotations.map((q) => {
                    const isWinner = q.rank === 1;
                    return (
                      <tr
                        key={q.id}
                        className={`transition ${isWinner ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-[#fdf2f8]'}`}
                      >
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                              isWinner
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#e8d8de] text-slate-800'
                            }`}
                          >
                            {q.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{q.quotation_number}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {q.supplier_name || `Supplier #${q.supplier_id}`}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                          ${q.unit_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {q.delivery_lead_days} days
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-700">
                          {q.quality_rating.toFixed(1)}/5.0
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {(q.reliability_score * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-700">
                          {(q.risk_score * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-[#8e3a59] bg-[#fdf2f8] px-2.5 py-0.5 rounded-full border border-[#d2b0bd]">
                            {q.total_score.toFixed(1)} / 100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onNavigateToNegotiation && (
                              <button
                                onClick={() => onNavigateToNegotiation(q.procurement_request_id, q.supplier_id)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-[#d2b0bd] hover:bg-[#fdf2f8] text-[11px] font-semibold text-[#8e3a59] transition cursor-pointer"
                              >
                                Negotiate
                              </button>
                            )}
                            {onNavigateToCNT && (
                              <button
                                onClick={() => onNavigateToCNT(q.procurement_request_id)}
                                className="px-2.5 py-1 rounded-lg bg-[#8e3a59] text-white hover:bg-[#752d48] text-[11px] font-bold transition shadow-2xs cursor-pointer"
                              >
                                Twin Sim
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {comparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#d2b0bd] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8d8de] pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Quotation Comparison: {comparisonModal.procurement_request?.request_number}
              </h3>
              <button
                onClick={() => setComparisonModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#fdf2f8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#fdf2f8] border border-[#d2b0bd] text-slate-800">
                <span className="font-bold text-[#8e3a59] block mb-1">Recommendation:</span>
                Award to <strong>{comparisonModal.recommended_supplier?.name}</strong>. Achieved top score of{' '}
                <strong>{comparisonModal.recommended_score?.toFixed(1)}</strong> based on balanced price, lead time, and risk profile.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
