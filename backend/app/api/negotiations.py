from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import NegotiationSession, NegotiationMessage, ProcurementRequest, Quotation, Supplier
from app.schemas.schemas import NegotiationSessionResponse, NegotiationMessageCreate, NegotiationMessageResponse
from app.agents.negotiation_agent import NegotiationAgent

router = APIRouter(prefix="/negotiations", tags=["Supplier Negotiation"])

@router.get("/", response_model=List[NegotiationSessionResponse])
def get_negotiations(procurement_request_id: int = None, db: Session = Depends(get_db)):
    query = db.query(NegotiationSession)
    if procurement_request_id:
        query = query.filter(NegotiationSession.procurement_request_id == procurement_request_id)
    sessions = query.order_by(NegotiationSession.created_at.desc()).all()

    res = []
    for s in sessions:
        msgs = [
            NegotiationMessageResponse(
                id=m.id,
                session_id=m.session_id,
                sender_role=m.sender_role,
                sender_name=m.sender_name,
                round_number=m.round_number,
                offered_price=m.offered_price,
                offered_lead_days=m.offered_lead_days,
                message=m.message,
                ai_suggestion=m.ai_suggestion,
                created_at=m.created_at
            )
            for m in s.messages
        ]
        supplier = db.query(Supplier).filter(Supplier.id == s.supplier_id).first()
        res.append(NegotiationSessionResponse(
            id=s.id,
            session_number=s.session_number,
            procurement_request_id=s.procurement_request_id,
            supplier_id=s.supplier_id,
            supplier_name=supplier.name if supplier else "Supplier",
            status=s.status,
            target_price=s.target_price,
            current_buyer_offer=s.current_buyer_offer,
            current_supplier_offer=s.current_supplier_offer,
            max_rounds=s.max_rounds,
            current_round=s.current_round,
            agreement_reached=s.agreement_reached,
            final_price=s.final_price,
            final_lead_days=s.final_lead_days,
            decision_mode=s.decision_mode,
            messages=msgs,
            created_at=s.created_at
        ))
    return res

@router.get("/{session_id}", response_model=NegotiationSessionResponse)
def get_negotiation(session_id: int, db: Session = Depends(get_db)):
    s = db.query(NegotiationSession).filter(NegotiationSession.id == session_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Negotiation session not found")
    supplier = db.query(Supplier).filter(Supplier.id == s.supplier_id).first()
    msgs = [
        NegotiationMessageResponse(
            id=m.id,
            session_id=m.session_id,
            sender_role=m.sender_role,
            sender_name=m.sender_name,
            round_number=m.round_number,
            offered_price=m.offered_price,
            offered_lead_days=m.offered_lead_days,
            message=m.message,
            ai_suggestion=m.ai_suggestion,
            created_at=m.created_at
        )
        for m in s.messages
    ]
    return NegotiationSessionResponse(
        id=s.id,
        session_number=s.session_number,
        procurement_request_id=s.procurement_request_id,
        supplier_id=s.supplier_id,
        supplier_name=supplier.name if supplier else "Supplier",
        status=s.status,
        target_price=s.target_price,
        current_buyer_offer=s.current_buyer_offer,
        current_supplier_offer=s.current_supplier_offer,
        max_rounds=s.max_rounds,
        current_round=s.current_round,
        agreement_reached=s.agreement_reached,
        final_price=s.final_price,
        final_lead_days=s.final_lead_days,
        decision_mode=s.decision_mode,
        messages=msgs,
        created_at=s.created_at
    )

@router.post("/start")
def start_negotiation(procurement_request_id: int, supplier_id: int, target_discount_pct: float = 8.0, db: Session = Depends(get_db)):
    proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == procurement_request_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement request not found")

    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    quote = db.query(Quotation).filter(
        Quotation.procurement_request_id == procurement_request_id,
        Quotation.supplier_id == supplier_id
    ).first()
    initial_price = quote.unit_price if quote else 48.0
    initial_lead = quote.delivery_lead_days if quote else supplier.base_lead_time_days

    target_price = round(initial_price * (1.0 - (target_discount_pct / 100.0)), 2)

    count = db.query(NegotiationSession).count() + 1
    session_num = f"NEG-{datetime.utcnow().year}-{count:04d}"

    session = NegotiationSession(
        session_number=session_num,
        procurement_request_id=procurement_request_id,
        supplier_id=supplier_id,
        status="ACTIVE",
        target_price=target_price,
        current_buyer_offer=target_price,
        current_supplier_offer=initial_price,
        max_rounds=5,
        current_round=1,
        agreement_reached=False,
        decision_mode="NEGOTIATE"
    )
    db.add(session)
    db.flush()

    # Initial opening supplier offer message
    msg = NegotiationMessage(
        session_id=session.id,
        sender_role="SUPPLIER_AGENT",
        sender_name=f"{supplier.name} Sales Rep",
        round_number=1,
        offered_price=initial_price,
        offered_lead_days=initial_lead,
        message=f"Official submitted quote: ${initial_price}/unit with {initial_lead}-day lead time.",
        ai_suggestion=f"Supplier opened at standard catalog rate. Recommended counter: ${target_price} (8% discount)."
    )
    db.add(msg)
    db.commit()
    db.refresh(session)

    return {"session_id": session.id, "session_number": session.session_number, "status": session.status}

@router.post("/counter", response_model=NegotiationSessionResponse)
def counteroffer(req: NegotiationMessageCreate, db: Session = Depends(get_db)):
    """
    Submits a buyer counteroffer and triggers AI Negotiation Agent to evaluate concession.
    """
    res = NegotiationAgent.execute_round(
        db,
        session_id=req.session_id,
        buyer_offered_price=req.offered_price,
        buyer_lead_days=req.offered_lead_days,
        buyer_message=req.message
    )
    return get_negotiation(req.session_id, db)
