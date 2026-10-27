import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { api } from '../services/api';
import { Users, Star, Clock, Activity, ShieldCheck, Mail, Phone, MessagesSquare } from 'lucide-react';
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
    const fetchSuppliers = async () => {
      try {
        const data = await api.getSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Supplier & Negotiation Hub
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Certified supplier partner profiles, reliability scorecards, and live bilateral multi-agent negotiations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#d2b0bd] shadow-2xs self-start">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-[#8e3a59] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-[#fdf2f8]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Supplier Directory ({suppliers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('negotiation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'negotiation'
                ? 'bg-[#8e3a59] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-[#fdf2f8]'
            }`}
          >
            <MessagesSquare className="h-3.5 w-3.5" />
            <span>Negotiation Arena</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl p-5 border border-[#d2b0bd] bg-white hover:border-[#8e3a59] transition shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <span className="text-[11px] text-[#8e3a59] font-semibold">{s.categories}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    {s.baseline_rating.toFixed(1)}
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-[#e8d8de] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Base Lead Time:
                    </span>
                    <span className="font-semibold text-slate-900">{s.base_lead_time_days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-slate-400" /> Weekly Capacity:
                    </span>
                    <span className="font-semibold text-slate-900">{s.capacity_per_week} units/wk</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Reliability:
                    </span>
                    <span className="font-bold text-emerald-700">
                      {(s.reliability_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-amber-500" /> Disruption Risk:
                    </span>
                    <span
                      className={`font-bold ${
                        s.risk_score > 0.2 ? 'text-amber-700' : 'text-slate-700'
                      }`}
                    >
                      {(s.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 text-[11px] text-slate-500 space-y-2">
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
                  className="w-full mt-2 py-1.5 rounded-xl border border-[#d2b0bd] bg-[#fdf2f8] hover:bg-[#8e3a59] hover:text-white text-[#8e3a59] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
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
