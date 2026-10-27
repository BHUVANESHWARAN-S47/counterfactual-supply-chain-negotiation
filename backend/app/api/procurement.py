from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ProcurementRequest
from app.schemas.schemas import ProcurementRequestResponse

router = APIRouter(prefix="/procurement", tags=["Procurement Management"])

@router.get("/", response_model=List[ProcurementRequestResponse])
def get_procurement_requests(db: Session = Depends(get_db)):
    reqs = db.query(ProcurementRequest).order_by(ProcurementRequest.created_at.desc()).all()
    res = []
    for r in reqs:
        res.append(ProcurementRequestResponse(
            id=r.id,
            request_number=r.request_number,
            order_id=r.order_id,
            order_number=r.order.order_number if r.order else None,
            product_id=r.product_id,
            product_name=r.product.name if r.product else "Product",
            required_quantity=r.required_quantity,
            available_quantity=r.available_quantity,
            shortage_quantity=r.shortage_quantity,
            required_by_date=r.required_by_date,
            estimated_budget=r.estimated_budget,
            status=r.status,
            priority=r.priority,
            delivery_risk=r.delivery_risk,
            quotations_count=len(r.quotations),
            created_at=r.created_at
        ))
    return res

@router.get("/{proc_id}", response_model=ProcurementRequestResponse)
def get_procurement_request(proc_id: int, db: Session = Depends(get_db)):
    r = db.query(ProcurementRequest).filter(ProcurementRequest.id == proc_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Procurement request not found")
    return ProcurementRequestResponse(
        id=r.id,
        request_number=r.request_number,
        order_id=r.order_id,
        order_number=r.order.order_number if r.order else None,
        product_id=r.product_id,
        product_name=r.product.name if r.product else "Product",
        required_quantity=r.required_quantity,
        available_quantity=r.available_quantity,
        shortage_quantity=r.shortage_quantity,
        required_by_date=r.required_by_date,
        estimated_budget=r.estimated_budget,
        status=r.status,
        priority=r.priority,
        delivery_risk=r.delivery_risk,
        quotations_count=len(r.quotations),
        created_at=r.created_at
    )
