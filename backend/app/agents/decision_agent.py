from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import ProcurementRequest, CustomerOrder, Quotation, SimulationRun, SimulationScenario
from app.services.cnt_engine import CounterfactualNegotiationTwin
from app.services.llm_service import CentralizedLLMService

class DecisionAgent(BaseAgent):
    name: str = "Decision Agent"

    @classmethod
    def execute(
        cls,
        db: Session,
        procurement_id: int,
        delay_days: int = 4,
        demand_variation_pct: float = 20.0,
        negotiated_discount_pct: float = 8.0
    ) -> Dict[str, Any]:
        """
        Runs the Counterfactual Negotiation Twin simulation across scenarios,
        evaluates Retain / Negotiate / Switch criteria, and persists the simulation run.
        """
        proc = db.query(ProcurementRequest).filter(ProcurementRequest.id == procurement_id).first()
        if not proc:
            raise ValueError(f"Procurement request {procurement_id} not found")
        order = db.query(CustomerOrder).filter(CustomerOrder.id == proc.order_id).first()

        task = cls.create_task(
            db,
            related_order_id=order.id if order else None,
            related_procurement_id=procurement_id,
            input_payload={"procurement_id": procurement_id, "mode": "CNT_SIMULATION"},
            requires_approval=True
        )
        cls.log(db, task.id, f"Executing Counterfactual Negotiation Twin for Procurement #{proc.request_number}")

        # Gather quotations
        quotes = db.query(Quotation).filter(Quotation.procurement_request_id == procurement_id).all()
        if not quotes:
            raise ValueError("No quotations found for CNT simulation.")

        quote_dicts = []
        for q in quotes:
            quote_dicts.append({
                "id": q.id,
                "supplier_id": q.supplier_id,
                "supplier_name": q.supplier.name if q.supplier else "Supplier",
                "unit_price": q.unit_price,
                "offered_quantity": q.offered_quantity,
                "delivery_lead_days": q.delivery_lead_days,
                "quality_rating": q.quality_rating,
                "reliability_score": q.reliability_score,
                "risk_score": q.risk_score,
                "total_score": q.total_score
            })

        order_info = {
            "target_delivery_date": order.target_delivery_date if order else datetime.utcnow(),
            "target_selling_price": order.product.target_selling_price if order and order.product else 250.0,
            "quantity": order.quantity if order else 100
        }

        proc_info = {
            "shortage_quantity": proc.shortage_quantity or 100
        }

        # Run CNT Simulation Engine (deterministic mathematics)
        sim_result = CounterfactualNegotiationTwin.run_simulation(
            order_info=order_info,
            procurement_info=proc_info,
            quotations=quote_dicts,
            delay_days=delay_days,
            demand_variation_pct=demand_variation_pct,
            negotiated_discount_pct=negotiated_discount_pct
        )

        # LLM Synthesis of Trade-Offs and Scenario Justification (Groq 70B / Ollama)
        llm_prompt = (
            f"Generate an executive justification for the Decision Agent's recommendation:\n"
            f"- Recommendation: {sim_result['recommendation']}\n"
            f"- Evaluated Scenarios: {[s['scenario_name'] + ' (Margin: ' + str(s['profit_margin_pct']) + '%, Feasible: ' + str(s['feasibility']) + ')' for s in sim_result['scenarios']]}\n"
            f"- Incumbent Supplier: {quote_dicts[0]['supplier_name'] if quote_dicts else 'Incumbent'}\n"
            f"- Disruption Stress: +{delay_days} days transit delay\n"
            f"Explain in 2-3 sentences why {sim_result['recommendation']} is the optimal risk-adjusted decision for cost, SLA delivery, and business continuity."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an autonomous Decision & Counterfactual Optimization Agent. Provide deep multi-scenario reasoning.",
            max_tokens=220,
            correlation_id=task.task_number
        )
        if llm_res.content and not llm_res.is_fallback:
            sim_result["justification"] = llm_res.content.strip()

        # Persist SimulationRun
        count = db.query(SimulationRun).count() + 1
        run_number = f"SIM-{datetime.utcnow().year}-{count:04d}"
        sim_run = SimulationRun(
            run_number=run_number,
            order_id=order.id if order else 1,
            procurement_request_id=proc.id,
            run_type=sim_result["run_type"],
            recommendation=sim_result["recommendation"],
            justification=sim_result["justification"],
            trade_offs=sim_result["trade_offs"],
            customer_impact_summary=sim_result["customer_impact_summary"],
            confidence_score=sim_result["confidence_score"]
        )
        db.add(sim_run)
        db.flush()


        # Persist SimulationScenarios
        for s in sim_result["scenarios"]:
            sc_record = SimulationScenario(
                simulation_run_id=sim_run.id,
                scenario_name=s["scenario_name"],
                supplier_id=s.get("supplier_id"),
                supplier_name=s["supplier_name"],
                unit_price=s["unit_price"],
                total_cost=s["total_cost"],
                lead_time_days=s["lead_time_days"],
                arrival_date=s["arrival_date"],
                deadline_variance_days=s["deadline_variance_days"],
                feasibility=s["feasibility"],
                risk_score=s["risk_score"],
                estimated_profit=s["estimated_profit"],
                profit_margin_pct=s["profit_margin_pct"],
                decision_mode=s["decision_mode"],
                scenario_parameters={"quantity": s["quantity"], "procurement_cost": s["procurement_cost"]}
            )
            db.add(sc_record)

        proc.status = "SIMULATED"
        if order:
            order.status = "SIMULATION_COMPLETED"

        db.commit()
        db.refresh(sim_run)

        cls.log(
            db,
            task.id,
            f"CNT Simulation completed: Decision={sim_run.recommendation}. Requires Admin/Procurement approval to commit.",
            level="SUCCESS",
            details={"run_number": run_number, "recommendation": sim_run.recommendation}
        )

        sim_result["id"] = sim_run.id
        sim_result["run_number"] = sim_run.run_number
        cls.complete_task(db, task, sim_result)
        return sim_result
