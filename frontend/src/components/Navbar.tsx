import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Bell,
  Sparkles,
  Shield,
  Briefcase,
  Truck,
  UserCheck,
  LogOut,
  Building,
} from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  onOpenAssistant: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant, onOpenNotifications }) => {
  const { role, userName, companyName, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [assistantStatus, setAssistantStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const notifs = await api.getNotifications(role, true);
        setUnreadCount(notifs.length);
        const st = await api.getAssistantStatus();
        setAssistantStatus(st);
      } catch (err) {
        // quiet error
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [role]);

  const roleMeta = {
    ADMIN: { label: 'Administrator', icon: Shield, badgeColor: 'bg-[#fdf2f8] text-[#8e3a59] border-[#d2b0bd]' },
    PROCUREMENT: { label: 'Procurement Manager', icon: Briefcase, badgeColor: 'bg-[#fdf2f8] text-[#8e3a59] border-[#d2b0bd]' },
    SUPPLIER: { label: 'Supplier Portal', icon: Truck, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    CUSTOMER: { label: 'Customer Portal', icon: UserCheck, badgeColor: 'bg-amber-50 text-amber-800 border-amber-300' },
  }[role] || { label: 'User', icon: Shield, badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' };

  const RoleIcon = roleMeta.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#d2b0bd] bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8e3a59] shadow-sm shadow-[#8e3a59]/20 text-white">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base">
                CNT Supply Chain AI
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Counterfactual Multi-Agent Negotiation & Decision Platform
            </p>
          </div>
        </div>

        {/* Current Authenticated Role Badge */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-[#e8d8de] bg-[#fdf2f8]">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Workspace:
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${roleMeta.badgeColor}`}>
            <RoleIcon className="h-3.5 w-3.5" />
            <span>{roleMeta.label}</span>
          </div>
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <Building className="h-3 w-3 text-slate-400" />
            <span className="font-medium text-slate-800">{companyName || 'Enterprise'}</span>
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#d2b0bd] bg-[#fdf2f8] hover:bg-[#e8d8de] text-[#8e3a59] text-xs font-semibold transition-all shadow-2xs"
          >
            <Sparkles className="h-4 w-4 text-[#8e3a59]" />
            <span className="hidden sm:inline">AI Co-Pilot</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                assistantStatus?.ollama_connected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {assistantStatus?.ollama_connected ? 'LLaMA (Ollama)' : 'Heuristic Engine'}
            </span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#fdf2f8] border border-[#d2b0bd] transition-all shadow-2xs"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="hidden sm:flex flex-col text-right pl-2 border-l border-[#e8d8de]">
            <span className="text-xs font-semibold text-slate-900">{userName || 'Active User'}</span>
            <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{companyName}</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d2b0bd] bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 text-xs font-semibold transition-all shadow-2xs ml-1 cursor-pointer"
            title="Log out back to Landing Page"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
