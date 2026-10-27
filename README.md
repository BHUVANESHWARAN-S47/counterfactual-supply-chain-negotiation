# Counterfactual Multi-Agent Framework for Adaptive Supplier Negotiation and Customer-Aware Supply Chain Switching

An end-to-end runnable AI-powered supply chain management platform integrating a **Supervisor-coordinated 9-Agent architecture**, **Counterfactual Negotiation Twin (CNT)** for pre-commitment scenario comparison, adaptive **Retain / Negotiate / Switch** decision intelligence, and transparent customer tracking.

---

## 🚀 Key Highlights & Architectural Innovations

1. **Counterfactual Negotiation Twin (CNT):**
   - Simulates alternative supplier agreements before commitment.
   - Evaluates: Baseline Incumbent, Alternative Challenger, Negotiated Concessions (-8%), Disruption Stress-Tests (+4d Port Delay), and Demand Surges (+20%).
   - Calculates deterministic Procurement Cost, Freight, Production conversion, Total Cost, Revenue, Margin %, and Deadline Variance.
2. **Supervisor-Coordinated 9-Agent Subsystem:**
   - **Supervisor Agent:** Orchestrates pipeline and maintains workflow state.
   - **Buyer Agent:** Evaluates inventory shortages and creates procurement requisitions.
   - **Supplier Agent:** Manages quotation intake and multi-criteria weighted scoring.
   - **Price Analysis Agent:** Calculates price spread, benchmark variances, and target discounts.
   - **Risk Assessment Agent:** Computes disruption risk, capacity tightness, and lead-time variance.
   - **Logistics Agent:** Evaluates shipping routes, transit delays, and freight cost models.
   - **AI Negotiation Agent:** Multi-round bargaining engine simulating buyer-supplier concessions.
   - **Decision Agent:** Synthesizes CNT counterfactuals to recommend **RETAIN**, **NEGOTIATE**, or **SWITCH**.
   - **Customer Impact Agent:** Translates internal supplier decisions into clear customer status updates.
3. **Role-Based Portals:**
   - **Admin Portal:** Executive KPI cards, live order funnel, approval authorizations, agent monitor.
   - **Procurement Portal:** Shortage calculator, RFQ generation, quotation comparison, negotiation terminal.
   - **Supplier Portal:** Assigned RFQs, quotation response form, purchase orders, shipment dispatch.
   - **Customer Portal:** Order intake, milestone tracking timeline, quality explanations, feedback ratings.
4. **AI Assistant with Fallback:**
   - Connects to local LLaMA via Ollama when available.
   - Automatically falls back to a deterministic, domain-grounded heuristic engine when Ollama is offline.
5. **Data Integrity & Idempotency:**
   - Prevents duplicate purchase orders via transactional idempotency keys.
   - Mathematical inventory rule: `Available = On-Hand - Reserved`, `Shortage = max(0, Required - Available)`.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Uvicorn, Pytest, python-jose, passlib.
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Database:** SQLite (default zero-friction local storage; can be pointed to PostgreSQL via `DATABASE_URL`).
- **Deployment:** Docker & Docker Compose.

---

## ⚡ Quick Start Instructions

### 1. Backend Setup & Run

In a terminal:

```bash
cd backend

# (Optional: create and activate virtual environment)
# python -m venv venv
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server (automatically initializes & seeds SQLite database on first launch)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend Setup & Run

In a second terminal:

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🐳 Docker Deployment

To launch the full stack with Docker Compose:

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Automated Tests

Run the complete test suite (unit + end-to-end integration tests):

```bash
cd backend
python -m pytest tests/
```

Test coverage includes:
- JWT token & password hashing
- Mathematical inventory shortage rules
- Supplier multi-criteria scoring & ranking
- CNT scenario cost, profit, and deadline variance calculations
- Offline LLM assistant heuristic fallback
- Full end-to-end API order-to-delivery lifecycle and purchase order idempotency

---

## 🔑 Pre-Seeded Demo Accounts

You can switch personas directly via the **Navbar Persona Switcher** or log in with:

| Role | Email | Password | Persona Details |
|---|---|---|---|
| **Admin** | `admin@supplychain.ai` | `admin123` | Sarah Jenkins (AeroDynamics Global Enterprise) |
| **Procurement** | `procurement@supplychain.ai` | `procure123` | David Vance (Procurement Lead) |
| **Supplier** | `apex@supplier.com` | `supplier123` | Michael Chen (Apex Components Ltd) |
| **Customer** | `cust@acme.com` | `cust123` | Elena Rostova (Acme Robotics Systems) |

---

## 📋 End-to-End Walkthrough Demonstration

1. **Customer Order Intake:**
   - In **Customer Orders**, click **"New Customer Request"**.
   - Select *ARM Cortex Dual-Core Microcontroller*, Quantity: 100, Budget: $12,000.
   - Click **"Submit & Orchestrate"**.
2. **Supervisor Autonomous Orchestration:**
   - The Supervisor Agent triggers Buyer Agent → checks warehouse (30 on-hand, 20 reserved = 10 available, Shortage = 90).
   - Generates Procurement Request `PR-2026-XXXX`.
   - Supplier Agent gathers and ranks quotes from Apex Components, Nexus Industrial, and Quantum Dynamics.
   - Price, Risk, and Logistics agents evaluate benchmarks, transit routes, and disruption factors.
   - Decision Agent executes the Counterfactual Negotiation Twin and recommends **NEGOTIATE** / **RETAIN**.
   - Customer Impact Agent generates a customer status update.
   - Order enters **`AWAITING_APPROVAL`**.
3. **Explore Counterfactual Twin (CNT):**
   - Navigate to **Counterfactual Twin (CNT)**.
   - Inspect the scenario matrix: Baseline vs Alternative Challenger vs Negotiated Discount vs +4d Port Delay stress-test.
   - Adjust the delay and demand sliders and click **"Re-Run CNT"**.
4. **Negotiation Arena:**
   - In **Supplier Negotiation**, review the multi-round buyer-supplier chat thread.
   - Submit a counteroffer (e.g. $41.50/unit) to watch the Supplier Agent respond.
5. **Approve Supplier & Issue Purchase Order:**
   - In CNT, click **"Approve Supplier"**.
   - Confirm PO creation. Notice idempotency check prevents duplicate orders.
   - Status transitions to `PURCHASE_ORDER_CREATED`.
6. **Fulfillment Tracking & Feedback:**
   - Switch to **Supplier Portal** persona and click **"Dispatch Materials"**.
   - Switch to **Customer Portal** persona to view the live timeline and submit 5-star customer feedback.
