import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building2,
  Package,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';

interface DecisionApprovalsPageProps {
  onNavigateToCNT?: (procId: number) => void;
}

export const DecisionApprovalsPage: React.FC<DecisionApprovalsPageProps> = ({ onNavigateToCNT }) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingApprovals();
      setApprovals(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (item: any) => {
    if (!item.procurement_request_id) return;
    try {
      setActionLoading(item.order_id);
      await api.approveSupplier({
        procurement_request_id: item.procurement_request_id,
        supplier_id: item.recommended_supplier_id || 1,
        selected_unit_price: item.recommended_unit_price,
        lead_time_days: item.recommended_lead_days || 7,
        quantity: item.quantity,
      });
      setFeedbackMsg({
        type: 'success',
        text: `Successfully approved supplier for Order #${item.order_number}. Purchase Order issued!`,
      });
      fetchApprovals();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Approval failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: number) => {
    const reason = prompt('Please specify rejection reason to return to Procurement Manager:');
    if (!reason) return;
    try {
      setActionLoading(orderId);
      await api.rejectApproval(orderId, reason);
      setFeedbackMsg({
        type: 'success',
        text: 'Recommendation rejected. Returned to Procurement queue for revision.',
      });
      fetchApprovals();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Rejection failed' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
              Governance & Oversight
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Waiting for Approval
          </h1>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5">
            Review supplier recommendations and approve purchase orders before orders are processed.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#2563EB] text-xs font-semibold text-[#374151] hover:text-[#2563EB] transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 text-[#2563EB]" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Approval Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E7EB]">
          <span className="animate-pulse text-xs font-bold text-[#2563EB]">
            Loading pending decision approvals from database...
          </span>
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E7EB] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#111827]">Approval Queue Clear</h3>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            All procurement decisions and supplier switches have been processed. New recommendations from the Decision Agent will automatically appear here for executive authorization.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((item) => (
            <div
              key={item.order_id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5 hover:border-[#D1D5DB] transition space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#2563EB] text-xs font-bold border border-[#DBEAFE]">
                    #{item.order_number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">
                      {item.customer_name} ({item.customer_company})
                    </h3>
                    <p className="text-[11px] text-[#6B7280]">
                      Product: <span className="font-semibold text-[#111827]">{item.product_name}</span> · Requested Qty: {item.quantity} units
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                      item.recommendation === 'SWITCH'
                        ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                        : item.recommendation === 'NEGOTIATE'
                        ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]'
                        : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                    }`}
                  >
                    AI Recommendation: {item.recommendation}
                  </span>
                </div>
              </div>

              {/* Grid of decision parameters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6] text-xs">
                <div>
                  <span className="text-[10px] text-[#6B7280] uppercase font-bold">Recommended Vendor</span>
                  <div className="font-bold text-[#111827] mt-0.5 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span>{item.recommended_supplier_name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#6B7280] uppercase font-bold">Quoted Unit Cost</span>
                  <div className="font-bold text-[#111827] mt-0.5">
                    {formatINR(item.recommended_unit_price)} / unit
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#6B7280] uppercase font-bold">Total Estimated Spend</span>
                  <div className="font-extrabold text-[#2563EB] mt-0.5">
                    {formatINR(item.total_estimated_cost)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#6B7280] uppercase font-bold">Expected Lead Time</span>
                  <div className="font-bold text-[#111827] mt-0.5 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
                    <span>{item.recommended_lead_days} Days</span>
                  </div>
                </div>
              </div>

              {/* Justification Quote */}
              <div className="p-3 rounded-xl bg-[#EFF6FF]/60 border border-[#DBEAFE] text-xs text-[#1E40AF]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
                  <span>Decision Agent Rationale & Risk Assessment:</span>
                </div>
                <p className="text-[11px] text-[#1E3A8A] leading-relaxed">
                  {item.justification}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {onNavigateToCNT && item.procurement_request_id && (
                  <button
                    onClick={() => onNavigateToCNT(item.procurement_request_id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    <span>Inspect Simulation Scenarios in CNT Twin</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    disabled={actionLoading === item.order_id}
                    onClick={() => handleReject(item.order_id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] text-xs font-bold transition cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject / Request Re-negotiation</span>
                  </button>

                  <button
                    disabled={actionLoading === item.order_id}
                    onClick={() => handleApprove(item)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{actionLoading === item.order_id ? 'Authorizing...' : 'Authorize & Issue PO'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
