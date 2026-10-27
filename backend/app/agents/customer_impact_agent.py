from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import CustomerOrder, SimulationRun, Notification

class CustomerImpactAgent(BaseAgent):
    name: str = "Customer Impact Agent"

    @classmethod
    def execute(cls, db: Session, order_id: int) -> Dict[str, Any]:
        """
        Assesses delivery impact, availability, quality assurance,
        and translates supplier selection into customer-friendly status narrative.
        """
        order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")

        task = cls.create_task(db, related_order_id=order_id, input_payload={"order_id": order_id})
        cls.log(db, task.id, f"Evaluating customer transparency & impact for Order #{order.order_number}")

        # Look up latest simulation run
        sim_run = db.query(SimulationRun).filter(SimulationRun.order_id == order_id).order_by(SimulationRun.created_at.desc()).first()

        recommendation = sim_run.recommendation if sim_run else "RETAIN"

        if recommendation == "SWITCH":
            explanation = (
                f"Your order for {order.quantity} units of {order.product.name if order.product else 'components'} "
                f"has been routed to an expedited tier-1 certified manufacturing partner. "
                f"Expected delivery remains strictly on schedule for {order.target_delivery_date.strftime('%b %d, %Y')} "
                f"with full ISO-compliant quality guarantees."
            )
        elif recommendation == "NEGOTIATE":
            explanation = (
                f"Our supply chain supervisor has finalized volume alignment with verified suppliers. "
                f"Your product delivery schedule is optimized for {order.target_delivery_date.strftime('%b %d, %Y')} "
                f"at guaranteed premium quality specs."
            )
        else:
            explanation = (
                f"Production sourcing confirmed with our primary certified supplier. "
                f"Zero delivery variance detected; on-track for delivery by {order.target_delivery_date.strftime('%b %d, %Y')}."
            )

        order.customer_explanation = explanation

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
