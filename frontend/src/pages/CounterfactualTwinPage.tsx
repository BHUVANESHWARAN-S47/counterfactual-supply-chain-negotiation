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
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Counterfactual Negotiation Twin (CNT)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fdf2f8] text-[#8e3a59] border border-[#d2b0bd]">
              Digital Twin Runtime
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
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
            className="bg-white border border-[#d2b0bd] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59] font-semibold"
          >
            {procurements.map((p) => (
              <option key={p.id} value={p.id}>
                {p.request_number} — {p.product_name || `PR #${p.id}`} ({p.shortage_quantity} units)
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowApprovalModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Award className="h-4 w-4" />
            <span>Approve Supplier</span>
          </button>
        </div>
      </div>

      {/* Adaptive Decision Card */}
      {simulation && (
        <div className="rounded-2xl p-6 border border-[#d2b0bd] bg-white shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                CNT Adaptive Decision Recommendation
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black px-4 py-1 rounded-xl bg-[#fdf2f8] text-[#8e3a59] border border-[#d2b0bd]">
                  RECOMMENDATION: {simulation.recommendation}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Confidence: {(simulation.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500">Simulation Run ID:</span>
              <span className="font-bold text-slate-900 block text-xs">{simulation.run_number}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#e8d8de] text-xs">
            <div className="p-3.5 rounded-xl bg-[#fdf2f8] border border-[#d2b0bd]">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Mathematical Justification
              </h4>
              <p className="text-slate-700 leading-relaxed text-[11px]">{simulation.justification}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fdf2f8] border border-[#d2b0bd]">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Evaluated Trade-Offs
              </h4>
              <p className="text-slate-700 leading-relaxed text-[11px]">{simulation.trade_offs}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fdf2f8] border border-[#d2b0bd]">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-[#8e3a59]" /> Customer Impact Assessment
              </h4>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {simulation.customer_impact_summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scenario Parameter Controls */}
      <div className="rounded-2xl p-5 border border-[#d2b0bd] bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Sliders className="h-4 w-4 text-[#8e3a59]" />
          <span>Interactive Stress-Test Parameters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Delay Stress:</span>
            <select
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="bg-white border border-[#d2b0bd] rounded-lg px-2.5 py-1 text-slate-900 font-semibold"
            >
              <option value={2}>+2 Days</option>
              <option value={4}>+4 Days (Transit Jam)</option>
              <option value={7}>+7 Days (Port Strike)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Demand Surge:</span>
            <select
              value={demandSurgePct}
              onChange={(e) => setDemandSurgePct(Number(e.target.value))}
              className="bg-white border border-[#d2b0bd] rounded-lg px-2.5 py-1 text-slate-900 font-semibold"
            >
              <option value={10}>+10% Surge</option>
              <option value={20}>+20% Surge</option>
              <option value={35}>+35% Surge</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Counteroffer Target:</span>
            <select
              value={negotiatedDiscountPct}
              onChange={(e) => setNegotiatedDiscountPct(Number(e.target.value))}
              className="bg-white border border-[#d2b0bd] rounded-lg px-2.5 py-1 text-slate-900 font-semibold"
            >
              <option value={5}>5% Discount</option>
              <option value={8}>8% Target Discount</option>
              <option value={12}>12% Aggressive Discount</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white font-bold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Simulating...' : 'Re-Run CNT'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <div className="bg-white rounded-2xl border border-[#d2b0bd] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#e8d8de] bg-[#fdf2f8] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#8e3a59]" />
            Counterfactual Agreement Comparison Matrix
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {simulation?.scenarios.length || 0} Simulated Agreement Scenarios
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-[#fdf2f8] text-[11px] uppercase tracking-wider text-slate-600 border-b border-[#e8d8de]">
              <tr>
                <th className="py-3 px-4 font-bold">Scenario Name</th>
                <th className="py-3 px-4 font-bold">Supplier</th>
                <th className="py-3 px-4 font-bold text-right">Offered Unit</th>
                <th className="py-3 px-4 font-bold text-right">Total Est. Cost</th>
                <th className="py-3 px-4 font-bold text-right">Lead Days</th>
                <th className="py-3 px-4 font-bold text-center">Deadline Variance</th>
                <th className="py-3 px-4 font-bold text-center">Schedule Feasible</th>
                <th className="py-3 px-4 font-bold text-right">Est. Profit</th>
                <th className="py-3 px-4 font-bold text-right text-emerald-700">Profit Margin</th>
                <th className="py-3 px-4 font-bold text-center">Decision Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8d8de]">
              {simulation?.scenarios.map((sc, idx) => (
                <tr key={idx} className="hover:bg-[#fdf2f8] transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sc.scenario_name}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{sc.supplier_name}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-semibold">
                    ${sc.unit_price.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                    ${sc.total_cost.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-700 font-medium">{sc.lead_time_days}d</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-bold ${
                        sc.deadline_variance_days <= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {sc.deadline_variance_days <= 0
                        ? `${Math.abs(sc.deadline_variance_days)}d early`
                        : `+${sc.deadline_variance_days}d LATE`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sc.feasibility
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {sc.feasibility ? '✓ FEASIBLE' : '✕ INFEASIBLE'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 font-mono">
                    ${sc.estimated_profit.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700 text-sm">
                    {sc.profit_margin_pct}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={sc.decision_mode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#d2b0bd] shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Total Estimated Cost by Scenario</h3>
          <p className="text-xs text-slate-500 mb-4">
            Component breakdown: Procurement Cost + Freight Logistics + Production Assembly
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#7b6671', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#7b6671', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d2b0bd', borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="procurement" stackId="a" fill="#8e3a59" name="Procurement ($)" />
                <Bar dataKey="freight" stackId="a" fill="#bb899b" name="Freight ($)" />
                <Bar dataKey="production" stackId="a" fill="#16a34a" name="Production ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#d2b0bd] shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Projected Profit Margin % Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">
            Margin expansion under price concession and surge volume
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#7b6671', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#7b6671', fontSize: 11 }} domain={[0, 80]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d2b0bd', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="margin" fill="#8e3a59" name="Profit Margin (%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Supplier Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-[#d2b0bd] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8d8de] mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                Authorize Supplier Agreement & Issue PO
              </h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#fdf2f8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {approvalSuccess ? (
              <div className="space-y-4 text-xs text-slate-800">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950">Purchase Order Successfully Issued!</h4>
                    <p className="mt-1">
                      Purchase Order <strong>{approvalSuccess.po_number}</strong> created with total volume of ${approvalSuccess.total_amount}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#8e3a59] text-white font-bold"
                >
                  Close & Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  You are authorizing the <strong>{simulation?.recommendation}</strong> action recommended by the Counterfactual Negotiation Twin.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#d2b0bd] text-slate-700 hover:bg-[#fdf2f8]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveSupplier}
                    disabled={approving}
                    className="px-5 py-2 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white font-bold disabled:opacity-50"
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
