from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import (
    User, Customer, Supplier, Product, Inventory, InventoryTransaction,
    CustomerOrder, OrderItem, ProcurementRequest, Quotation,
    NegotiationSession, NegotiationMessage, PurchaseOrder, ProductionPlan,
    Shipment, AgentTask, AgentLog, SimulationRun, SimulationScenario,
    Notification, CustomerFeedback, AuditLog
)
from app.services.supplier_evaluator import SupplierEvaluator
from app.services.cnt_engine import CounterfactualNegotiationTwin

def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already contains data, skipping seed.")
        return

    print("Seeding database with realistic supply chain demo data...")

    # 1. Users & Demo Accounts
    admin_user = User(
        email="admin@supplychain.ai",
        hashed_password=hash_password("admin123"),
        full_name="Sarah Jenkins (Admin)",
        role="ADMIN",
        company_name="AeroDynamics Global Enterprise"
    )
    proc_user = User(
        email="procurement@supplychain.ai",
        hashed_password=hash_password("procure123"),
        full_name="David Vance (Procurement Lead)",
        role="PROCUREMENT",
        company_name="AeroDynamics Global Enterprise"
    )
    supplier_user = User(
        email="apex@supplier.com",
        hashed_password=hash_password("supplier123"),
        full_name="Michael Chen (Apex Sales VP)",
        role="SUPPLIER",
        company_name="Apex Components Ltd"
    )
    customer_user = User(
        email="cust@acme.com",
        hashed_password=hash_password("cust123"),
        full_name="Elena Rostova (Acme COO)",
        role="CUSTOMER",
        company_name="Acme Robotics Systems"
    )
    db.add_all([admin_user, proc_user, supplier_user, customer_user])
    db.flush()

    # 2. Customer Profile
    customer = Customer(
        user_id=customer_user.id,
        name="Acme Robotics Systems",
        company="Acme Corporation",
        email="cust@acme.com",
        phone="+1 (555) 019-2834",
        shipping_address="450 Innovation Parkway, Suite 100, Silicon Valley, CA 94025"
    )
    db.add(customer)
    db.flush()

    # 3. Suppliers (5 Distinct Suppliers)
    suppliers = [
        Supplier(
            user_id=supplier_user.id,
            name="Apex Components Ltd",
            contact_email="sales@apexcomponents.com",
            phone="+1 (555) 234-5678",
            categories="Microcontrollers, Embedded Electronics, Sensors",
            baseline_rating=4.8,
            base_lead_time_days=7,
            capacity_per_week=1000,
            reliability_score=0.95,
            risk_score=0.12
        ),
        Supplier(
            name="Nexus Industrial Corp",
            contact_email="orders@nexusind.com",
            phone="+1 (555) 345-6789",
            categories="Microcontrollers, Batteries, Semiconductors",
            baseline_rating=4.4,
            base_lead_time_days=6,
            capacity_per_week=800,
            reliability_score=0.88,
            risk_score=0.18
        ),
        Supplier(
            name="Global Precision Works",
            contact_email="rfq@globalprecision.com",
            phone="+1 (555) 456-7890",
            categories="Chassis Frames, Structural Metals, Hardware",
            baseline_rating=4.6,
            base_lead_time_days=9,
            capacity_per_week=600,
            reliability_score=0.92,
            risk_score=0.15
        ),
        Supplier(
            name="Quantum Dynamics Ltd",
            contact_email="support@quantumdynamics.org",
            phone="+1 (555) 567-8901",
            categories="LiDAR Sensors, Optical Arrays, Power Modules",
            baseline_rating=4.7,
            base_lead_time_days=8,
            capacity_per_week=500,
            reliability_score=0.94,
            risk_score=0.14
        ),
        Supplier(
            name="Vanguard Logistics & Materials",
            contact_email="dispatch@vanguardmaterials.com",
            phone="+1 (555) 678-9012",
            categories="Raw Carbon Fiber, Connectors, Wiring",
            baseline_rating=4.2,
            base_lead_time_days=12,
            capacity_per_week=1500,
            reliability_score=0.84,
            risk_score=0.25
        )
    ]
    db.add_all(suppliers)
    db.flush()

    # 4. Products
    products = [
        Product(
            name="ARM Cortex Dual-Core Microcontroller",
            sku="MCU-ARM-2026",
            category="Electronics",
            unit="units",
            unit_cost=42.0,
            target_selling_price=120.0,
            reorder_level=40,
            description="Automotive-grade high-speed dual-core ARM Cortex processor with integrated CAN controller."
        ),
        Product(
            name="Li-Ion 48V Power Module",
            sku="BAT-48V-500W",
            category="Energy Storage",
            unit="packs",
            unit_cost=185.0,
            target_selling_price=390.0,
            reorder_level=25,
            description="500Wh smart lithium battery pack with embedded battery management system (BMS)."
        ),
        Product(
            name="Carbon Fiber Chassis Frame",
            sku="CHS-CF-01",
            category="Structural",
            unit="frames",
            unit_cost=210.0,
            target_selling_price=480.0,
            reorder_level=20,
            description="Lightweight high-tensile carbon fiber monocoque chassis for autonomous robots."
        ),
        Product(
            name="LiDAR Precision 3D Sensor",
            sku="SEN-LIDAR-X",
            category="Sensors",
            unit="units",
            unit_cost=95.0,
            target_selling_price=240.0,
            reorder_level=30,
            description="360-degree Solid-state LiDAR module with 50-meter operating range."
        )
    ]
    db.add_all(products)
    db.flush()

    # 5. Inventory & Initial Stock
    inventories = [
        Inventory(product_id=products[0].id, on_hand=30, reserved=20, incoming=0),  # Available = 10 (Shortage!)
        Inventory(product_id=products[1].id, on_hand=150, reserved=50, incoming=50), # Available = 100 (Healthy)
        Inventory(product_id=products[2].id, on_hand=0, reserved=0, incoming=0),     # Available = 0 (Critical Shortage)
        Inventory(product_id=products[3].id, on_hand=80, reserved=60, incoming=20)   # Available = 20 (Low Stock)
    ]
    db.add_all(inventories)
    db.flush()

    for inv in inventories:
        tx = InventoryTransaction(
            inventory_id=inv.id,
            transaction_type="INTAKE",
            quantity=inv.on_hand,
            notes="Initial warehouse inventory baseline"
        )
        db.add(tx)

    # 6. Pre-seeded Customer Order (ORD-2026-0001)
    now = datetime.utcnow()
    target_date = now + timedelta(days=14)

    order1 = CustomerOrder(
        order_number="ORD-2026-0001",
        customer_id=customer.id,
        product_id=products[0].id,
        quantity=100,
        target_delivery_date=target_date,
        max_budget=12000.0,
        status="AWAITING_APPROVAL",
        delivery_address=customer.shipping_address,
        specifications="Strict AEC-Q100 Grade 2 certification, sealed ESD packaging, on-time delivery critical.",
        customer_explanation=(
            "Your order for 100 units of ARM Cortex Dual-Core Microcontrollers is confirmed. "
            "Our multi-agent procurement twin has evaluated candidate suppliers and verified schedule adherence. "
            "Materials arrival is planned on-time with zero downstream delivery delay."
        )
    )
    db.add(order1)
    db.flush()

    order_item = OrderItem(
        order_id=order1.id,
        product_id=products[0].id,
        quantity=100,
        unit_price=products[0].target_selling_price,
        total_price=100 * products[0].target_selling_price
    )
    db.add(order_item)

    # 7. Procurement Request for Order 1 (Shortage = 90 units)
    proc_req = ProcurementRequest(
        request_number="PR-2026-0001",
        order_id=order1.id,
        product_id=products[0].id,
        required_quantity=100,
        available_quantity=10,
        shortage_quantity=90,
        required_by_date=target_date - timedelta(days=3),
        estimated_budget=4500.0,
        status="SIMULATED",
        priority="HIGH",
        delivery_risk="LOW"
    )
    db.add(proc_req)
    db.flush()

    # 8. Quotations from Suppliers
    quote_apex = Quotation(
        quotation_number="QT-2026-0001",
        procurement_request_id=proc_req.id,
        supplier_id=suppliers[0].id,  # Apex
        offered_quantity=90,
        unit_price=44.50,
        delivery_lead_days=6,
        quality_rating=4.8,
        reliability_score=0.95,
        risk_score=0.12,
        validity_date=now + timedelta(days=14),
        notes="AEC-Q100 certified batch with priority courier dispatch.",
        status="SUBMITTED",
        total_score=92.4,
        rank=1
    )
    quote_nexus = Quotation(
        quotation_number="QT-2026-0002",
        procurement_request_id=proc_req.id,
        supplier_id=suppliers[1].id,  # Nexus
        offered_quantity=90,
        unit_price=39.80,
        delivery_lead_days=7,
        quality_rating=4.4,
        reliability_score=0.88,
        risk_score=0.18,
        validity_date=now + timedelta(days=10),
        notes="Competitive bulk quote; standard warranty included.",
        status="SUBMITTED",
        total_score=88.7,
        rank=2
    )
    quote_quantum = Quotation(
        quotation_number="QT-2026-0003",
        procurement_request_id=proc_req.id,
        supplier_id=suppliers[3].id,  # Quantum
        offered_quantity=90,
        unit_price=47.00,
        delivery_lead_days=5,
        quality_rating=4.7,
        reliability_score=0.94,
        risk_score=0.14,
        validity_date=now + timedelta(days=12),
        notes="Fast-track premium shipping option.",
        status="SUBMITTED",
        total_score=85.1,
        rank=3
    )
    db.add_all([quote_apex, quote_nexus, quote_quantum])
    db.flush()

    # 9. Negotiation Session for PR 1 with Apex Components
    neg_session = NegotiationSession(
        session_number="NEG-2026-0001",
        procurement_request_id=proc_req.id,
        supplier_id=suppliers[0].id,
        status="ACTIVE",
        target_price=41.00,
        current_buyer_offer=41.50,
        current_supplier_offer=43.00,
        max_rounds=5,
        current_round=2,
        agreement_reached=False,
        decision_mode="NEGOTIATE"
    )
    db.add(neg_session)
    db.flush()

    m1 = NegotiationMessage(
        session_id=neg_session.id,
        sender_role="SUPPLIER_AGENT",
        sender_name="Michael Chen (Apex Sales VP)",
        round_number=1,
        offered_price=44.50,
        offered_lead_days=6,
        message="Initial catalog quotation submitted at ₹44.50/unit for 90 units.",
        ai_suggestion="Opening quote is within 6% of target. Suggested counteroffer: ₹41.00 (7.8% discount)."
    )
    m2 = NegotiationMessage(
        session_id=neg_session.id,
        sender_role="BUYER_AGENT",
        sender_name="AI Buyer Negotiation Agent",
        round_number=1,
        offered_price=41.00,
        offered_lead_days=6,
        message="We counter with ₹41.00/unit based on recurring quarterly volume and market index.",
        ai_suggestion="Counter submitted within buyer target bounds."
    )
    m3 = NegotiationMessage(
        session_id=neg_session.id,
        sender_role="SUPPLIER_AGENT",
        sender_name="Michael Chen (Apex Sales VP)",
        round_number=2,
        offered_price=43.00,
        offered_lead_days=6,
        message="We can compromise at ₹43.00/unit with guaranteed priority testing included.",
        ai_suggestion="Supplier conceded ₹1.50/unit. Next round can target final agreement around ₹42.00."
    )
    db.add_all([m1, m2, m3])

    # 10. Pre-seeded CNT Simulation Run
    sim_run = SimulationRun(
        run_number="SIM-2026-0001",
        order_id=order1.id,
        procurement_request_id=proc_req.id,
        run_type="COUNTERFACTUAL_COMPARISON",
        recommendation="NEGOTIATE",
        justification=(
            "CNT simulation projects a +₹420.00 profit increase (61.2% vs 58.4% margin) with Apex Components Ltd "
            "under an 8% targeted counteroffer while preserving full delivery compliance (0 days deadline variance)."
        ),
        trade_offs="Trade-off: Requires 1 round of automated AI counteroffer. Supplier historical concession probability is 78%. Fallback to baseline remains 100% schedule-safe.",
        customer_impact_summary="Customer Impact: ZERO schedule delay. Materials arrive on-schedule; full AEC-Q100 certified quality maintained.",
        confidence_score=0.92
    )
    db.add(sim_run)
    db.flush()

    scenarios_data = [
        ("Baseline: Apex Components (Original Quote)", suppliers[0].id, suppliers[0].name, 44.50, 4005.0, 6, -3, True, 0.12, 6500.0, 54.2, "RETAIN"),
        ("Alternative Challenger: Nexus Industrial", suppliers[1].id, suppliers[1].name, 39.80, 3582.0, 7, -2, True, 0.18, 6920.0, 57.6, "SWITCH"),
        ("Counterfactual: Negotiated (8% Concession)", suppliers[0].id, suppliers[0].name, 41.50, 3735.0, 6, -3, True, 0.11, 6770.0, 56.4, "NEGOTIATE"),
        ("Disruption Stress-Test: (+4d Port Delay)", suppliers[0].id, suppliers[0].name, 44.50, 4005.0, 10, 1, False, 0.38, 5900.0, 49.1, "RETAIN"),
        ("Demand Surge: (+20% Quantity Spike)", suppliers[0].id, suppliers[0].name, 42.50, 4590.0, 7, -2, True, 0.15, 8100.0, 58.0, "NEGOTIATE")
    ]

    for name, s_id, s_name, price, cost, lead, var, feas, risk, profit, margin, mode in scenarios_data:
        sc = SimulationScenario(
            simulation_run_id=sim_run.id,
            scenario_name=name,
            supplier_id=s_id,
            supplier_name=s_name,
            unit_price=price,
            total_cost=cost,
            lead_time_days=lead,
            arrival_date=now + timedelta(days=lead),
            deadline_variance_days=var,
            feasibility=feas,
            risk_score=risk,
            estimated_profit=profit,
            profit_margin_pct=margin,
            decision_mode=mode,
            scenario_parameters={"quantity": 90, "procurement_cost": cost}
        )
        db.add(sc)

    # 11. Initial Notifications
    notifs = [
        Notification(role="ADMIN", title="Approval Required: Order #ORD-2026-0001", message="CNT Simulation recommends 'NEGOTIATE' with Apex Components. Review scenario details.", event_type="APPROVAL_REQUIRED", related_order_id=order1.id),
        Notification(role="PROCUREMENT", title="Quotation Ranking Ready", message="3 quotations ranked for PR-2026-0001. Top score: Apex Components (92.4/100).", event_type="QUOTATION_RECEIVED", related_order_id=order1.id),
        Notification(role="CUSTOMER", title="Order Intake Confirmed", message="Order #ORD-2026-0001 received and in inventory analysis.", event_type="ORDER_INTAKE", related_order_id=order1.id),
        Notification(role="SUPPLIER", title="Quotation Request Assigned", message="New RFQ #PR-2026-0001 assigned for 90 units of Microcontrollers.", event_type="RFQ_SENT", related_order_id=order1.id)
    ]
    db.add_all(notifs)

    # 12. Agent Execution Tasks and Logs
    agents_list = ["Supervisor Agent", "Buyer Agent", "Supplier Agent", "Price Analysis Agent", "Risk Assessment Agent", "Logistics Agent", "Decision Agent", "Customer Impact Agent"]
    for idx, ag_name in enumerate(agents_list):
        task = AgentTask(
            task_number=f"TASK-{ag_name[:4].upper()}-{idx+1:04d}",
            agent_name=ag_name,
            related_order_id=order1.id,
            related_procurement_id=proc_req.id,
            status="COMPLETED",
            input_payload={"order_id": order1.id, "procurement_id": proc_req.id},
            output_payload={"status": "SUCCESS", "message": f"{ag_name} successfully executed."},
            requires_approval=(ag_name == "Decision Agent"),
            created_at=now - timedelta(minutes=30 - (idx*3)),
            completed_at=now - timedelta(minutes=28 - (idx*3))
        )
        db.add(task)
        db.flush()

        log = AgentLog(
            task_id=task.id,
            agent_name=ag_name,
            log_level="SUCCESS",
            message=f"{ag_name} finished operational evaluation for Order #{order1.order_number}",
            details={"task_number": task.task_number},
            timestamp=now - timedelta(minutes=28 - (idx*3))
        )
        db.add(log)

    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
