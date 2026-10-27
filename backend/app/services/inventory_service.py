from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Inventory, InventoryTransaction, Product
from app.schemas.schemas import ShortageCalculationResponse

class InventoryService:
    @staticmethod
    def calculate_shortage(db: Session, product_id: int, required_quantity: int) -> ShortageCalculationResponse:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError(f"Product with id {product_id} not found")

        inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if not inv:
            # Create default inventory if not existing
            inv = Inventory(
                product_id=product_id,
                on_hand=0,
                reserved=0,
                incoming=0
            )
            db.add(inv)
            db.commit()
            db.refresh(inv)

        available_stock = max(0, inv.on_hand - inv.reserved)
        shortage_quantity = max(0, required_quantity - available_stock)
        is_shortage = shortage_quantity > 0
        estimated_cost = shortage_quantity * product.unit_cost

        return ShortageCalculationResponse(
            product_id=product.id,
            product_name=product.name,
            required_quantity=required_quantity,
            on_hand=inv.on_hand,
            reserved=inv.reserved,
            available_stock=available_stock,
            incoming_stock=inv.incoming,
            shortage_quantity=shortage_quantity,
            is_shortage=is_shortage,
            estimated_purchase_cost=round(estimated_cost, 2)
        )

    @staticmethod
    def record_transaction(
        db: Session,
        product_id: int,
        transaction_type: str,
        quantity: int,
        reference_id: str = None,
        notes: str = None
    ) -> Inventory:
        inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if not inv:
            inv = Inventory(product_id=product_id, on_hand=0, reserved=0, incoming=0)
            db.add(inv)
            db.flush()

        if transaction_type == "INTAKE":
            inv.on_hand += quantity
            if inv.incoming >= quantity:
                inv.incoming -= quantity
        elif transaction_type == "RESERVATION":
            inv.reserved += quantity
        elif transaction_type == "RELEASE":
            inv.reserved = max(0, inv.reserved - quantity)
        elif transaction_type == "DISPATCH":
            inv.on_hand = max(0, inv.on_hand - quantity)
            inv.reserved = max(0, inv.reserved - quantity)
        elif transaction_type == "ADJUSTMENT":
            inv.on_hand = max(0, inv.on_hand + quantity)

        inv.last_updated = datetime.utcnow()

        tx = InventoryTransaction(
            inventory_id=inv.id,
            transaction_type=transaction_type,
            quantity=quantity,
            reference_id=reference_id,
            notes=notes
        )
        db.add(tx)
        db.commit()
        db.refresh(inv)
        return inv
