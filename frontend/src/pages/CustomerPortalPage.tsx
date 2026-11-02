import React, { useState, useEffect } from 'react';
import { CustomerOrder, TimelineEvent } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { UserCheck, Clock, ShieldCheck, Plus, CheckCircle2, Star, Send } from 'lucide-react';

export const CustomerPortalPage: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCustomerOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(data[0]);
        const tl = await api.getOrderTimeline(data[0].id);
        setTimeline(tl.timeline);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const handleSelectOrder = async (ord: CustomerOrder) => {
    setSelectedOrder(ord);
    setFeedbackSaved(false);
    try {
      const tl = await api.getOrderTimeline(ord.id);
      setTimeline(tl.timeline);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.submitFeedback({
        order_id: selectedOrder.id,
        rating,
        comments,
      });
      setFeedbackSaved(true);
      setComments('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl p-6 border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#2563EB] text-white shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">Customer Portal</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Welcome, Acme Industrial Solutions. Track verified production milestones and delivery transparency.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Active Orders List */}
        <div className="rounded-2xl p-5 border border-[#E5E7EB] bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Your Orders ({orders.length})
          </h3>
          <div className="space-y-2.5">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => handleSelectOrder(o)}
                className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedOrder?.id === o.id
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold shadow-2xs'
                    : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#D1D5DB]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{o.order_number}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-xs font-semibold text-[#111827]">
                  {o.quantity}x {o.product_name}
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#6B7280] mt-2 pt-1 border-t border-[#F3F4F6]">
                  <span>Target: {new Date(o.target_delivery_date).toLocaleDateString()}</span>
                  <span className="font-bold text-[#111827] font-mono">₹{o.max_budget.toLocaleString('en-IN')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Order Detail & Transparent Stepper */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOrder && (
            <>
              {/* Customer Transparency Card */}
              <div className="rounded-2xl p-6 border border-[#E5E7EB] bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                      Order #{selectedOrder.order_number}
                      <StatusBadge status={selectedOrder.status} />
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Destination: {selectedOrder.delivery_address || 'Silicon Valley, CA'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#6B7280] block">Scheduled Delivery:</span>
                    <span className="text-sm font-bold text-[#10B981]">
                      {new Date(selectedOrder.target_delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Sourcing Explanation */}
                <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#1E3A8A] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                    <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                    <span>Autonomous Sourcing Transparency Advisory:</span>
                  </div>
                  <p className="leading-relaxed text-[#1E3A8A]">
                    {selectedOrder.customer_explanation ||
                      'Component shortage resolved via Counterfactual Multi-Agent switching. Certified batch scheduled for on-time delivery without assembly line delay.'}
                  </p>
                </div>

                {/* Milestone Stepper */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
                    Verified Execution Milestones
                  </span>
                  <div className="space-y-2.5">
                    {timeline.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E7EB] bg-[#F5F7FB]"
                      >
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0 ${
                            ev.state === 'COMPLETED'
                              ? 'bg-[#10B981] text-white'
                              : ev.state === 'ACTIVE'
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-[#E5E7EB] text-[#6B7280]'
                          }`}
                        >
                          {ev.state === 'COMPLETED' ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-[#111827]">
                            <span>{ev.label}</span>
                            <span
                              className={`text-[10px] uppercase font-bold ${
                                ev.state === 'COMPLETED'
                                  ? 'text-[#10B981]'
                                  : ev.state === 'ACTIVE'
                                  ? 'text-[#2563EB]'
                                  : 'text-[#6B7280]'
                              }`}
                            >
                              {ev.state}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4B5563] mt-0.5">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Feedback Card */}
              <div className="rounded-2xl p-6 border border-[#E5E7EB] bg-white shadow-xs">
                <h3 className="text-sm font-bold text-[#111827] mb-1 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                  Order Fulfillment Rating & Satisfaction Feedback
                </h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  Rate delivery transparency, schedule adherence, and component quality.
                </p>

                {feedbackSaved && (
                  <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Thank you! Your feedback has been recorded and submitted to the AI Decision Agent.</span>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#374151] font-semibold mb-1">Satisfaction Score (1-5)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            rating >= star
                              ? 'bg-amber-50 border-amber-300 text-amber-500'
                              : 'bg-white border-[#E5E7EB] text-[#D1D5DB]'
                          }`}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#374151] font-semibold mb-1">Comments / Notes</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Share your satisfaction with the delivery timeframe and notification transparency..."
                      rows={2}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Customer Rating</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
