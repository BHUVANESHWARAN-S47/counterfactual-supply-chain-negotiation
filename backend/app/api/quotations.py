from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Quotation, ProcurementRequest, Supplier
from app.schemas.schemas import QuotationCreate, QuotationResponse
from app.services.supplier_evaluator import SupplierEvaluator

router = APIRouter(prefix="/quotations", tags=["Supplier Quotations"])

@router.get("/", response_model=List[QuotationResponse])
def get_quotations(procurement_request_id: int = None, supplier_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Quotation)
    if procurement_request_id:
        query = query.filter(Quotation.procurement_request_id == procurement_request_id)
    if supplier_id:
        query = query.filter(Quotation.supplier_id == supplier_id)
    quotes = query.order_by(Quotation.total_score.desc(), Quotation.created_at.desc()).all()

    res = []
    for q in quotes:
        res.append(QuotationResponse(
            id=q.id,
            quotation_number=q.quotation_number,
            procurement_request_id=q.procurement_request_id,
            supplier_id=q.supplier_id,
            supplier_name=q.supplier.name if q.supplier else "Supplier",
            offered_quantity=q.offered_quantity,
            unit_price=q.unit_price,
            delivery_lead_days=q.delivery_lead_days,
            quality_rating=q.quality_rating,
            reliability_score=q.reliability_score,
            risk_score=q.risk_score,
            validity_date=q.validity_date,
            notes=q.notes,
            version=q.version,
            status=q.status,
            total_score=q.total_score,
            rank=q.rank,
            created_at=q.created_at
        ))
    return res

@router.post("/", response_model=QuotationResponse)
def submit_quotation(req: QuotationCreate, db: Session = Depends(get_db)):
    proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == req.procurement_request_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")

    supplier = db.query(Supplier).filter(Supplier.id == req.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    count = db.query(Quotation).count() + 1
    q_num = f"QT-{datetime.utcnow().year}-{count:04d}"

    q = Quotation(
        quotation_number=q_num,
        procurement_request_id=req.procurement_request_id,
        supplier_id=req.supplier_id,
        offered_quantity=req.offered_quantity,
        unit_price=req.unit_price,
        delivery_lead_days=req.delivery_lead_days,
        quality_rating=supplier.baseline_rating,
        reliability_score=supplier.reliability_score,
        risk_score=supplier.risk_score,
        validity_date=datetime.utcnow() + timedelta(days=14),
        notes=req.notes or f"Quotation submitted by {supplier.name}",
        status="SUBMITTED"
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    # Recalculate ranking across this procurement's quotes
    all_quotes = db.query(Quotation).filter(Quotation.procurement_request_id == req.procurement_request_id).all()
    q_dicts = [
        {
            "id": item.id,
            "unit_price": item.unit_price,
            "delivery_lead_days": item.delivery_lead_days,
            "quality_rating": item.quality_rating,
            "reliability_score": item.reliability_score,
            "risk_score": item.risk_score,
            "offered_quantity": item.offered_quantity
        }
        for item in all_quotes
    ]
    ranked = SupplierEvaluator.evaluate_quotations(q_dicts, proc.shortage_quantity)
    for r in ranked:
        target_q = db.query(Quotation).filter(Quotation.id == r["id"]).first()
        if target_q:
            target_q.total_score = r["total_score"]
            target_q.rank = r["rank"]
    db.commit()
    db.refresh(q)

    return QuotationResponse(
        id=q.id,
        quotation_number=q.quotation_number,
        procurement_request_id=q.procurement_request_id,
        supplier_id=q.supplier_id,
        supplier_name=supplier.name,
        offered_quantity=q.offered_quantity,
        unit_price=q.unit_price,
        delivery_lead_days=q.delivery_lead_days,
        quality_rating=q.quality_rating,
        reliability_score=q.reliability_score,
        risk_score=q.risk_score,
        validity_date=q.validity_date,
        notes=q.notes,
        version=q.version,
        status=q.status,
        total_score=q.total_score,
        rank=q.rank,
        created_at=q.created_at
    )

@router.get("/compare/{procurement_request_id}")
def compare_quotations(procurement_request_id: int, db: Session = Depends(get_db)):
    proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == procurement_request_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")

    quotes = db.query(Quotation).filter(Quotation.procurement_request_id == procurement_request_id).all()
    if not quotes:
        return {"procurement_request_id": procurement_request_id, "comparison": []}

    q_dicts = [
        {
            "id": q.id,
            "quotation_number": q.quotation_number,
            "supplier_id": q.supplier_id,
            "supplier_name": q.supplier.name if q.supplier else "Supplier",
            "unit_price": q.unit_price,
            "offered_quantity": q.offered_quantity,
            "delivery_lead_days": q.delivery_lead_days,
            "quality_rating": q.quality_rating,
            "reliability_score": q.reliability_score,
            "risk_score": q.risk_score
        }
        for q in quotes
    ]

    evaluated = SupplierEvaluator.evaluate_quotations(q_dicts, proc.shortage_quantity)
    return {
        "procurement_request_id": procurement_request_id,
        "product_name": proc.product.name if proc.product else "Product",
        "required_quantity": proc.shortage_quantity,
        "criteria_weights": SupplierEvaluator.WEIGHTS,
        "comparison": evaluated
    }
