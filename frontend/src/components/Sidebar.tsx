import React from 'react';
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
  Star,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  // Exactly 7 core modules for Admin and Procurement Manager
  const enterpriseModules = [
    { id: 'overview', label: '1. Overview Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: '2. Customer Demand & Orders', icon: ShoppingCart },
    { id: 'inventory', label: '3. Inventory & Shortage Analysis', icon: Package },
    { id: 'procurement', label: '4. Procurement & Quotations', icon: Layers },
    { id: 'cnt', label: '5. Counterfactual Twin (CNT)', icon: Cpu },
    { id: 'suppliers', label: '6. Supplier & Negotiation Hub', icon: Users },
    { id: 'reports', label: '7. Reports & Intelligence', icon: BarChart3 },
  ];

  // Role dedicated portals
  const supplierModules = [
    { id: 'supplier-portal', label: 'Supplier Workspace & RFQs', icon: Truck },
    { id: 'suppliers', label: 'Active Negotiations', icon: Users },
    { id: 'reports', label: 'Supplier Fulfillment Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
  ];

  const customerModules = [
    { id: 'customer-portal', label: 'Customer Workspace', icon: UserCheck },
    { id: 'orders', label: 'Order Tracking & Delivery', icon: ShoppingCart },
    { id: 'reports', label: 'Delivery SLA Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Order Notifications', icon: Bell },
  ];

  let activeNavItems = enterpriseModules;
  if (role === 'SUPPLIER') activeNavItems = supplierModules;
  if (role === 'CUSTOMER') activeNavItems = customerModules;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#d2b0bd] bg-white p-4 flex flex-col justify-between min-h-[calc(100vh-4rem)] shadow-xs">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {role === 'ADMIN'
              ? 'Admin Platform Modules (7)'
              : role === 'PROCUREMENT'
              ? 'Procurement Modules (7)'
              : role === 'SUPPLIER'
              ? 'Supplier Workspace'
              : 'Customer Workspace'}
          </div>
          <nav className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#8e3a59] text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#fdf2f8] border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-[#8e3a59]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="rounded-xl p-3 border border-[#d2b0bd] bg-[#fdf2f8] text-xs text-slate-700 space-y-1.5 shadow-2xs">
        <div className="flex items-center justify-between font-bold text-slate-900">
          <span>Supervisor Runtime</span>
          <span className="text-emerald-700 flex items-center gap-1 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          Autonomous multi-agent negotiation with Counterfactual Twin validation.
        </p>
      </div>
    </aside>
  );
};
