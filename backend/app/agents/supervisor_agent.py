from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.agents.buyer_agent import BuyerAgent
from app.agents.supplier_agent import SupplierAgent
from app.agents.price_analysis_agent import PriceAnalysisAgent
from app.agents.risk_assessment_agent import RiskAssessmentAgent
from app.agents.logistics_agent import LogisticsAgent
from app.agents.decision_agent import DecisionAgent
from app.agents.customer_impact_agent import CustomerImpactAgent
from app.models.models import CustomerOrder, Notification
from app.services.llm_service import CentralizedLLMService

class SupervisorAgent(BaseAgent):
    name: str = "Supervisor Agent"

    @classmethod
    def orchestrate_order_workflow(cls, db: Session, order_id: int) -> Dict[str, Any]:
        """
        Coordinates all specialized agents in dependency sequence:
        Buyer -> Supplier -> Price -> Risk -> Logistics -> Decision (CNT) -> Customer Impact.
        """
        order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")

        super_task = cls.create_task(db, related_order_id=order_id, input_payload={"order_id": order_id})
        cls.log(db, super_task.id, f"Initiating Multi-Agent Workflow for Order #{order.order_number}")

        # Step 1: Buyer Agent
        order.status = "INVENTORY_ANALYSIS"
        db.commit()
        buyer_res = BuyerAgent.execute(db, order_id)
        proc_id = buyer_res["procurement_request_id"]

        # Step 2: Supplier Agent
        order.status = "AWAITING_QUOTATIONS"
        db.commit()
        supplier_res = SupplierAgent.execute(db, proc_id)

        # Step 3: Price Analysis Agent
        price_res = PriceAnalysisAgent.execute(db, proc_id)

        # Step 4: Risk Assessment Agent
        risk_res = RiskAssessmentAgent.execute(db, proc_id)

        # Step 5: Logistics Agent
        logistics_res = LogisticsAgent.execute(db, proc_id)

        # Step 6: Decision Agent (runs Counterfactual Negotiation Twin)
        decision_res = DecisionAgent.execute(db, proc_id)

        # Step 7: Customer Impact Agent
        impact_res = CustomerImpactAgent.execute(db, order_id)

        # Step 8: Update Order Status to AWAITING_APPROVAL
        order.status = "AWAITING_APPROVAL"

        # Step 9: Notify Admin and Procurement Manager
        admin_notif = Notification(
            role="ADMIN",
            title=f"Approval Required: Supplier Recommendation for Order #{order.order_number}",
            message=(
                f"CNT Simulation completed with recommendation '{decision_res['recommendation']}'. "
                f"Please review scenarios and authorize purchase order commitment."
            ),
            event_type="APPROVAL_REQUIRED",
            related_order_id=order.id
        )
        proc_notif = Notification(
            role="PROCUREMENT",
            title=f"Quotation Simulation Ready for Order #{order.order_number}",
            message=f"Adaptive decision recommends {decision_res['recommendation']}. Ready for final authorization.",
            event_type="APPROVAL_REQUIRED",
            related_order_id=order.id
        )
        db.add(admin_notif)
        db.add(proc_notif)
        db.commit()

        # Step 10: Executive Multi-Agent Synthesis via Centralized LLM
        sup_prompt = (
            f"Multi-Agent Workflow Consolidation for Order #{order.order_number}:\n"
            f"- Sourcing Shortage: {buyer_res.get('shortage_quantity')} units\n"
            f"- Sourcing Recommendation: {decision_res['recommendation']}\n"
            f"- Primary Supplier: {supplier_res.get('top_supplier', {}).get('supplier_name', 'Vendor')}\n"
            f"- Decision Rationale: {decision_res['justification']}\n"
            f"Provide a 2-sentence executive dispatch statement for leadership review."
        )
        sup_llm_res = CentralizedLLMService.generate(
            prompt=sup_prompt,
            system_prompt="You are the Autonomous Multi-Agent Supervisor Agent. Summarize end-to-end multi-agent execution results concisely.",
            max_tokens=150,
            correlation_id=super_task.task_number
        )

        summary_output = {
            "order_id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "procurement_request_id": proc_id,
            "recommendation": decision_res["recommendation"],
            "justification": decision_res["justification"],
            "top_supplier": supplier_res.get("top_supplier"),
            "customer_explanation": impact_res["customer_explanation"],
            "supervisor_executive_brief": sup_llm_res.content.strip()
        }

        cls.log(
            db,
            super_task.id,
            f"Multi-Agent Workflow completed successfully! State transitioned to AWAITING_APPROVAL with recommendation '{decision_res['recommendation']}'.",
            level="SUCCESS",
            details=summary_output
        )
        cls.complete_task(db, super_task, summary_output)
        return summary_output

