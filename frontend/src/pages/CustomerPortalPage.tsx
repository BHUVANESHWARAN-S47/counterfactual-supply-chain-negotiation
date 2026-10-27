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
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 border border-[#d2b0bd] bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#8e3a59] text-white shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Portal</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Welcome, Acme Industrial Solutions. Track verified production milestones and delivery transparency.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Active Orders List */}
        <div className="rounded-2xl p-5 border border-[#d2b0bd] bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Your Orders ({orders.length})
          </h3>
          <div className="space-y-2.5">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => handleSelectOrder(o)}
                className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedOrder?.id === o.id
                    ? 'bg-[#fdf2f8] border-[#8e3a59] text-[#8e3a59] font-bold shadow-2xs'
                    : 'bg-white border-[#e8d8de] text-slate-700 hover:border-[#d2b0bd]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{o.order_number}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {o.quantity}x {o.product_name}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-1 border-t border-[#f7eef3]">
                  <span>Target: {new Date(o.target_delivery_date).toLocaleDateString()}</span>
                  <span className="font-bold text-slate-900 font-mono">${o.max_budget.toLocaleString()}</span>
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
              <div className="rounded-2xl p-6 border border-[#d2b0bd] bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e8d8de] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      Order #{selectedOrder.order_number}
                      <StatusBadge status={selectedOrder.status} />
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Destination: {selectedOrder.delivery_address || 'Silicon Valley, CA'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Scheduled Delivery:</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {new Date(selectedOrder.target_delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Sourcing Explanation */}
                <div className="p-4 rounded-xl bg-[#fdf2f8] border border-[#d2b0bd] text-xs text-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#8e3a59]">
                    <ShieldCheck className="h-4 w-4 text-[#8e3a59]" />
                    <span>Autonomous Sourcing Transparency Advisory:</span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    {selectedOrder.customer_explanation ||
                      'Component shortage resolved via Counterfactual Multi-Agent switching. Certified batch scheduled for on-time delivery without assembly line delay.'}
                  </p>
                </div>

                {/* Milestone Stepper */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Verified Execution Milestones
                  </span>
                  <div className="space-y-2.5">
                    {timeline.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl border border-[#e8d8de] bg-[#fdf2f8]"
                      >
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0 ${
                            ev.state === 'COMPLETED'
                              ? 'bg-emerald-600 text-white'
                              : ev.state === 'ACTIVE'
                              ? 'bg-[#8e3a59] text-white'
                              : 'bg-[#d2b0bd] text-slate-700'
                          }`}
                        >
                          {ev.state === 'COMPLETED' ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{ev.label}</span>
                            <span
                              className={`text-[10px] uppercase font-bold ${
                                ev.state === 'COMPLETED'
                                  ? 'text-emerald-700'
                                  : ev.state === 'ACTIVE'
                                  ? 'text-[#8e3a59]'
                                  : 'text-slate-500'
                              }`}
                            >
                              {ev.state}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Feedback Card */}
              <div className="rounded-2xl p-6 border border-[#d2b0bd] bg-white shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                  Order Fulfillment Rating & Satisfaction Feedback
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Rate delivery transparency, schedule adherence, and component quality.
                </p>

                {feedbackSaved && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Thank you! Your feedback has been recorded and submitted to the AI Decision Agent.</span>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Satisfaction Score (1-5)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            rating >= star
                              ? 'bg-amber-50 border-amber-300 text-amber-500'
                              : 'bg-white border-[#d2b0bd] text-slate-300'
                          }`}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Comments / Notes</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Share your satisfaction with the delivery timeframe and notification transparency..."
                      rows={2}
                      className="w-full bg-white border border-[#d2b0bd] rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
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
