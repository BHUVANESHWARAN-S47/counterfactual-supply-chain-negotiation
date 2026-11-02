from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.models import CustomerOrder, ProcurementRequest, Product
from app.services.inventory_service import InventoryService
from app.services.llm_service import CentralizedLLMService

class BuyerAgent(BaseAgent):
    name: str = "Buyer Agent"

    @classmethod
    def execute(cls, db: Session, order_id: int) -> Dict[str, Any]:
        """
        Calculates procurement needs, checks inventory availability and shortages,
        synthesizes market lead constraints via LLM, and generates formal procurement requirements.
        """
        order = db.query(CustomerOrder).filter(CustomerOrder.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")

        task = cls.create_task(db, related_order_id=order_id, input_payload={"order_id": order_id, "quantity": order.quantity})
        cls.log(db, task.id, f"Evaluating inventory shortage for Customer Order #{order.order_number}")

        # Check inventory shortage deterministically
        shortage_res = InventoryService.calculate_shortage(db, order.product_id, order.quantity)
        cls.log(
            db,
            task.id,
            f"Inventory Check: Available={shortage_res.available_stock}, Shortage={shortage_res.shortage_quantity}",
            details=shortage_res.model_dump()
        )

        # LLM Reasoning on Sourcing Urgency and Budget Allocation
        product_name = order.product.name if order.product else "Item"
        llm_prompt = (
            f"Evaluate procurement urgency for Customer Order {order.order_number}:\n"
            f"- Product: {product_name}\n"
            f"- Total Required: {order.quantity} units\n"
            f"- Warehouse Available: {shortage_res.available_stock} units\n"
            f"- Net Sourcing Shortage: {shortage_res.shortage_quantity} units\n"
            f"- Target Customer Delivery: {order.target_delivery_date.strftime('%Y-%m-%d')}\n"
            f"- Max Budget: ₹{order.max_budget}\n"
            f"Provide a 2-sentence procurement brief focusing on lead schedule risk and sourcing recommendation."
        )
        llm_res = CentralizedLLMService.generate(
            prompt=llm_prompt,
            system_prompt="You are an expert Enterprise Buyer Agent. Formulate concise, actionable sourcing strategy.",
            max_tokens=150,
            correlation_id=task.task_number
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
            "status": proc.status,
            "buyer_reasoning": llm_res.content.strip()
        }
        cls.complete_task(db, task, output)
        return output

