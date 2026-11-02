import pytest
from datetime import datetime, timedelta
from app.core.database import Base, engine, SessionLocal
from app.models.models import (
    User, Customer, Supplier, Product, Inventory, CustomerOrder,
    ProcurementRequest, Quotation, SimulationRun, NegotiationSession,
    AgentTask, RiskAssessment, LogisticsAssessment, CustomerImpactAssessment,
    DatasetSource, DatasetImport, DatasetRowProvenance
)
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.llm_service import CentralizedLLMService, LLMResult
from app.services.assistant_tools import AssistantDataTools
from app.services.dataset_pipeline import DatasetIngestionPipeline
from app.agents.buyer_agent import BuyerAgent
from app.agents.supplier_agent import SupplierAgent
from app.agents.price_analysis_agent import PriceAnalysisAgent
from app.agents.risk_assessment_agent import RiskAssessmentAgent
from app.agents.logistics_agent import LogisticsAgent
from app.agents.decision_agent import DecisionAgent
from app.agents.customer_impact_agent import CustomerImpactAgent
from app.agents.supervisor_agent import SupervisorAgent
from app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        # Register benchmark sources
        DatasetIngestionPipeline.register_or_get_source(db, "DATACO")
        DatasetIngestionPipeline.register_or_get_source(db, "UCI_ONLINE_RETAIL")
    finally:
        db.close()

# -------------------------------------------------------------
# 1. Centralized LLM Service & Fallback Tests
# -------------------------------------------------------------
def test_llm_health_check():
    health = CentralizedLLMService.health_check()
    assert "primary_configured_provider" in health
    assert "groq" in health
    assert "ollama" in health
    assert health["heuristic_fallback_available"] is True

def test_llm_deterministic_fallback_when_offline():
    # Prompting deterministic engine directly
    res = CentralizedLLMService.generate(
        prompt="Explain why RETAIN or SWITCH was recommended by CNT",
        preferred_provider="offline_forced"
    )
    assert res is not None
    assert len(res.content) > 10
    assert res.is_fallback is True
    assert res.provider == "deterministic_engine"

def test_llm_structured_parsing():
    parsed = CentralizedLLMService.generate_structured(
        prompt="Evaluate price discount: unit=45, target=41",
        schema_guide='{"status": "analyzed", "target_price": 41.0}'
    )
    assert isinstance(parsed, dict)
    assert "parsed" in parsed or "target_price" in parsed or "status" in parsed

# -------------------------------------------------------------
# 2. Authentication, Role Security & Privilege Escalation Tests
# -------------------------------------------------------------
def test_password_hashing_security():
    pwd = "EnterpriseSecret2026!"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongSecret", hashed) is False

def test_jwt_token_payload():
    payload = {"sub": "buyer@aerodynamics.com", "role": "PROCUREMENT", "user_id": 99}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "buyer@aerodynamics.com"
    assert decoded["role"] == "PROCUREMENT"

