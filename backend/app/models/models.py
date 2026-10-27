from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="CUSTOMER")  # ADMIN, PROCUREMENT, SUPPLIER, CUSTOMER
    company_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer_profile = relationship("Customer", back_populates="user", uselist=False)
    supplier_profile = relationship("Supplier", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    shipping_address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="customer_profile")
    orders = relationship("CustomerOrder", back_populates="customer")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    name = Column(String(255), nullable=False, index=True)
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    categories = Column(String(255), nullable=False)  # e.g., "Electronics, Batteries, Sensors"
    baseline_rating = Column(Float, default=4.5)  # 1.0 - 5.0
    base_lead_time_days = Column(Integer, default=7)
    capacity_per_week = Column(Integer, default=500)
    reliability_score = Column(Float, default=0.90)  # 0.0 - 1.0 (90%)
    risk_score = Column(Float, default=0.15)  # 0.0 - 1.0 (lower is safer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="supplier_profile")
    quotations = relationship("Quotation", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)
    unit = Column(String(50), default="units")
    unit_cost = Column(Float, nullable=False)  # baseline expected standard cost
    target_selling_price = Column(Float, nullable=False)
    reorder_level = Column(Integer, default=50)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory = relationship("Inventory", back_populates="product", uselist=False)
    order_items = relationship("OrderItem", back_populates="product")
    procurement_requests = relationship("ProcurementRequest", back_populates="product")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True, nullable=False)
    on_hand = Column(Integer, default=0, nullable=False)
    reserved = Column(Integer, default=0, nullable=False)
    incoming = Column(Integer, default=0, nullable=False)
    incoming_eta = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="inventory")
    transactions = relationship("InventoryTransaction", back_populates="inventory")

    @property
    def available(self) -> int:
        return max(0, self.on_hand - self.reserved)


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    transaction_type = Column(String(50), nullable=False)  # INTAKE, RESERVATION, RELEASE, DISPATCH, ADJUSTMENT
    quantity = Column(Integer, nullable=False)
    reference_id = Column(String(100), nullable=True)  # Order ID or PO ID
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory = relationship("Inventory", back_populates="transactions")


