from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    PurchaseOrder, ProcurementRequest, CustomerOrder, Supplier,
    ProductionPlan, Notification, AuditLog, Quotation
)
from app.schemas.schemas import PurchaseOrderResponse, ApproveSupplierRequest

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders & Supplier Approval"])

@router.get("/", response_model=List[PurchaseOrderResponse])
def get_purchase_orders(supplier_id: int = None, db: Session = Depends(get_db)):
    query = db.query(PurchaseOrder)
    if supplier_id:
        query = query.filter(PurchaseOrder.supplier_id == supplier_id)
    pos = query.order_by(PurchaseOrder.created_at.desc()).all()

    res = []
    for po in pos:
        res.append(PurchaseOrderResponse(
            id=po.id,
            po_number=po.po_number,
            order_id=po.order_id,
            order_number=po.order.order_number if po.order else None,
            procurement_request_id=po.procurement_request_id,
            supplier_id=po.supplier_id,
            supplier_name=po.supplier.name if po.supplier else "Supplier",
            quantity=po.quantity,
            unit_price=po.unit_price,
            total_amount=po.total_amount,
            expected_delivery_date=po.expected_delivery_date,
            status=po.status,
            approved_at=po.approved_at,
            created_at=po.created_at
        ))
    return res

@router.post("/approve", response_model=PurchaseOrderResponse)
def approve_supplier_and_create_po(
    req: ApproveSupplierRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """
    Formally approves a recommended supplier agreement, creates a Purchase Order
    under transactional idempotency, schedules a production plan, and dispatches notifications.
    """
    proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == req.procurement_request_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")

    supplier = db.query(Supplier).filter(Supplier.id == req.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    order = proc.order
    if not order:
        raise HTTPException(status_code=404, detail="Associated customer order not found")

    # Idempotency check: prevent duplicate PO creation
    idempotency_key = f"PO-REQ-{proc.id}-SUP-{supplier.id}"
    existing_po = db.query(PurchaseOrder).filter(PurchaseOrder.idempotency_key == idempotency_key).first()
    if existing_po:
        return PurchaseOrderResponse(
            id=existing_po.id,
            po_number=existing_po.po_number,
            order_id=existing_po.order_id,
            order_number=order.order_number,
            procurement_request_id=existing_po.procurement_request_id,
            supplier_id=existing_po.supplier_id,
            supplier_name=supplier.name,
            quantity=existing_po.quantity,
            unit_price=existing_po.unit_price,
            total_amount=existing_po.total_amount,
            expected_delivery_date=existing_po.expected_delivery_date,
            status=existing_po.status,
            approved_at=existing_po.approved_at,
            created_at=existing_po.created_at
        )

    # Calculate total and expected arrival
    total_amount = round(req.quantity * req.selected_unit_price, 2)
    expected_delivery = datetime.utcnow() + timedelta(days=req.lead_time_days)

    count = db.query(PurchaseOrder).count() + 1
    po_number = f"PO-{datetime.utcnow().year}-{count:04d}"

    po = PurchaseOrder(
        po_number=po_number,
        order_id=order.id,
        procurement_request_id=proc.id,
        supplier_id=supplier.id,
        quantity=req.quantity,
        unit_price=req.selected_unit_price,
        total_amount=total_amount,
        expected_delivery_date=expected_delivery,
        status="APPROVED",
        approved_by_user_id=user_id,
        approved_at=datetime.utcnow(),
        idempotency_key=idempotency_key
    )
    db.add(po)
    db.flush()

    # Create associated Production Plan
    prod_plan = ProductionPlan(
        purchase_order_id=po.id,
        order_id=order.id,
        status="PLANNED",
        planned_start=expected_delivery,
        planned_end=expected_delivery + timedelta(days=2)
    )
    db.add(prod_plan)

    # Update state of Procurement Request and Customer Order
    proc.status = "PO_ISSUED"
    order.status = "PURCHASE_ORDER_CREATED"

    # Notify Supplier
    sup_notif = Notification(
        user_id=supplier.user_id,
        role="SUPPLIER",
        title=f"New Purchase Order Received: {po.po_number}",
        message=f"You have been awarded Purchase Order #{po.po_number} for {req.quantity} units (${req.selected_unit_price}/unit). Total: ${total_amount}.",
        event_type="PO_ISSUED",
        related_order_id=order.id
    )
    db.add(sup_notif)

    # Notify Customer
    cust_notif = Notification(
        user_id=order.customer.user_id if order.customer else None,
        role="CUSTOMER",
        title=f"Order Update: Materials Sourced for #{order.order_number}",
        message=f"Component sourcing approved. Production timeline is locked for scheduled delivery on {order.target_delivery_date.strftime('%b %d, %Y')}.",
        event_type="ORDER_UPDATE",
        related_order_id=order.id
    )
    db.add(cust_notif)

    # Audit Log
    audit = AuditLog(
        user_id=user_id,
        action="SUPPLIER_APPROVED_PO_CREATED",
        entity_type="PurchaseOrder",
        entity_id=po.po_number,
        new_values={
            "supplier": supplier.name,
            "quantity": req.quantity,
            "unit_price": req.selected_unit_price,
            "total_amount": total_amount,
            "order_number": order.order_number
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(po)

    return PurchaseOrderResponse(
        id=po.id,
        po_number=po.po_number,
        order_id=po.order_id,
        order_number=order.order_number,
        procurement_request_id=po.procurement_request_id,
        supplier_id=po.supplier_id,
        supplier_name=supplier.name,
        quantity=po.quantity,
        unit_price=po.unit_price,
        total_amount=po.total_amount,
        expected_delivery_date=po.expected_delivery_date,
        status=po.status,
        approved_at=po.approved_at,
        created_at=po.created_at
    )
