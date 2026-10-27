from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import ProcurementRequest, CustomerOrder, Quotation

class LogisticsAgent(BaseAgent):
    name: str = "Logistics Agent"

    @classmethod
    def execute(cls, db: Session, procurement_id: int) -> Dict[str, Any]:
        """
        Evaluates delivery route, shipping lead time, freight cost models,
        and schedule feasibility against customer deadline.
        """
        proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == procurement_id).first()
        order = db.query(CustomerOrder).filter(CustomerOrder.id == proc.order_id).first() if proc else None

        task = cls.create_task(db, related_procurement_id=procurement_id, input_payload={"procurement_id": procurement_id})
        cls.log(db, task.id, f"Calculating logistics feasibility and transit windows for PR #{proc.request_number if proc else procurement_id}")

        quotes = db.query(Quotation).filter(Quotation.procurement_request_id == procurement_id).all()
        logistics_plans = []
        now = datetime.utcnow()

        target_date = order.target_delivery_date if order else now + timedelta(days=14)

        for q in quotes:
            lead_days = q.delivery_lead_days
            estimated_arrival = now + timedelta(days=lead_days)
            production_buffer_days = 2
            total_lead_to_ship = lead_days + production_buffer_days
            projected_delivery = now + timedelta(days=total_lead_to_ship)
            variance_days = (projected_delivery - target_date).days

            # Freight cost: base $120 + $0.75 per unit
            qty = proc.shortage_quantity if proc else 100
            estimated_freight = round(120.0 + (qty * 0.75), 2)

            is_feasible = variance_days <= 0

            logistics_plans.append({
                "supplier_id": q.supplier_id,
                "supplier_name": q.supplier.name if q.supplier else "Supplier",
                "lead_time_days": lead_days,
                "estimated_material_arrival": estimated_arrival.isoformat(),
                "projected_customer_delivery": projected_delivery.isoformat(),
                "deadline_variance_days": variance_days,
                "is_schedule_feasible": is_feasible,
                "estimated_freight_cost": estimated_freight,
                "freight_carrier": "Express Freight Line (Tier-1 Air/Road)"
            })

        output = {
            "procurement_id": procurement_id,
            "target_customer_delivery": target_date.isoformat(),
            "logistics_evaluations": logistics_plans
        }

        cls.log(
            db,
            task.id,
            f"Logistics evaluation complete. {sum(1 for p in logistics_plans if p['is_schedule_feasible'])}/{len(logistics_plans)} routes schedule-compliant.",
            details=output
        )
        cls.complete_task(db, task, output)
        return output
