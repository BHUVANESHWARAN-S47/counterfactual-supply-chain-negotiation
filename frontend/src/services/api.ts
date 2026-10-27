import {
  User, CustomerOrder, TimelineEvent, InventoryItem, ProcurementRequest,
  Supplier, Quotation, NegotiationSession, SimulationRun, PurchaseOrder,
  Shipment, AgentTask, AgentLog, NotificationItem, CustomerFeedback, DashboardKPIs
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async demoLogin(role: string = 'ADMIN'): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/demo-login?role=${role}`, { method: 'POST' });
    if (!res.ok) throw new Error('Demo login failed');
    return res.json();
  },

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Invalid credentials');
    }
    return res.json();
  },

  async register(payload: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    company_name?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  // Orders
  async getOrders(customerId?: number): Promise<CustomerOrder[]> {
    const url = customerId ? `${API_BASE}/orders/?customer_id=${customerId}` : `${API_BASE}/orders/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(orderId: number): Promise<CustomerOrder> {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async createOrder(payload: {
    product_id: number;
    quantity: number;
    target_delivery_date: string;
    max_budget: number;
    delivery_address: string;
    specifications?: string;
  }): Promise<CustomerOrder> {
    const res = await fetch(`${API_BASE}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async getOrderTimeline(orderId: number): Promise<{ order_id: number; current_status: string; timeline: TimelineEvent[] }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/inventory/`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async adjustStock(productId: number, adjustmentType: string, quantity: number, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        adjustment_type: adjustmentType,
        quantity,
        notes,
      }),
    });
    return res.json();
  },

  async getInventoryTransactions(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/inventory/transactions`);
    return res.json();
  },

  // Procurement
  async getProcurementRequests(): Promise<ProcurementRequest[]> {
    const res = await fetch(`${API_BASE}/procurement/`);
    if (!res.ok) throw new Error('Failed to fetch procurement requests');
    return res.json();
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE}/suppliers/`);
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    return res.json();
  },

  // Quotations
  async getQuotations(procurementRequestId?: number): Promise<Quotation[]> {
    const url = procurementRequestId
      ? `${API_BASE}/quotations/?procurement_request_id=${procurementRequestId}`
      : `${API_BASE}/quotations/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch quotations');
    return res.json();
  },

  async submitQuotation(payload: {
    procurement_request_id: number;
    supplier_id: number;
    offered_quantity: number;
    unit_price: number;
    delivery_lead_days: number;
    notes?: string;
  }): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit quote');
    return res.json();
  },

  async compareQuotations(procurementRequestId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/quotations/compare/${procurementRequestId}`);
    if (!res.ok) throw new Error('Failed to compare quotations');
    return res.json();
  },

  // Negotiations
  async getNegotiations(procurementRequestId?: number): Promise<NegotiationSession[]> {
    const url = procurementRequestId
      ? `${API_BASE}/negotiations/?procurement_request_id=${procurementRequestId}`
      : `${API_BASE}/negotiations/`;
    const res = await fetch(url);
    return res.json();
  },

  async getNegotiation(sessionId: number): Promise<NegotiationSession> {
    const res = await fetch(`${API_BASE}/negotiations/${sessionId}`);
    return res.json();
  },

  async startNegotiation(procurementRequestId: number, supplierId: number, targetDiscountPct = 8.0): Promise<any> {
    const res = await fetch(
      `${API_BASE}/negotiations/start?procurement_request_id=${procurementRequestId}&supplier_id=${supplierId}&target_discount_pct=${targetDiscountPct}`,
      { method: 'POST' }
    );
    return res.json();
  },

  async counteroffer(sessionId: number, offeredPrice: number, offeredLeadDays: number, message?: string): Promise<NegotiationSession> {
    const res = await fetch(`${API_BASE}/negotiations/counter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        offered_price: Number(offeredPrice),
        offered_lead_days: Number(offeredLeadDays),
        message,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit counteroffer' }));
      throw new Error(err.detail || 'Failed to submit counteroffer');
    }
    return res.json();
  },

  // Simulations (CNT)
  async getSimulations(procurementRequestId?: number): Promise<SimulationRun[]> {
    const url = procurementRequestId
      ? `${API_BASE}/simulations/?procurement_request_id=${procurementRequestId}`
      : `${API_BASE}/simulations/`;
    const res = await fetch(url);
    return res.json();
  },

  async getSimulation(runId: number): Promise<SimulationRun> {
    const res = await fetch(`${API_BASE}/simulations/${runId}`);
    return res.json();
  },

  async runSimulation(payload: {
    procurement_request_id: number;
    delay_days?: number;
    demand_variation_pct?: number;
    negotiated_discount_pct?: number;
  }): Promise<SimulationRun> {
    const res = await fetch(`${API_BASE}/simulations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  // Purchase Orders & Approval
  async getPurchaseOrders(supplierId?: number): Promise<PurchaseOrder[]> {
    const url = supplierId ? `${API_BASE}/purchase-orders/?supplier_id=${supplierId}` : `${API_BASE}/purchase-orders/`;
    const res = await fetch(url);
    return res.json();
  },

  async approveSupplier(payload: {
    procurement_request_id: number;
    supplier_id: number;
    selected_unit_price: number;
    quantity: number;
    lead_time_days: number;
    notes?: string;
  }): Promise<PurchaseOrder> {
    const res = await fetch(`${API_BASE}/purchase-orders/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Approval failed');
    return res.json();
  },

  // Shipments
  async getShipments(orderId?: number): Promise<Shipment[]> {
    const url = orderId ? `${API_BASE}/shipments/?order_id=${orderId}` : `${API_BASE}/shipments/`;
    const res = await fetch(url);
    return res.json();
  },

  async dispatchShipment(orderId: number, carrier?: string): Promise<Shipment> {
    const url = carrier ? `${API_BASE}/shipments/dispatch/${orderId}?carrier=${encodeURIComponent(carrier)}` : `${API_BASE}/shipments/dispatch/${orderId}`;
    const res = await fetch(url, { method: 'POST' });
    return res.json();
  },

  async deliverShipment(shipmentId: number): Promise<Shipment> {
    const res = await fetch(`${API_BASE}/shipments/${shipmentId}/deliver`, { method: 'POST' });
    return res.json();
  },

  // AI Agent Monitor
  async getAgentTasks(limit = 40): Promise<AgentTask[]> {
    const res = await fetch(`${API_BASE}/agents/tasks?limit=${limit}`);
    return res.json();
  },

  async getAgentLogs(taskId?: number, limit = 80): Promise<AgentLog[]> {
    const url = taskId ? `${API_BASE}/agents/logs?task_id=${taskId}&limit=${limit}` : `${API_BASE}/agents/logs?limit=${limit}`;
    const res = await fetch(url);
    return res.json();
  },

  async getAgentsStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/agents/status-summary`);
    return res.json();
  },

  async triggerOrchestration(orderId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/agents/trigger-orchestration/${orderId}`, { method: 'POST' });
    return res.json();
  },

  // Notifications
  async getNotifications(role?: string, unreadOnly = false): Promise<NotificationItem[]> {
    let url = `${API_BASE}/notifications/?unread_only=${unreadOnly}`;
    if (role) url += `&role=${role}`;
    const res = await fetch(url);
    return res.json();
  },

  async markNotificationRead(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
    return res.json();
  },

  async markAllNotificationsRead(role?: string): Promise<any> {
    const url = role ? `${API_BASE}/notifications/read-all?role=${role}` : `${API_BASE}/notifications/read-all`;
    const res = await fetch(url, { method: 'POST' });
    return res.json();
  },

  // Feedback
  async getFeedback(): Promise<CustomerFeedback[]> {
    const res = await fetch(`${API_BASE}/feedback/`);
    return res.json();
  },

  async submitFeedback(payload: {
    order_id: number;
    rating: number;
    delivery_satisfaction?: number;
    quality_satisfaction?: number;
    comments?: string;
  }): Promise<CustomerFeedback> {
    const res = await fetch(`${API_BASE}/feedback/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Reports
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const res = await fetch(`${API_BASE}/reports/dashboard-kpis`);
    return res.json();
  },

  async getOrderDistribution(): Promise<{ status: string; count: number }[]> {
    const res = await fetch(`${API_BASE}/reports/order-distribution`);
    return res.json();
  },

  async getSupplierPerformance(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/reports/supplier-performance`);
    return res.json();
  },

  async getNegotiationMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/negotiation-metrics`);
    return res.json();
  },

  async getPredictedVsActual(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/reports/predicted-vs-actual`);
    return res.json();
  },

  // AI Assistant
  async getAssistantStatus(): Promise<{ ollama_connected: boolean; configured_model: string; active_mode: string; fallback_available: boolean }> {
    const res = await fetch(`${API_BASE}/assistant/status`);
    return res.json();
  },

  async queryAssistant(prompt: string, role = 'ADMIN', orderId?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, role, order_id: orderId }),
    });
    return res.json();
  },
};
