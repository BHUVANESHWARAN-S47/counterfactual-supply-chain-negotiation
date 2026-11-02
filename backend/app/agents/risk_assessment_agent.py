from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import Quotation, ProcurementRequest, Supplier, RiskAssessment
from app.services.llm_service import CentralizedLLMService

class RiskAssessmentAgent(BaseAgent):
    name: str = "Risk Assessment Agent"

    @classmethod
    def execute(cls, db: Session, procurement_id: int) -> Dict[str, Any]:
        """
        Evaluates supply disruption risks, supplier concentration risks,
        persists risk assessment records in the database, and generates LLM risk mitigation rationale.
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

            # Persist RiskAssessment record
            risk_rec = RiskAssessment(
                procurement_request_id=procurement_id,
                supplier_id=q.supplier_id,
                risk_score=round(overall_risk, 3),
                reliability_score=round(q.reliability_score, 3),
                lead_time_volatility=round(q.delivery_lead_days * 0.02, 2),
                disruption_probability=round(overall_risk * 0.8, 3),
                justification="; ".join(risk_factors) if risk_factors else "Standard verified operational risk",
                evidence_data={
                    "capacity_per_week": supplier.capacity_per_week if supplier else 500,
                    "lead_days": q.delivery_lead_days,
                    "risk_level": risk_level
                }
            )
            db.add(risk_rec)

            risk_evaluations.append({
                "supplier_id": q.supplier_id,
                "supplier_name": supplier.name if supplier else "Supplier",
                "risk_score": round(overall_risk, 2),
                "risk_level": risk_level,
                "risk_factors": risk_factors or ["Normal operational risk profile"]
            })

        db.commit()

        overall_risk_status = "LOW" if all(r["risk_level"] != "HIGH" for r in risk_evaluations) else "MEDIUM"

        # LLM Synthesis of Disruption Mitigation
        llm_prompt = (
            f"Review supplier risk evaluation for Procurement #{proc.request_number if proc else procurement_id}:\n"
            f"- Overall System Risk: {overall_risk_status}\n"
            f"- Vendor Assessments: {[{'vendor': r['supplier_name'], 'risk': r['risk_score'], 'level': r['risk_level']} for r in risk_evaluations]}\n"
            f"Provide a 2-sentence executive summary explaining key disruption drivers and required buffer stock."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an expert Supply Chain Risk Assessment Agent. Explain vulnerabilities and contingency buffers.",
            max_tokens=150,
            correlation_id=task.task_number
        )

        output = {
            "procurement_id": procurement_id,
            "overall_supply_risk": overall_risk_status,
            "evaluations": risk_evaluations,
            "risk_analysis_reasoning": llm_res.content.strip()
        }

        cls.log(
            db,
            task.id,
            f"Risk assessment finalized: Overall Risk={output['overall_supply_risk']}",
            details=output
        )
        cls.complete_task(db, task, output)
        return output

