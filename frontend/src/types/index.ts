export type UserRole = 'ADMIN' | 'PROCUREMENT' | 'SUPPLIER' | 'CUSTOMER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  company_name?: string;
  is_active: boolean;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  customer_company?: string;
  product_id: number;
  product_name?: string;
  quantity: number;
  target_delivery_date: string;
  max_budget: number;
  status: string;
  delivery_address?: string;
  specifications?: string;
  customer_explanation?: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  code: string;
  label: string;
  description: string;
  state: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  is_current: boolean;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  on_hand: number;
  reserved: number;
  available: number;
  incoming: number;
  incoming_eta?: string;
  reorder_level: number;
  unit_cost: number;
  status: 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL_SHORTAGE';
}

export interface ProcurementRequest {
  id: number;
  request_number: string;
  order_id: number;
  order_number?: string;
  product_id: number;
  product_name?: string;
  required_quantity: number;
  available_quantity: number;
  shortage_quantity: number;
  required_by_date: string;
  estimated_budget: number;
  status: string;
  priority: string;
  delivery_risk: string;
  quotations_count: number;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_email: string;
  phone?: string;
  categories: string;
  baseline_rating: number;
  base_lead_time_days: number;
  capacity_per_week: number;
  reliability_score: number;
  risk_score: number;
  is_active: boolean;
}

export interface Quotation {
  id: number;
  quotation_number: string;
  procurement_request_id: number;
  supplier_id: number;
  supplier_name: string;
  offered_quantity: number;
  unit_price: number;
  delivery_lead_days: number;
  quality_rating: number;
  reliability_score: number;
  risk_score: number;
  validity_date?: string;
  notes?: string;
  version: number;
  status: string;
  total_score: number;
  rank: number;
  created_at: string;
}

export interface NegotiationMessage {
  id: number;
  session_id: number;
  sender_role: string;
  sender_name: string;
  round_number: number;
  offered_price: number;
  offered_lead_days: number;
  message: string;
  ai_suggestion?: string;
  created_at: string;
}

export interface NegotiationSession {
  id: number;
  session_number: string;
  procurement_request_id: number;
  supplier_id: number;
  supplier_name: string;
  status: string;
  target_price: number;
  current_buyer_offer: number;
  current_supplier_offer: number;
  max_rounds: number;
  current_round: number;
  agreement_reached: boolean;
  final_price?: number;
  final_lead_days?: number;
  decision_mode: string;
  messages: NegotiationMessage[];
  created_at: string;
}

export interface ScenarioResult {
  scenario_name: string;
  supplier_id?: number;
  supplier_name: string;
  unit_price: number;
  quantity: number;
  procurement_cost: number;
  transportation_cost: number;
  production_cost: number;
  total_cost: number;
  lead_time_days: number;
  arrival_date: string;
  deadline_variance_days: number;
  feasibility: boolean;
  risk_score: number;
  estimated_revenue: number;
  estimated_profit: number;
  profit_margin_pct: number;
  decision_mode: 'RETAIN' | 'NEGOTIATE' | 'SWITCH';
  trade_off_notes: string;
}

export interface SimulationRun {
  id: number;
  run_number: string;
  order_id: number;
  procurement_request_id: number;
  run_type: string;
  recommendation: 'RETAIN' | 'NEGOTIATE' | 'SWITCH';
  justification: string;
  trade_offs?: string;
  customer_impact_summary?: string;
  confidence_score: number;
  scenarios: ScenarioResult[];
  created_at: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  order_id: number;
  order_number?: string;
  procurement_request_id: number;
  supplier_id: number;
  supplier_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  expected_delivery_date: string;
  status: string;
  approved_at: string;
  created_at: string;
}

export interface Shipment {
  id: number;
  shipment_number: string;
  order_id: number;
  purchase_order_id?: number;
  tracking_number?: string;
  carrier: string;
  origin: string;
  destination: string;
  status: string;
  estimated_arrival: string;
  actual_arrival?: string;
  created_at: string;
}

export interface AgentTask {
  id: number;
  task_number: string;
  agent_name: string;
  related_order_id?: number;
  related_procurement_id?: number;
  status: string;
  input_payload?: any;
  output_payload?: any;
  error_info?: string;
  retry_count: number;
  requires_approval: boolean;
  created_at: string;
  completed_at?: string;
}

export interface AgentLog {
  id: number;
  task_id: number;
  agent_name: string;
  log_level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  details?: any;
  timestamp: string;
}

export interface NotificationItem {
  id: number;
  role: string;
  title: string;
  message: string;
  event_type: string;
  related_order_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface CustomerFeedback {
  id: number;
  order_id: number;
  customer_id: number;
  customer_name?: string;
  rating: number;
  delivery_satisfaction: number;
  quality_satisfaction: number;
  comments?: string;
  created_at: string;
}

export interface DashboardKPIs {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  procurement_requests: number;
  active_suppliers: number;
  shortage_items: number;
  total_pos: number;
  total_procurement_spend: number;
  customer_satisfaction_avg: number;
  on_time_delivery_rate: number;
}
