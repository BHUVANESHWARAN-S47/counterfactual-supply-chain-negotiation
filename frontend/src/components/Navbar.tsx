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
  Search,
  Calendar,
  Filter,
  ChevronDown,
  User,
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
    ADMIN: { label: 'Administrator', icon: Shield, badgeColor: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]' },
    PROCUREMENT: { label: 'Procurement Manager', icon: Briefcase, badgeColor: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]' },
    SUPPLIER: { label: 'Supplier Portal', icon: Truck, badgeColor: 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]' },
    CUSTOMER: { label: 'Customer Portal', icon: UserCheck, badgeColor: 'bg-[#FFF7ED] text-[#F59E0B] border-[#FED7AA]' },
  }[role] || { label: 'User', icon: Shield, badgeColor: 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]' };

  const RoleIcon = roleMeta.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-white shadow-2xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] shadow-sm text-white">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-[#111827] text-base">
                Nexora
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                Twin
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] hidden sm:block">
              Counterfactual Supply Chain Intelligence
            </p>
          </div>
        </div>

        {/* Center: Search input matching screenshot */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search anything... ⌘ K"
              className="w-full bg-[#F5F7FB] border border-[#E5E7EB] rounded-xl pl-9 pr-12 py-2 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2563EB] transition"
            />
            <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#9CA3AF] bg-white border border-[#E5E7EB]">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Date Picker Button */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] text-xs font-semibold text-[#374151] transition shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-[#2563EB]" />
            <span className="text-[11px]">May 12 – May 19, 2026</span>
          </div>

          {/* AI Co-Pilot Button (Purple accent) */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9D5FF] bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
            <span className="hidden sm:inline">AI Co-Pilot</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                assistantStatus?.ollama_connected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-purple-200 text-purple-900'
              }`}
            >
              {assistantStatus?.ollama_connected ? 'LLaMA' : 'Active'}
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] border border-[#E5E7EB] transition-all shadow-2xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition bg-white cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] font-bold text-xs">
                {userName ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#111827] leading-tight">
                  {userName || 'User'}
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  {roleMeta.label}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-[#E5E7EB] shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-[#F3F4F6] mb-1">
                  <p className="text-xs font-bold text-[#111827]">{userName || 'User'}</p>
                  <p className="text-[11px] text-[#6B7280]">{companyName || 'Enterprise Node'}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta.badgeColor}`}>
                    {roleMeta.label}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
