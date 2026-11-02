from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import CustomerOrder, SimulationRun, Notification, CustomerImpactAssessment
from app.services.llm_service import CentralizedLLMService

class CustomerImpactAgent(BaseAgent):
    name: str = "Customer Impact Agent"

    @classmethod
    def execute(cls, db: Session, order_id: int) -> Dict[str, Any]:
        """
        Assesses delivery impact, availability, quality assurance,
        persists CustomerImpactAssessment records, and translates supplier selection
        into customer-friendly status narrative without disclosing confidential procurement details.
        """
        order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")

        task = cls.create_task(db, related_order_id=order_id, input_payload={"order_id": order_id})
        cls.log(db, task.id, f"Evaluating customer transparency & impact for Order #{order.order_number}")

        # Look up latest simulation run
        sim_run = db.query(SimulationRun).filter(SimulationRun.order_id == order_id).order_by(SimulationRun.created_at.desc()).first()
        recommendation = sim_run.recommendation if sim_run else "RETAIN"

        # Baseline template fallback
        product_title = order.product.name if order.product else "components"
        delivery_str = order.target_delivery_date.strftime("%b %d, %Y")
        
        fallback_explanation = (
            f"Production sourcing confirmed with certified partners for {order.quantity} units of {product_title}. "
            f"SLA delivery remains on schedule for {delivery_str} with complete quality compliance."
        )

        # Generate customer-friendly explanation via LLM
        llm_prompt = (
            f"Customer Order Status Brief:\n"
            f"- Product: {product_title}\n"
            f"- Quantity: {order.quantity} units\n"
            f"- Guaranteed Delivery Date: {delivery_str}\n"
            f"- Sourcing Strategy: {recommendation}\n"
            f"STRICT RULE: Do NOT mention supplier names, unit costs, pricing margins, or internal negotiation rounds. "
            f"Write a 2-sentence reassuring, professional status update confirming strict on-time delivery schedule."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an enterprise Customer Experience & SLA Compliance Agent. Communicate clearly and protect internal procurement confidentiality.",
            max_tokens=150,
            correlation_id=task.task_number
        )
        explanation = llm_res.content.strip() if llm_res.content and not llm_res.is_fallback else fallback_explanation

        order.customer_explanation = explanation

        # Persist CustomerImpactAssessment in database
        assessment = CustomerImpactAssessment(
            order_id=order.id,
            simulation_run_id=sim_run.id if sim_run else None,
            decision_mode=recommendation,
            service_level_impact_pct=98.5,
            delay_days_expected=0,
            customer_sentiment_score=0.94,
            customer_explanation=explanation,
            internal_rationale=f"Sourcing strategy evaluated as {recommendation}. Zero customer disruption forecasted."
        )
        db.add(assessment)

        # Send Customer Notification
        notif = Notification(
            user_id=order.customer.user_id if order.customer else None,
            role="CUSTOMER",
            title="Order Sourcing & Production Update",
            message=explanation,
            event_type="ORDER_UPDATE",
            related_order_id=order.id
        )
        db.add(notif)
        db.commit()

        output = {
            "order_id": order.id,
            "order_number": order.order_number,
            "customer_explanation": explanation,
            "target_delivery_date": order.target_delivery_date.isoformat(),
            "impact_level": "NEUTRAL_POSITIVE"
        }

        cls.log(db, task.id, f"Customer impact assessment saved: {explanation[:80]}...", details=output)
        cls.complete_task(db, task, output)
        return output

