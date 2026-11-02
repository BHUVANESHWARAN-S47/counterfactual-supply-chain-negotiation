from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import ProcurementRequest, Supplier, Quotation
from app.services.supplier_evaluator import SupplierEvaluator
from app.services.llm_service import CentralizedLLMService

class SupplierAgent(BaseAgent):
    name: str = "Supplier Agent"

    @classmethod
    def execute(cls, db: Session, procurement_id: int) -> Dict[str, Any]:
        """
        Gathers quotations from active suppliers for this procurement request,
        simulates responsive quotations if none exist, and ranks them.
        """
        proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == procurement_id).first()
        if not proc:
            raise ValueError(f"Procurement request {procurement_id} not found")

        task = cls.create_task(db, related_procurement_id=procurement_id, input_payload={"procurement_id": procurement_id})
        cls.log(db, task.id, f"Collecting supplier quotations for Procurement #{proc.request_number}")

        # Check existing quotations
        quotes = db.query(Quotation).filter(Quotation.procurement_request_id == procurement_id).all()

        # If no quotations, simulate responses from registered suppliers
        if not quotes:
            suppliers = db.query(Supplier).filter(Supplier.is_active == True).limit(3).all()
            base_count = db.query(Quotation).count()
            for idx, s in enumerate(suppliers):
                q_num = f"QT-{datetime.utcnow().year}-{base_count + idx + 1:04d}"
                # Add slight variance across suppliers
                price_variance = (idx - 1) * 4.5
                lead_variance = (idx - 1) * 1
                base_unit = proc.product.unit_cost if proc.product else 45.0
                offered_price = round(max(10.0, base_unit + price_variance), 2)
                offered_lead = max(2, s.base_lead_time_days + lead_variance)

                new_q = Quotation(
                    quotation_number=q_num,
                    procurement_request_id=proc.id,
                    supplier_id=s.id,
                    offered_quantity=proc.shortage_quantity or proc.required_quantity,
                    unit_price=offered_price,
                    delivery_lead_days=offered_lead,
                    quality_rating=s.baseline_rating,
                    reliability_score=s.reliability_score,
                    risk_score=s.risk_score,
                    validity_date=datetime.utcnow() + timedelta(days=14),
                    notes=f"Standard quotation submitted by {s.name}",
                    status="SUBMITTED"
                )
                db.add(new_q)
            db.commit()
            quotes = db.query(Quotation).filter(Quotation.procurement_request_id == procurement_id).all()

        # Perform Multi-Criteria Scoring & Ranking
        quote_dicts = []
        for q in quotes:
            quote_dicts.append({
                "id": q.id,
                "quotation_number": q.quotation_number,
                "supplier_id": q.supplier_id,
                "supplier_name": q.supplier.name if q.supplier else "Supplier",
                "unit_price": q.unit_price,
                "offered_quantity": q.offered_quantity,
                "delivery_lead_days": q.delivery_lead_days,
                "quality_rating": q.quality_rating,
                "reliability_score": q.reliability_score,
                "risk_score": q.risk_score
            })

        evaluated = SupplierEvaluator.evaluate_quotations(quote_dicts, proc.shortage_quantity or proc.required_quantity)

        # Update quotation records with scores & ranks
        for item in evaluated:
            q_rec = db.query(Quotation).filter(Quotation.id == item["id"]).first()
            if q_rec:
                q_rec.total_score = item["total_score"]
                q_rec.rank = item["rank"]
        db.commit()

        # LLM Synthesis of Supplier Landscape
        top_name = evaluated[0]["supplier_name"] if evaluated else "None"
        top_price = evaluated[0]["unit_price"] if evaluated else 0.0
        top_lead = evaluated[0]["delivery_lead_days"] if evaluated else 0
        llm_prompt = (
            f"Analyze supplier market response for Procurement {proc.request_number}:\n"
            f"- Total evaluated quotes: {len(evaluated)}\n"
            f"- Top ranked vendor: {top_name} (Price: ₹{top_price}/unit, Lead: {top_lead} days)\n"
            f"- Score breakdown: {evaluated[0].get('score_breakdown', {}) if evaluated else {}}\n"
            f"Summarize in 2 sentences the key vendor trade-off between price vs delivery reliability."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an expert Supplier Management Agent. Assess supplier reliability and market competitiveness.",
            max_tokens=150,
            correlation_id=task.task_number
        )

        cls.log(
            db,
            task.id,
            f"Successfully ranked {len(evaluated)} supplier quotations. Top: {top_name}",
            details={"rankings": evaluated}
        )

        output = {
            "total_quotations": len(evaluated),
            "top_supplier": evaluated[0] if evaluated else None,
            "ranked_quotations": evaluated,
            "supplier_agent_reasoning": llm_res.content.strip()
        }
        cls.complete_task(db, task, output)
        return output