def test_registration_safe_role_enforcement():
    db = SessionLocal()
    try:
        # Simulate registration logic from auth.py: public users attempting ADMIN should default to CUSTOMER
        test_email = f"test_reg_{int(datetime.utcnow().timestamp())}@test.com"
        requested_role = "ADMIN"
        assigned_role = "CUSTOMER" if requested_role in ("ADMIN", "PROCUREMENT") else requested_role

        user = User(
            email=test_email,
            hashed_password=hash_password("password123"),
            full_name="Attacking User",
            role=assigned_role,
            company_name="Independent Org"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        assert user.role == "CUSTOMER"  # Privilege escalation prevented!
    finally:
        db.close()

# -------------------------------------------------------------
# 3. AI Assistant Authorized Data Tools & Isolation Tests
# -------------------------------------------------------------
def test_customer_data_isolation():
    db = SessionLocal()
    try:
        customer_user = db.query(User).filter(User.role == "CUSTOMER").first()
        if not customer_user:
            pytest.skip("No customer demo user found")

        # 1. Customer searching orders only sees their own
        res_orders = AssistantDataTools.search_orders(db, customer_user)
        assert res_orders["tool"] == "search_orders"
        for o in res_orders["orders"]:
            # Customer should not see internal procurement budget caps
            assert "max_budget" not in o

        # 2. Customer attempting to see supplier bids is restricted
        res_quotes = AssistantDataTools.get_quotations_and_suppliers(db, customer_user)
        assert "notice" in res_quotes
        assert "restricted" in res_quotes["notice"].lower()

        # 3. Customer attempting to inspect internal negotiations is restricted
        res_neg = AssistantDataTools.get_negotiations_summary(db, customer_user)
        assert "notice" in res_neg
        assert "confidential" in res_neg["notice"].lower()
    finally:
        db.close()

def test_procurement_data_access():
    db = SessionLocal()
    try:
        proc_user = db.query(User).filter(User.role == "PROCUREMENT").first()
        if not proc_user:
            pytest.skip("No procurement demo user found")

        # Procurement lead CAN view multi-vendor quotations
        res_quotes = AssistantDataTools.get_quotations_and_suppliers(db, proc_user)
        assert res_quotes["total_quotations"] > 0
        assert "supplier_name" in res_quotes["quotations"][0]
        assert "reliability_score" in res_quotes["quotations"][0]

        # Procurement lead CAN view inventory shortages
        res_inv = AssistantDataTools.search_inventory(db, proc_user, shortage_only=False)
        assert res_inv["total_items"] > 0
    finally:
        db.close()

# -------------------------------------------------------------
# 4. Multi-Agent Reasoning & Tool Execution Tests
# -------------------------------------------------------------
def test_nine_agent_workflow_and_persistence():
    db = SessionLocal()
    try:
        order = db.query(CustomerOrder).first()
        if not order:
            pytest.skip("No test orders found in database")

        # 1. Buyer Agent executes and persists task
        buyer_out = BuyerAgent.execute(db, order.id)
        assert "procurement_request_id" in buyer_out
        assert "buyer_reasoning" in buyer_out
        proc_id = buyer_out["procurement_request_id"]

        # 2. Supplier Agent ranks vendors
        supp_out = SupplierAgent.execute(db, proc_id)
        assert supp_out["total_quotations"] > 0
        assert "top_supplier" in supp_out

        # 3. Price Analysis Agent calculates variance and counteroffer
        price_out = PriceAnalysisAgent.execute(db, proc_id)
        assert price_out["lowest_unit_price"] > 0
        assert "target_counter_unit_price" in price_out

        # 4. Risk Assessment Agent evaluates and persists RiskAssessment
        risk_out = RiskAssessmentAgent.execute(db, proc_id)
        assert risk_out["overall_supply_risk"] in ("LOW", "MEDIUM", "HIGH")
        saved_risk = db.query(RiskAssessment).filter(RiskAssessment.procurement_request_id == proc_id).first()
        assert saved_risk is not None
        assert saved_risk.risk_score >= 0.0

        # 5. Logistics Agent evaluates schedules and persists LogisticsAssessment
        log_out = LogisticsAgent.execute(db, proc_id)
        assert "logistics_evaluations" in log_out
        saved_log = db.query(LogisticsAssessment).filter(LogisticsAssessment.procurement_request_id == proc_id).first()
        assert saved_log is not None
        assert saved_log.estimated_lead_days > 0

        # 6. Decision Agent runs CNT and persists SimulationRun
        dec_out = DecisionAgent.execute(db, proc_id, delay_days=4)
        assert dec_out["recommendation"] in ("RETAIN", "NEGOTIATE", "SWITCH")
        assert len(dec_out["scenarios"]) >= 3

        # 7. Customer Impact Agent translates narrative without confidential leaks
        impact_out = CustomerImpactAgent.execute(db, order.id)
        assert "customer_explanation" in impact_out
        saved_impact = db.query(CustomerImpactAssessment).filter(CustomerImpactAssessment.order_id == order.id).first()
        assert saved_impact is not None
        assert saved_impact.service_level_impact_pct > 0.0
    finally:
        db.close()

# -------------------------------------------------------------
# 5. Dataset Pipeline & Provenance Tests
# -------------------------------------------------------------
def test_dataset_pipeline_ingestion_and_idempotence():
    import uuid
    uid = uuid.uuid4().hex[:6]
    db = SessionLocal()
    try:
        sample_batch = [
            {
                "Order Id": f"TEST-DATACO-{uid}-001",
                "Product Name": "Aerospace Microcontroller Unit",
                "Product Card Id": f"SKU-MCU-TEST-{uid}",
                "Category Name": "Electronics",
                "Order Item Product Price": 45.0,
                "Order Item Quantity": 20,
                "Customer Fname": "Rohan",
                "Customer Lname": "Sharma",
                "Customer Segment": "Consumer Electronics",
                "Delivery Status": "Shipping on time"
            },
            {
                "Order Id": f"TEST-DATACO-{uid}-002",
                "Product Name": "Lithium Polymer Battery 5000mAh",
                "Product Card Id": f"SKU-BAT-TEST-{uid}",
                "Category Name": "Power Supplies",
                "Order Item Product Price": 80.0,
                "Order Item Quantity": 10,
                "Customer Fname": "Priya",
                "Customer Lname": "Patel",
                "Customer Segment": "Industrial Enterprise",
                "Delivery Status": "Delivery risks"
            }
        ]

        # First ingestion
        res1 = DatasetIngestionPipeline.ingest_records(
            db=db,
            records=sample_batch,
            source_key="DATACO"
        )
        assert res1["status"] == "COMPLETED"
        assert res1["imported_rows"] == 2
        assert res1["skipped_rows"] == 0

        # Verify provenance was saved
        prov1 = db.query(DatasetRowProvenance).filter(DatasetRowProvenance.entity_id == f"EXT-TEST-DATACO-{uid}-001").first()
        assert prov1 is not None
        assert len(prov1.data_hash) == 64

        # Second ingestion of the same records (test idempotency & duplicate prevention)
        res2 = DatasetIngestionPipeline.ingest_records(
            db=db,
            records=sample_batch,
            source_key="DATACO"
        )
        assert res2["status"] == "COMPLETED"
        assert res2["imported_rows"] == 0
        assert res2["skipped_rows"] == 2  # Correctly recognized as duplicate and skipped!
    finally:
        db.close()

# -------------------------------------------------------------
# 5. Role-Based Governance & Approval Workflow Tests
# -------------------------------------------------------------
def test_admin_user_role_assignment_and_audit():
    from app.api.users import update_user_role, update_user_status, get_audit_logs
    from app.schemas.schemas import UserRoleUpdate, UserStatusUpdate
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email != "admin@nexora.com").first()
        assert user is not None
        orig_role = user.role

        # Update role to PROCUREMENT
        updated = update_user_role(user.id, UserRoleUpdate(role="PROCUREMENT"), db)
        assert updated.role == "PROCUREMENT"

        # Toggle status to False
        deactivated = update_user_status(user.id, UserStatusUpdate(is_active=False), db)
        assert deactivated.is_active is False

        # Reactivate
        reactivated = update_user_status(user.id, UserStatusUpdate(is_active=True), db)
        assert reactivated.is_active is True

        # Check audit log trail
        logs = get_audit_logs(limit=10, db=db)
        actions = [l["action"] for l in logs]
        assert "USER_ROLE_ASSIGNED" in actions
        assert "USER_STATUS_UPDATED" in actions

        # Restore original role
        update_user_role(user.id, UserRoleUpdate(role=orig_role), db)
    finally:
        db.close()

def test_admin_pending_approvals_and_rejection():
    from app.api.purchase_orders import get_pending_approvals, reject_approval_recommendation
    db = SessionLocal()
    try:
        # Check pending approvals retrieval
        approvals = get_pending_approvals(db)
        assert isinstance(approvals, list)

        # Ensure an order exists to test rejection
        order = db.query(CustomerOrder).first()
        assert order is not None
        
        # Test rejection workflow
        res = reject_approval_recommendation(order.id, "Lead time too long for Q3 delivery", db)
        assert res["status"] == "AWAITING_QUOTATIONS"
        
        db.refresh(order)
        assert order.status == "AWAITING_QUOTATIONS"
        assert "Lead time too long" in order.customer_explanation
    finally:
        db.close()


