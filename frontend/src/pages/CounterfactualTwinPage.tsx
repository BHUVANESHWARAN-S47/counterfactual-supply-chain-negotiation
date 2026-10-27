import React, { useState, useEffect } from 'react';
import { SimulationRun, ScenarioResult, ProcurementRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import {
  Cpu,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Award,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

interface CounterfactualTwinPageProps {
  initialProcId?: number;
  onNavigateToOrders?: () => void;
}

export const CounterfactualTwinPage: React.FC<CounterfactualTwinPageProps> = ({
  initialProcId,
  onNavigateToOrders,
}) => {
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [selectedProcId, setSelectedProcId] = useState<number>(initialProcId || 1);
  const [simulation, setSimulation] = useState<SimulationRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Simulation Parameters
  const [delayDays, setDelayDays] = useState<number>(4);
  const [demandSurgePct, setDemandSurgePct] = useState<number>(20);
  const [negotiatedDiscountPct, setNegotiatedDiscountPct] = useState<number>(8);

  // Approval Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<any | null>(null);

  const fetchSimData = async (procId: number) => {
    try {
      const runs = await api.getSimulations(procId);
      if (runs.length > 0) {
        setSimulation(runs[0]);
      } else {
        const newRun = await api.runSimulation({ procurement_request_id: procId });
        setSimulation(newRun);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const prList = await api.getProcurementRequests();
        setProcurements(prList);
        const targetId = initialProcId || (prList.length > 0 ? prList[0].id : 1);
        setSelectedProcId(targetId);
        await fetchSimData(targetId);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [initialProcId]);

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const run = await api.runSimulation({
        procurement_request_id: selectedProcId,
        delay_days: delayDays,
        demand_variation_pct: demandSurgePct,
        negotiated_discount_pct: negotiatedDiscountPct,
      });
      setSimulation(run);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleApproveSupplier = async () => {
    if (!simulation || simulation.scenarios.length === 0) return;
    setApproving(true);
    try {
      const targetScenario = simulation.scenarios[0];
      const res = await api.approveSupplier({
        procurement_request_id: selectedProcId,
        supplier_id: targetScenario.supplier_id || 1,
        selected_unit_price: targetScenario.unit_price,
        quantity: targetScenario.quantity,
        lead_time_days: targetScenario.lead_time_days,
        notes: `Approved following CNT recommendation (${simulation.recommendation})`,
      });
      setApprovalSuccess(res);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setApproving(false);
    }
  };

  const costChartData =
    simulation?.scenarios.map((s) => ({
      name: s.scenario_name.split(':')[0],
      procurement: s.procurement_cost,
      freight: s.transportation_cost,
      production: s.production_cost,
      total: s.total_cost,
      margin: s.profit_margin_pct,
    })) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">
              Counterfactual Negotiation Twin (CNT)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF]">
              Digital Twin Runtime
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Simulate alternative supplier agreements, logistics bottlenecks, and counteroffer outcomes before commitment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProcId}
            onChange={(e) => {
              const pid = Number(e.target.value);
              setSelectedProcId(pid);
              fetchSimData(pid);
            }}
            className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#2563EB] font-semibold"
          >
            {procurements.map((p) => (
              <option key={p.id} value={p.id}>
                {p.request_number} — {p.product_name || `PR #${p.id}`} ({p.shortage_quantity} units)
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowApprovalModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Award className="h-4 w-4" />
            <span>Approve Supplier</span>
          </button>
        </div>
      </div>

      {/* Adaptive Decision Card */}
      {simulation && (
        <div className="rounded-2xl p-6 border border-[#E5E7EB] bg-white shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                CNT Adaptive Decision Recommendation
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black px-4 py-1 rounded-xl bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF]">
                  RECOMMENDATION: {simulation.recommendation}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  Confidence: {(simulation.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#9CA3AF]">Simulation Run ID:</span>
              <span className="font-bold text-[#111827] block text-xs">{simulation.run_number}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#F3F4F6] text-xs">
            <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
              <h4 className="font-bold text-[#111827] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Mathematical Justification
              </h4>
              <p className="text-[#4B5563] leading-relaxed text-[11px]">{simulation.justification}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
              <h4 className="font-bold text-[#111827] mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#F59E0B]" /> Evaluated Trade-Offs
              </h4>
              <p className="text-[#4B5563] leading-relaxed text-[11px]">{simulation.trade_offs}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB]">
              <h4 className="font-bold text-[#111827] mb-1 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-[#7C3AED]" /> Customer Impact Assessment
              </h4>
              <p className="text-[#4B5563] leading-relaxed text-[11px]">
                {simulation.customer_impact_summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scenario Parameter Controls */}
      <div className="rounded-2xl p-5 border border-[#E5E7EB] bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
          <Sliders className="h-4 w-4 text-[#7C3AED]" />
          <span>Interactive Stress-Test Parameters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#4B5563] font-semibold">Delay Stress:</span>
            <select
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-[#111827] font-semibold"
            >
              <option value={2}>+2 Days</option>
              <option value={4}>+4 Days (Transit Jam)</option>
              <option value={7}>+7 Days (Port Strike)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#4B5563] font-semibold">Demand Surge:</span>
            <select
              value={demandSurgePct}
              onChange={(e) => setDemandSurgePct(Number(e.target.value))}
              className="bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-[#111827] font-semibold"
            >
              <option value={10}>+10% Surge</option>
              <option value={20}>+20% Surge</option>
              <option value={35}>+35% Surge</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#4B5563] font-semibold">Counteroffer Target:</span>
            <select
              value={negotiatedDiscountPct}
              onChange={(e) => setNegotiatedDiscountPct(Number(e.target.value))}
              className="bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-[#111827] font-semibold"
            >
              <option value={5}>5% Discount</option>
              <option value={8}>8% Target Discount</option>
              <option value={12}>12% Aggressive Discount</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Simulating 1,000 Trials...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {simulation?.scenarios.map((sc, idx) => {
          const isRecommended = sc.decision_mode === simulation.recommendation;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isRecommended
                  ? 'border-[#7C3AED] bg-[#FAF5FF] shadow-sm ring-1 ring-[#7C3AED]'
                  : 'border-[#E5E7EB] bg-white shadow-xs hover:border-[#D1D5DB]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Scenario {idx + 1}
                  </span>
                  {isRecommended && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#7C3AED] text-white">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-[#111827] text-sm mb-1">{sc.scenario_name}</h3>
                <p className="text-[11px] text-[#2563EB] font-bold mb-3">{sc.supplier_name}</p>

                <div className="space-y-2 py-3 border-y border-[#F3F4F6] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Negotiated Unit Rate:</span>
                    <span className="font-bold text-[#111827]">${sc.unit_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Total Projected Cost:</span>
                    <span className="font-extrabold text-[#111827]">${sc.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Lead Time:</span>
                    <span className="font-semibold text-[#111827]">{sc.lead_time_days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Profit Margin:</span>
                    <span className="font-bold text-[#10B981]">{sc.profit_margin_pct}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Disruption Risk Score:</span>
                    <span
                      className={`font-bold ${
                        sc.risk_score > 0.3 ? 'text-[#EF4444]' : 'text-[#10B981]'
                      }`}
                    >
                      {(sc.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <p className="text-[11px] text-[#4B5563] italic leading-snug">
                  {sc.trade_off_notes}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
          <h3 className="text-sm font-bold text-[#111827] mb-1">Total Estimated Cost by Scenario</h3>
          <p className="text-xs text-[#6B7280] mb-4">
            Component breakdown: Procurement Cost + Freight Logistics + Production Assembly
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="procurement" stackId="a" fill="#2563EB" name="Procurement ($)" />
                <Bar dataKey="freight" stackId="a" fill="#7C3AED" name="Freight ($)" />
                <Bar dataKey="production" stackId="a" fill="#10B981" name="Production ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
          <h3 className="text-sm font-bold text-[#111827] mb-1">Projected Profit Margin % Comparison</h3>
          <p className="text-xs text-[#6B7280] mb-4">
            Margin expansion under price concession and surge volume
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, 80]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="margin" fill="#2563EB" name="Profit Margin (%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Supplier Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-4">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Award className="h-5 w-5 text-[#10B981]" />
                Authorize Supplier Agreement & Issue PO
              </h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F3F4F6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {approvalSuccess ? (
              <div className="space-y-4 text-xs text-[#111827]">
                <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-[#10B981] flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950">Purchase Order Successfully Issued!</h4>
                    <p className="mt-1">
                      Purchase Order <strong>{approvalSuccess.po_number}</strong> created with total volume of ${approvalSuccess.total_amount}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white font-bold cursor-pointer"
                >
                  Close & Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-[#4B5563] leading-relaxed">
                  You are authorizing the <strong>{simulation?.recommendation}</strong> action recommended by the Counterfactual Negotiation Twin.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveSupplier}
                    disabled={approving}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {approving ? 'Issuing PO...' : 'Confirm Authorization'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
