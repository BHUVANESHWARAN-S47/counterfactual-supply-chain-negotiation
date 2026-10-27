from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CustomerFeedback, CustomerOrder, Customer
from app.schemas.schemas import CustomerFeedbackCreate, CustomerFeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Customer Feedback"])

@router.get("/", response_model=List[CustomerFeedbackResponse])
def get_all_feedback(db: Session = Depends(get_db)):
    feedback_list = db.query(CustomerFeedback).order_by(CustomerFeedback.created_at.desc()).all()
    res = []
    for f in feedback_list:
        customer = db.query(Customer).filter(Customer.id == f.customer_id).first()
        res.append(CustomerFeedbackResponse(
            id=f.id,
            order_id=f.order_id,
            customer_id=f.customer_id,
            customer_name=customer.name if customer else "Customer",
            rating=f.rating,
            delivery_satisfaction=f.delivery_satisfaction,
            quality_satisfaction=f.quality_satisfaction,
            comments=f.comments,
            created_at=f.created_at
        ))
    return res

@router.post("/", response_model=CustomerFeedbackResponse)
def submit_feedback(req: CustomerFeedbackCreate, db: Session = Depends(get_db)):
    order = db.query(CustomerOrder).filter(CustomerOrder.id == req.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    existing = db.query(CustomerFeedback).filter(CustomerFeedback.order_id == req.order_id).first()
    if existing:
        existing.rating = req.rating
        existing.delivery_satisfaction = req.delivery_satisfaction
        existing.quality_satisfaction = req.quality_satisfaction
        existing.comments = req.comments
        db.commit()
        db.refresh(existing)
        fb = existing
    else:
        fb = CustomerFeedback(
            order_id=order.id,
            customer_id=order.customer_id,
            rating=req.rating,
            delivery_satisfaction=req.delivery_satisfaction,
            quality_satisfaction=req.quality_satisfaction,
            comments=req.comments
        )
        db.add(fb)
        order.status = "COMPLETED"
        db.commit()
        db.refresh(fb)

    customer = order.customer
    return CustomerFeedbackResponse(
        id=fb.id,
        order_id=fb.order_id,
        customer_id=fb.customer_id,
        customer_name=customer.name if customer else "Customer",
        rating=fb.rating,
        delivery_satisfaction=fb.delivery_satisfaction,
        quality_satisfaction=fb.quality_satisfaction,
        comments=fb.comments,
        created_at=fb.created_at
    )
