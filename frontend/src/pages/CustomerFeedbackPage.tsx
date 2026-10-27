import React, { useState, useEffect } from 'react';
import { CustomerFeedback, CustomerOrder } from '../types';
import { api } from '../services/api';
import { Star, MessageSquare, CheckCircle2, User, Send } from 'lucide-react';

export const CustomerFeedbackPage: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<CustomerFeedback[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number>(1);
  const [rating, setRating] = useState<number>(5);
  const [deliverySat, setDeliverySat] = useState<number>(5);
  const [qualitySat, setQualitySat] = useState<number>(5);
  const [comments, setComments] = useState<string>('Exceptional delivery speed and precision component packaging.');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const [fData, oData] = await Promise.all([
        api.getFeedback(),
        api.getOrders(),
      ]);
      setFeedbackList(fData);
      setOrders(oData);
      if (oData.length > 0) setSelectedOrderId(oData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitFeedback({
        order_id: selectedOrderId,
        rating,
        delivery_satisfaction: deliverySat,
        quality_satisfaction: qualitySat,
        comments,
      });
      setComments('');
      await fetchFeedback();
    } catch (err: any) {
      alert(`Feedback submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Customer Satisfaction & Feedback Ledger</h2>
        <p className="text-xs text-slate-400">
          Post-delivery ratings and customer transparency reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Review Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            Submit Delivery Feedback
          </h3>
          <p className="text-xs text-slate-400 mb-4">Rate fulfilled order performance</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Select Order</label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number} ({o.product_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Delivery Speed (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={deliverySat}
                  onChange={(e) => setDeliverySat(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Quality Rating (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={qualitySat}
                  onChange={(e) => setQualitySat(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Customer Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Share your fulfillment experience..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Recording...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Reviews Feed */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                Customer Ratings & Testimonials
              </h3>
              <span className="text-xs text-slate-400">{feedbackList.length} Verified Reviews</span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {feedbackList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No customer feedback recorded yet.
                </div>
              ) : (
                feedbackList.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <User className="h-3.5 w-3.5 text-blue-400" />
                        <span>{f.customer_name || 'Acme Robotics Systems'}</span>
                        <span className="text-slate-500 text-[11px] font-normal">
                          • Order #{f.order_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        {[...Array(f.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed italic">
                      "{f.comments || 'Order completed successfully on time.'}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>Delivery Satisfaction: {f.delivery_satisfaction}/5 • Quality: {f.quality_satisfaction}/5</span>
                      <span>{new Date(f.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
