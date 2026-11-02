import React, { useState, useEffect } from 'react';
import { CustomerOrder, TimelineEvent } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { Plus, Clock, Eye, CheckCircle2, AlertCircle, ShoppingCart, X, FileText } from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<CustomerOrder | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Form State
  const [productId, setProductId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(100);
  const [maxBudget, setMaxBudget] = useState<number>(12000);
  const [deliveryDays, setDeliveryDays] = useState<number>(14);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('450 Innovation Parkway, Silicon Valley, CA 94025');
  const [specifications, setSpecifications] = useState<string>('Strict AEC-Q100 Grade 2 certification, sealed ESD packaging.');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + Number(deliveryDays));

      await api.createOrder({
        product_id: Number(productId),
        quantity: Number(quantity),
        target_delivery_date: targetDate.toISOString(),
        max_budget: Number(maxBudget),
        delivery_address: deliveryAddress,
        specifications: specifications,
      });

      setShowCreateModal(false);
      await fetchOrders();
    } catch (err: any) {
      alert(`Order Creation Failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTimeline = async (order: CustomerOrder) => {
    setSelectedTimelineOrder(order);
    setTimelineLoading(true);
    try {
      const res = await api.getOrderTimeline(order.id);
      setTimelineEvents(res.timeline);
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">
            Customer Demand & Orders Management
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Submit customer demand, evaluate delivery schedules, and track the autonomous multi-agent sourcing cycle.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Customer Request</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F5F7FB] text-[11px] uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order ID</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Product</th>
                <th className="py-3.5 px-4 font-bold">Quantity</th>
                <th className="py-3.5 px-4 font-bold">Target Delivery</th>
                <th className="py-3.5 px-4 font-bold">Max Budget</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F9FAFB] transition">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">{o.order_number}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#111827]">{o.customer_name}</div>
                    <div className="text-[11px] text-[#6B7280]">{o.customer_company}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#374151]">{o.product_name}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">{o.quantity} units</td>
                  <td className="py-3.5 px-4 text-[#6B7280]">
                    {new Date(o.target_delivery_date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827] font-mono">
                    ₹{o.max_budget.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleViewTimeline(o)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] hover:bg-[#2563EB] hover:text-white text-[#2563EB] font-semibold text-xs transition cursor-pointer"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Timeline</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-4">
              <h3 className="font-bold text-[#111827] text-base">New Customer Order Intake</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F3F4F6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#374151] font-semibold mb-1">Target Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value={1}>IC-MCU-ARM-32B (ARM Microcontroller 32-Bit)</option>
                  <option value={2}>PWR-MGMT-IC-5V (Power Management Controller)</option>
                  <option value={3}>SNS-IMU-6AXIS (6-Axis IMU Sensor Package)</option>
                  <option value={4}>CAP-CER-10UF-50V (High-Reliability Ceramic Capacitor)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#374151] font-semibold mb-1">Order Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#374151] font-semibold mb-1">Max Budget (₹ INR)</label>
                  <input
                    type="number"
                    min={100}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#374151] font-semibold mb-1">Target Lead Time (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#374151] font-semibold mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#374151] font-semibold mb-1">Specifications</label>
                <textarea
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Triggering Agents...' : 'Submit & Orchestrate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {selectedTimelineOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#2563EB]" />
                  Order Fulfillment Timeline: {selectedTimelineOrder.order_number}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {selectedTimelineOrder.quantity}x {selectedTimelineOrder.product_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedTimelineOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-[#F3F4F6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedTimelineOrder.customer_explanation && (
              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#1E3A8A] mb-4 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#2563EB]">Customer Transparency Update:</span>
                  <p className="mt-1 leading-relaxed text-[#1E3A8A]">{selectedTimelineOrder.customer_explanation}</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {timelineLoading ? (
                <div className="text-center py-8 text-[#6B7280] text-xs animate-pulse">
                  Loading verified event records...
                </div>
              ) : (
                timelineEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 ${
                        ev.state === 'COMPLETED'
                          ? 'bg-[#10B981] text-white'
                          : ev.state === 'ACTIVE'
                          ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20'
                          : 'bg-[#E5E7EB] text-[#6B7280]'
                      }`}
                    >
                      {ev.state === 'COMPLETED' ? '✓' : idx + 1}
                    </div>
                    <div
                      className={`flex-1 p-3 rounded-xl border ${
                        ev.state === 'ACTIVE'
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#111827] font-semibold'
                          : ev.state === 'COMPLETED'
                          ? 'bg-white border-[#E5E7EB] text-[#374151]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{ev.label}</span>
                        <span
                          className={`text-[10px] uppercase font-bold ${
                            ev.state === 'COMPLETED'
                              ? 'text-[#10B981]'
                              : ev.state === 'ACTIVE'
                              ? 'text-[#2563EB]'
                              : 'text-[#9CA3AF]'
                          }`}
                        >
                          {ev.state}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 text-[#6B7280] font-normal">{ev.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
