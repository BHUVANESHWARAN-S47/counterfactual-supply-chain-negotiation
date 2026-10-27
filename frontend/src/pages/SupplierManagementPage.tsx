import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Supplier } from '../types';
import {
  Users,
  ShieldCheck,
  Star,
  Clock,
  Activity,
  Mail,
  Phone,
  MessagesSquare,
} from 'lucide-react';
import { NegotiationPage } from './NegotiationPage';

interface SupplierManagementPageProps {
  initialProcId?: number;
  initialSupplierId?: number;
  defaultSubTab?: 'directory' | 'negotiation';
}

export const SupplierManagementPage: React.FC<SupplierManagementPageProps> = ({
  initialProcId,
  initialSupplierId,
  defaultSubTab = 'directory',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'negotiation'>(defaultSubTab);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialProcId || initialSupplierId) {
      setActiveSubTab('negotiation');
    }
  }, [initialProcId, initialSupplierId]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await api.getSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">
            Supplier & Negotiation Hub
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Certified supplier partner profiles, reliability scorecards, and live bilateral multi-agent negotiations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] shadow-2xs self-start">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Supplier Directory ({suppliers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('negotiation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'negotiation'
                ? 'bg-[#7C3AED] text-white shadow-xs font-bold'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-white'
            }`}
          >
            <MessagesSquare className="h-3.5 w-3.5" />
            <span>AI Negotiation Arena</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl p-5 border border-[#E5E7EB] bg-white hover:border-[#2563EB]/50 transition shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#111827] text-sm">{s.name}</h3>
                    <span className="text-[11px] text-[#2563EB] font-semibold">{s.categories}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#FFF7ED] border border-[#FED7AA] px-2 py-0.5 rounded-lg text-xs font-bold text-[#F59E0B]">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    {s.baseline_rating.toFixed(1)}
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-[#F3F4F6] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Base Lead Time:
                    </span>
                    <span className="font-semibold text-[#111827]">{s.base_lead_time_days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280] flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-slate-400" /> Weekly Capacity:
                    </span>
                    <span className="font-semibold text-[#111827]">{s.capacity_per_week} units/wk</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280] flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Reliability:
                    </span>
                    <span className="font-bold text-[#10B981]">
                      {(s.reliability_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280] flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-[#F59E0B]" /> Disruption Risk:
                    </span>
                    <span
                      className={`font-bold ${
                        s.risk_score > 0.2 ? 'text-[#F59E0B]' : 'text-[#6B7280]'
                      }`}
                    >
                      {(s.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 text-[11px] text-[#6B7280] space-y-2">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <span>{s.contact_email}</span>
                </div>
                {s.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                )}
                <button
                  onClick={() => setActiveSubTab('negotiation')}
                  className="w-full mt-2 py-2 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] hover:bg-[#2563EB] hover:text-white text-[#2563EB] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <MessagesSquare className="h-3.5 w-3.5" />
                  <span>Open Active Negotiations</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NegotiationPage
          initialProcId={initialProcId}
          initialSupplierId={initialSupplierId}
        />
      )}
    </div>
  );
};
