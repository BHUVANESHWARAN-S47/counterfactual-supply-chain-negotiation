from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    full_name: str
    role: str
    company_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "CUSTOMER"
    company_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    company_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Products & Inventory
class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    unit: str
    unit_cost: float
    target_selling_price: float
    reorder_level: int
    description: Optional[str] = None
    class Config:
        from_attributes = True

class InventoryResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    sku: Optional[str] = None
    on_hand: int
    reserved: int
    available: int
    incoming: int
    incoming_eta: Optional[datetime] = None
    reorder_level: int
    unit_cost: float
    status: str
    class Config:
        from_attributes = True

class InventoryStockAdjust(BaseModel):
    product_id: int
    adjustment_type: str  # INTAKE, ADJUSTMENT, DISPATCH
    quantity: int
    notes: Optional[str] = None

class ShortageCalculationRequest(BaseModel):
    product_id: int
    required_quantity: int
    target_delivery_date: datetime

class ShortageCalculationResponse(BaseModel):
    product_id: int
    product_name: str
    required_quantity: int
    on_hand: int
    reserved: int
    available_stock: int
    incoming_stock: int
    shortage_quantity: int
    is_shortage: bool
    estimated_purchase_cost: float

# Customer Orders
class CustomerOrderCreate(BaseModel):
    product_id: int
    quantity: int
    target_delivery_date: datetime
    max_budget: float
    delivery_address: str
    specifications: Optional[str] = None

class CustomerOrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: int
    customer_name: Optional[str] = None
    customer_company: Optional[str] = None
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    target_delivery_date: datetime
    max_budget: float
    status: str
    delivery_address: Optional[str] = None
    specifications: Optional[str] = None
    customer_explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Procurement Requests
class ProcurementRequestResponse(BaseModel):
    id: int
    request_number: str
    order_id: int
    order_number: Optional[str] = None
    product_id: int
    product_name: Optional[str] = None
    required_quantity: int
    available_quantity: int
    shortage_quantity: int
    required_by_date: datetime
    estimated_budget: float
    status: str
    priority: str
    delivery_risk: str
    quotations_count: Optional[int] = 0
    created_at: datetime
    class Config:
        from_attributes = True

# Suppliers
class SupplierResponse(BaseModel):
    id: int
    name: str
    contact_email: str
    phone: Optional[str] = None
    categories: str
    baseline_rating: float
    base_lead_time_days: int
    capacity_per_week: int
    reliability_score: float
    risk_score: float
    is_active: bool
    class Config:
        from_attributes = True

# Quotations
class QuotationCreate(BaseModel):
    procurement_request_id: int
    supplier_id: int
    offered_quantity: int
    unit_price: float
    delivery_lead_days: int
    notes: Optional[str] = None

class QuotationResponse(BaseModel):
    id: int
    quotation_number: str
    procurement_request_id: int
    supplier_id: int
    supplier_name: Optional[str] = None
    offered_quantity: int
    unit_price: float
    delivery_lead_days: int
    quality_rating: float
    reliability_score: float
    risk_score: float
    validity_date: Optional[datetime] = None
    notes: Optional[str] = None
    version: int
    status: str
    total_score: float
    rank: int
    created_at: datetime
    class Config:
        from_attributes = True

# Negotiation
class NegotiationMessageCreate(BaseModel):
    session_id: int
    offered_price: float
    offered_lead_days: int
    message: str

class NegotiationMessageResponse(BaseModel):
    id: int
    session_id: int
    sender_role: str
    sender_name: str
    round_number: int
    offered_price: float
    offered_lead_days: int
    message: str
    ai_suggestion: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class NegotiationSessionResponse(BaseModel):
    id: int
    session_number: str
    procurement_request_id: int
    supplier_id: int
    supplier_name: Optional[str] = None
    status: str
    target_price: float
    current_buyer_offer: float
    current_supplier_offer: float
    max_rounds: int
    current_round: int
    agreement_reached: bool
    final_price: Optional[float] = None
    final_lead_days: Optional[int] = None
    decision_mode: str
    messages: List[NegotiationMessageResponse] = []
    created_at: datetime
    class Config:
        from_attributes = True

