from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import CustomerOrder, ProcurementRequest, Product
from app.services.inventory_service import InventoryService

class BuyerAgent(BaseAgent):
    name: str = "Buyer Agent"

    @classmethod
    def execute(cls, db: Session, order_id: int) -> Dict[str, Any]:
        """
        Calculates procurement needs, checks inventory availability and shortages,
        and generates formal procurement requirements.
        """
        order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")

        task = cls.create_task(db, related_order_id=order_id, input_payload={"order_id": order_id, "quantity": order.quantity})
        cls.log(db, task.id, f"Evaluating inventory shortage for Customer Order #{order.order_number}")

        # Check inventory shortage
        shortage_res = InventoryService.calculate_shortage(db, order.product_id, order.quantity)
        cls.log(
            db,
            task.id,
            f"Inventory Check: Available={shortage_res.available_stock}, Shortage={shortage_res.shortage_quantity}",
            details=shortage_res.dict()
        )

        # Check existing procurement request
        existing_proc = db.query(ProcurementRequest).filter(ProcurementRequest.order_id == order_id).first()
        if not existing_proc:
            count = db.query(ProcurementRequest).count() + 1
            req_number = f"PR-{datetime.utcnow().year}-{count:04d}"
            # Needed by 3 days before customer deadline to allow assembly
            required_by = order.target_delivery_date - timedelta(days=3)
            proc = ProcurementRequest(
                request_number=req_number,
                order_id=order_id,
                product_id=order.product_id,
                required_quantity=order.quantity,
                available_quantity=shortage_res.available_stock,
                shortage_quantity=shortage_res.shortage_quantity,
                required_by_date=required_by,
                estimated_budget=shortage_res.estimated_purchase_cost or (order.max_budget * 0.75),
                status="CREATED",
                priority="HIGH" if shortage_res.is_shortage else "LOW",
                delivery_risk="MEDIUM" if shortage_res.shortage_quantity > 50 else "LOW"
            )
            db.add(proc)
            db.commit()
            db.refresh(proc)
        else:
            proc = existing_proc

        output = {
            "procurement_request_id": proc.id,
            "request_number": proc.request_number,
            "shortage_quantity": proc.shortage_quantity,
            "required_by_date": proc.required_by_date.isoformat(),
            "estimated_budget": proc.estimated_budget,
            "status": proc.status
        }
        cls.complete_task(db, task, output)
        return output
