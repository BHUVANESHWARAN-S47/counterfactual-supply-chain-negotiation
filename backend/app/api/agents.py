from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AgentTask, AgentLog, CustomerOrder
from app.schemas.schemas import AgentTaskResponse, AgentLogResponse
from app.agents.supervisor_agent import SupervisorAgent

router = APIRouter(prefix="/agents", tags=["AI Agent Monitor"])

@router.get("/tasks", response_model=List[AgentTaskResponse])
def get_agent_tasks(limit: int = 50, db: Session = Depends(get_db)):
    tasks = db.query(AgentTask).order_by(AgentTask.created_at.desc()).limit(limit).all()
    return tasks

@router.get("/logs", response_model=List[AgentLogResponse])
def get_agent_logs(task_id: int = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(AgentLog)
    if task_id:
        query = query.filter(AgentLog.task_id == task_id)
    logs = query.order_by(AgentLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/status-summary")
def get_agents_status(db: Session = Depends(get_db)):
    """
    Returns live health and status metrics for all 9 specialized agents.
    """
    agents = [
        {"name": "Supervisor Agent", "category": "Coordination", "role": "Master Orchestration & Workflow State"},
        {"name": "Buyer Agent", "category": "Procurement", "role": "Shortage Calculation & PR Formulation"},
        {"name": "Supplier Agent", "category": "Sourcing", "role": "Quotation Intake & Multi-Criteria Ranking"},
        {"name": "Price Analysis Agent", "category": "Economics", "role": "Price Variance & Discount Sensitivity"},
        {"name": "Risk Assessment Agent", "category": "Risk", "role": "Disruption & Capacity Risk Scoring"},
        {"name": "Logistics Agent", "category": "Operations", "role": "Route Feasibility & Freight Modeling"},
        {"name": "AI Negotiation Agent", "category": "Negotiation", "role": "Multi-Round Concessions & Counteroffers"},
        {"name": "Decision Agent", "category": "Intelligence", "role": "CNT Simulation & Retain/Negotiate/Switch"},
        {"name": "Customer Impact Agent", "category": "Transparency", "role": "Delivery Assurance & Client Updates"}
    ]

    total_tasks = db.query(AgentTask).count()
    completed_tasks = db.query(AgentTask).filter(AgentTask.status == "COMPLETED").count()
    failed_tasks = db.query(AgentTask).filter(AgentTask.status == "FAILED").count()

    summary = []
    for a in agents:
        agent_tasks = db.query(AgentTask).filter(AgentTask.agent_name == a["name"]).count()
        last_task = db.query(AgentTask).filter(AgentTask.agent_name == a["name"]).order_by(AgentTask.created_at.desc()).first()
        summary.append({
            "name": a["name"],
            "category": a["category"],
            "role": a["role"],
            "total_tasks_run": agent_tasks,
            "last_active": last_task.created_at.isoformat() if last_task else "Idle (Ready)",
            "status": "ACTIVE" if agent_tasks > 0 else "READY",
            "health": "OPERATIONAL"
        })

    return {
        "agents": summary,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "failed_tasks": failed_tasks
    }

@router.post("/trigger-orchestration/{order_id}")
def trigger_orchestration(order_id: int, db: Session = Depends(get_db)):
    order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    result = SupervisorAgent.orchestrate_order_workflow(db, order_id)
    return result