# CNT & Simulation
class ScenarioResult(BaseModel):
    scenario_name: str
    supplier_id: Optional[int] = None
    supplier_name: str
    unit_price: float
    quantity: int
    procurement_cost: float
    transportation_cost: float
    production_cost: float
    total_cost: float
    lead_time_days: int
    arrival_date: datetime
    deadline_variance_days: int
    feasibility: bool
    risk_score: float
    estimated_revenue: float
    estimated_profit: float
    profit_margin_pct: float
    decision_mode: str
    trade_off_notes: str

class SimulationRunResponse(BaseModel):
    id: int
    run_number: str
    order_id: int
    procurement_request_id: int
    run_type: str
    recommendation: str  # RETAIN, NEGOTIATE, SWITCH
    justification: str
    trade_offs: Optional[str] = None
    customer_impact_summary: Optional[str] = None
    confidence_score: float
    scenarios: List[ScenarioResult] = []
    created_at: datetime
    class Config:
        from_attributes = True

class RunSimulationRequest(BaseModel):
    procurement_request_id: int
    include_delay_scenario: bool = True
    delay_days: int = 4
    include_demand_variation: bool = True
    demand_variation_pct: float = 20.0
    negotiated_discount_pct: float = 8.0

# Purchase Orders & Approval
class ApproveSupplierRequest(BaseModel):
    procurement_request_id: int
    supplier_id: int
    selected_unit_price: float
    quantity: int
    lead_time_days: int
    notes: Optional[str] = None

class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    order_id: int
    order_number: Optional[str] = None
    procurement_request_id: int
    supplier_id: int
    supplier_name: Optional[str] = None
    quantity: int
    unit_price: float
    total_amount: float
    expected_delivery_date: datetime
    status: str
    approved_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# Shipments
class ShipmentResponse(BaseModel):
    id: int
    shipment_number: str
    order_id: int
    purchase_order_id: Optional[int] = None
    tracking_number: Optional[str] = None
    carrier: str
    origin: str
    destination: str
    status: str
    estimated_arrival: datetime
    actual_arrival: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ShipmentUpdateStatus(BaseModel):
    status: str
    notes: Optional[str] = None

# Agents & Tasks
class AgentTaskResponse(BaseModel):
    id: int
    task_number: str
    agent_name: str
    related_order_id: Optional[int] = None
    related_procurement_id: Optional[int] = None
    status: str
    input_payload: Optional[Dict[str, Any]] = None
    output_payload: Optional[Dict[str, Any]] = None
    error_info: Optional[str] = None
    retry_count: int
    requires_approval: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class AgentLogResponse(BaseModel):
    id: int
    task_id: int
    agent_name: str
    log_level: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
    class Config:
        from_attributes = True

# Notifications
class NotificationResponse(BaseModel):
    id: int
    role: str
    title: str
    message: str
    event_type: str
    related_order_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Feedback
class CustomerFeedbackCreate(BaseModel):
    order_id: int
    rating: int
    delivery_satisfaction: int = 5
    quality_satisfaction: int = 5
    comments: Optional[str] = None

class CustomerFeedbackResponse(BaseModel):
    id: int
    order_id: int
    customer_id: int
    customer_name: Optional[str] = None
    rating: int
    delivery_satisfaction: int
    quality_satisfaction: int
    comments: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Assistant
class AssistantQueryRequest(BaseModel):
    prompt: str
    order_id: Optional[int] = None
    role: str = "ADMIN"

class AssistantQueryResponse(BaseModel):
    answer: str
    model_used: str  # e.g., "Ollama (llama3)" or "Rule-based Fallback Heuristic Engine"
    is_fallback: bool
    context_retrieved: Dict[str, Any]
    suggested_actions: List[str]