class CustomerOrder(Base):
    __tablename__ = "customer_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    target_delivery_date = Column(DateTime, nullable=False)
    max_budget = Column(Float, nullable=False)
    status = Column(String(50), default="REQUEST_RECEIVED")
    # Statuses: REQUEST_RECEIVED, INVENTORY_ANALYSIS, PROCUREMENT_REQUIRED, AWAITING_QUOTATIONS,
    # NEGOTIATION_IN_PROGRESS, SIMULATION_COMPLETED, AWAITING_APPROVAL, SUPPLIER_APPROVED,
    # PURCHASE_ORDER_CREATED, MATERIALS_IN_TRANSIT, MATERIALS_RECEIVED, PRODUCTION_STARTED,
    # PRODUCTION_COMPLETED, SHIPPED, DELIVERED, COMPLETED, CANCELLED
    delivery_address = Column(Text, nullable=True)
    specifications = Column(Text, nullable=True)
    customer_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    product = relationship("Product")
    items = relationship("OrderItem", back_populates="order")
    procurement_requests = relationship("ProcurementRequest", back_populates="order")
    purchase_orders = relationship("PurchaseOrder", back_populates="order")
    simulation_runs = relationship("SimulationRun", back_populates="order")
    feedback = relationship("CustomerFeedback", back_populates="order", uselist=False)
    shipments = relationship("Shipment", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("customer_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("CustomerOrder", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("customer_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    required_quantity = Column(Integer, nullable=False)
    available_quantity = Column(Integer, default=0)
    shortage_quantity = Column(Integer, nullable=False)
    required_by_date = Column(DateTime, nullable=False)
    estimated_budget = Column(Float, nullable=False)
    status = Column(String(50), default="CREATED")  # CREATED, RFQ_SENT, QUOTATIONS_RECEIVED, SIMULATED, APPROVED, PO_ISSUED
    priority = Column(String(50), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    delivery_risk = Column(String(50), default="LOW")
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("CustomerOrder", back_populates="procurement_requests")
    product = relationship("Product", back_populates="procurement_requests")
    quotations = relationship("Quotation", back_populates="procurement_request")
    negotiation_sessions = relationship("NegotiationSession", back_populates="procurement_request")
    purchase_orders = relationship("PurchaseOrder", back_populates="procurement_request")
    simulation_runs = relationship("SimulationRun", back_populates="procurement_request")


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    quotation_number = Column(String(50), unique=True, index=True, nullable=False)
    procurement_request_id = Column(Integer, ForeignKey("procurement_requests.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    offered_quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    delivery_lead_days = Column(Integer, nullable=False)
    quality_rating = Column(Float, default=4.5)  # 1.0 - 5.0
    reliability_score = Column(Float, default=0.90)  # 0.0 - 1.0
    risk_score = Column(Float, default=0.15)  # 0.0 - 1.0
    validity_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    status = Column(String(50), default="SUBMITTED")  # SUBMITTED, UNDER_EVALUATION, REVISED, ACCEPTED, REJECTED
    total_score = Column(Float, default=0.0)  # Multi-criteria weighted normalized score
    rank = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    procurement_request = relationship("ProcurementRequest", back_populates="quotations")
    supplier = relationship("Supplier", back_populates="quotations")


class NegotiationSession(Base):
    __tablename__ = "negotiation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_number = Column(String(50), unique=True, index=True, nullable=False)
    procurement_request_id = Column(Integer, ForeignKey("procurement_requests.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, AGREED, FAILED, COUNTERED
    target_price = Column(Float, nullable=False)
    current_buyer_offer = Column(Float, nullable=False)
    current_supplier_offer = Column(Float, nullable=False)
    max_rounds = Column(Integer, default=5)
    current_round = Column(Integer, default=1)
    agreement_reached = Column(Boolean, default=False)
    final_price = Column(Float, nullable=True)
    final_lead_days = Column(Integer, nullable=True)
    decision_mode = Column(String(50), default="NEGOTIATE")  # RETAIN, NEGOTIATE, SWITCH
    created_at = Column(DateTime, default=datetime.utcnow)

    procurement_request = relationship("ProcurementRequest", back_populates="negotiation_sessions")
    messages = relationship("NegotiationMessage", back_populates="session", cascade="all, delete-orphan")


class NegotiationMessage(Base):
    __tablename__ = "negotiation_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("negotiation_sessions.id"), nullable=False)
    sender_role = Column(String(50), nullable=False)  # BUYER_AGENT, SUPPLIER_AGENT, HUMAN_BUYER, HUMAN_SUPPLIER
    sender_name = Column(String(100), nullable=False)
    round_number = Column(Integer, default=1)
    offered_price = Column(Float, nullable=False)
    offered_lead_days = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    ai_suggestion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("NegotiationSession", back_populates="messages")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("customer_orders.id"), nullable=False)
    procurement_request_id = Column(Integer, ForeignKey("procurement_requests.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    expected_delivery_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="APPROVED")  # APPROVED, ISSUED, ACCEPTED, IN_TRANSIT, RECEIVED, CANCELLED
    approved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, default=datetime.utcnow)
    idempotency_key = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("CustomerOrder", back_populates="purchase_orders")
    procurement_request = relationship("ProcurementRequest", back_populates="purchase_orders")
    supplier = relationship("Supplier", back_populates="purchase_orders")
    production_plan = relationship("ProductionPlan", back_populates="purchase_order", uselist=False)
    shipments = relationship("Shipment", back_populates="purchase_order")


class ProductionPlan(Base):
    __tablename__ = "production_plans"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("customer_orders.id"), nullable=False)
    status = Column(String(50), default="PLANNED")  # PLANNED, IN_PROGRESS, COMPLETED
    planned_start = Column(DateTime, nullable=False)
    planned_end = Column(DateTime, nullable=False)
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    purchase_order = relationship("PurchaseOrder", back_populates="production_plan")


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("customer_orders.id"), nullable=False)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    carrier = Column(String(100), default="Express Freight Logistics")
    origin = Column(String(255), default="Supplier Hub")
    destination = Column(String(255), nullable=False)
    status = Column(String(50), default="IN_TRANSIT")  # DISPATCHED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
    estimated_arrival = Column(DateTime, nullable=False)
    actual_arrival = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("CustomerOrder", back_populates="shipments")
    purchase_order = relationship("PurchaseOrder", back_populates="shipments")


class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_number = Column(String(50), unique=True, index=True, nullable=False)
    agent_name = Column(String(100), nullable=False)  # Supervisor, Buyer, Supplier, Price, Risk, Logistics, Negotiation, Decision, CustomerImpact
    related_order_id = Column(Integer, ForeignKey("customer_orders.id"), nullable=True)
    related_procurement_id = Column(Integer, ForeignKey("procurement_requests.id"), nullable=True)
    status = Column(String(50), default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED, REQUIRES_APPROVAL
    input_payload = Column(JSON, nullable=True)
    output_payload = Column(JSON, nullable=True)
    error_info = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    requires_approval = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    logs = relationship("AgentLog", back_populates="task", cascade="all, delete-orphan")


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("agent_tasks.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    log_level = Column(String(20), default="INFO")  # INFO, WARNING, ERROR, SUCCESS
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    task = relationship("AgentTask", back_populates="logs")


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("customer_orders.id"), nullable=False)
    procurement_request_id = Column(Integer, ForeignKey("procurement_requests.id"), nullable=False)
    run_type = Column(String(50), default="COUNTERFACTUAL_COMPARISON")
    recommendation = Column(String(50), nullable=False)  # RETAIN, NEGOTIATE, SWITCH
    justification = Column(Text, nullable=False)
    trade_offs = Column(Text, nullable=True)
    customer_impact_summary = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.88)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("CustomerOrder", back_populates="simulation_runs")
    procurement_request = relationship("ProcurementRequest", back_populates="simulation_runs")
    scenarios = relationship("SimulationScenario", back_populates="simulation_run", cascade="all, delete-orphan")


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    simulation_run_id = Column(Integer, ForeignKey("simulation_runs.id"), nullable=False)
    scenario_name = Column(String(100), nullable=False)  # e.g., "Baseline (Incumbent)", "Alternative A", "Delay +5d", "Demand +20%"
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    supplier_name = Column(String(255), nullable=False)
    unit_price = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    lead_time_days = Column(Integer, nullable=False)
    arrival_date = Column(DateTime, nullable=False)
    deadline_variance_days = Column(Integer, nullable=False)  # negative means early, positive means late
    feasibility = Column(Boolean, default=True)
    risk_score = Column(Float, nullable=False)
    estimated_profit = Column(Float, nullable=False)
    profit_margin_pct = Column(Float, nullable=False)
    decision_mode = Column(String(50), default="RETAIN")  # RETAIN, NEGOTIATE, SWITCH
    scenario_parameters = Column(JSON, nullable=True)

    simulation_run = relationship("SimulationRun", back_populates="scenarios")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String(50), nullable=False)  # ALL, ADMIN, PROCUREMENT, SUPPLIER, CUSTOMER
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    event_type = Column(String(50), default="INFO")  # ORDER_INTAKE, SHORTAGE_ALERT, QUOTATION_RECEIVED, SIMULATION_READY, APPROVAL_REQUIRED, PO_ISSUED, SHIPMENT_UPDATE
    related_order_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class CustomerFeedback(Base):
    __tablename__ = "customer_feedback"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("customer_orders.id"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    delivery_satisfaction = Column(Integer, default=5)
    quality_satisfaction = Column(Integer, default=5)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("CustomerOrder", back_populates="feedback")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # ORDER_CREATED, SUPPLIER_APPROVED, PO_ISSUED, NEGOTIATION_COUNTERED, etc.
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=False)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
