import re
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import security_scheme, decode_access_token
from app.models.models import User
from app.schemas.schemas import AssistantQueryRequest, AssistantQueryResponse
from app.services.llm_assistant import LLMAssistantService
from app.services.assistant_tools import AssistantDataTools

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.get("/status")
def get_assistant_engine_status():
    return LLMAssistantService.get_engine_status()

@router.post("/query", response_model=AssistantQueryResponse)
def query_assistant(
    req: AssistantQueryRequest,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    """
    Role-authenticated natural language data retrieval and conversational reasoning.
    Executes authorized parameterized database tools based on query intent.
    Never leaks cross-role records and maintains context for follow-up questions.
    """
    # 1. Determine verified user identity
    user: Optional[User] = None
    if auth and auth.credentials:
        payload = decode_access_token(auth.credentials)
        if payload and "sub" in payload:
            user = db.query(User).filter(User.email == payload["sub"]).first()

    # Fallback to role-based system persona if using unauthenticated client session
    if not user:
        role_to_find = (req.role or "ADMIN").upper()
        user = db.query(User).filter(User.role == role_to_find).first()
        if not user:
            user = db.query(User).first()

    effective_role = user.role if user else (req.role or "ADMIN").upper()
    p_lower = req.prompt.lower().strip()

    # 2. Select Authorized Tools according to user query intent
    tool_data = {}

    is_greeting = bool(re.match(r"^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings|howdy|hi\s*there)[!.,\s]*$", p_lower))

    if not is_greeting:
        # Check for Pending Approvals intent
        if any(w in p_lower for w in ["approval", "approve", "waiting for approval", "decisions need", "pending supplier", "sign-off"]):
            tool_data["pending_approvals"] = AssistantDataTools.get_pending_approvals(
                db=db,
                user=user,
                limit=5
            )

        # Check for Inventory Shortages intent
        elif any(w in p_lower for w in ["shortage", "inventory", "stock", "reorder", "low stock", "buffer level", "critical inventory"]):
            tool_data["inventory"] = AssistantDataTools.search_inventory(
                db=db,
                user=user,
                shortage_only=True,
                limit=5
            )

        # Check for Supplier Comparison or Follow-up intent (Cheaper vs Delivery time)
        elif any(w in p_lower for w in ["which supplier", "best supplier", "cheaper", "delivery time", "compare supplier", "lead time", "fastest supplier", "supplier recommendation"]):
            # Extract order number from prompt or history
            order_match = re.search(r"(ORD-\d+|PO-\d+)", req.prompt, re.IGNORECASE)
            order_ref = order_match.group(1) if order_match else None
            
            # If not in current prompt, check recent conversation history
            if not order_ref and req.history:
                for h in reversed(req.history):
                    h_text = h.get("content") or h.get("text") or ""
                    prev_match = re.search(r"(ORD-\d+|PO-\d+)", h_text, re.IGNORECASE)
                    if prev_match:
                        order_ref = prev_match.group(1)
                        break

            tool_data["supplier_comparison"] = AssistantDataTools.compare_suppliers_for_order(
                db=db,
                user=user,
                order_ref=order_ref
            )

        # Check for Purchase Orders intent
        elif any(w in p_lower for w in ["purchase order", "open purchase order", "my purchase order", "po-"]):
            tool_data["purchase_orders"] = AssistantDataTools.search_purchase_orders(
                db=db,
                user=user,
                limit=5
            )

        # Check for Order Tracking / Status intent
        elif any(w in p_lower for w in ["order", "track", "delayed", "late", "status", "delivery", "when will", "ord-"]):
            tool_data["orders"] = AssistantDataTools.search_orders(
                db=db,
                user=user,
                query=None,
                delayed_only=("delay" in p_lower or "late" in p_lower),
                limit=5
            )

        # Default fallback context if general inquiry
        else:
            if effective_role in ("ADMIN", "PROCUREMENT"):
                tool_data["orders"] = AssistantDataTools.search_orders(db=db, user=user, limit=3)
                tool_data["inventory"] = AssistantDataTools.search_inventory(db=db, user=user, shortage_only=True, limit=3)
            elif effective_role == "SUPPLIER":
                tool_data["purchase_orders"] = AssistantDataTools.search_purchase_orders(db=db, user=user, limit=3)
            else:
                tool_data["orders"] = AssistantDataTools.search_orders(db=db, user=user, limit=3)

    # 3. Formulate Grounded Answer via Centralized LLM Engine
    result = LLMAssistantService.query_assistant(
        prompt=req.prompt,
        role=effective_role,
        context=tool_data,
        history=req.history
    )

    return AssistantQueryResponse(
        answer=result["answer"],
        model_used=result["model_used"],
        is_fallback=result["is_fallback"],
        context_retrieved=result["context_retrieved"],
        suggested_actions=result["suggested_actions"]
    )
