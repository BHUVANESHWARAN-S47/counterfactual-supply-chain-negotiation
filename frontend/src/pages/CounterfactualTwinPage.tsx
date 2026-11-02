import React, { useState, useEffect } from 'react';
import { SimulationRun, ScenarioResult, ProcurementRequest } from '../types';
import { api } from '../services/api';
import { formatINR, formatINRUnit } from '../utils/currency';
import {
  Cpu,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Award,
  X,
  Layers,
  ArrowUpDown,
  Gauge,
  HelpCircle,
  Zap,
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

  // Dynamic Interactive Stress-Test Parameters (Continuous & Flexible)
  const [delayDays, setDelayDays] = useState<number>(4);
  const [demandSurgePct, setDemandSurgePct] = useState<number>(20);
  const [negotiatedDiscountPct, setNegotiatedDiscountPct] = useState<number>(8);

  // User-Selected Decision override (Retain, Negotiate, or Switch)
  const [selectedDecision, setSelectedDecision] = useState<'RETAIN' | 'NEGOTIATE' | 'SWITCH' | null>(null);

  // Approval Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<any | null>(null);

  const fetchSimData = async (procId: number) => {
    try {
      const runs = await api.getSimulations(procId);
      if (runs.length > 0) {
        setSimulation(runs[0]);
        setSelectedDecision(runs[0].recommendation as any);
      } else {
        const newRun = await api.runSimulation({ procurement_request_id: procId });
        setSimulation(newRun);
        setSelectedDecision(newRun.recommendation as any);
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

  const handleRunSimulation = async (customParams?: { delay?: number; surge?: number; discount?: number }) => {
    setSimulating(true);
    const d = customParams?.delay ?? delayDays;
    const s = customParams?.surge ?? demandSurgePct;
    const disc = customParams?.discount ?? negotiatedDiscountPct;

    try {
      const run = await api.runSimulation({
        procurement_request_id: selectedProcId,
        delay_days: d,
        demand_variation_pct: s,
        negotiated_discount_pct: disc,
      });
      setSimulation(run);
      setSelectedDecision(run.recommendation as any);
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
      // Find matching scenario based on user selection or recommendation
      const activeDecisionMode = selectedDecision || simulation.recommendation;
      const matchedScenario =
        simulation.scenarios.find((sc) => sc.decision_mode === activeDecisionMode) ||
        simulation.scenarios[0];

      const res = await api.approveSupplier({
        procurement_request_id: selectedProcId,
        supplier_id: matchedScenario.supplier_id || 1,
        selected_unit_price: matchedScenario.unit_price,
        quantity: matchedScenario.quantity,
        lead_time_days: matchedScenario.lead_time_days,
        notes: `Authorized under CNT Decision: ${activeDecisionMode} (${matchedScenario.scenario_name})`,
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
      name: s.scenario_name.split(':')[0].replace('Counterfactual', 'Counterfactual').replace('Disruption Stress-Test', 'Stress-Test'),
      procurement: s.procurement_cost,
      freight: s.transportation_cost,
      production: s.production_cost,
      total: s.total_cost,
      margin: s.profit_margin_pct,
      leadTime: s.lead_time_days,
    })) || [];

  const currentActiveScenario =
    simulation?.scenarios.find((s) => s.decision_mode === (selectedDecision || simulation?.recommendation)) ||
    simulation?.scenarios[0];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Requisition Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">
              Supplier Comparison & Decision Tool
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D5FF]">
              Supplier Comparison
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Compare alternative supplier options, delivery times, and price negotiations in Indian Rupee (₹).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-[#4B5563]">Target Requisition:</label>
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
        </div>
      </div>

      {/* 2. Dynamic Stress-Test Parameter Controller (Fully dynamic sliders & inputs, not a fixed static matrix) */}
      <div className="rounded-2xl p-5 border border-[#E5E7EB] bg-white shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#F3E8FF] text-[#7C3AED]">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111827]">
                Dynamic Stress-Test & Simulation Parameters
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Adjust continuous sliders or type custom stress values to test resilience before commitment.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider mr-1">Presets:</span>
            <button
              onClick={() => {
                setDelayDays(2);
                setDemandSurgePct(10);
                setNegotiatedDiscountPct(5);
                handleRunSimulation({ delay: 2, surge: 10, discount: 5 });
              }}
              className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] font-semibold transition cursor-pointer"
            >
              Mild
            </button>
            <button
              onClick={() => {
                setDelayDays(4);
                setDemandSurgePct(20);
                setNegotiatedDiscountPct(8);
                handleRunSimulation({ delay: 4, surge: 20, discount: 8 });
              }}
              className="px-2.5 py-1 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB] font-bold transition cursor-pointer"
            >
              Port Jam (+4d)
            </button>
            <button
              onClick={() => {
                setDelayDays(7);
                setDemandSurgePct(35);
                setNegotiatedDiscountPct(12);
                handleRunSimulation({ delay: 7, surge: 35, discount: 12 });
              }}
              className="px-2.5 py-1 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C] font-bold transition cursor-pointer"
            >
              Port Strike (+7d)
            </button>
            <button
              onClick={() => {
                setDelayDays(14);
                setDemandSurgePct(50);
                setNegotiatedDiscountPct(15);
                handleRunSimulation({ delay: 14, surge: 50, discount: 15 });
              }}
              className="px-2.5 py-1 rounded-lg border border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48] font-bold transition cursor-pointer"
            >
              Severe Crisis (+14d)
            </button>
          </div>
        </div>

        {/* Sliders & Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Delay Stress */}
          <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#374151] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
                Logistics & Port Delay:
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={delayDays}
                  onChange={(e) => setDelayDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-14 px-2 py-0.5 text-center font-bold bg-white border border-[#D1D5DB] rounded-md text-[#111827]"
                />
                <span className="font-bold text-[#111827]">Days</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={21}
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value))}
              className="w-full accent-[#F59E0B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>0d (On Time)</span>
              <span>+7d (Standard Delay)</span>
              <span>+21d (Severe Disruption)</span>
            </div>
          </div>

          {/* Demand Surge */}
          <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#374151] flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[#2563EB]" />
                Demand Surge Volume:
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={-20}
                  max={100}
                  value={demandSurgePct}
                  onChange={(e) => setDemandSurgePct(parseInt(e.target.value) || 0)}
                  className="w-14 px-2 py-0.5 text-center font-bold bg-white border border-[#D1D5DB] rounded-md text-[#111827]"
                />
                <span className="font-bold text-[#111827]">%</span>
              </div>
            </div>
            <input
              type="range"
              min={-20}
              max={100}
              value={demandSurgePct}
              onChange={(e) => setDemandSurgePct(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>-20% (Drop)</span>
              <span>+20% (Typical Surge)</span>
              <span>+100% (2x Volume)</span>
            </div>
          </div>

          {/* Counteroffer Target */}
          <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#374151] flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#7C3AED]" />
                Target Discount Concession:
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={negotiatedDiscountPct}
                  onChange={(e) => setNegotiatedDiscountPct(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-14 px-2 py-0.5 text-center font-bold bg-white border border-[#D1D5DB] rounded-md text-[#111827]"
                />
                <span className="font-bold text-[#111827]">%</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              value={negotiatedDiscountPct}
              onChange={(e) => setNegotiatedDiscountPct(parseInt(e.target.value))}
              className="w-full accent-[#7C3AED] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>0% (List Price)</span>
              <span>8% (Recommended)</span>
              <span>25% (Aggressive)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleRunSimulation()}
            disabled={simulating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Simulating Dynamic Scenarios...' : 'Run Simulation with Custom Parameters'}</span>
          </button>
        </div>
      </div>

      {/* 3. VISUAL ANALYTICS CHARTS / PLOTS (PLACED ON TOP AS REQUESTED: "in cnt modelue the plot should be abouve") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <BarChart className="h-4 w-4 text-[#2563EB]" />
            <span>Counterfactual Visual Simulation Analytics (₹ INR)</span>
          </h3>
          <span className="text-[11px] text-[#6B7280]">
            Comparing 5 Digital Twin Trajectories
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Total Cost Component Breakdown in ₹ */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Total Cost Breakdown by Scenario (₹)</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Procurement + Freight Logistics + Production Assembly
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB]">
                Currency: INR (₹)
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: 12,
                      fontSize: 11,
                      color: '#ffffff',
                    }}
                    formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="procurement" stackId="a" fill="#2563EB" name="Procurement (₹)" />
                  <Bar dataKey="freight" stackId="a" fill="#7C3AED" name="Freight (₹)" />
                  <Bar dataKey="production" stackId="a" fill="#10B981" name="Production (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Profit Margin % & Delivery Lead-Time Variance */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Projected Profit Margin & Schedule Variance</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Margin expansion vs Disruption buffer (Lead time in days)
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#065F46]">
                Target: &gt; 55%
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                    domain={[0, 80]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: 12,
                      fontSize: 11,
                      color: '#ffffff',
                    }}
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="margin" fill="#10B981" name="Profit Margin (%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SCENARIOS MATRIX (PLACED AFTER / BELOW THE GRAPH AS REQUESTED: "and then sinario la apram show aaaganaum") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#7C3AED]" />
            <span>Evaluated Counterfactual Candidate Scenarios</span>
          </h3>
          <span className="text-[11px] text-[#6B7280]">
            Review dynamic cost, risk, and timeline metrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {simulation?.scenarios.map((sc, idx) => {
            const isAiRecommended = sc.decision_mode === simulation.recommendation;
            const isUserSelected = selectedDecision === sc.decision_mode;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDecision(sc.decision_mode as any)}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between cursor-pointer ${
                  isUserSelected
                    ? 'border-[#7C3AED] bg-[#FAF5FF] shadow-md ring-2 ring-[#7C3AED]'
                    : isAiRecommended
                    ? 'border-[#7C3AED]/40 bg-[#FAF5FF]/50 shadow-xs'
                    : 'border-[#E5E7EB] bg-white shadow-xs hover:border-[#D1D5DB]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Scenario {idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isAiRecommended && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#7C3AED] text-white">
                          AI CHOICE
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sc.decision_mode === 'RETAIN'
                          ? 'bg-blue-100 text-blue-800'
                          : sc.decision_mode === 'NEGOTIATE'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sc.decision_mode}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-[#111827] text-sm mb-1">{sc.scenario_name}</h3>
                  <p className="text-[11px] text-[#2563EB] font-bold mb-3">{sc.supplier_name}</p>

                  <div className="space-y-2 py-3 border-y border-[#F3F4F6] text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B7280]">Unit Rate:</span>
                      <span className="font-bold text-[#111827]">{formatINRUnit(sc.unit_price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B7280]">Total Projected Cost:</span>
                      <span className="font-extrabold text-[#111827]">{formatINR(sc.total_cost)}</span>
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
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#7C3AED]">
                      {isUserSelected ? '✓ Selected Strategy' : 'Click to Select'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#7C3AED]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SUGGESTION TO RETAIN / NEGOTIATE / SWITCH & FINAL ACTION AT LAST OF CNT PAGE
          (AS REQUESTED: "then give a suggestion to retain or negaitaote or swith that should at last select in the last of cnt page") */}
      {simulation && (
        <div className="rounded-3xl p-6 sm:p-8 border-2 border-[#7C3AED]/30 bg-gradient-to-br from-white via-[#FAF5FF] to-white shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-lg bg-[#7C3AED] text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#7C3AED]">
                  CNT Adaptive Intelligence Recommendation
                </span>
              </div>
              <h3 className="text-xl font-black text-[#111827]">
                Executive Strategy: AI Recommends{' '}
                <span className="underline decoration-[#7C3AED] underline-offset-4">
                  {simulation.recommendation}
                </span>
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Calibrated across 1,000 Monte Carlo iterations and disruption stress tests.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-[#9CA3AF] block font-bold uppercase">Confidence Score</span>
                <span className="text-lg font-black text-[#065F46] px-3 py-1 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] inline-block">
                  {(simulation.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Justification & Trade-offs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs">
              <h4 className="font-bold text-[#111827] mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Mathematical Justification
              </h4>
              <p className="text-[#4B5563] leading-relaxed text-[11px]">{simulation.justification}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs">
              <h4 className="font-bold text-[#111827] mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#F59E0B]" /> Evaluated Trade-Offs
              </h4>
              <p className="text-[#4B5563] leading-relaxed text-[11px]">{simulation.trade_offs}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs">
              <h4 className="font-bold text-[#111827] mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-[#7C3AED]" /> Customer Impact Assessment
              </h4>
              <p className="text-[#4B5563] leading-relaxed text-[11px]">
                {simulation.customer_impact_summary}
              </p>
            </div>
          </div>

          {/* Interactive Decision Selector Pills: Select RETAIN / NEGOTIATE / SWITCH */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#111827] flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-[#7C3AED]" />
                Select Strategic Action to Authorize:
              </label>
              <span className="text-[11px] text-[#6B7280]">
                Currently Selected: <strong className="text-[#7C3AED] font-bold">{selectedDecision || simulation.recommendation}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedDecision('RETAIN')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  (selectedDecision || simulation.recommendation) === 'RETAIN'
                    ? 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-[#2563EB]/40 shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#111827]">RETAIN Incumbent</span>
                  {simulation.recommendation === 'RETAIN' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      AI Suggested
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Continue with primary verified vendor to protect schedule integrity and zero switching risk.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision('NEGOTIATE')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  (selectedDecision || simulation.recommendation) === 'NEGOTIATE'
                    ? 'border-[#7C3AED] bg-[#FAF5FF] ring-2 ring-[#7C3AED]/40 shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#111827]">NEGOTIATE Concessions</span>
                  {simulation.recommendation === 'NEGOTIATE' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                      AI Suggested
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Trigger AI bargaining to extract {negotiatedDiscountPct}% price concession before contract signing.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision('SWITCH')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  (selectedDecision || simulation.recommendation) === 'SWITCH'
                    ? 'border-[#10B981] bg-[#ECFDF5] ring-2 ring-[#10B981]/40 shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#111827]">SWITCH Challenger</span>
                  {simulation.recommendation === 'SWITCH' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      AI Suggested
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Pivot to alternative challenger offering lower overall cost and expanded capacity.
                </p>
              </button>
            </div>

            {/* Authorize Button at the very bottom */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F3F4F6]">
              <div className="text-xs text-[#4B5563]">
                Authorizing will transition the procurement request and generate a purchase order for the chosen scenario.
              </div>
              <button
                onClick={() => setShowApprovalModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Award className="h-4 w-4" />
                <span>Authorize & Approve {selectedDecision || simulation.recommendation} Supplier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. HIGH-CONTRAST DARK SLEEK APPROVAL MODAL (Fixes the ugly white screen bug reported by the user) */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Authorize Supplier Agreement & Issue PO
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Counterfactual Negotiation Twin (CNT) Authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {approvalSuccess ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <h4 className="font-bold text-white text-sm">Purchase Order Successfully Issued!</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Purchase Order <strong>{approvalSuccess.po_number}</strong> created with total volume of{' '}
                    <strong className="text-emerald-400">{formatINR(approvalSuccess.total_amount)}</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Supplier:</span>
                    <span className="font-semibold text-white">{currentActiveScenario?.supplier_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorized Unit Rate:</span>
                    <span className="font-semibold text-emerald-400">{formatINRUnit(currentActiveScenario?.unit_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Lead Time:</span>
                    <span className="font-semibold text-white">{currentActiveScenario?.lead_time_days} days</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer transition shadow-sm"
                >
                  Close & View Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Selected Strategy:</span>
                    <span className="px-2 py-0.5 rounded font-extrabold text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selectedDecision || simulation?.recommendation}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Supplier:</span>
                    <span className="font-bold text-white">{currentActiveScenario?.supplier_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Unit Rate (₹):</span>
                    <span className="font-bold text-emerald-400">{formatINRUnit(currentActiveScenario?.unit_price)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Projected PO Cost:</span>
                    <span className="font-extrabold text-white">{formatINR(currentActiveScenario?.total_cost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery Lead Time:</span>
                    <span className="font-semibold text-slate-200">{currentActiveScenario?.lead_time_days} days</span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px]">
                  You are confirming the <strong className="text-purple-300">{selectedDecision || simulation?.recommendation}</strong> action.
                  This will lock the pricing terms and dispatch an immutable purchase order to the vendor node.
                </p>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveSupplier}
                    disabled={approving}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50 cursor-pointer transition shadow-md"
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
export default CounterfactualTwinPage;
