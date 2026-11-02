import React, { useState, useEffect } from 'react';
import { Quotation, PurchaseOrder, ProcurementRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { Truck, FileText, Award, Send, CheckCircle2, PackageCheck, ArrowRight } from 'lucide-react';

export const SupplierPortalPage: React.FC = () => {
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedProcId, setSelectedProcId] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(43.5);
  const [leadDays, setLeadDays] = useState<number>(6);
  const [offeredQty, setOfferedQty] = useState<number>(90);
  const [notes, setNotes] = useState<string>('Priority shipment with ISO certified test reports.');
  const [submitting, setSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const fetchSupplierData = async () => {
    try {
      const [pData, qData, poData] = await Promise.all([
        api.getProcurementRequests(),
        api.getQuotations(),
        api.getPurchaseOrders(),
      ]);
      setProcurements(pData);
      setQuotations(qData.filter((q) => q.supplier_id === 1)); // Demo Apex supplier
      setPurchaseOrders(poData.filter((po) => po.supplier_id === 1));
      if (pData.length > 0) setSelectedProcId(pData[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitQuotation({
        procurement_request_id: selectedProcId,
        supplier_id: 1, // Apex Components
        offered_quantity: Number(offeredQty),
        unit_price: Number(unitPrice),
        delivery_lead_days: Number(leadDays),
        notes,
      });
      setQuoteSuccess(true);
      await fetchSupplierData();
      setTimeout(() => setQuoteSuccess(false), 4000);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (orderId: number) => {
    try {
      const shp = await api.dispatchShipment(orderId, 'Apex Logistics Express');
      setDispatchSuccess(`Shipment ${shp.shipment_number} dispatched! Tracking: ${shp.tracking_number}`);
      await fetchSupplierData();
      setTimeout(() => setDispatchSuccess(null), 5000);
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl p-6 border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#2563EB] text-white shadow-sm">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">Supplier Partner Portal</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Apex Components Ltd • View RFQs, submit revised quotations, and manage purchase order dispatch.
            </p>
          </div>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Quotation Form */}
        <div className="rounded-2xl p-6 border border-[#E5E7EB] bg-white shadow-xs">
          <h3 className="text-sm font-bold text-[#111827] mb-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#2563EB]" />
            Submit Quotation Response
          </h3>
          <p className="text-xs text-[#6B7280] mb-4">Respond to active procurement requisitions</p>

          {quoteSuccess && (
            <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] text-[#065F46] mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Quotation submitted & ranked!
            </div>
          )}

          <form onSubmit={handleSubmitQuote} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#374151] mb-1 font-semibold">Procurement Requisition</label>
              <select
                value={selectedProcId}
                onChange={(e) => setSelectedProcId(Number(e.target.value))}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#2563EB]"
              >
                {procurements.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.request_number} — {p.product_name || `Product #${p.product_id}`} ({p.shortage_quantity} units)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#374151] mb-1 font-semibold">Offered Rate (₹/unit)</label>
                <input
                  type="number"
                  step="0.1"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111827] font-bold focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#374151] mb-1 font-semibold">Lead Time (Days)</label>
                <input
                  type="number"
                  value={leadDays}
                  onChange={(e) => setLeadDays(Number(e.target.value))}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#374151] mb-1 font-semibold">Quantity Offered</label>
              <input
                type="number"
                value={offeredQty}
                onChange={(e) => setOfferedQty(Number(e.target.value))}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#2563EB]"
                required
              />
            </div>

            <div>
              <label className="block text-[#374151] mb-1 font-semibold">Proposal Notes & Certification</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Submitting Quote...' : 'Submit Quote to Enterprise'}</span>
            </button>
          </form>
        </div>

        {/* Awarded Purchase Orders & Fulfillment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F7FB] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-[#10B981]" />
                Awarded Purchase Orders (Fulfillment Required)
              </h3>
              <span className="text-xs text-[#6B7280] font-medium">
                {purchaseOrders.length} Committed POs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#111827]">
                <thead className="bg-[#F5F7FB] text-[11px] uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4 font-bold">PO Number</th>
                    <th className="py-3 px-4 font-bold">Product</th>
                    <th className="py-3 px-4 font-bold text-right">Units</th>
                    <th className="py-3 px-4 font-bold text-right">Unit Rate</th>
                    <th className="py-3 px-4 font-bold text-right">Total Value</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-[#F9FAFB] transition">
                        <td className="py-3.5 px-4 font-bold text-[#111827]">{po.po_number}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#374151]">{po.order_number || 'Industrial Component'}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#111827]">{po.quantity}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#374151]">₹{po.unit_price.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#10B981] font-mono">
                          ₹{po.total_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={po.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDispatch(po.order_id)}
                            className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition cursor-pointer"
                          >
                            Dispatch Batch
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                        No purchase orders pending dispatch. Submit competitive quotes to win sourcing awards.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
