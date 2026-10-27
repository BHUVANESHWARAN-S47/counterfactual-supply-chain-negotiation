from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import SimulationRun, SimulationScenario, ProcurementRequest
from app.schemas.schemas import SimulationRunResponse, RunSimulationRequest, ScenarioResult
from app.agents.decision_agent import DecisionAgent

router = APIRouter(prefix="/simulations", tags=["Counterfactual Negotiation Twin"])

@router.get("/", response_model=List[SimulationRunResponse])
def get_simulation_runs(procurement_request_id: int = None, db: Session = Depends(get_db)):
    query = db.query(SimulationRun)
    if procurement_request_id:
        query = query.filter(SimulationRun.procurement_request_id == procurement_request_id)
    runs = query.order_by(SimulationRun.created_at.desc()).all()

    res = []
    for r in runs:
        scenarios = []
        for s in r.scenarios:
            params = s.scenario_parameters or {}
            scenarios.append(ScenarioResult(
                scenario_name=s.scenario_name,
                supplier_id=s.supplier_id,
                supplier_name=s.supplier_name,
                unit_price=s.unit_price,
                quantity=params.get("quantity", 100),
                procurement_cost=params.get("procurement_cost", round(s.unit_price * 100, 2)),
                transportation_cost=round(120.0 + (params.get("quantity", 100) * 0.75), 2),
                production_cost=round(params.get("quantity", 100) * 6.0, 2),
                total_cost=s.total_cost,
                lead_time_days=s.lead_time_days,
                arrival_date=s.arrival_date,
                deadline_variance_days=s.deadline_variance_days,
                feasibility=s.feasibility,
                risk_score=s.risk_score,
                estimated_revenue=round(params.get("quantity", 100) * 250.0, 2),
                estimated_profit=s.estimated_profit,
                profit_margin_pct=s.profit_margin_pct,
                decision_mode=s.decision_mode,
                trade_off_notes=r.trade_offs or "Scenario evaluation"
            ))

        res.append(SimulationRunResponse(
            id=r.id,
            run_number=r.run_number,
            order_id=r.order_id,
            procurement_request_id=r.procurement_request_id,
            run_type=r.run_type,
            recommendation=r.recommendation,
            justification=r.justification,
            trade_offs=r.trade_offs,
            customer_impact_summary=r.customer_impact_summary,
            confidence_score=r.confidence_score,
            scenarios=scenarios,
            created_at=r.created_at
        ))
    return res

@router.get("/{run_id}", response_model=SimulationRunResponse)
def get_simulation_run(run_id: int, db: Session = Depends(get_db)):
    r = db.query(SimulationRun).filter(SimulationRun.id == run_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Simulation run not found")

    scenarios = []
    for s in r.scenarios:
        params = s.scenario_parameters or {}
        scenarios.append(ScenarioResult(
            scenario_name=s.scenario_name,
            supplier_id=s.supplier_id,
            supplier_name=s.supplier_name,
            unit_price=s.unit_price,
            quantity=params.get("quantity", 100),
            procurement_cost=params.get("procurement_cost", round(s.unit_price * 100, 2)),
            transportation_cost=round(120.0 + (params.get("quantity", 100) * 0.75), 2),
            production_cost=round(params.get("quantity", 100) * 6.0, 2),
            total_cost=s.total_cost,
            lead_time_days=s.lead_time_days,
            arrival_date=s.arrival_date,
            deadline_variance_days=s.deadline_variance_days,
            feasibility=s.feasibility,
            risk_score=s.risk_score,
            estimated_revenue=round(params.get("quantity", 100) * 250.0, 2),
            estimated_profit=s.estimated_profit,
            profit_margin_pct=s.profit_margin_pct,
            decision_mode=s.decision_mode,
            trade_off_notes=r.trade_offs or "Scenario evaluation"
        ))

    return SimulationRunResponse(
        id=r.id,
        run_number=r.run_number,
        order_id=r.order_id,
        procurement_request_id=r.procurement_request_id,
        run_type=r.run_type,
        recommendation=r.recommendation,
        justification=r.justification,
        trade_offs=r.trade_offs,
        customer_impact_summary=r.customer_impact_summary,
        confidence_score=r.confidence_score,
        scenarios=scenarios,
        created_at=r.created_at
    )

@router.post("/run", response_model=SimulationRunResponse)
def run_simulation(req: RunSimulationRequest, db: Session = Depends(get_db)):
    """
    Triggers Counterfactual Negotiation Twin (CNT) simulation run across candidate scenarios:
    Baseline, Alternative Challenger, Negotiated Concession, Disruption Stress-Test, Demand Surge.
    """
    res = DecisionAgent.execute(
        db,
        procurement_id=req.procurement_request_id,
        delay_days=req.delay_days,
        demand_variation_pct=req.demand_variation_pct,
        negotiated_discount_pct=req.negotiated_discount_pct
    )
    return get_simulation_run(res["id"], db)
