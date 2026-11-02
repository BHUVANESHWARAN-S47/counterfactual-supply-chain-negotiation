from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import ProcurementRequest, CustomerOrder, Quotation, LogisticsAssessment
from app.services.llm_service import CentralizedLLMService

class LogisticsAgent(BaseAgent):
    name: str = "Logistics Agent"

    @classmethod
    def execute(cls, db: Session, procurement_id: int) -> Dict[str, Any]:
        """
        Evaluates delivery route, shipping lead time, freight cost models,
        persists logistics assessments in the database, and validates schedule feasibility.
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

            # Freight cost: base ₹2,500 + ₹65 per unit
            qty = proc.shortage_quantity if proc else 100
            estimated_freight = round(2500.0 + (qty * 65.0), 2)

            is_feasible = variance_days <= 0

            # Persist LogisticsAssessment record
            log_assessment = LogisticsAssessment(
                order_id=order.id if order else 1,
                procurement_request_id=procurement_id,
                carrier="Express Freight Logistics (Tier-1 Multi-Modal)",
                origin=f"Hub-{q.supplier.name if q.supplier else 'Vendor'}",
                destination=order.delivery_address if order and order.delivery_address else "Central Fulfillment Facility",
                estimated_lead_days=total_lead_to_ship,
                delay_risk_score=0.10 if is_feasible else 0.45,
                transit_cost=estimated_freight,
                is_at_risk=not is_feasible,
                feasibility=is_feasible,
                explanation=f"Transit window: {lead_days}d supplier lead + {production_buffer_days}d buffer. Variance: {variance_days} days.",
                evidence_data={
                    "variance_days": variance_days,
                    "target_date": target_date.isoformat(),
                    "projected_delivery": projected_delivery.isoformat()
                }
            )
            db.add(log_assessment)

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

        db.commit()

        # LLM Synthesis of Logistics Windows
        feasible_count = sum(1 for p in logistics_plans if p['is_schedule_feasible'])
        llm_prompt = (
            f"Review freight logistics schedule for Procurement #{proc.request_number if proc else procurement_id}:\n"
            f"- Target Customer Deadline: {target_date.strftime('%Y-%m-%d')}\n"
            f"- Total Routes Evaluated: {len(logistics_plans)}\n"
            f"- Schedule Feasible Routes: {feasible_count}/{len(logistics_plans)}\n"
            f"Summarize in 2 sentences transit feasibility and dispatch recommendations."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an expert Logistics & Freight Routing Agent. Verify SLA delivery compliance and transit variance.",
            max_tokens=150,
            correlation_id=task.task_number
        )

        output = {
            "procurement_id": procurement_id,
            "target_customer_delivery": target_date.isoformat(),
            "feasible_routes_count": feasible_count,
            "logistics_evaluations": logistics_plans,
            "logistics_agent_reasoning": llm_res.content.strip()
        }

        cls.log(
            db,
            task.id,
            f"Logistics evaluation complete. {feasible_count}/{len(logistics_plans)} routes schedule-compliant.",
            details=output
        )
        cls.complete_task(db, task, output)
        return output

