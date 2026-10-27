import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { Package, PlusCircle, Calculator, History, AlertTriangle, ArrowUpDown, X, CheckCircle2 } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Shortage Calculator State
  const [calcProductId, setCalcProductId] = useState<number>(1);
  const [calcQuantity, setCalcQuantity] = useState<number>(100);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Stock Adjustment State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<string>('INTAKE');
  const [adjustQty, setAdjustQty] = useState<number>(50);
  const [adjustNotes, setAdjustNotes] = useState<string>('Inbound batch arrival');

  const fetchData = async () => {
    try {
      const [invData, txData] = await Promise.all([
        api.getInventory(),
        api.getInventoryTransactions(),
      ]);
      setInventory(invData);
      setTransactions(txData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCalculateShortage = async () => {
    try {
      const res = await fetch('/api/inventory/calculate-shortage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: calcProductId,
          required_quantity: calcQuantity,
          target_delivery_date: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      setCalcResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adjustStock(adjustProductId, adjustType, adjustQty, adjustNotes);
      setShowAdjustModal(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">
            Warehouse Inventory & Shortage Analysis
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Strict formula rule: <code className="text-[#2563EB] font-bold">Available = On-Hand - Reserved</code> • <code className="text-[#2563EB] font-bold">Shortage = max(0, Required - Available)</code>
          </p>
        </div>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span>Record Stock Movement</span>
        </button>
      </div>

      {/* Real-time Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F7FB] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] flex items-center gap-2">
            <Package className="h-4 w-4 text-[#2563EB]" />
            Live Warehouse Inventory Positions
          </h3>
          <span className="text-xs text-[#6B7280] font-medium">4 Critical Component SKUs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F5F7FB] text-[11px] uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3 px-4 font-bold">SKU / Product</th>
                <th className="py-3 px-4 font-bold text-right">On-Hand</th>
                <th className="py-3 px-4 font-bold text-right">Reserved</th>
                <th className="py-3 px-4 font-bold text-right text-[#2563EB]">Available Stock</th>
                <th className="py-3 px-4 font-bold text-right">Incoming (ETA)</th>
                <th className="py-3 px-4 font-bold text-right">Reorder Level</th>
                <th className="py-3 px-4 font-bold text-right">Unit Cost</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {inventory.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F9FAFB] transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#111827]">{inv.product_name}</div>
                    <div className="text-[11px] text-[#6B7280] font-mono">{inv.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-[#4B5563]">{inv.on_hand}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#F59E0B]">{inv.reserved}</td>
                  <td className="py-3 px-4 text-right font-bold text-base text-[#2563EB]">
                    {inv.available}
                  </td>
                  <td className="py-3 px-4 text-right text-[#6B7280]">
                    {inv.incoming > 0 ? (
                      <span className="text-[#10B981] font-bold">+{inv.incoming} (3d)</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-[#6B7280]">{inv.reorder_level}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#111827] font-mono">
                    ${inv.unit_cost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Shortage Calculator Tool & Movement History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shortage Calculator */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-5 w-5 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#111827]">Deterministic Shortage Calculator</h3>
          </div>
          <p className="text-xs text-[#6B7280] mb-4">
            Test and verify shortage calculations against real-time warehouse availability.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] text-[#4B5563] mb-1 font-semibold">Target Component</label>
              <select
                value={calcProductId}
                onChange={(e) => setCalcProductId(Number(e.target.value))}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#2563EB]"
              >
                {inventory.map((i) => (
                  <option key={i.product_id} value={i.product_id}>
                    {i.product_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#4B5563] mb-1 font-semibold">Required Units</label>
              <input
                type="number"
                value={calcQuantity}
                onChange={(e) => setCalcQuantity(Number(e.target.value))}
                min={1}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <button
            onClick={handleCalculateShortage}
            className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs mb-4 cursor-pointer"
          >
            Compute Shortage & Purchase Cost
          </button>

          {calcResult && (
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2 text-xs animate-in fade-in">
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Available Stock:</span>
                <span className="font-bold text-[#111827]">{calcResult.available_stock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Calculated Shortage:</span>
                <span
                  className={`font-bold ${
                    calcResult.is_shortage ? 'text-[#EF4444] text-sm' : 'text-[#10B981]'
                  }`}
                >
                  {calcResult.shortage_quantity} units
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#DBEAFE]">
                <span className="text-[#4B5563]">Estimated Sourcing Cost:</span>
                <span className="font-bold text-[#111827] text-sm font-mono">
                  ${calcResult.estimated_purchase_cost.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stock Movement Audit History */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-5 w-5 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#111827]">Stock Movement Audit History</h3>
          </div>
          <p className="text-xs text-[#6B7280] mb-4">
            Audited ledger of warehouse intake, reservations, and dispatch events.
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#111827]">{t.product_name}</span>
                  <div className="text-[11px] text-[#6B7280]">{t.notes || t.type}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold ${
                      t.type === 'INTAKE' ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  >
                    {t.type === 'INTAKE' ? `+${t.quantity}` : `-${t.quantity}`} units
                  </span>
                  <div className="text-[10px] text-[#9CA3AF]">
                    {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-4">
              <h3 className="font-bold text-[#111827] text-sm">Record Stock Adjustment</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#F3F4F6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdjustStock} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">Target Component</label>
                <select
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  {inventory.map((i) => (
                    <option key={i.product_id} value={i.product_id}>
                      {i.product_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4B5563] font-semibold mb-1">Action Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="INTAKE">Inbound Intake (+)</option>
                    <option value="RESERVE">Reserve for Order (-)</option>
                    <option value="SCRAP">Scrap / Defective (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4B5563] font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">Adjustment Notes</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold cursor-pointer"
                >
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
