from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import NegotiationSession, NegotiationMessage, Quotation, ProcurementRequest
from app.services.llm_service import CentralizedLLMService

class NegotiationAgent(BaseAgent):
    name: str = "AI Negotiation Agent"

    @classmethod
    def execute_round(
        cls,
        db: Session,
        session_id: int,
        buyer_offered_price: Optional[float] = None,
        buyer_lead_days: Optional[int] = None,
        buyer_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes a negotiation turn between Buyer Agent and Supplier Agent,
        recording messages, evaluating concessions, and checking for agreement.
        """
        session = db.query(NegotiationSession).filter(NegotiationSession.id == session_id).first()
        if not session:
            raise ValueError(f"Negotiation session {session_id} not found")

        task = cls.create_task(db, related_procurement_id=session.procurement_request_id, input_payload={"session_id": session_id, "round": session.current_round})
        cls.log(db, task.id, f"Processing negotiation round {session.current_round} for Session #{session.session_number}")

        # If buyer did not provide price, formulate an AI suggested counteroffer (e.g. 7% discount)
        if buyer_offered_price is None:
            buyer_offered_price = round(session.current_supplier_offer * 0.93, 2)
        if buyer_lead_days is None:
            buyer_lead_days = 6
        if not buyer_message:
            buyer_message = (
                f"We request a targeted unit price of ₹{buyer_offered_price} (lead time: {buyer_lead_days}d) "
                f"based on committed order volume and competitive market benchmarks."
            )

        # Re-open session if it was previously agreed so the user can continue bargaining
        if session.status == "AGREED":
            session.status = "ACTIVE"
            session.agreement_reached = False

        if session.current_round >= session.max_rounds:
            session.max_rounds = session.current_round + 3

        # 1. Record Buyer Message
        buyer_msg = NegotiationMessage(
            session_id=session.id,
            sender_role="BUYER_AGENT",
            sender_name="Buyer Negotiation Agent",
            round_number=session.current_round,
            offered_price=buyer_offered_price,
            offered_lead_days=buyer_lead_days,
            message=buyer_message,
            ai_suggestion=f"Buyer proposed ₹{buyer_offered_price}/unit targeting maximum cost savings."
        )
        db.add(buyer_msg)
        session.current_buyer_offer = buyer_offered_price

        # 2. Supplier Agent Response Logic
        diff_pct = (session.current_supplier_offer - buyer_offered_price) / max(session.current_supplier_offer, 1.0)

        # Generate dynamic supplier concession justification via LLM
        vendor_name = session.procurement_request.product.name if session.procurement_request and session.procurement_request.product else "Components"
        llm_prompt = (
            f"Supplier Negotiation Turn:\n"
            f"- Component: {vendor_name}\n"
            f"- Buyer Offer: ₹{buyer_offered_price} (Lead: {buyer_lead_days}d)\n"
            f"- Supplier Offer: ₹{session.current_supplier_offer}\n"
            f"- Price Difference: {round(diff_pct * 100, 1)}%\n"
            f"- Round: {session.current_round}\n"
            f"Generate a professional, realistic supplier response message (max 2 sentences) either confirming concession or presenting counter-price."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an autonomous Supplier Sales Agent negotiating enterprise component contracts.",
            max_tokens=120,
            correlation_id=task.task_number
        )

        supplier_dialogue = llm_res.content.strip()

        if diff_pct <= 0.05 or session.current_round >= session.max_rounds:
            # Supplier ACCEPTS
            agreement_price = buyer_offered_price if diff_pct <= 0.05 else round((session.current_supplier_offer + buyer_offered_price) / 2, 2)
            session.agreement_reached = True
            session.status = "AGREED"
            session.final_price = agreement_price
            session.final_lead_days = buyer_lead_days
            session.current_supplier_offer = agreement_price

            supplier_msg = NegotiationMessage(
                session_id=session.id,
                sender_role="SUPPLIER_AGENT",
                sender_name=f"Supplier Agent ({vendor_name})",
                round_number=session.current_round,
                offered_price=agreement_price,
                offered_lead_days=buyer_lead_days,
                message=supplier_dialogue or f"Offer accepted at ₹{agreement_price}/unit with {buyer_lead_days}-day delivery lead time. Agreement confirmed.",
                ai_suggestion="Supplier concession confirmed. Session reached binding agreement."
            )
            db.add(supplier_msg)
            cls.log(db, task.id, f"Negotiation SUCCESS: Agreement reached at ₹{agreement_price}/unit in Round {session.current_round}!", level="SUCCESS")
        else:
            # Supplier COUNTERS with compromise price
            counter_supplier_price = round(session.current_supplier_offer - ((session.current_supplier_offer - buyer_offered_price) * 0.45), 2)
            session.current_supplier_offer = counter_supplier_price
            session.current_round += 1

            supplier_msg = NegotiationMessage(
                session_id=session.id,
                sender_role="SUPPLIER_AGENT",
                sender_name="Supplier Agent",
                round_number=session.current_round - 1,
                offered_price=counter_supplier_price,
                offered_lead_days=buyer_lead_days + 1,
                message=supplier_dialogue or f"We can offer a revised rate of ₹{counter_supplier_price}/unit with {buyer_lead_days + 1}-day lead time.",
                ai_suggestion=f"Supplier reduced offer to ₹{counter_supplier_price}/unit. Recommended action: Accept or submit another counteroffer."
            )
            db.add(supplier_msg)
            cls.log(db, task.id, f"Supplier countered with ₹{counter_supplier_price}/unit. Progressing to Round {session.current_round}.")


        db.commit()
        db.refresh(session)

        output = {
            "session_id": session.id,
            "status": session.status,
            "current_round": session.current_round,
            "agreement_reached": session.agreement_reached,
            "final_price": session.final_price,
            "current_supplier_offer": session.current_supplier_offer,
            "current_buyer_offer": session.current_buyer_offer
        }
        cls.complete_task(db, task, output)
        return output
