import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Users,
  Cpu,
  BarChart3,
  Bell,
  Truck,
  UserCheck,
  Globe,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Activity,
  Eye,
  MessageSquare,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  // Dedicated Admin Governance Navigation
  const adminModules = [
    { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'approvals', label: 'Waiting for Approval', icon: ShieldCheck },
    { id: 'users', label: 'User & Role Mgmt', icon: Users },
    { id: 'suppliers', label: 'Supplier Governance', icon: Building2 },
    { id: 'orders', label: 'Demand Oversight', icon: Eye },
    { id: 'agent-monitor', label: 'Task & System Status', icon: Activity, isAi: true },
    { id: 'reports', label: 'Reports & Governance', icon: BarChart3 },
    { id: 'notifications', label: 'Governance Alerts', icon: Bell },
  ];

  // Dedicated Operational Procurement Manager Navigation
  const procurementModules = [
    { id: 'overview', label: 'Purchasing Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Customer Demand', icon: ShoppingCart },
    { id: 'inventory', label: 'Stock & Inventory', icon: Package },
    { id: 'procurement', label: 'Purchasing & Quotes', icon: Layers },
    { id: 'cnt', label: 'Compare Suppliers', icon: Cpu, isAi: true },
    { id: 'suppliers', label: 'Suppliers & Negotiation', icon: Users },
    { id: 'reports', label: 'Purchasing Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts & Messages', icon: Bell },
  ];

  // Role dedicated portals
  const supplierModules = [
    { id: 'supplier-portal', label: 'Supplier Workspace', icon: Truck },
    { id: 'suppliers', label: 'Active Negotiations', icon: Users },
    { id: 'reports', label: 'Fulfillment Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts & Messages', icon: Bell },
  ];

  const customerModules = [
    { id: 'customer-portal', label: 'Customer Workspace', icon: UserCheck },
    { id: 'orders', label: 'Order Tracking & SLA', icon: ShoppingCart },
    { id: 'feedback', label: 'Delivery Feedback', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  let activeNavItems = procurementModules;
  if (role === 'ADMIN') activeNavItems = adminModules;
  if (role === 'SUPPLIER') activeNavItems = supplierModules;
  if (role === 'CUSTOMER') activeNavItems = customerModules;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#E5E7EB] bg-white p-4 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            {role === 'ADMIN'
              ? 'Admin Modules'
              : role === 'PROCUREMENT'
              ? 'Procurement Modules'
              : role === 'SUPPLIER'
              ? 'Supplier Portal'
              : 'Customer Portal'}
          </div>
          <nav className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? item.isAi
                        ? 'bg-[#F3E8FF] text-[#7C3AED] shadow-2xs font-bold border border-[#E9D5FF]'
                        : 'bg-[#EFF6FF] text-[#2563EB] shadow-2xs font-bold border border-[#DBEAFE]'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        active
                          ? item.isAi
                            ? 'text-[#7C3AED]'
                            : 'text-[#2563EB]'
                          : 'text-[#9CA3AF]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.isAi && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F3E8FF] text-[#7C3AED]">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Controls matching Screenshot */}
      <div className="space-y-3 pt-4 border-t border-[#F3F4F6]">


        {/* Global View Selector Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition cursor-pointer text-xs text-[#374151]">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-[#2563EB]" />
            <span className="font-semibold text-[11px]">Global Network</span>
          </div>
          <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
        </div>
      </div>
    </aside>
  );
};
