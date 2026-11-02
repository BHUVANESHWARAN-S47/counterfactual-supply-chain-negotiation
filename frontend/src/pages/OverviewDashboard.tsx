import React, { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DashboardKPIs, CustomerOrder, AgentTask } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';
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
  Boxes,
  ShoppingCart,
  Layers,
  Cpu,
  BarChart3,
  Users,
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

  // Design Tokens based on Section 3 Palette
  const THEME_COLORS = {
    blue: '#2563EB',
    purple: '#7C3AED',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    sky: '#38BDF8',
    gray: '#9CA3AF',
    darkNavy: '#111827',
  };

  const paletteCycle = [
    THEME_COLORS.blue,
    THEME_COLORS.purple,
    THEME_COLORS.green,
    THEME_COLORS.orange,
    THEME_COLORS.sky,
  ];

  // 1. Inventory Overview Donut Data from real backend database
  const inventoryData = (kpis?.inventory_categories && kpis.inventory_categories.length > 0)
    ? kpis.inventory_categories.map((cat, idx) => ({
        name: cat.name,
        value: cat.value,
        color: paletteCycle[idx % paletteCycle.length],
        pct: cat.pct,
      }))
    : [
        { name: 'Electronics', value: 31635, color: THEME_COLORS.blue, pct: 26 },
        { name: 'Energy Storage', value: 27750, color: THEME_COLORS.green, pct: 23 },
        { name: 'Power Supplies', value: 54000, color: THEME_COLORS.purple, pct: 45 },
        { name: 'Sensors', value: 7600, color: THEME_COLORS.orange, pct: 6 },
      ];

  // 2. Demand Forecast Multi-line Plot
  const forecastData = [
    { week: 'Wk 1', historical: 28, forecast: null, high: null, low: null },
    { week: 'Wk 2', historical: 33, forecast: null, high: null, low: null },
    { week: 'Wk 3', historical: 31, forecast: 35, high: 38, low: 30 },
    { week: 'Wk 4', historical: null, forecast: 38, high: 43, low: 32 },
    { week: 'Wk 5', historical: null, forecast: 42, high: 48, low: 34 },
    { week: 'Wk 6', historical: null, forecast: 40, high: 46, low: 31 },
    { week: 'Wk 7', historical: null, forecast: 45, high: 52, low: 35 },
    { week: 'Wk 8', historical: null, forecast: 43, high: 50, low: 33 },
    { week: 'Wk 9', historical: null, forecast: 49, high: 58, low: 36 },
  ];

  // 3. Delivery Performance Donut Data from real backend database
  const onTimeRate = kpis?.on_time_delivery_rate ?? 100.0;
  const delayedRate = Number(Math.max(0, 100 - onTimeRate).toFixed(1));
  const deliveryData = [
    { name: 'On-Time', value: onTimeRate, color: THEME_COLORS.green, pct: `${onTimeRate}%` },
    { name: 'Delayed', value: delayedRate, color: THEME_COLORS.red, pct: `${delayedRate}%` },
  ];

  // 4. Top Delay Reasons Data
  const delayReasons = [
    { label: 'Carrier Transit Congestion', pct: 32, color: THEME_COLORS.purple },
    { label: 'Port Customs Processing', pct: 21, color: THEME_COLORS.blue },
    { label: 'Warehouse Dock Handling', pct: 18, color: THEME_COLORS.sky },
    { label: 'Severe Weather Variance', pct: 12, color: THEME_COLORS.green },
    { label: 'Documentation Revision', pct: 17, color: THEME_COLORS.gray },
  ];

  // 5. Cost Breakdown Donut Data from real backend database
  const costBreakdownData = (kpis?.cost_breakdown && kpis.cost_breakdown.length > 0)
    ? kpis.cost_breakdown.map((item, idx) => ({
        name: item.name,
        value: item.value,
        color: paletteCycle[idx % paletteCycle.length],
        pct: item.pct,
      }))
    : [
        { name: 'Direct Procurement', value: 37125, color: THEME_COLORS.blue, pct: 64 },
        { name: 'Transportation & Freight', value: 5197, color: THEME_COLORS.green, pct: 9 },
        { name: 'Inventory Carrying', value: 9678, color: THEME_COLORS.purple, pct: 17 },
        { name: 'Warehousing & Facilities', value: 6049, color: THEME_COLORS.orange, pct: 10 },
      ];

  const pendingApprovals = orders.filter((o) => o.status === 'AWAITING_APPROVAL');

  const toggleAction = (idx: number) => {
    setCheckedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-[#6B7280]">
        <span className="animate-pulse font-semibold text-[#2563EB]">
          Loading Nexora Supply Chain Intelligence...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & CONTROLS (NEXORA STYLE)                      */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5">
            Track orders, compare suppliers, monitor deliveries, and make better purchasing decisions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('orders')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#2563EB] text-xs font-semibold text-[#374151] hover:text-[#2563EB] transition shadow-2xs cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4 text-[#2563EB]" />
            <span>Customer Demand</span>
          </button>

          <button
            onClick={() => onNavigate('cnt')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Cpu className="h-4 w-4" />
            <span>Compare Supplier Options</span>
          </button>
        </div>
      </div>

      {/* Action Required Banner if orders awaiting approval */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl p-4 border border-[#FED7AA] bg-[#FFF7ED] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-100 text-[#F59E0B]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-orange-950">
                Action Required: {pendingApprovals.length} order(s) waiting for approval
              </h4>
              <p className="text-[11px] text-orange-900/80">
                We have compared alternative suppliers for {pendingApprovals.length} order(s). Please review and approve the recommended option before the purchase order is created.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Review Approvals <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TOP KPI ROW (4 SPARKLINES IN NEXORA STYLE)                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Stock Value"
          value={formatINR(kpis?.total_inventory_valuation ?? 0, { compact: true })}
          trend={`${kpis?.total_inventory_units?.toLocaleString() ?? 0} units`}
          trendPositive={true}
          accentColor="blue"
          subtitle="Real-time stock valuation"
          icon={<Package className="h-5 w-5" />}
          sparklinePoints={[24, 28, 22, 35, 30, 42, 38, 48, 45, 54]}
        />
        <KPICard
          title="Demand (Orders)"
          value={formatINR(kpis?.total_demand_value ?? 0, { compact: true })}
          trend={`${kpis?.total_orders ?? 0} orders`}
          trendPositive={true}
          accentColor="green"
          subtitle={`${kpis?.pending_orders ?? 0} active in pipeline`}
          icon={<TrendingUp className="h-5 w-5" />}
          sparklinePoints={[30, 32, 28, 40, 35, 45, 42, 50, 48, 62]}
        />
        <KPICard
          title="On-Time Deliveries"
          value={`${kpis?.on_time_delivery_rate ?? 100}%`}
          trend={`${kpis?.completed_orders ?? 0} fulfilled`}
          trendPositive={(kpis?.on_time_delivery_rate ?? 100) >= 90}
          accentColor="red"
          subtitle="Orders delivered on time"
          icon={<Clock className="h-5 w-5" />}
          sparklinePoints={[55, 52, 48, 50, 47, 44, 46, 42, 40, 38]}
        />
        <KPICard
          title="Total Purchasing Cost"
          value={formatINR(kpis?.total_procurement_spend ?? 0, { compact: true })}
          trend={`${kpis?.total_pos ?? 0} POs issued`}
          trendPositive={true}
          accentColor="purple"
          subtitle={`${kpis?.active_suppliers ?? 0} active suppliers`}
          icon={<DollarSign className="h-5 w-5" />}
          sparklinePoints={[45, 42, 44, 38, 40, 35, 32, 34, 30, 28]}
        />
      </div>

      {/* ============================================================ */}
      {/* 3. MIDDLE SECTION: 3 ADVANCED ANALYTICS PLOTS               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Inventory Overview (Donut Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                Inventory Overview
              </h3>
              <span className="text-[#10B981] font-bold text-xs">↑ 8.4%</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart */}
              <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [formatINR(val, { compact: true }), 'Valuation']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
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
                  <span className="text-sm font-extrabold text-[#111827] leading-tight">
                    {formatINR(kpis?.total_inventory_valuation ?? 0, { compact: true })}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-semibold">Total Stock</span>
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
                      <span className="text-[#4B5563] font-medium text-[11px] truncate max-w-[85px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111827] text-[11px]">{formatINR(item.value, { compact: true })}</span>
                      <span className="text-[#9CA3AF] text-[10px] w-6 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#9CA3AF]">
            <span>Live warehouse telemetry</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-[#2563EB] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Analyze Stock <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Demand Forecast (Next 8 Weeks) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                  Expected Future Demand (Next 8 Weeks)
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">Expected demand over the next 8 weeks</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F7FB] border border-[#E5E7EB] text-[11px] font-semibold text-[#374151]">
                  Scenarios ▾
                </span>
                <select
                  value={forecastScenario}
                  onChange={(e) => setForecastScenario(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#F5F7FB] border border-[#E5E7EB] text-[11px] font-semibold text-[#374151] focus:outline-none"
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
                    tickFormatter={(v) => `₹${v} Cr`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₹${val} Cr`, '']}
                  />
                  {/* Historical: Solid Blue */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    name="Past results"
                    stroke={THEME_COLORS.blue}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: THEME_COLORS.blue }}
                  />
                  {/* Forecast: Dashed Purple */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Expected results"
                    stroke={THEME_COLORS.purple}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: THEME_COLORS.purple }}
                  />
                  {/* High Scenario: Dashed Green */}
                  <Line
                    type="monotone"
                    dataKey="high"
                    name="Higher-demand possibility"
                    stroke={THEME_COLORS.green}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  {/* Low Scenario: Dashed Red */}
                  <Line
                    type="monotone"
                    dataKey="low"
                    name="Lower-demand possibility"
                    stroke={THEME_COLORS.red}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-[10px] text-[#6B7280] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#2563EB]"></span> Past results
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#7C3AED]"></span> Expected results
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#10B981]"></span> Higher-demand possibility
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#EF4444]"></span> Lower-demand possibility
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Delivery Performance (Donut Gauge) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                Delivery Performance
              </h3>
              <span className="text-[#EF4444] font-bold text-xs">↓ 3.4pp</span>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Rate']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
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
                  <span className="text-base font-extrabold text-[#111827] leading-tight">
                    {kpis?.on_time_delivery_rate ?? 100}%
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-semibold">On-Time</span>
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
                      <span className="text-[#4B5563] font-medium text-[11px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#111827] text-[11px]">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#9CA3AF]">
            <span>Real-time delivery SLA</span>
            <button
              onClick={() => onNavigate('orders')}
              className="text-[#2563EB] font-bold hover:underline cursor-pointer flex items-center gap-1"
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
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                Delivery Status
              </h3>
              <span className="text-[11px] text-[#10B981] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded-md">
                Live shipment updates
              </span>
            </div>

            {/* Top 4 Mini Tiles */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-center">
                <p className="text-[10px] text-[#2563EB] font-semibold uppercase">In Transit</p>
                <p className="text-sm font-extrabold text-[#111827] mt-0.5">
                  {kpis?.shipments_telemetry?.in_transit ?? 0}
                </p>
                <p className="text-[9px] text-[#6B7280]">Shipments</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-center">
                <p className="text-[10px] text-[#10B981] font-semibold uppercase">Delivered</p>
                <p className="text-sm font-extrabold text-[#10B981] mt-0.5">
                  {kpis?.shipments_telemetry?.delivered ?? (kpis?.completed_orders ?? 0)}
                </p>
                <p className="text-[9px] text-[#059669]">{kpis?.on_time_delivery_rate ?? 100}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-center">
                <p className="text-[10px] text-[#EF4444] font-semibold uppercase">Delayed</p>
                <p className="text-sm font-extrabold text-[#EF4444] mt-0.5">
                  {kpis?.shipments_telemetry?.delayed ?? 0}
                </p>
                <p className="text-[9px] text-[#DC2626]">
                  {kpis?.shipments_telemetry?.total ? `${((kpis.shipments_telemetry.delayed / Math.max(kpis.shipments_telemetry.total, 1)) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-center">
                <p className="text-[10px] text-[#F59E0B] font-semibold uppercase">Needs attention</p>
                <p className="text-sm font-extrabold text-[#F59E0B] mt-0.5">
                  {kpis?.shipments_telemetry?.at_risk ?? (kpis?.shortage_items ?? 0)}
                </p>
                <p className="text-[9px] text-[#D97706]">Items to monitor</p>
              </div>
            </div>

            {/* Stylized World Route Map SVG with Nodes & Route Curves */}
            <div className="relative h-32 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] p-3 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 400 160" className="w-full h-full text-slate-300">
                {/* Background Dotted Grid */}
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
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="animate-pulse"
                />
                <path
                  d="M 290,55 Q 260,110 210,65 T 110,65"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Glowing Port Hubs */}
                <g>
                  {/* Port of Shanghai */}
                  <circle cx="290" cy="55" r="5" fill="#2563EB" className="animate-ping opacity-75" />
                  <circle cx="290" cy="55" r="4" fill="#2563EB" />
                  <text x="295" y="52" fill="#1D4ED8" fontSize="8" fontWeight="bold">Shanghai</text>

                  {/* Port of Rotterdam */}
                  <circle cx="200" cy="45" r="4" fill="#10B981" />
                  <text x="180" y="38" fill="#10B981" fontSize="8" fontWeight="bold">Rotterdam</text>

                  {/* Dallas Logistics DC */}
                  <circle cx="110" cy="65" r="4" fill="#7C3AED" />
                  <text x="85" y="80" fill="#7C3AED" fontSize="8" fontWeight="bold">Dallas DC</text>
                </g>
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
            <span className="text-[11px] text-[#9CA3AF]">Live vessel & truck telemetry</span>
            <button
              onClick={() => onNavigate('orders')}
              className="text-[#2563EB] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all shipments →
            </button>
          </div>
        </div>

        {/* Top Delay Reasons (Progress Bars) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                Top Delay Reasons
              </h3>
              <span className="text-xs text-[#9CA3AF] font-semibold">Q2 Analysis</span>
            </div>

            <div className="space-y-3.5">
              {delayReasons.map((reason) => (
                <div key={reason.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4B5563] font-medium text-[11px]">{reason.label}</span>
                    <span className="font-bold text-[#111827] text-[11px]">{reason.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
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

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
            <span className="text-[11px] text-[#9CA3AF]">AI root cause tracking</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[#2563EB] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              View delay analytics →
            </button>
          </div>
        </div>

        {/* Supply Chain Cost Breakdown */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                Where the money is spent
              </h3>
              <span className="text-[#10B981] font-bold text-xs">↓ 4.6%</span>
            </div>

            <div className="flex flex-col items-center justify-center py-1">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any) => [formatINR(val, { compact: true }), 'Cost']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
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
                  <span className="text-sm font-extrabold text-[#111827] leading-tight">
                    {formatINR(kpis?.total_supply_chain_cost ?? kpis?.total_procurement_spend ?? 0, { compact: true })}
                  </span>
                  <span className="text-[9px] text-[#9CA3AF] font-semibold">Total Spend</span>
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
                      <span className="text-[#4B5563] font-medium text-[11px] truncate max-w-[85px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      <span className="text-[#111827]">{formatINR(item.value, { compact: true })}</span>
                      <span className="text-[#9CA3AF] text-[10px]">({item.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#9CA3AF]">
            <span>Live procurement cycle</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[#2563EB] font-bold hover:underline cursor-pointer flex items-center gap-1"
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
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                Alerts & Notifications
              </h3>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer"
              >
                View all alerts →
              </button>
            </div>

            <div className="space-y-2.5">
              {/* High Alert */}
              <div
                onClick={() => onNavigate('orders')}
                className="p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2]/60 hover:bg-[#FEF2F2] transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-full bg-red-100 text-[#EF4444]">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#EF4444] bg-red-100 px-1.5 py-0.2 rounded">
                        High
                      </span>
                      <span className="text-xs font-bold text-[#111827]">
                        Delayed shipment from Shanghai Port
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B5563] mt-0.5">
                      PO #PO-88421 is delayed by 4 days due to port congestion.
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">12 mins ago</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
              </div>

              {/* Medium Alert */}
              <div
                onClick={() => onNavigate('inventory')}
                className="p-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/60 hover:bg-[#FFF7ED] transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-full bg-orange-100 text-[#F59E0B]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] bg-orange-100 px-1.5 py-0.2 rounded">
                        Medium
                      </span>
                      <span className="text-xs font-bold text-[#111827]">
                        Inventory below threshold
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B5563] mt-0.5">
                      Hydraulic Pump (SKU: HP-7823) at Dallas DC at critical buffer level.
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">45 mins ago</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
              </div>

              {/* Low Alert */}
              <div
                onClick={() => onNavigate('suppliers')}
                className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] hover:bg-[#EFF6FF] transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-full bg-blue-100 text-[#2563EB]">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-100 px-1.5 py-0.2 rounded">
                        Notice
                      </span>
                      <span className="text-xs font-bold text-[#111827]">
                        Supplier performance issue
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B5563] mt-0.5">
                      On-time delivery dropped below 85% for secondary vendor.
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">2 hrs ago</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights (Purple Soft Card matching screenshot) */}
        <div className="lg:col-span-3 rounded-2xl p-5 border border-[#E9D5FF] bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] text-[#111827] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-[#7C3AED] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                AI Autonomous Insight
              </span>
            </div>

            <h4 className="text-sm font-bold text-[#111827] leading-snug mb-2">
              Route & Supplier Sourcing Opportunity
            </h4>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Consolidate shipments from suppliers to reduce transit costs by <strong className="text-[#7C3AED] underline">~₹62.0 Lakhs</strong> over the next 4 weeks.
            </p>
          </div>

          <div className="relative z-10 mt-5 pt-3 border-t border-[#E9D5FF]">
            <button
              onClick={() => onNavigate('cnt')}
              className="w-full py-2 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              View Recommendation <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                Recommended Actions
              </h3>
              <span className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer">
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
                    className="p-3 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] bg-[#F5F7FB] hover:bg-[#EFF6FF]/60 transition flex items-center justify-between cursor-pointer"
                    onClick={() => toggleAction(act.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center transition ${
                          checked
                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          checked ? 'line-through text-[#9CA3AF]' : 'text-[#111827]'
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
                      className="p-1 text-[#9CA3AF] hover:text-[#2563EB] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#9CA3AF]">
            <span>Multi-Agent Policy Engine</span>
            <button
              onClick={() => onNavigate('cnt')}
              className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
            >
              Simulate in Twin <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
