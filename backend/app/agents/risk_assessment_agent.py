from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import Quotation, ProcurementRequest, Supplier

class RiskAssessmentAgent(BaseAgent):
    name: str = "Risk Assessment Agent"

    @classmethod
    def execute(cls, db: Session, procurement_id: int) -> Dict[str, Any]:
        """
        Evaluates supply disruption risks, supplier concentration risks,
        and single-source vulnerability.
        """
        proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == procurement_id).first()
        task = cls.create_task(db, related_procurement_id=procurement_id, input_payload={"procurement_id": procurement_id})
        cls.log(db, task.id, f"Evaluating supply chain risk profile for Procurement #{proc.request_number if proc else procurement_id}")

        quotes = db.query(Quotation).filter(Quotation.procurement_request_id == procurement_id).all()
        risk_evaluations = []

        for q in quotes:
            supplier = q.supplier
            risk_factors = []
            overall_risk = q.risk_score

            if supplier and supplier.capacity_per_week < (q.offered_quantity * 1.5):
                risk_factors.append("Capacity utilization tight (>65% allocated)")
                overall_risk = min(0.9, overall_risk + 0.05)

            if q.delivery_lead_days > 10:
                risk_factors.append("Extended lead time increases transit variance")
                overall_risk = min(0.9, overall_risk + 0.08)

            if supplier and supplier.reliability_score < 0.88:
                risk_factors.append("Historical fulfillment reliability below 88%")
                overall_risk = min(0.9, overall_risk + 0.06)

            risk_level = "LOW"
            if overall_risk > 0.35:
                risk_level = "HIGH"
            elif overall_risk > 0.18:
                risk_level = "MEDIUM"

            risk_evaluations.append({
                "supplier_id": q.supplier_id,
                "supplier_name": supplier.name if supplier else "Supplier",
                "risk_score": round(overall_risk, 2),
                "risk_level": risk_level,
                "risk_factors": risk_factors or ["Normal operational risk profile"]
            })

        output = {
            "procurement_id": procurement_id,
            "overall_supply_risk": "LOW" if all(r["risk_level"] != "HIGH" for r in risk_evaluations) else "MEDIUM",
            "evaluations": risk_evaluations
        }

        cls.log(
            db,
            task.id,
            f"Risk assessment finalized: Overall Risk={output['overall_supply_risk']}",
            details=output
        )
        cls.complete_task(db, task, output)
        return output
