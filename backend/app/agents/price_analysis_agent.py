from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import Quotation, ProcurementRequest
from app.services.llm_service import CentralizedLLMService

class PriceAnalysisAgent(BaseAgent):
    name: str = "Price Analysis Agent"

    @classmethod
    def execute(cls, db: Session, procurement_id: int) -> Dict[str, Any]:
        """
        Analyzes price competitiveness, variance against target standard cost,
        and determines feasible counteroffer target discounts using deterministic math + LLM strategy.
        """
        proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == procurement_id).first()
        task = cls.create_task(db, related_procurement_id=procurement_id, input_payload={"procurement_id": procurement_id})
        cls.log(db, task.id, f"Performing price elasticity and margin analysis for PR #{proc.request_number if proc else procurement_id}")

        quotes = db.query(Quotation).filter(Quotation.procurement_request_id == procurement_id).all()
        if not quotes:
            cls.complete_task(db, task, {"error": "No quotations available for price analysis"}, status="FAILED")
            return {}

        prices = [q.unit_price for q in quotes]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        price_spread = max_price - min_price

        # Standard benchmark cost
        standard_cost = proc.product.unit_cost if proc and proc.product else min_price
        variance_pct = round(((min_price - standard_cost) / standard_cost) * 100, 2) if standard_cost else 0.0

        # Recommendation: if min_price is above standard cost, target a 7-10% discount
        recommended_target_discount = 8.0 if min_price > standard_cost else 5.0
        target_counter_price = round(min_price * (1.0 - (recommended_target_discount / 100.0)), 2)

        # LLM Reasoning on Price Dispersion
        llm_prompt = (
            f"Analyze supplier pricing spread for Procurement Request #{proc.request_number if proc else procurement_id}:\n"
            f"- Lowest Quote: ₹{min_price}\n"
            f"- Highest Quote: ₹{max_price}\n"
            f"- Average Quote: ₹{round(avg_price, 2)}\n"
            f"- Standard Cost Baseline: ₹{standard_cost}\n"
            f"- Recommended Target Counter: ₹{target_counter_price} ({recommended_target_discount}% concession)\n"
            f"Explain in 2 sentences why this counter-price optimizes procurement savings while maintaining vendor engagement."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an expert Procurement Price Analysis Agent. Explain price competitiveness and cost optimization.",
            max_tokens=150,
            correlation_id=task.task_number
        )

        output = {
            "average_unit_price": round(avg_price, 2),
            "lowest_unit_price": min_price,
            "highest_unit_price": max_price,
            "price_spread": round(price_spread, 2),
            "standard_benchmark_cost": standard_cost,
            "variance_from_benchmark_pct": variance_pct,
            "recommended_target_discount_pct": recommended_target_discount,
            "target_counter_unit_price": target_counter_price,
            "price_analysis_reasoning": llm_res.content.strip()
        }

        cls.log(
            db,
            task.id,
            f"Price analysis completed: Min Price=₹{min_price}, Target Counter Price=₹{target_counter_price} ({recommended_target_discount}% target discount)",
            details=output
        )
        cls.complete_task(db, task, output)
        return output

