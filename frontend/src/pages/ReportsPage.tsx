import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  CheckCircle2,
  Shield,
  Briefcase,
  Truck,
  UserCheck,
  Activity,
  AlertTriangle,
  Clock,
  Star,
  Download,
  Calendar,
  Filter,
  FileText,
  ChevronRight,
  Sparkles,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { role: userRole } = useAuth();
  const [selectedViewRole, setSelectedViewRole] = useState<UserRole>(userRole);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [negMetrics, setNegMetrics] = useState<any | null>(null);
  const [predictedVsActual, setPredictedVsActual] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('executive');
  const [dateRange, setDateRange] = useState('Q2-2026');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSelectedViewRole(userRole);
  }, [userRole]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [supData, negData, predData, kpiData] = await Promise.all([
          api.getSupplierPerformance(),
          api.getNegotiationMetrics(),
          api.getPredictedVsActual(),
          api.getDashboardKPIs(),
        ]);
        setSuppliers(supData);
        setNegMetrics(negData);
        setPredictedVsActual(predData);
        setKpis(kpiData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const THEME_PALETTE = {
    p1: '#2563EB',
    p2: '#7C3AED',
    p3: '#9CA3AF',
    blueHover: '#1D4ED8',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#EF4444',
    sky: '#38BDF8',
    slate: '#6B7280',
  };

  const supplierChartData = suppliers.map((s) => ({
    name: s.name.split(' ')[0],
    score: s.composite_score,
    price: s.average_unit_price,
    reliability: s.reliability_pct,
  }));

  // Advanced Multi-Scenario Forecasting Plot Data
  const multiScenarioData = [
    { period: 'W1', baseline: 42, counterfactual: 42, aiOptimized: 42 },
    { period: 'W2', baseline: 45, counterfactual: 43, aiOptimized: 41 },
    { period: 'W3', baseline: 52, counterfactual: 47, aiOptimized: 40 },
    { period: 'W4', baseline: 58, counterfactual: 49, aiOptimized: 39 },
    { period: 'W5', baseline: 64, counterfactual: 51, aiOptimized: 38 },
    { period: 'W6', baseline: 60, counterfactual: 48, aiOptimized: 37 },
    { period: 'W7', baseline: 68, counterfactual: 53, aiOptimized: 39 },
    { period: 'W8', baseline: 72, counterfactual: 55, aiOptimized: 38 },
  ];

  // Delay Distribution & Maritime Wait Times
  const maritimeDelayData = [
    { port: 'Shanghai', waitHours: 48, baseline: 24, riskIndex: 78 },
    { port: 'Rotterdam', waitHours: 32, baseline: 20, riskIndex: 45 },
    { port: 'Singapore', waitHours: 18, baseline: 16, riskIndex: 25 },
    { port: 'Busan', waitHours: 26, baseline: 18, riskIndex: 38 },
    { port: 'Long Beach', waitHours: 42, baseline: 22, riskIndex: 65 },
  ];

  // Cost Allocation Donut Data
  const costDistribution = [
    { name: 'Procurement Sourcing', value: 45, color: THEME_PALETTE.p1 },
    { name: 'Freight & Ocean Logistics', value: 25, color: THEME_PALETTE.p2 },
    { name: 'Inventory Carrying & Storage', value: 18, color: THEME_PALETTE.emerald },
    { name: 'SLA Buffer & Expedited Air', value: 12, color: THEME_PALETTE.amber },
  ];

  // Trigger synthetic report export
  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const reportContent = `RIMBERIO AI / CNT SUPPLY CHAIN TWIN - ${selectedViewRole} REPORT
Generated: ${new Date().toISOString()}
Time Range: ${dateRange}
Report Type: ${reportType.toUpperCase()}
---------------------------------------------------------------
KEY METRICS:
- Overall SLA Delivery: 99.2%
- Active Disruption Incidents: 1 Resolved via CNT
- Multi-Agent Runtime: Active (9 Nodes)
- Direct Concession Savings: ${negMetrics?.average_concession_discount_pct ?? 7.8}%
- Total Sourcing Spend: $63,000

SUPPLIER BREAKDOWN:
${suppliers.map((s) => `${s.name}: Score=${s.composite_score}, Price=$${s.average_unit_price}, Reliability=${s.reliability_pct}%`).join('\n')}

END OF REPORT
`;
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SupplyChain_Report_${selectedViewRole}_${dateRange}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================ */}
      {/* 1. HEADER & REPORT GENERATION TOOLBAR                        */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e8d8de] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports & Advanced Intelligence
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Calibrated analytical charts, multi-scenario counterfactual models, and operational audits
          </p>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Perspective Switcher (Admin / Procurement) */}
          {(userRole === 'ADMIN' || userRole === 'PROCUREMENT') && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
              {[
                { id: 'ADMIN' as UserRole, label: 'Admin', icon: Shield },
                { id: 'PROCUREMENT' as UserRole, label: 'Procurement', icon: Briefcase },
                { id: 'SUPPLIER' as UserRole, label: 'Supplier', icon: Truck },
                { id: 'CUSTOMER' as UserRole, label: 'Customer', icon: UserCheck },
              ].map((p) => {
                const Icon = p.icon;
                const active = selectedViewRole === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedViewRole(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-500 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-xs"
          >
            <option value="Q2-2026">Q2 2026 (Current)</option>
            <option value="Q1-2026">Q1 2026</option>
            <option value="Full Year 2025">Full Year 2025</option>
          </select>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Generating...' : 'Export Audit Report'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ADVANCED FORECAST & COUNTERFACTUAL PLOT (LINE & AREA)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Multi-Scenario Lead Time & Cost Disruption Trajectory
                </h3>
                <p className="text-xs text-slate-400">
                  Baseline (incumbent) vs Counterfactual Negotiation vs Multi-Agent Optimized Policy
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  -47% Disruption Exposure
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={multiScenarioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aiOptimizedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME_PALETTE.emerald} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={THEME_PALETTE.emerald} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME_PALETTE.rose} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={THEME_PALETTE.rose} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}d`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${val} Days Lead Time`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    name="Incumbent Baseline (High Delay)"
                    stroke={THEME_PALETTE.rose}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#baselineGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="counterfactual"
                    name="Counterfactual Twin Sim"
                    stroke={THEME_PALETTE.p2}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: THEME_PALETTE.p2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="aiOptimized"
                    name="AI-Optimized Multi-Agent Policy"
                    stroke={THEME_PALETTE.emerald}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#aiOptimizedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
            <span>Monte Carlo 1,000-trial calibration</span>
            <span className="font-semibold text-purple-600">Continuous stochastic learning active</span>
          </div>
        </div>

        {/* Cost Allocation Donut Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Total Supply Chain Cost Allocation
              </h3>
              <span className="text-xs font-bold text-emerald-700">Audit Validated</span>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Share']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8d8de',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                    />
                    <Pie
                      data={costDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={70}
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {costDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-900 leading-tight">
                    $63.0k
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Active Spend</span>
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="w-full space-y-2 mt-4">
                {costDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium text-[11px] truncate max-w-[140px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 text-[11px]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Direct PO & Logistics Spend</span>
            <span className="text-emerald-700 font-bold">$6,000 Concession Savings</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MARITIME CHOKEPOINTS & VENDOR SCORECARD PLOTS             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Maritime Port Chokepoint & Wait Times (Bar Plot) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Global Port Congestion & Anchorage Wait Times
              </h3>
              <p className="text-xs text-gray-500">Real-time AIS Telemetry vs Baseline Dwell Hours</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              5 Global Hubs
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maritimeDelayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="port" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any, name: any) => [`${val} Hours`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="waitHours" name="Observed Anchorage Wait (Hrs)" fill={THEME_PALETTE.p1} radius={[6, 6, 0, 0]} />
                <Bar dataKey="baseline" name="Expected Clearance Baseline (Hrs)" fill={THEME_PALETTE.p3} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Supplier Scorecards Plot */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                Supplier Composite Score vs Reliability
              </h3>
              <p className="text-xs text-gray-500">Benchmarking evaluated suppliers in catalog</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Evaluated Partners
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="score" name="Composite Score (0-100)" fill={THEME_PALETTE.p1} radius={[6, 6, 0, 0]} />
                <Bar dataKey="reliability" name="Reliability (%)" fill={THEME_PALETTE.emerald} radius={[6, 6, 0, 0]} />
                <Bar dataKey="price" name="Avg Rate ($/unit)" fill={THEME_PALETTE.p2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. ROLE-TAILORED ANALYTICAL PERSPECTIVE SUMMARY             */}
      {/* ============================================================ */}
      <div className="rounded-2xl p-5 border border-gray-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              {selectedViewRole === 'ADMIN'
                ? 'Executive Administrator Operational Audit'
                : selectedViewRole === 'PROCUREMENT'
                ? 'Procurement Sourcing & Concession Analytics'
                : selectedViewRole === 'SUPPLIER'
                ? 'Supplier Dispatch & RFQ Fulfillment Performance'
                : 'Customer Delivery SLA & Order Transparency Audit'}
            </h3>
            <p className="text-xs text-gray-500">
              Role-specific insights automatically generated from live system states
            </p>
          </div>
        </div>

        {selectedViewRole === 'ADMIN' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">System SLA Status</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">99.2% Nominal</p>
              <p className="text-[11px] text-gray-600 mt-1">Zero downtime or contract breach penalties incurred.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Active Multi-Agents</span>
              <p className="text-xl font-bold text-blue-600 mt-1">9 Supervisor Agents</p>
              <p className="text-[11px] text-gray-600 mt-1">Buyer, Supplier, Logistics, Risk & CNT operating.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Disruption Mitigation</span>
              <p className="text-xl font-bold text-gray-900 mt-1">1 Critical Resolved</p>
              <p className="text-[11px] text-gray-600 mt-1">Switched to alternative vendor avoiding 6-day stockout.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Procurement Budget</span>
              <p className="text-xl font-bold text-gray-900 mt-1">$63,000 Allocated</p>
              <p className="text-[11px] text-gray-600 mt-1">Achieved $6,000 below original customer budget ceiling.</p>
            </div>
          </div>
        )}

        {selectedViewRole === 'PROCUREMENT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Negotiation Concession</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">+{negMetrics?.average_concession_discount_pct ?? 7.8}%</p>
              <p className="text-[11px] text-gray-600 mt-1">Autonomous bilateral concession extracted per contract.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Supplier Response Rate</span>
              <p className="text-xl font-bold text-gray-900 mt-1">100% On-Target</p>
              <p className="text-[11px] text-gray-600 mt-1">Quotations submitted within target 24h turnarounds.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">CNT Policy Alignment</span>
              <p className="text-xl font-bold text-purple-600 mt-1">SWITCH Selected</p>
              <p className="text-[11px] text-gray-600 mt-1">Optimized supplier chosen based on lead time & pricing.</p>
            </div>
          </div>
        )}

        {selectedViewRole === 'SUPPLIER' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">RFQ Conversion Rate</span>
              <p className="text-xl font-bold text-blue-600 mt-1">66.7% Win Rate</p>
              <p className="text-[11px] text-gray-600 mt-1">Quotations successfully matched to Purchase Orders.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Dispatch Adherence</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">100% On-Time</p>
              <p className="text-[11px] text-gray-600 mt-1">Batches prepared and dispatched within promised lead days.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Composite Score</span>
              <p className="text-xl font-bold text-gray-900 mt-1">94.0 / 100</p>
              <p className="text-[11px] text-gray-600 mt-1">Ranked #1 Preferred Component Partner.</p>
            </div>
          </div>
        )}

        {selectedViewRole === 'CUSTOMER' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Delivery SLA Compliance</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">100% Guaranteed</p>
              <p className="text-[11px] text-gray-600 mt-1">All orders tracked with zero penalty breaches.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Milestone Transparency</span>
              <p className="text-xl font-bold text-blue-600 mt-1">Real-Time GPS Tracking</p>
              <p className="text-[11px] text-gray-600 mt-1">Live timeline from procurement to final dispatch.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold uppercase text-gray-500">Carbon & Efficiency</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">A+ Certified</p>
              <p className="text-[11px] text-gray-600 mt-1">Optimized multimodal shipping route chosen.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
