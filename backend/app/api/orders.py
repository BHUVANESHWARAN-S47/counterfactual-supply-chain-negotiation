from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CustomerOrder, Customer, Product, OrderItem, Notification, AuditLog
from app.schemas.schemas import CustomerOrderCreate, CustomerOrderResponse
from app.agents.supervisor_agent import SupervisorAgent

router = APIRouter(prefix="/orders", tags=["Customer Orders"])

@router.get("/", response_model=List[CustomerOrderResponse])
def get_orders(customer_id: int = None, db: Session = Depends(get_db)):
    query = db.query(CustomerOrder)
    if customer_id:
        query = query.filter(CustomerOrder.customer_id == customer_id)
    orders = query.order_by(CustomerOrder.created_at.desc()).all()

    result = []
    for o in orders:
        result.append(CustomerOrderResponse(
            id=o.id,
            order_number=o.order_number,
            customer_id=o.customer_id,
            customer_name=o.customer.name if o.customer else "Customer",
            customer_company=o.customer.company if o.customer else None,
            product_id=o.product_id,
            product_name=o.product.name if o.product else "Product",
            quantity=o.quantity,
            target_delivery_date=o.target_delivery_date,
            max_budget=o.max_budget,
            status=o.status,
            delivery_address=o.delivery_address,
            specifications=o.specifications,
            customer_explanation=o.customer_explanation,
            created_at=o.created_at,
            updated_at=o.updated_at
        ))
    return result

@router.get("/{order_id}", response_model=CustomerOrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    o = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return CustomerOrderResponse(
        id=o.id,
        order_number=o.order_number,
        customer_id=o.customer_id,
        customer_name=o.customer.name if o.customer else "Customer",
        customer_company=o.customer.company if o.customer else None,
        product_id=o.product_id,
        product_name=o.product.name if o.product else "Product",
        quantity=o.quantity,
        target_delivery_date=o.target_delivery_date,
        max_budget=o.max_budget,
        status=o.status,
        delivery_address=o.delivery_address,
        specifications=o.specifications,
        customer_explanation=o.customer_explanation,
        created_at=o.created_at,
        updated_at=o.updated_at
    )

@router.post("/", response_model=CustomerOrderResponse)
def create_order(
    req: CustomerOrderCreate,
    customer_id: int = 1,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Submits a new customer request, creates the order, and automatically triggers
    the Supervisor-coordinated multi-agent pipeline.
    """
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {req.product_id} not found")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        customer = db.query(Customer).first()
        if not customer:
            customer = Customer(name="Acme Robotics", email="cust@acme.com", company="Acme Systems")
            db.add(customer)
            db.commit()
            db.refresh(customer)

    count = db.query(CustomerOrder).count() + 1
    order_number = f"ORD-{datetime.utcnow().year}-{count:04d}"

    order = CustomerOrder(
        order_number=order_number,
        customer_id=customer.id,
        product_id=product.id,
        quantity=req.quantity,
        target_delivery_date=req.target_delivery_date,
        max_budget=req.max_budget,
        status="REQUEST_RECEIVED",
        delivery_address=req.delivery_address,
        specifications=req.specifications,
        customer_explanation="Your request has been received and is entering multi-agent inventory analysis."
    )
    db.add(order)
    db.flush()

    # Create OrderItem
    item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=req.quantity,
        unit_price=product.target_selling_price,
        total_price=req.quantity * product.target_selling_price
    )
    db.add(item)

    # Notify Admin
    notif = Notification(
        role="ADMIN",
        title=f"New Order Intake: #{order.order_number}",
        message=f"Customer {customer.name} placed order for {req.quantity} units of {product.name}.",
        event_type="ORDER_INTAKE",
        related_order_id=order.id
    )
    db.add(notif)

    # Audit Log
    audit = AuditLog(
        user_email=customer.email,
        action="ORDER_CREATED",
        entity_type="CustomerOrder",
        entity_id=order.order_number,
        new_values={"product": product.name, "quantity": req.quantity, "budget": req.max_budget}
    )
    db.add(audit)
    db.commit()
    db.refresh(order)

    # Execute Supervisor Orchestration
    SupervisorAgent.orchestrate_order_workflow(db, order.id)
    db.refresh(order)

    return CustomerOrderResponse(
        id=order.id,
        order_number=order.order_number,
        customer_id=order.customer_id,
        customer_name=customer.name,
        customer_company=customer.company,
        product_id=order.product_id,
        product_name=product.name,
        quantity=order.quantity,
        target_delivery_date=order.target_delivery_date,
        max_budget=order.max_budget,
        status=order.status,
        delivery_address=order.delivery_address,
        specifications=order.specifications,
        customer_explanation=order.customer_explanation,
        created_at=order.created_at,
        updated_at=order.updated_at
    )

@router.get("/{order_id}/timeline")
def get_order_timeline(order_id: int, db: Session = Depends(get_db)):
    """
    Returns verified fulfillment tracking timeline based on actual system records.
    """
    order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    statuses_sequence = [
        ("REQUEST_RECEIVED", "Request Intake", "Order validated and registered in system"),
        ("INVENTORY_ANALYSIS", "Inventory Analysis", "Stock availability and shortage evaluated by Inventory Agent"),
        ("PROCUREMENT_REQUIRED", "Procurement Requirement", "Procurement requisition formulated by Buyer Agent"),
        ("AWAITING_QUOTATIONS", "Supplier Quotations", "Quotes collected and ranked by Supplier Agent"),
        ("SIMULATION_COMPLETED", "CNT Simulation", "Counterfactual scenarios and stress-tests completed"),
        ("AWAITING_APPROVAL", "Awaiting Approval", "Decision recommendation submitted for Admin/Procurement sign-off"),
        ("SUPPLIER_APPROVED", "Supplier Approved", "Authorized supplier agreement approved"),
        ("PURCHASE_ORDER_CREATED", "Purchase Order Created", "Purchase Order issued to supplier"),
        ("MATERIALS_IN_TRANSIT", "Materials in Transit", "Supplier dispatched production materials"),
        ("MATERIALS_RECEIVED", "Materials Received", "Warehouse confirmed inbound delivery and intake"),
        ("PRODUCTION_STARTED", "Production Started", "Factory assembly and quality tests underway"),
        ("SHIPPED", "Dispatched to Customer", "Completed units shipped via tracked carrier"),
        ("DELIVERED", "Delivered", "Delivered to customer destination"),
        ("COMPLETED", "Order Completed", "Fulfillment cycle closed; feedback recorded")
    ]

    current_idx = 0
    for idx, (code, _, _) in enumerate(statuses_sequence):
        if order.status == code:
            current_idx = idx
            break

    timeline = []
    for idx, (code, label, desc) in enumerate(statuses_sequence):
        state = "COMPLETED" if idx < current_idx else ("ACTIVE" if idx == current_idx else "UPCOMING")
        timeline.append({
            "code": code,
            "label": label,
            "description": desc,
            "state": state,
            "is_current": (idx == current_idx)
        })

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "current_status": order.status,
        "timeline": timeline
    }
