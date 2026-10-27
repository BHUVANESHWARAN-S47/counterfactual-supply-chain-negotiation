from datetime import datetime, date
from typing import Dict, Any, Optional
import json
from sqlalchemy.orm import Session
from app.models.models import AgentTask, AgentLog

def sanitize_json(obj: Any) -> Any:
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json(i) for i in obj]
    return obj

class BaseAgent:
    name: str = "BaseAgent"

    @classmethod
    def log(cls, db: Session, task_id: int, message: str, level: str = "INFO", details: Optional[Dict[str, Any]] = None):
        agent_log = AgentLog(
            task_id=task_id,
            agent_name=cls.name,
            log_level=level,
            message=message,
            details=sanitize_json(details) if details else None,
            timestamp=datetime.utcnow()
        )
        db.add(agent_log)
        db.commit()

    @classmethod
    def create_task(
        cls,
        db: Session,
        related_order_id: Optional[int] = None,
        related_procurement_id: Optional[int] = None,
        input_payload: Optional[Dict[str, Any]] = None,
        requires_approval: bool = False
    ) -> AgentTask:
        count = db.query(AgentTask).count() + 1
        task_number = f"TASK-{cls.name.upper()[:4]}-{count:04d}"
        task = AgentTask(
            task_number=task_number,
            agent_name=cls.name,
            related_order_id=related_order_id,
            related_procurement_id=related_procurement_id,
            status="RUNNING",
            input_payload=sanitize_json(input_payload) if input_payload else {},
            requires_approval=requires_approval,
            created_at=datetime.utcnow()
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @classmethod
    def complete_task(cls, db: Session, task: AgentTask, output_payload: Dict[str, Any], status: str = "COMPLETED"):
        task.status = status
        task.output_payload = sanitize_json(output_payload)
        task.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(task)
