import React, { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DashboardKPIs, CustomerOrder, AgentTask } from '../types';
import { api } from '../services/api';
import {
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Truck,
  RotateCw,
  Layers,
  Users,
  Cpu,
  BarChart3,
  ShoppingCart,
  Boxes,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface OverviewDashboardProps {
  onNavigate: (tab: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [forecastScenario, setForecastScenario] = useState('Base Scenario');

  // Interactive state for recommended actions checklist
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiData, orderData, taskData] = await Promise.all([
          api.getDashboardKPIs(),
          api.getOrders(),
          api.getAgentTasks(8),
        ]);
        setKpis(kpiData);
        setOrders(orderData.slice(0, 5));
        setTasks(taskData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Theme Palette Tokens: P1 Deep Berry Wine (#8e3a59), P2 Mauve (#a5617a), P3 Dusty Rose (#bb899b), P1-Hover (#752d48)
  const BERRY_PALETTE = {
    p1: '#8e3a59',
    p2: '#a5617a',
    p3: '#bb899b',
    darkWine: '#752d48',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    slate: '#94a3b8',
  };

  // 1. Inventory Overview Donut Data
  const inventoryData = [
    { name: 'Raw Materials', value: 48.7, color: BERRY_PALETTE.p1, pct: 32 },
    { name: 'WIP', value: 26.3, color: BERRY_PALETTE.emerald, pct: 17 },
    { name: 'Finished Goods', value: 57.9, color: BERRY_PALETTE.p2, pct: 38 },
    { name: 'MRO / Other', value: 19.7, color: BERRY_PALETTE.amber, pct: 13 },
  ];

  // 2. Demand Forecast (Next 8 Weeks) Data
  const forecastData = [
    { week: 'May 19', historical: 28, forecast: null, high: null, low: null },
    { week: 'May 26', historical: 33, forecast: null, high: null, low: null },
    { week: 'Jun 2', historical: 31, forecast: 35, high: 38, low: 30 },
    { week: 'Jun 9', historical: null, forecast: 38, high: 43, low: 32 },
    { week: 'Jun 16', historical: null, forecast: 42, high: 48, low: 34 },
    { week: 'Jun 23', historical: null, forecast: 40, high: 46, low: 31 },
    { week: 'Jun 30', historical: null, forecast: 45, high: 52, low: 35 },
    { week: 'Jul 7', historical: null, forecast: 43, high: 50, low: 33 },
    { week: 'Jul 14', historical: null, forecast: 49, high: 58, low: 36 },
  ];

  // 3. Delivery Performance Donut Data
  const deliveryData = [
    { name: 'On-Time', value: 92.1, color: BERRY_PALETTE.emerald, pct: '92.1%' },
    { name: 'Delayed', value: 5.6, color: BERRY_PALETTE.rose, pct: '5.6%' },
    { name: 'Early', value: 2.3, color: BERRY_PALETTE.p1, pct: '2.3%' },
  ];

  // 4. Top Delay Reasons Data
  const delayReasons = [
    { label: 'Carrier Delays', pct: 32, color: BERRY_PALETTE.p1 },
    { label: 'Port Congestion', pct: 21, color: BERRY_PALETTE.p2 },
    { label: 'Customs Clearance', pct: 18, color: '#38bdf8' },
    { label: 'Weather & Maritime', pct: 12, color: BERRY_PALETTE.emerald },
    { label: 'Other Exceptions', pct: 17, color: BERRY_PALETTE.slate },
  ];

  // 5. Cost Breakdown Donut Data
  const costBreakdownData = [
    { name: 'Transportation', value: 11.2, color: BERRY_PALETTE.p1, pct: 39 },
    { name: 'Inventory Carrying', value: 6.8, color: BERRY_PALETTE.emerald, pct: 24 },
    { name: 'Warehousing', value: 5.6, color: BERRY_PALETTE.p2, pct: 19 },
    { name: 'Other Logistics', value: 5.1, color: BERRY_PALETTE.amber, pct: 18 },
  ];

  const pendingApprovals = orders.filter((o) => o.status === 'AWAITING_APPROVAL');

  const toggleAction = (idx: number) => {
    setCheckedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <span className="animate-pulse font-medium text-[#8e3a59]">
          Loading Zaiko Supply Chain Intelligence...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & CONTROLS (ZAIKO STYLE)                       */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e8d8de] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Supply Chain Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time multi-agent telemetry, counterfactual forecasting, and autonomous fulfillment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything... ⌘ K"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fdf2f8] border border-[#e8d8de] rounded-xl pl-9 pr-12 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#8e3a59] transition"
            />
            <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white border border-[#e8d8de]">
              ⌘K
            </span>
          </div>

          {/* Date Range Picker Button */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#e8d8de] hover:border-[#8e3a59] text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer">
            <Calendar className="h-4 w-4 text-[#8e3a59]" />
            <span>May 12 – May 19, 2026</span>
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e8d8de] hover:border-[#8e3a59] text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer">
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Action Required Banner if orders awaiting approval */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl p-4 border border-amber-200 bg-amber-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Action Required: {pendingApprovals.length} Order(s) Awaiting Decision Approval
              </h4>
              <p className="text-[11px] text-amber-800/80">
                The Counterfactual Negotiation Twin has simulated alternative suppliers. Admin / Procurement approval is needed to issue Purchase Orders.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('cnt')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Review in CNT <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TOP KPI ROW (4 SPARKLINES IN ZAIKO STYLE)                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Inventory"
          value="$152.6M"
          trend="8.4%"
          trendPositive={true}
          accentColor="berry"
          subtitle="vs May 5 – May 11"
          icon={<Package className="h-5 w-5" />}
          sparklinePoints={[24, 28, 22, 35, 30, 42, 38, 48, 45, 54]}
        />
        <KPICard
          title="Demand (Forecast)"
          value="$189.3M"
          trend="12.7%"
          trendPositive={true}
          accentColor="emerald"
          subtitle="vs May 5 – May 11"
          icon={<TrendingUp className="h-5 w-5" />}
          sparklinePoints={[30, 32, 28, 40, 35, 45, 42, 50, 48, 62]}
        />
        <KPICard
          title="On-Time Delivery"
          value="92.1%"
          trend="3.4pp"
          trendPositive={false}
          accentColor="rose"
          subtitle="vs May 5 – May 11"
          icon={<Clock className="h-5 w-5" />}
          sparklinePoints={[55, 52, 48, 50, 47, 44, 46, 42, 40, 38]}
        />
        <KPICard
          title="Total Supply Chain Cost"
          value="$28.7M"
          trend="4.6%"
          trendPositive={true} // Cost reduction is positive
          accentColor="berry"
          subtitle="vs May 5 – May 11"
          icon={<DollarSign className="h-5 w-5" />}
          sparklinePoints={[45, 42, 44, 38, 40, 35, 32, 34, 30, 28]}
        />
      </div>

      {/* ============================================================ */}
      {/* 3. MIDDLE SECTION: 3 ADVANCED ANALYTICS PLOTS               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Inventory Overview (Donut Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Inventory Overview
              </h3>
              <span className="text-emerald-700 font-bold text-xs">↑ 8.4%</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart */}
              <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [`$${val}M`, 'Value']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8d8de',
                        borderRadius: '12px',
                        fontSize: '11px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Pie
                      data={inventoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={62}
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-extrabold text-slate-900 leading-tight">
                    $152.6M
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2.5 flex-1">
                {inventoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 font-medium text-[11px] truncate max-w-[85px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-[11px]">${item.value}M</span>
                      <span className="text-slate-400 text-[10px] w-6 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#fdf2f8] flex items-center justify-between text-[11px] text-slate-400">
            <span>vs May 5 – May 11</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-[#8e3a59] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Analyze Stock <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Demand Forecast (Next 8 Weeks) - Multi-Line Time-Series Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Demand Forecast (Next 8 Weeks)
                </h3>
                <p className="text-[11px] text-slate-400">Monte Carlo multi-scenario projection</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#fdf2f8] border border-[#e8d8de] text-[11px] font-semibold text-slate-700">
                  Forecast ▾
                </span>
                <select
                  value={forecastScenario}
                  onChange={(e) => setForecastScenario(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#fdf2f8] border border-[#e8d8de] text-[11px] font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="Base Scenario">Base Scenario</option>
                  <option value="Aggressive Sourcing">Aggressive Sourcing</option>
                  <option value="Conservative Buffer">Conservative Buffer</option>
                </select>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e8d8de',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`$${val}M`, '']}
                  />
                  {/* Historical: Solid Berry Wine */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    name="Historical"
                    stroke={BERRY_PALETTE.p1}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: BERRY_PALETTE.p1 }}
                  />
                  {/* Forecast: Dashed Mauve */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Forecast"
                    stroke={BERRY_PALETTE.p2}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: BERRY_PALETTE.p2 }}
                  />
                  {/* High Scenario: Dashed Green */}
                  <Line
                    type="monotone"
                    dataKey="high"
                    name="High Scenario"
                    stroke={BERRY_PALETTE.emerald}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  {/* Low Scenario: Dashed Rose */}
                  <Line
                    type="monotone"
                    dataKey="low"
                    name="Low Scenario"
                    stroke={BERRY_PALETTE.rose}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#8e3a59]"></span> Historical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#a5617a]"></span> Forecast
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500"></span> High Scenario
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500"></span> Low Scenario
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Delivery Performance (Radial Gauge Donut) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Delivery Performance
              </h3>
              <span className="text-rose-600 font-bold text-xs">↓ 3.4pp</span>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Rate']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8d8de',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                    />
                    <Pie
                      data={deliveryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={46}
                      outerRadius={64}
                      stroke="#ffffff"
                      strokeWidth={3}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {deliveryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-900 leading-tight">
                    92.1%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">On-Time</span>
                </div>
              </div>

              {/* Status List */}
              <div className="w-full space-y-2 mt-3">
                {deliveryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 font-medium text-[11px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 text-[11px]">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-[#fdf2f8] flex items-center justify-between text-[11px] text-slate-400">
            <span>vs May 5 – May 11</span>
            <button
              onClick={() => onNavigate('orders')}
              className="text-[#8e3a59] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Order Details <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. THIRD ROW: LOGISTICS SNAPSHOT, TOP DELAYS, COST BREAKDOWN */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Logistics Snapshot & Interactive World Map Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Logistics Snapshot
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Telemetry
              </span>
            </div>

            {/* Top 4 Mini Tiles */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-[#fdf2f8] border border-[#e8d8de] text-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">In Transit</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">1,247</p>
                <p className="text-[9px] text-slate-400">Shipments</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                <p className="text-[10px] text-emerald-700 font-semibold uppercase">On-Time</p>
                <p className="text-sm font-extrabold text-emerald-700 mt-0.5">1,148</p>
                <p className="text-[9px] text-emerald-600">92.1%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
                <p className="text-[10px] text-rose-700 font-semibold uppercase">Delayed</p>
                <p className="text-sm font-extrabold text-rose-700 mt-0.5">76</p>
                <p className="text-[9px] text-rose-600">6.1%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                <p className="text-[10px] text-amber-700 font-semibold uppercase">At Risk</p>
                <p className="text-sm font-extrabold text-amber-700 mt-0.5">23</p>
                <p className="text-[9px] text-amber-600">1.8%</p>
              </div>
            </div>

            {/* Stylized World Route Map SVG with Nodes & Route Curves */}
            <div className="relative h-32 rounded-xl bg-[#fdf2f8]/70 border border-[#e8d8de] p-3 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 400 160" className="w-full h-full text-[#bb899b]/40">
                {/* Background Dotted Grid representing continents */}
                <g fill="currentColor">
                  {/* North America */}
                  <circle cx="80" cy="50" r="2.5" />
                  <circle cx="95" cy="55" r="2.5" />
                  <circle cx="110" cy="65" r="2.5" />
                  <circle cx="85" cy="70" r="2.5" />
                  {/* Europe */}
                  <circle cx="200" cy="45" r="2.5" />
                  <circle cx="215" cy="50" r="2.5" />
                  <circle cx="210" cy="65" r="2.5" />
                  {/* Asia / Pacific */}
                  <circle cx="290" cy="55" r="2.5" />
                  <circle cx="310" cy="65" r="2.5" />
                  <circle cx="325" cy="80" r="2.5" />
                  <circle cx="280" cy="75" r="2.5" />
                  <circle cx="295" cy="95" r="2.5" />
                </g>

                {/* Connecting Maritime Shipping Routes */}
                <path
                  d="M 110,65 Q 160,35 200,45 T 290,55"
                  fill="none"
                  stroke="#8e3a59"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="animate-pulse"
                />
                <path
                  d="M 290,55 Q 260,110 210,65 T 110,65"
                  fill="none"
                  stroke="#a5617a"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Glowing Port Hubs */}
                <g>
                  {/* Port of Shanghai */}
                  <circle cx="290" cy="55" r="5" fill="#8e3a59" className="animate-ping opacity-75" />
                  <circle cx="290" cy="55" r="4" fill="#8e3a59" />
                  <text x="295" y="52" fill="#752d48" fontSize="8" fontWeight="bold">Shanghai</text>

                  {/* Port of Rotterdam */}
                  <circle cx="200" cy="45" r="4" fill="#10b981" />
                  <text x="180" y="38" fill="#10b981" fontSize="8" fontWeight="bold">Rotterdam</text>

                  {/* Dallas Logistics DC */}
                  <circle cx="110" cy="65" r="4" fill="#8e3a59" />
                  <text x="85" y="80" fill="#752d48" fontSize="8" fontWeight="bold">Dallas DC</text>
                </g>
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#fdf2f8] flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Live vessel & truck telemetry</span>
            <button
              onClick={() => onNavigate('orders')}
              className="text-[#8e3a59] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all shipments →
            </button>
          </div>
        </div>

        {/* Top Delay Reasons (Progress Bars) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Top Delay Reasons
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Q2 Analysis</span>
            </div>

            <div className="space-y-3.5">
              {delayReasons.map((reason) => (
                <div key={reason.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium text-[11px]">{reason.label}</span>
                    <span className="font-bold text-slate-900 text-[11px]">{reason.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#fdf2f8] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${reason.pct}%`,
                        backgroundColor: reason.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#fdf2f8] flex items-center justify-between">
            <span className="text-[11px] text-slate-400">AI root cause tracking</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[#8e3a59] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              View delay analytics →
            </button>
          </div>
        </div>

        {/* Supply Chain Cost Breakdown */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Cost Breakdown
              </h3>
              <span className="text-emerald-700 font-bold text-xs">↓ 4.6%</span>
            </div>

            <div className="flex flex-col items-center justify-center py-1">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [`$${val}M`, 'Cost']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8d8de',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                    />
                    <Pie
                      data={costBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={38}
                      outerRadius={56}
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-extrabold text-slate-900 leading-tight">
                    $28.7M
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">Total</span>
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="w-full space-y-2 mt-2">
                {costBreakdownData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 font-medium text-[11px] truncate max-w-[85px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      <span className="text-slate-800">${item.value}M</span>
                      <span className="text-slate-400 text-[10px]">({item.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-[#fdf2f8] flex items-center justify-between text-[11px] text-slate-400">
            <span>vs May 5 – May 11</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[#8e3a59] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Cost Report <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. BOTTOM ROW: ALERTS, AI INSIGHTS, RECOMMENDED ACTIONS     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Alerts & Notifications */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Alerts & Notifications
              </h3>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-[#8e3a59] font-bold text-xs hover:underline cursor-pointer"
              >
                View all alerts →
              </button>
            </div>

            <div className="space-y-2.5">
              {/* High Alert */}
              <div
                onClick={() => onNavigate('orders')}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-full bg-rose-100 text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-1.5 py-0.2 rounded">
                        High
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Delayed shipment from Shanghai Port
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      PO #PO-88421 is delayed by 4 days due to port congestion.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">May 19, 2026 · 10:24 AM</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              {/* Medium Alert */}
              <div
                onClick={() => onNavigate('inventory')}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-full bg-amber-100 text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                        Medium
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Inventory below threshold
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Hydraulic Pump (SKU: HP-7823) at Dallas DC at critical buffer level.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">May 19, 2026 · 09:15 AM</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              {/* Low Alert */}
              <div
                onClick={() => onNavigate('suppliers')}
                className="p-3 rounded-xl border border-[#e8d8de] bg-[#fdf2f8]/60 hover:bg-[#fdf2f8] transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-full bg-[#e8d8de] text-[#8e3a59]">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e3a59] bg-[#e8d8de] px-1.5 py-0.2 rounded">
                        Notice
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Supplier performance issue
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      On-time delivery dropped below 85% for secondary vendor.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">May 19, 2026 · 08:15 AM</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights (With Berry Gradient Visual Orb) */}
        <div className="lg:col-span-3 rounded-2xl p-5 border border-[#e8d8de] bg-gradient-to-br from-[#8e3a59] to-[#752d48] text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative background circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-[#bb899b]/20 blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-white/20 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
                AI Autonomous Insight
              </span>
            </div>

            <h4 className="text-sm font-bold text-white leading-snug mb-2">
              Route & Supplier Consolidation
            </h4>
            <p className="text-xs text-rose-100/90 leading-relaxed">
              Consolidate shipments from suppliers in Vietnam and switch Tier-2 component sourcing to reduce transit costs by <strong className="text-white underline">~$620K</strong> over the next 4 weeks.
            </p>
          </div>

          <div className="relative z-10 mt-5 pt-3 border-t border-white/20">
            <button
              onClick={() => onNavigate('cnt')}
              className="w-full py-2 px-3 rounded-xl bg-white text-[#8e3a59] hover:bg-rose-50 text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              View CNT Recommendation <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#e8d8de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recommended Actions
              </h3>
              <span className="text-xs text-[#8e3a59] font-bold hover:underline cursor-pointer">
                View all actions →
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 0,
                  label: 'Approve alternative shipment route via Rotterdam',
                  tag: 'Logistics',
                  tab: 'cnt',
                },
                {
                  id: 1,
                  label: 'Increase safety stock for 2 critical microcontrollers',
                  tag: 'Inventory',
                  tab: 'inventory',
                },
                {
                  id: 2,
                  label: 'Review underperforming supplier concession terms',
                  tag: 'Negotiation',
                  tab: 'suppliers',
                },
              ].map((act) => {
                const checked = !!checkedActions[act.id];
                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-[#e8d8de] hover:border-[#8e3a59] bg-[#fdf2f8]/40 hover:bg-[#fdf2f8] transition flex items-center justify-between cursor-pointer"
                    onClick={() => toggleAction(act.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center transition ${
                          checked
                            ? 'bg-[#8e3a59] border-[#8e3a59] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          checked ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {act.label}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(act.tab);
                      }}
                      className="p-1 text-slate-400 hover:text-[#8e3a59] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#fdf2f8] flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by Multi-Agent Engine</span>
            <button
              onClick={() => onNavigate('cnt')}
              className="text-[#8e3a59] font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
            >
              Simulate in Twin <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. CONSOLIDATED 7-MODULE ENTERPRISE LAUNCHPAD                 */}
      {/* ============================================================ */}
      <div className="rounded-2xl p-5 border border-[#e8d8de] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Enterprise 7-Module Operational Launchpad
            </h3>
            <p className="text-xs text-slate-500">
              Direct access to all 7 unified supply chain operations
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#8e3a59] bg-[#fdf2f8] px-2.5 py-1 rounded-lg border border-[#e8d8de]">
            Unified Architecture
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { id: 'overview', label: '1. Overview', icon: Boxes, desc: 'Real-time KPIs' },
            { id: 'orders', label: '2. Orders', icon: ShoppingCart, desc: 'Customer Demand' },
            { id: 'inventory', label: '3. Inventory', icon: Package, desc: 'Stock & Shortage' },
            { id: 'procurement', label: '4. Procurement', icon: Layers, desc: 'RFQs & Quotes' },
            { id: 'cnt', label: '5. CNT Twin', icon: Cpu, desc: 'Monte Carlo Sim' },
            { id: 'suppliers', label: '6. Suppliers', icon: Users, desc: 'Negotiation Hub' },
            { id: 'reports', label: '7. Reports', icon: BarChart3, desc: 'Role Analytics' },
          ].map((mod) => {
            const ModIcon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="p-3 rounded-xl border border-[#e8d8de] hover:border-[#8e3a59] hover:bg-[#fdf2f8] text-left transition group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-[#fdf2f8] group-hover:bg-[#8e3a59] group-hover:text-white text-[#8e3a59] w-fit transition mb-2">
                  <ModIcon className="h-4 w-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#8e3a59] transition">
                  {mod.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{mod.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
