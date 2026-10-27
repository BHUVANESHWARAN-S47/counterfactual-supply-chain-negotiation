from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Shipment, CustomerOrder, PurchaseOrder, Notification
from app.schemas.schemas import ShipmentResponse, ShipmentUpdateStatus

router = APIRouter(prefix="/shipments", tags=["Fulfillment & Shipments"])

@router.get("/", response_model=List[ShipmentResponse])
def get_shipments(order_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Shipment)
    if order_id:
        query = query.filter(Shipment.order_id == order_id)
    shipments = query.order_by(Shipment.created_at.desc()).all()
    return shipments

@router.post("/dispatch/{order_id}", response_model=ShipmentResponse)
def dispatch_shipment(order_id: int, carrier: str = "Global Express Freight", db: Session = Depends(get_db)):
    order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    count = db.query(Shipment).count() + 1
    shipment_num = f"SHP-{datetime.utcnow().year}-{count:04d}"
    tracking_num = f"TRK{datetime.utcnow().strftime('%y%m%d')}{count:04d}"

    shipment = Shipment(
        shipment_number=shipment_num,
        order_id=order.id,
        tracking_number=tracking_num,
        carrier=carrier,
        origin="Manufacturing Facility Hub",
        destination=order.delivery_address or "Customer Destination",
        status="IN_TRANSIT",
        estimated_arrival=datetime.utcnow() + timedelta(days=3)
    )
    db.add(shipment)
    order.status = "SHIPPED"

    # Notify customer
    notif = Notification(
        user_id=order.customer.user_id if order.customer else None,
        role="CUSTOMER",
        title=f"Order Dispatched: #{order.order_number}",
        message=f"Your completed order has been dispatched via {carrier} (Tracking: {tracking_num}).",
        event_type="SHIPMENT_UPDATE",
        related_order_id=order.id
    )
    db.add(notif)
    db.commit()
    db.refresh(shipment)
    return shipment

@router.post("/{shipment_id}/deliver", response_model=ShipmentResponse)
def mark_delivered(shipment_id: int, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment.status = "DELIVERED"
    shipment.actual_arrival = datetime.utcnow()
    order = shipment.order
    if order:
        order.status = "DELIVERED"

    notif = Notification(
        user_id=order.customer.user_id if order and order.customer else None,
        role="CUSTOMER",
        title=f"Order Delivered: #{order.order_number if order else ''}",
        message="Your shipment has been successfully delivered! Please share your feedback.",
        event_type="DELIVERY_CONFIRMED",
        related_order_id=order.id if order else None
    )
    db.add(notif)
    db.commit()
    db.refresh(shipment)
    return shipment
