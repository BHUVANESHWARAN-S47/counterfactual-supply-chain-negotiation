import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIAssistantModal } from './components/AIAssistantModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

// Core & Role Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { ProcurementPage } from './pages/ProcurementPage';
import { CounterfactualTwinPage } from './pages/CounterfactualTwinPage';
import { SupplierManagementPage } from './pages/SupplierManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { DecisionApprovalsPage } from './pages/DecisionApprovalsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AgentMonitorPage } from './pages/AgentMonitorPage';
import { CustomerFeedbackPage } from './pages/CustomerFeedbackPage';

// Role Workspaces
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { SupplierPortalPage } from './pages/SupplierPortalPage';
import { NotificationsPage } from './pages/NotificationsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedProcIdForCNT, setSelectedProcIdForCNT] = useState<number | undefined>(undefined);
  const [selectedProcIdForNeg, setSelectedProcIdForNeg] = useState<number | undefined>(undefined);
  const [selectedSupIdForNeg, setSelectedSupIdForNeg] = useState<number | undefined>(undefined);

  // Unauthenticated public view state ('landing' | 'login')
  const [publicView, setPublicView] = useState<'landing' | 'login'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Automatically configure the default active tab based on the authenticated role
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'SUPPLIER') {
        setActiveTab('supplier-portal');
      } else if (role === 'CUSTOMER') {
        setActiveTab('customer-portal');
      } else if (role === 'PROCUREMENT') {
        setActiveTab('procurement');
      } else {
        setActiveTab('overview');
      }
    }
  }, [isAuthenticated, role]);

  // If user is not authenticated, render either the Landing Page or dedicated full-screen LoginPage
  if (!isAuthenticated) {
    if (publicView === 'login') {
      return (
        <LoginPage
          initialMode={authMode}
          onBackToLanding={() => setPublicView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGoToLogin={(mode) => {
          setAuthMode(mode);
          setPublicView('login');
        }}
      />
    );
  }

  const handleNavigateToCNT = (procId: number) => {
    setSelectedProcIdForCNT(procId);
    setActiveTab('cnt');
  };

  const handleNavigateToNegotiation = (procId: number, supId?: number) => {
    setSelectedProcIdForNeg(procId);
    setSelectedSupIdForNeg(supId);
    setActiveTab('suppliers');
  };

  // Enforce role isolation in view rendering
  const renderActiveView = () => {
    // 1. Supplier Role Modules
    if (role === 'SUPPLIER') {
      if (activeTab === 'suppliers') {
        return (
          <SupplierManagementPage
            initialProcId={selectedProcIdForNeg}
            initialSupplierId={selectedSupIdForNeg}
            defaultSubTab="negotiation"
          />
        );
      }
      if (activeTab === 'reports') {
        return <ReportsPage />;
      }
      if (activeTab === 'notifications') {
        return <NotificationsPage />;
      }
      return <SupplierPortalPage />;
    }

    // 2. Customer Role Modules
    if (role === 'CUSTOMER') {
      if (activeTab === 'orders') {
        return <CustomerOrdersPage />;
      }
      if (activeTab === 'feedback') {
        return <CustomerFeedbackPage />;
      }
      if (activeTab === 'notifications') {
        return <NotificationsPage />;
      }
      return <CustomerPortalPage />;
    }

    // 3. Admin Governance Modules
    if (role === 'ADMIN') {
      switch (activeTab) {
        case 'overview':
          return <OverviewDashboard onNavigate={setActiveTab} />;
        case 'approvals':
          return <DecisionApprovalsPage onNavigateToCNT={handleNavigateToCNT} />;
        case 'users':
          return <UserManagementPage />;
        case 'agent-monitor':
          return <AgentMonitorPage />;
        case 'suppliers':
          return (
            <SupplierManagementPage
              initialProcId={selectedProcIdForNeg}
              initialSupplierId={selectedSupIdForNeg}
            />
          );
        case 'orders':
          return <CustomerOrdersPage />;
        case 'reports':
          return <ReportsPage />;
        case 'notifications':
          return <NotificationsPage />;
        default:
          return <OverviewDashboard onNavigate={setActiveTab} />;
      }
    }

    // 4. Procurement Manager Operational Modules
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard onNavigate={setActiveTab} />;
      case 'orders':
        return <CustomerOrdersPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'procurement':
        return (
          <ProcurementPage
            onNavigateToCNT={handleNavigateToCNT}
            onNavigateToNegotiation={handleNavigateToNegotiation}
          />
        );
      case 'cnt':
        return (
          <CounterfactualTwinPage
            initialProcId={selectedProcIdForCNT}
            onNavigateToOrders={() => setActiveTab('orders')}
          />
        );
      case 'suppliers':
        return (
          <SupplierManagementPage
            initialProcId={selectedProcIdForNeg}
            initialSupplierId={selectedSupIdForNeg}
          />
        );
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <ProcurementPage onNavigateToCNT={handleNavigateToCNT} onNavigateToNegotiation={handleNavigateToNegotiation} />;
    }
  };

  return (
    <div className="light-theme min-h-screen bg-[#F5F7FB] text-[#111827] flex flex-col font-sans">
      <Navbar
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenNotifications={() => setActiveTab('notifications')}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#F5F7FB]">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Floating AI Co-Pilot Widget (Accessible across all roles) */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer border border-white/20 group"
        title="Open AI Supply Chain Assistant"
      >
        <span className="p-1 rounded-full bg-white/20 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </span>
        <span className="text-xs font-bold tracking-wide">
          AI Assistant
        </span>
      </button>

      <AIAssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
