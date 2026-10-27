from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Inventory, InventoryTransaction, Product
from app.schemas.schemas import InventoryResponse, InventoryStockAdjust, ShortageCalculationRequest, ShortageCalculationResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.get("/", response_model=List[InventoryResponse])
def get_all_inventory(db: Session = Depends(get_db)):
    items = db.query(Inventory).all()
    res = []
    for inv in items:
        prod = inv.product
        status = "HEALTHY"
        if inv.available <= 0:
            status = "CRITICAL_SHORTAGE"
        elif inv.available < (prod.reorder_level if prod else 50):
            status = "LOW_STOCK"

        res.append(InventoryResponse(
            id=inv.id,
            product_id=inv.product_id,
            product_name=prod.name if prod else "Unknown",
            sku=prod.sku if prod else "SKU-N/A",
            on_hand=inv.on_hand,
            reserved=inv.reserved,
            available=inv.available,
            incoming=inv.incoming,
            incoming_eta=inv.incoming_eta,
            reorder_level=prod.reorder_level if prod else 50,
            unit_cost=prod.unit_cost if prod else 0.0,
            status=status
        ))
    return res

@router.post("/calculate-shortage", response_model=ShortageCalculationResponse)
def calculate_shortage(req: ShortageCalculationRequest, db: Session = Depends(get_db)):
    """
    Applies the exact mathematical shortage rule:
    Available Stock = On-Hand - Reserved
    Shortage Quantity = max(0, Required Quantity - Eligible Available Stock)
    """
    return InventoryService.calculate_shortage(db, req.product_id, req.required_quantity)

@router.post("/adjust")
def adjust_inventory(req: InventoryStockAdjust, db: Session = Depends(get_db)):
    inv = InventoryService.record_transaction(
        db,
        product_id=req.product_id,
        transaction_type=req.adjustment_type,
        quantity=req.quantity,
        notes=req.notes
    )
    return {
        "success": True,
        "product_id": inv.product_id,
        "on_hand": inv.on_hand,
        "reserved": inv.reserved,
        "available": inv.available
    }

@router.get("/transactions")
def get_transactions(limit: int = 50, db: Session = Depends(get_db)):
    txs = db.query(InventoryTransaction).order_by(InventoryTransaction.created_at.desc()).limit(limit).all()
    return [
        {
            "id": t.id,
            "inventory_id": t.inventory_id,
            "product_name": t.inventory.product.name if t.inventory and t.inventory.product else "Product",
            "type": t.transaction_type,
            "quantity": t.quantity,
            "reference_id": t.reference_id,
            "notes": t.notes,
            "created_at": t.created_at
        }
        for t in txs
    ]
