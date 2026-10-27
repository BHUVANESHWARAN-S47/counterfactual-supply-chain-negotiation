import pytest
import httpx
from datetime import datetime, timedelta
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.seed import seed_database
from app.services.inventory_service import InventoryService
from app.services.supplier_evaluator import SupplierEvaluator
from app.services.cnt_engine import CounterfactualNegotiationTwin
from app.services.llm_assistant import LLMAssistantService
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

def test_password_hashing():
    pwd = "securepassword123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token():
    payload = {"sub": "test@supplychain.ai", "role": "ADMIN", "user_id": 42}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "test@supplychain.ai"
    assert decoded["role"] == "ADMIN"
    assert decoded["user_id"] == 42

def test_inventory_shortage_calculation_rule():
    on_hand = 30
    reserved = 20
    available = max(0, on_hand - reserved)
    assert available == 10

    required_qty = 100
    shortage = max(0, required_qty - available)
    assert shortage == 90

    required_small = 5
    shortage_none = max(0, required_small - available)
    assert shortage_none == 0

def test_supplier_evaluator_scoring_and_ranking():
    quotations = [
        {
            "id": 1,
            "supplier_name": "Supplier High Price Fast Lead",
            "unit_price": 50.0,
            "delivery_lead_days": 4,
            "quality_rating": 4.9,
            "reliability_score": 0.95,
            "risk_score": 0.10,
            "offered_quantity": 100
        },
        {
            "id": 2,
            "supplier_name": "Supplier Low Price Slow Lead",
            "unit_price": 35.0,
            "delivery_lead_days": 10,
            "quality_rating": 4.2,
            "reliability_score": 0.85,
            "risk_score": 0.22,
            "offered_quantity": 100
        }
    ]

    evaluated = SupplierEvaluator.evaluate_quotations(quotations, required_quantity=100)
    assert len(evaluated) == 2
    assert evaluated[0]["rank"] == 1
    assert evaluated[1]["rank"] == 2
    assert evaluated[0]["total_score"] >= evaluated[1]["total_score"]
    assert "score_breakdown" in evaluated[0]
    assert "price_score" in evaluated[0]["score_breakdown"]

def test_cnt_engine_simulation_calculations():
    now = datetime.utcnow()
    target_delivery = now + timedelta(days=14)

    order_info = {
        "target_delivery_date": target_delivery,
        "target_selling_price": 120.0,
        "quantity": 100
    }
    procurement_info = {
        "shortage_quantity": 90
    }
    quotations = [
        {
            "supplier_id": 1,
            "supplier_name": "Apex Components Ltd",
            "unit_price": 44.50,
            "delivery_lead_days": 6,
            "quality_rating": 4.8,
            "reliability_score": 0.95,
            "risk_score": 0.12,
            "total_score": 92.0
        },
        {
            "supplier_id": 2,
            "supplier_name": "Nexus Industrial Corp",
            "unit_price": 38.00,
            "delivery_lead_days": 7,
            "quality_rating": 4.3,
            "reliability_score": 0.88,
            "risk_score": 0.20,
            "total_score": 87.0
        }
    ]

    sim_res = CounterfactualNegotiationTwin.run_simulation(
        order_info=order_info,
        procurement_info=procurement_info,
        quotations=quotations,
        delay_days=4,
        demand_variation_pct=20.0,
        negotiated_discount_pct=8.0
    )

    assert sim_res["run_type"] == "COUNTERFACTUAL_COMPARISON"
    assert sim_res["recommendation"] in ["RETAIN", "NEGOTIATE", "SWITCH"]
    assert len(sim_res["scenarios"]) >= 4

    baseline = sim_res["scenarios"][0]
    assert baseline["procurement_cost"] == round(90 * 44.50, 2)
    assert baseline["total_cost"] > baseline["procurement_cost"]
    assert baseline["estimated_profit"] == round(baseline["estimated_revenue"] - baseline["total_cost"], 2)
    assert baseline["feasibility"] is True
    assert baseline["deadline_variance_days"] <= 0

def test_llm_assistant_offline_fallback():
    context = {
        "orders": [{"order_number": "ORD-2026-0001", "status": "AWAITING_APPROVAL", "quantity": 100}],
        "inventory_alerts": [{"product_name": "ARM Microcontroller", "available": 10, "shortage": 90}],
        "top_suppliers": [{"name": "Apex Components", "score": 92.4, "price": 44.50}],
        "latest_cnt_recommendation": {"recommendation": "NEGOTIATE", "justification": "8% margin gain."}
    }

    res = LLMAssistantService._generate_heuristic_response(
        prompt="What is the CNT recommendation for my latest order?",
        role="ADMIN",
        context=context
    )

    assert res["is_fallback"] is True
    assert "NEGOTIATE" in res["answer"]
    assert len(res["suggested_actions"]) > 0

