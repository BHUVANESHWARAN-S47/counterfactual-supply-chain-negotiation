from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CustomerOrder, Inventory, Supplier, Quotation, SimulationRun
from app.schemas.schemas import AssistantQueryRequest, AssistantQueryResponse
from app.services.llm_assistant import LLMAssistantService

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.get("/status")
def get_assistant_engine_status():
    ollama_online = LLMAssistantService.is_ollama_available()
    return {
        "ollama_connected": ollama_online,
        "configured_model": "llama3" if ollama_online else "Fallback Rule Engine",
        "active_mode": "Local LLaMA (Ollama)" if ollama_online else "Deterministic Heuristic Engine",
        "fallback_available": True
    }

@router.post("/query", response_model=AssistantQueryResponse)
def query_assistant(req: AssistantQueryRequest, db: Session = Depends(get_db)):
    """
    Role-aware AI query grounded in real database context with Ollama + Rule-based fallback.
    """
    # Retrieve operational context
    orders = db.query(CustomerOrder).order_by(CustomerOrder.created_at.desc()).limit(5).all()
    orders_context = [
        {
            "order_number": o.order_number,
            "product": o.product.name if o.product else "N/A",
            "quantity": o.quantity,
            "status": o.status,
            "target_date": o.target_delivery_date.strftime("%Y-%m-%d")
        }
        for o in orders
    ]

    shortage_items = db.query(Inventory).filter((Inventory.on_hand - Inventory.reserved) <= 50).all()
    inventory_context = [
        {
            "product_name": inv.product.name if inv.product else "Item",
            "available": inv.available,
            "on_hand": inv.on_hand,
            "shortage": max(0, 100 - inv.available)
        }
        for inv in shortage_items
    ]

    suppliers = db.query(Supplier).limit(4).all()
    supplier_context = [
        {
            "name": s.name,
            "rating": s.baseline_rating,
            "lead_days": s.base_lead_time_days,
            "reliability": s.reliability_score,
            "risk": s.risk_score
        }
        for s in suppliers
    ]

    latest_sim = db.query(SimulationRun).order_by(SimulationRun.created_at.desc()).first()
    cnt_context = {}
    if latest_sim:
        cnt_context = {
            "run_number": latest_sim.run_number,
            "recommendation": latest_sim.recommendation,
            "justification": latest_sim.justification,
            "confidence": latest_sim.confidence_score
        }

    context = {
        "orders": orders_context,
        "inventory_alerts": inventory_context,
        "top_suppliers": supplier_context,
        "latest_cnt_recommendation": cnt_context
    }

    result = LLMAssistantService.query_assistant(
        prompt=req.prompt,
        role=req.role,
        context=context
    )

    return AssistantQueryResponse(
        answer=result["answer"],
        model_used=result["model_used"],
        is_fallback=result["is_fallback"],
        context_retrieved=result["context_retrieved"],
        suggested_actions=result["suggested_actions"]
    )
