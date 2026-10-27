import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIAssistantModal } from './components/AIAssistantModal';
import { LandingPage } from './pages/LandingPage';

// 7 Consolidated Modules
import { OverviewDashboard } from './pages/OverviewDashboard';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { ProcurementPage } from './pages/ProcurementPage';
import { CounterfactualTwinPage } from './pages/CounterfactualTwinPage';
import { SupplierManagementPage } from './pages/SupplierManagementPage';
import { ReportsPage } from './pages/ReportsPage';

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

  // If user is not authenticated, render the public 2-page Landing Page
  if (!isAuthenticated) {
    return <LandingPage />;
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
    // Supplier role isolation
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

    // Customer role isolation
    if (role === 'CUSTOMER') {
      if (activeTab === 'orders') {
        return <CustomerOrdersPage />;
      }
      if (activeTab === 'reports') {
        return <ReportsPage />;
      }
      if (activeTab === 'notifications') {
        return <NotificationsPage />;
      }
      return <CustomerPortalPage />;
    }

    // Admin & Procurement Manager: Exactly 7 Unified Modules
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
        return <OverviewDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="light-theme min-h-screen bg-[#fdf2f8] text-[#1e1b1d] flex flex-col font-sans">
      <Navbar
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenNotifications={() => setActiveTab('notifications')}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#fdf2f8]">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

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