@pytest.mark.asyncio
async def test_end_to_end_api_workflow():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Demo login
        login_resp = await client.post("/api/auth/demo-login?role=ADMIN")
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert token_data["role"] == "ADMIN"

        # 2. Get Inventory
        inv_resp = await client.get("/api/inventory/")
        assert inv_resp.status_code == 200
        inv_data = inv_resp.json()
        assert len(inv_data) >= 4

        # 3. Create a new Customer Order (100 units of ARM Cortex)
        target_date = (datetime.utcnow() + timedelta(days=14)).isoformat()
        order_payload = {
            "product_id": 1,
            "quantity": 100,
            "target_delivery_date": target_date,
            "max_budget": 12000.0,
            "delivery_address": "777 Innovation Way, Tech Park",
            "specifications": "Aerospace grade, full compliance certs."
        }
        create_resp = await client.post("/api/orders/", json=order_payload)
        assert create_resp.status_code == 200
        order_data = create_resp.json()
        assert order_data["quantity"] == 100
        assert order_data["status"] == "AWAITING_APPROVAL"
        assert "customer_explanation" in order_data
        order_id = order_data["id"]

        # 4. Check Procurement Request was automatically created
        proc_resp = await client.get("/api/procurement/")
        assert proc_resp.status_code == 200
        procs = proc_resp.json()
        assert len(procs) >= 1
        target_proc = next(p for p in procs if p["order_id"] == order_id)
        assert target_proc["shortage_quantity"] > 0
        proc_id = target_proc["id"]

        # 5. Check Quotations were collected and ranked
        quotes_resp = await client.get(f"/api/quotations/?procurement_request_id={proc_id}")
        assert quotes_resp.status_code == 200
        quotes = quotes_resp.json()
        assert len(quotes) >= 2
        assert quotes[0]["rank"] == 1
        assert quotes[0]["total_score"] >= quotes[1]["total_score"]

        # 6. Check Counterfactual Simulation Run
        sim_resp = await client.get(f"/api/simulations/?procurement_request_id={proc_id}")
        assert sim_resp.status_code == 200
        sims = sim_resp.json()
        assert len(sims) >= 1
        assert sims[0]["recommendation"] in ["RETAIN", "NEGOTIATE", "SWITCH"]
        assert len(sims[0]["scenarios"]) >= 4

        # 7. Approve Supplier and issue Purchase Order
        top_supplier_id = quotes[0]["supplier_id"]
        unit_price = quotes[0]["unit_price"]
        approve_payload = {
            "procurement_request_id": proc_id,
            "supplier_id": top_supplier_id,
            "selected_unit_price": unit_price,
            "quantity": target_proc["shortage_quantity"],
            "lead_time_days": quotes[0]["delivery_lead_days"],
            "notes": "Approved following CNT simulation analysis"
        }
        po_resp = await client.post("/api/purchase-orders/approve", json=approve_payload)
        assert po_resp.status_code == 200
        po_data = po_resp.json()
        assert po_data["status"] == "APPROVED"
        assert po_data["total_amount"] == round(target_proc["shortage_quantity"] * unit_price, 2)

        # 8. Test Idempotency: Duplicate approval returns existing PO without duplicate creation
        po_dup = await client.post("/api/purchase-orders/approve", json=approve_payload)
        assert po_dup.status_code == 200
        assert po_dup.json()["id"] == po_data["id"]

        # 9. Verify Order Timeline
        timeline_resp = await client.get(f"/api/orders/{order_id}/timeline")
        assert timeline_resp.status_code == 200
        timeline_data = timeline_resp.json()
        assert len(timeline_data["timeline"]) > 5
        assert timeline_data["current_status"] == "PURCHASE_ORDER_CREATED"

        # 10. Dispatch Shipment
        dispatch_resp = await client.post(f"/api/shipments/dispatch/{order_id}")
        assert dispatch_resp.status_code == 200
        shipment_data = dispatch_resp.json()
        assert shipment_data["status"] == "IN_TRANSIT"

        # 11. Deliver Shipment
        deliver_resp = await client.post(f"/api/shipments/{shipment_data['id']}/deliver")
        assert deliver_resp.status_code == 200
        assert deliver_resp.json()["status"] == "DELIVERED"

        # 12. Submit Customer Feedback
        feedback_payload = {
            "order_id": order_id,
            "rating": 5,
            "delivery_satisfaction": 5,
            "quality_satisfaction": 5,
            "comments": "Flawless delivery! Exactly on schedule and certified specs."
        }
        fb_resp = await client.post("/api/feedback/", json=feedback_payload)
        assert fb_resp.status_code == 200
        assert fb_resp.json()["rating"] == 5
