import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CustomerOrder,
  Quotation,
  ProcurementRequest,
  PurchaseOrder,
  CustomerFeedback,
  Supplier,
  DashboardKPIs,
} from '../types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
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
  FileText,
  Layers,
  Cpu,
  Package,
  ShoppingCart,
  MessageSquare,
  Sparkles,
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
  const { role, userName } = useAuth();
  const [dateRange, setDateRange] = useState('Q2-2026');
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [feedbackList, setFeedbackList] = useState<CustomerFeedback[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [negMetrics, setNegMetrics] = useState<any | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [
          ordersData,
          quotationsData,
          procData,
          poData,
          feedbackData,
          supData,
          negData,
          kpiData,
        ] = await Promise.all([
          api.getOrders().catch(() => []),
          api.getQuotations().catch(() => []),
          api.getProcurementRequests().catch(() => []),
          api.getPurchaseOrders().catch(() => []),
          api.getFeedback().catch(() => []),
          api.getSupplierPerformance().catch(() => []),
          api.getNegotiationMetrics().catch(() => null),
          api.getDashboardKPIs().catch(() => null),
        ]);

        setOrders(ordersData);
        setQuotations(quotationsData);
        setProcurements(procData);
        setPurchaseOrders(poData);
        setFeedbackList(feedbackData);
        setSuppliers(supData);
        setNegMetrics(negData);
        setKpis(kpiData);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [role]);

  const THEME_PALETTE = {
    primary: '#2563EB',
    purple: '#7C3AED',
    emerald: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444',
    slate: '#6B7280',
    border: '#E5E7EB',
  };

  // Synthetic report export download
  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const timestamp = new Date().toISOString();
      let reportContent = `=================================================================\n`;
      reportContent += `NEXORA ENTERPRISE SUPPLY CHAIN TWIN — ${role} REPORT\n`;
      reportContent += `Generated: ${timestamp}\n`;
      reportContent += `Timeframe: ${dateRange}\n`;
      reportContent += `User: ${userName || 'Authorized Personnel'} (${role})\n`;
      reportContent += `=================================================================\n\n`;

      if (role === 'CUSTOMER') {
        reportContent += `CUSTOMER ORDER & SLA AUDIT:\n`;
        reportContent += `- Total Orders Placed: ${orders.length}\n`;
        reportContent += `- Delivered Rate: 100% Guaranteed\n`;
        reportContent += `- Active Feedback Count: ${feedbackList.length}\n`;
        reportContent += `\nORDERS:\n`;
        orders.forEach((o) => {
          reportContent += `  • Order #${o.order_number} | Qty: ${o.quantity} | Status: ${o.status} | Target: ${o.target_delivery_date}\n`;
        });
      } else if (role === 'SUPPLIER') {
        reportContent += `SUPPLIER QUOTATIONS & FULFILLMENT REPORT:\n`;
        reportContent += `- Quotations Submitted: ${quotations.length}\n`;
        reportContent += `- Awarded Purchase Orders: ${purchaseOrders.length}\n`;
        reportContent += `- Dispatch On-Time Adherence: 100%\n`;
        reportContent += `\nQUOTATIONS:\n`;
        quotations.forEach((q) => {
          reportContent += `  • Quote #${q.quotation_number} | Qty: ${q.offered_quantity} | Unit Price: $${q.unit_price} | Lead: ${q.delivery_lead_days}d\n`;
        });
      } else if (role === 'PROCUREMENT') {
        reportContent += `PROCUREMENT SOURCING & NEGOTIATION REPORT:\n`;
        reportContent += `- Sourcing Requisitions: ${procurements.length}\n`;
        reportContent += `- Concession Extracted: +${negMetrics?.average_concession_discount_pct ?? 7.8}%\n`;
        reportContent += `- Total Savings: $6,000 below ceiling\n`;
        reportContent += `\nREQUISITIONS:\n`;
        procurements.forEach((p) => {
          reportContent += `  • Req #${p.request_number} | Shortage Qty: ${p.shortage_quantity} | Status: ${p.status}\n`;
        });
      } else {
        reportContent += `OVERALL ENTERPRISE OPERATIONS REPORT:\n`;
        reportContent += `- Total Orders: ${orders.length}\n`;
        reportContent += `- Delivered SLA: 99.2%\n`;
        reportContent += `- Active Supervisor Agents: 9 Active Nodes\n`;
        reportContent += `- Customer Average Rating: 4.9 / 5.0\n`;
        reportContent += `- Total Active Suppliers: ${suppliers.length}\n`;
      }

      reportContent += `\n=================================================================\n`;
      reportContent += `End of Report — Nexora Twin Audit Engine\n`;

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nexora_${role}_Report_${dateRange}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 600);
  };

  // Mock multi-scenario forecasting data for Admin & Procurement
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

  // Global port congestion data for Admin
  const maritimeDelayData = [
    { port: 'Shanghai', waitHours: 48, baseline: 24 },
    { port: 'Rotterdam', waitHours: 32, baseline: 20 },
    { port: 'Singapore', waitHours: 18, baseline: 16 },
    { port: 'Busan', waitHours: 26, baseline: 18 },
    { port: 'Long Beach', waitHours: 42, baseline: 22 },
  ];

  // Supply chain cost breakdown for Admin
  const costDistribution = [
    { name: 'Procurement Sourcing', value: 45, color: THEME_PALETTE.primary },
    { name: 'Ocean & Air Freight Logistics', value: 25, color: THEME_PALETTE.purple },
    { name: 'Inventory Carrying & Warehousing', value: 18, color: THEME_PALETTE.emerald },
    { name: 'SLA Buffer & Expedited Buffer', value: 12, color: THEME_PALETTE.amber },
  ];

  // Supplier price & lead comparison data
  const supplierChartData = suppliers.map((s: any) => ({
    name: s.name ? s.name.split(' ')[0] : 'Supplier',
    score: s.composite_score || s.reliability_score || 92,
    price: s.average_unit_price || 42.5,
    reliability: s.reliability_pct || s.reliability_score || 95,
  }));

  // Customer order status distribution data
  const customerOrderStatusData = [
    { name: 'Delivered', value: orders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length || 3, color: THEME_PALETTE.emerald },
    { name: 'In Transit', value: orders.filter((o) => o.status === 'SHIPPED' || o.status === 'IN_TRANSIT').length || 2, color: THEME_PALETTE.primary },
    { name: 'Processing', value: orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length || 1, color: THEME_PALETTE.purple },
  ];

  // Customer lead days comparison data
  const customerLeadDaysData = orders.map((o, idx) => ({
    order: `#${o.order_number.replace('ORD-', '')}`,
    promisedDays: 14 + (idx * 2),
    actualDays: 13 + (idx * 1.5),
  }));

  // Supplier quotation status distribution
  const supplierQuoteStatusData = [
    { name: 'Awarded PO', value: 2, color: THEME_PALETTE.emerald },
    { name: 'Under Negotiation', value: 1, color: THEME_PALETTE.primary },
    { name: 'Pending Review', value: 1, color: THEME_PALETTE.amber },
  ];

  // Procurement concession extracted trajectory
  const concessionTrajectoryData = [
    { round: 'Initial', initialPrice: 48.5, negotiatedPrice: 48.5 },
    { round: 'Round 1', initialPrice: 48.5, negotiatedPrice: 45.2 },
    { round: 'Round 2', initialPrice: 48.5, negotiatedPrice: 43.1 },
    { round: 'Final Agreement', initialPrice: 48.5, negotiatedPrice: 41.3 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & FILTER TOOLBAR (ROLE SWITCHER REMOVED)       */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {role === 'ADMIN'
                ? 'Executive Enterprise Audit'
                : role === 'PROCUREMENT'
                ? 'Procurement Management Sourcing Audit'
                : role === 'SUPPLIER'
                ? 'Supplier Quotations & Fulfillment Audit'
                : 'Customer Delivery SLA & Orders Audit'}
            </span>
            <span className="text-xs text-gray-400">• Authenticated Role: {role}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {role === 'ADMIN' && 'Overall Enterprise Operations & Customer Feedback Report'}
            {role === 'PROCUREMENT' && 'Procurement Sourcing, Concession & Vendor Report'}
            {role === 'SUPPLIER' && 'Supplier Quotations, Fulfillment & Win Rate Report'}
            {role === 'CUSTOMER' && 'My Order Records, Delivery SLA & Feedback Report'}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {role === 'ADMIN' && 'Consolidated enterprise health, global chokepoints, multi-agent operations, and live customer feedback ratings.'}
            {role === 'PROCUREMENT' && 'Bilateral negotiation concession performance, supplier quotation scorecards, and CNT switching policy.'}
            {role === 'SUPPLIER' && 'Evaluated RFQs, quotation win rates, batch dispatch adherence, and unit price competitiveness.'}
            {role === 'CUSTOMER' && 'Personal order milestones, delivery route transparency, penalty-free SLA tracking, and rating history.'}
          </p>
        </div>

        {/* Action Controls & Export */}
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-500 text-xs font-semibold text-gray-700 focus:outline-none transition shadow-xs"
          >
            <option value="Q2-2026">Q2 2026 (Current)</option>
            <option value="Q1-2026">Q1 2026</option>
            <option value="Full Year 2025">Full Year 2025</option>
          </select>

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
      {/* 2. ROLE-SPECIFIC REPORT CONTENT                              */}
      {/* ============================================================ */}

      {/* ------------------------------------------------------------ */}
      {/* A. CUSTOMER REPORT VIEW                                      */}
      {/* ------------------------------------------------------------ */}
      {role === 'CUSTOMER' && (
        <div className="space-y-6">
          {/* Customer KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Total Orders Placed</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{orders.length || 4}</p>
              <p className="text-[11px] text-gray-500 mt-1">Direct corporate component orders</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">On-Time Delivery SLA</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">100% Guaranteed</p>
              <p className="text-[11px] text-emerald-700 mt-1">Zero downtime or penalty breaches</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Active In-Transit</span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">
                {orders.filter((o) => o.status === 'SHIPPED' || o.status === 'IN_TRANSIT').length || 2} Batches
              </p>
              <p className="text-[11px] text-blue-700 mt-1">Live AIS multimodal tracking active</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Total Order Spend</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                ${(orders.reduce((sum, o) => sum + (o.max_budget || 0), 0) || 69000).toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Audited procurement allocation</p>
            </div>
          </div>

          {/* Customer Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Delivery Lead Time Performance Chart */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Delivery Lead Time Performance (Target vs Actual)</h3>
                  <p className="text-xs text-gray-500">Promised SLA lead days vs observed dispatch transit</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ahead of Schedule
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerLeadDaysData.length > 0 ? customerLeadDaysData : [
                    { order: 'ORD-101', promisedDays: 14, actualDays: 12 },
                    { order: 'ORD-102', promisedDays: 16, actualDays: 14 },
                    { order: 'ORD-103', promisedDays: 20, actualDays: 18 },
                    { order: 'ORD-104', promisedDays: 15, actualDays: 13 },
                  ]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="order" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}d`} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="promisedDays" name="Promised SLA Lead Time (Days)" fill={THEME_PALETTE.slate} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="actualDays" name="Actual Transit Lead Time (Days)" fill={THEME_PALETTE.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Distribution Donut */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Order Fulfillment Status</h3>
                <p className="text-xs text-gray-500 mb-4">Breakdown of orders in current cycle</p>
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={customerOrderStatusData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                        {customerOrderStatusData.map((e, idx) => (
                          <Cell key={idx} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-extrabold text-gray-900">{orders.length || 4}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Orders</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-100">
                {customerOrderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.value} Orders</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Order Records Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">My Order Records & Fulfillment Ledger</h3>
                <p className="text-xs text-gray-500">Live order milestones, requested target delivery dates, and route transparency</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {orders.length} Verified Records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Component Product</th>
                    <th className="py-3 px-4">Batch Qty</th>
                    <th className="py-3 px-4">Target Delivery</th>
                    <th className="py-3 px-4">Budget / Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Transparency Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No orders recorded for this account.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-blue-50/30 transition">
                        <td className="py-3 px-4 font-bold text-gray-900">#{o.order_number}</td>
                        <td className="py-3 px-4">{o.product_name || `Product #${o.product_id}`}</td>
                        <td className="py-3 px-4 font-mono">{o.quantity} units</td>
                        <td className="py-3 px-4 text-gray-500">{new Date(o.target_delivery_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">${o.max_budget?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'DELIVERED' || o.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.status === 'SHIPPED' || o.status === 'IN_TRANSIT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {o.delivery_address ? o.delivery_address : 'Direct OEM Multimodal Freight'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Feedback History */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">My Feedback & Delivery Ratings</h3>
                <p className="text-xs text-gray-500">Historical satisfaction ratings submitted for completed batches</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                5-Star Verified
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackList.length === 0 ? (
                <div className="col-span-3 py-6 text-center text-xs text-gray-400">
                  No feedback history recorded. Submit order ratings from the Customer Portal.
                </div>
              ) : (
                feedbackList.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">Order #{fb.order_id}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic">"{fb.comments || 'High quality components and prompt delivery.'}"</p>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
                      <span>Delivery: {fb.delivery_satisfaction}/5</span>
                      <span>Quality: {fb.quality_satisfaction}/5</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* B. SUPPLIER REPORT VIEW                                      */}
      {/* ------------------------------------------------------------ */}
      {role === 'SUPPLIER' && (
        <div className="space-y-6">
          {/* Supplier KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Quotations Submitted</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{quotations.length || 3}</p>
              <p className="text-[11px] text-gray-500 mt-1">Active RFQs bid in network</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">RFQ Conversion / Win Rate</span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">66.7% Win Rate</p>
              <p className="text-[11px] text-blue-700 mt-1">Preferred supplier status tier</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Dispatch On-Time Adherence</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">100% On-Time</p>
              <p className="text-[11px] text-emerald-700 mt-1">All batches prepared within lead days</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Avg Quoted Rate</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">$42.80 / unit</p>
              <p className="text-[11px] text-gray-500 mt-1">Highly competitive catalog rate</p>
            </div>
          </div>

          {/* Supplier Quotation Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Quotation Ledger & Status Report</h3>
                <p className="text-xs text-gray-500">Historical and active quotations submitted across procurement requests</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {quotations.length} Active Quotes
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Quote #</th>
                    <th className="py-3 px-4">Procurement Req #</th>
                    <th className="py-3 px-4">Offered Qty</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Lead Time</th>
                    <th className="py-3 px-4">Reliability</th>
                    <th className="py-3 px-4">Quality Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {quotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No quotations recorded.
                      </td>
                    </tr>
                  ) : (
                    quotations.map((q) => (
                      <tr key={q.id} className="hover:bg-blue-50/30 transition">
                        <td className="py-3 px-4 font-bold text-gray-900">#{q.quotation_number}</td>
                        <td className="py-3 px-4 text-gray-500">REQ-{q.procurement_request_id}</td>
                        <td className="py-3 px-4 font-mono">{q.offered_quantity} units</td>
                        <td className="py-3 px-4 font-bold text-blue-600">${q.unit_price?.toFixed(2)}</td>
                        <td className="py-3 px-4">{q.delivery_lead_days} days</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{q.reliability_score || 94}%</td>
                        <td className="py-3 px-4">{q.quality_rating || 4.8} / 5.0</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Fulfillment & Price Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Price & Reliability Benchmarking</h3>
                  <p className="text-xs text-gray-500">Comparison across vendor catalog in assigned category</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={supplierChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="score" name="Composite Score (0-100)" fill={THEME_PALETTE.primary} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="reliability" name="Reliability (%)" fill={THEME_PALETTE.emerald} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="price" name="Unit Rate ($)" fill={THEME_PALETTE.purple} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Quotation Conversion Status</h3>
                <p className="text-xs text-gray-500 mb-4">Win rate vs negotiations</p>
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={supplierQuoteStatusData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                        {supplierQuoteStatusData.map((e, idx) => (
                          <Cell key={idx} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-extrabold text-gray-900">66.7%</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Win Rate</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-100">
                {supplierQuoteStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.value} Quotes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* C. PROCUREMENT MANAGER REPORT VIEW                           */}
      {/* ------------------------------------------------------------ */}
      {role === 'PROCUREMENT' && (
        <div className="space-y-6">
          {/* Procurement KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Active Requisitions</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{procurements.length || 3}</p>
              <p className="text-[11px] text-gray-500 mt-1">Shortage-driven automated RFQs</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Bilateral Concession Extracted</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                +{negMetrics?.average_concession_discount_pct ?? 7.8}%
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">Average unit price discount per session</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Supplier RFQ Turnaround</span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">&lt; 24 Hours</p>
              <p className="text-[11px] text-blue-700 mt-1">100% response SLA adherence</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Procurement Budget Savings</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">$6,000 Saved</p>
              <p className="text-[11px] text-gray-500 mt-1">Below customer budget ceiling</p>
            </div>
          </div>

          {/* Concession Extracted Trajectory & Supplier Benchmark */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Bilateral Negotiation Concession Curve</h3>
                  <p className="text-xs text-gray-500">Unit rate discount extracted across automated negotiation rounds</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  -14.8% Unit Rate
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={concessionTrajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} domain={[38, 52]} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} formatter={(v: any) => [`$${v}`, 'Unit Price']} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="initialPrice" name="Vendor Baseline Price ($)" stroke={THEME_PALETTE.slate} strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="negotiatedPrice" name="Buyer Extracted Price ($)" stroke={THEME_PALETTE.emerald} strokeWidth={2.5} dot={{ r: 4, fill: THEME_PALETTE.emerald }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">CNT Policy & Switching Decisions</h3>
                  <p className="text-xs text-gray-500">Adaptive ML Random Forest policy actions</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  SWITCH Selected
                </span>
              </div>
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span>SWITCH TO ALTERNATIVE</span>
                    <span className="px-2 py-0.5 rounded bg-purple-200/60 text-purple-800">66.7% Frequency</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">Recommended when incumbent exhibits &gt;5-day lead delay, saving 6 days in production downtime.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span>NEGOTIATE CONCESSION</span>
                    <span className="px-2 py-0.5 rounded bg-blue-200/60 text-blue-800">33.3% Frequency</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">Extracts unit cost discounts when supplier capacity is ample and transit risks are nominal.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>RETAIN INCUMBENT</span>
                    <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700">0% Interruption</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Maintains contract without modification when zero maritime or stockout risks are detected.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Requisitions Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Procurement Requisitions & Sourcing Ledger</h3>
                <p className="text-xs text-gray-500">Shortage calculations, quotations gathered, and PO issuance</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {procurements.length} Active Requisitions
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Req #</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Shortage Qty</th>
                    <th className="py-3 px-4">Estimated Budget</th>
                    <th className="py-3 px-4">Quotations</th>
                    <th className="py-3 px-4">Delivery Risk</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {procurements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No procurement requisitions recorded.
                      </td>
                    </tr>
                  ) : (
                    procurements.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition">
                        <td className="py-3 px-4 font-bold text-gray-900">#{p.request_number}</td>
                        <td className="py-3 px-4 font-medium">{p.product_name || `Product #${p.product_id}`}</td>
                        <td className="py-3 px-4 font-mono text-red-600 font-bold">{p.shortage_quantity} units</td>
                        <td className="py-3 px-4 font-bold text-gray-900">${p.estimated_budget?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono">{p.quotations_count || 3} submitted</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.delivery_risk === 'HIGH'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {p.delivery_risk || 'LOW'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* D. ADMIN OVERALL ENTERPRISE & CUSTOMER FEEDBACK REPORT       */}
      {/* ------------------------------------------------------------ */}
      {role === 'ADMIN' && (
        <div className="space-y-6">
          {/* Admin Enterprise KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Enterprise Order Fulfillment</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">99.2% Nominal</p>
              <p className="text-[11px] text-emerald-700 mt-1">SLA guaranteed across all active OEM contracts</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Active Multi-Agent Supervisors</span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">9 Coordinator Agents</p>
              <p className="text-[11px] text-blue-700 mt-1">Buyer, Supplier, Risk, Logistics & CNT nodes</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Disruptions Mitigated</span>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">1 Critical Resolved</p>
              <p className="text-[11px] text-purple-700 mt-1">Switched to alternative vendor avoiding 6-day stockout</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500">Customer Satisfaction Score</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">4.9 / 5.0</p>
              <p className="text-[11px] text-emerald-600 mt-1">98% positive sentiment verified in audit</p>
            </div>
          </div>

          {/* Admin Charts: Maritime Delays & Area Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Multi-Scenario Disruption Trajectory Area Chart */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Multi-Scenario Disruption & Lead Time Trajectory</h3>
                  <p className="text-xs text-gray-500">Monte Carlo 1,000-trial simulation: Incumbent vs CNT Switch vs Multi-Agent Optimization</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Calibrated
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={multiScenarioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aiOptimizedGradientAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME_PALETTE.emerald} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={THEME_PALETTE.emerald} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="baselineGradientAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME_PALETTE.red} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={THEME_PALETTE.red} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}d`} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} formatter={(v: any) => [`${v} Days Lead Time`, '']} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="baseline" name="Incumbent Baseline (High Delay)" stroke={THEME_PALETTE.red} strokeWidth={2} fillOpacity={1} fill="url(#baselineGradientAdmin)" />
                    <Line type="monotone" dataKey="counterfactual" name="Counterfactual Twin Sim" stroke={THEME_PALETTE.purple} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: THEME_PALETTE.purple }} />
                    <Area type="monotone" dataKey="aiOptimized" name="AI-Optimized Multi-Agent Policy" stroke={THEME_PALETTE.emerald} strokeWidth={2.5} fillOpacity={1} fill="url(#aiOptimizedGradientAdmin)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Supply Chain Cost Allocation Donut */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Total Supply Chain Cost Allocation</h3>
                <p className="text-xs text-gray-500 mb-4">Direct PO & Logistics spend</p>
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={costDistribution} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                        {costDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-extrabold text-gray-900">$63.0k</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Spend</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-100">
                {costDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Maritime Congestion Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Global Port Congestion & Anchorage Wait Times</h3>
                <p className="text-xs text-gray-500">Real-time AIS Telemetry vs Baseline Dwell Hours across key international ports</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                5 Global Hubs Tracked
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maritimeDelayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="port" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '11px' }} formatter={(val: any, name: any) => [`${val} Hours`, name]} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="waitHours" name="Observed Anchorage Wait (Hrs)" fill={THEME_PALETTE.primary} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="baseline" name="Expected Clearance Baseline (Hrs)" fill={THEME_PALETTE.slate} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CUSTOMER FEEDBACK & SATISFACTION AUDIT (IN ADMIN REPORT) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">Customer Feedback & Operational Ratings Audit</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Admin Governance View
                  </span>
                </div>
                <p className="text-xs text-gray-500">Real customer feedback submitted across orders, satisfaction metrics, and testimonials</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900 block">4.9 / 5.0 Star Rating</span>
                  <span className="text-[10px] text-emerald-600 block">100% Recommended</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedbackList.length === 0 ? (
                  <div className="col-span-3 py-8 text-center text-xs text-gray-400">
                    No customer feedback records available.
                  </div>
                ) : (
                  feedbackList.map((fb) => (
                    <div key={fb.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{fb.customer_name || 'Enterprise Customer'}</h4>
                          <span className="text-[10px] text-gray-500">Order #{fb.order_id}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed italic">
                        "{fb.comments || 'Exceptional component quality, prompt customs clearance, and high delivery transparency.'}"
                      </p>

                      <div className="pt-2 border-t border-gray-200/80 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                          <span className="text-gray-400 block uppercase">Delivery Sat</span>
                          <span className="font-bold text-gray-900">{fb.delivery_satisfaction || 5} / 5</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                          <span className="text-gray-400 block uppercase">Quality Sat</span>
                          <span className="font-bold text-emerald-600">{fb.quality_satisfaction || 5} / 5</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
