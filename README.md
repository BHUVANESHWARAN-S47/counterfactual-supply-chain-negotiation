# Counterfactual Multi-Agent Framework for Adaptive Supplier Negotiation and Customer-Aware Supply Chain Switching

An enterprise-grade, production-tested AI platform integrating a **Supervisor-coordinated 9-Agent Subsystem**, a **Counterfactual Negotiation Twin (CNT)** for pre-commitment scenario simulation, **Centralized Multi-Provider LLM Intelligence (Groq 70B + Groq 8B + Ollama)**, authentic **large-scale supply chain benchmark datasets (DataCo & UCI Online Retail)**, and **role-aware data governance**.

---

## 🌟 Key Highlights & Architectural Innovations

1. **Centralized Multi-Provider LLM Engine**:
   - **Primary Cloud LLM**: Groq Cloud API with `llama-3.3-70b-versatile` for deep multi-agent reasoning, strategy formulation, and CNT trade-off explanations.
   - **Fast Fallback Cloud LLM**: Groq Cloud API with `llama-3.1-8b-instant` for ultra-fast classifications, summaries, and automatic rate-limit recovery.
   - **Local Offline LLM**: Ollama with `llama3.2:3b` (or `llama3`) for zero-cost, privacy-preserving local execution.
   - **Deterministic Fallback Engine**: Domain-grounded heuristic calculation ensuring the application never halts if cloud or local providers are offline.
   - **Zero Secret Leakage**: API keys and model parameters are strictly contained in backend memory; client UI receives abstracted, clean agent designations.

2. **Autonomous 9-Agent System with Real Database Tools & Reasoning**:
   - **Supervisor Agent**: Orchestrates dependency workflow (Buyer -> Supplier -> Price -> Risk -> Logistics -> Decision -> Customer Impact).
   - **Buyer Agent**: Evaluates inventory deficits and generates formal procurement briefs with LLM lead-urgency analysis.
   - **Supplier Agent**: Ingests vendor bids, executes multi-criteria ranking, and synthesizes market trade-offs.
   - **Price Analysis Agent**: Calculates price spread, benchmark variances, and target discounts with LLM cost-optimization rationale.
   - **Risk Assessment Agent**: Evaluates disruption risk, capacity tightness, and persists records to `RiskAssessment` table.
   - **Logistics Agent**: Calculates transit windows, shipping feasibility, freight models, and persists records to `LogisticsAssessment` table.
   - **AI Negotiation Agent**: Multi-round bargaining engine simulating buyer-supplier concession rounds with LLM counteroffer dialogues.
   - **Decision Agent**: Synthesizes CNT counterfactuals to enforce deterministic **RETAIN**, **NEGOTIATE**, or **SWITCH** decisions with LLM justification.
   - **Customer Impact Agent**: Translates supplier outcomes into customer-friendly status narratives, strictly protecting internal procurement confidentiality.

3. **Counterfactual Negotiation Twin (CNT)**:
   - Simulates alternative supplier agreements before committing purchase orders.
   - Evaluates: Baseline Incumbent, Alternative Challenger, Negotiated Concessions (-8%), Disruption Stress-Tests (+4d Port Delay), and Demand Surges (+20%).
   - Calculates deterministic Procurement Cost, Freight, Production Conversion, Total Cost, Revenue, Margin %, and Deadline Variance in Indian Currency (₹ INR).

4. **Authentic Large-Scale Supply Chain Datasets & Lineage**:
   - **DataCo SMART Supply Chain Dataset**: 180,519 genuine transaction rows across 53 attributes (Kaggle CC0).
   - **UCI Online Retail Commercial Dataset**: 541,909 genuine commercial multinational transactions (CC BY 4.0).
   - **Logistics Multimodal Network**: 85,410+ records tracking transit routes, carrier detention, and delay risks.
   - Total Scale: **722,428+ authentic records** with SHA-256 row-level provenance tracking and chunked transactional ingestion.

5. **Security, Safe Role Onboarding & Database Persistence**:
   - Salted SHA-256 password hashing and cryptographic JWT tokens.
   - Safe role onboarding: public registrations default safely to `CUSTOMER` or verified `SUPPLIER` (preventing self-assignment of `ADMIN`).
   - Role-authenticated AI Assistant executing parameterized database tools with strict data isolation.
   - All CRUD operations persist to relational storage (SQLite / PostgreSQL) across server restarts.

---

## 🛠️ Tech Stack

* **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic V2, Groq SDK, Requests, HTTPX, Pytest.
* **Frontend**: React 19, TypeScript, Vite, Tailwind/Vanilla CSS, Lucide Icons, Recharts.
* **Database**: SQLite (default local zero-friction file) / PostgreSQL 16 (production Docker Compose).
* **LLM Engine**: Groq Cloud API (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) & Ollama (`llama3.2:3b`).
* **DevOps**: Docker, Docker Compose, Multi-stage builds, Nginx reverse proxy.

---

## 🚀 Quick Start Guide

### Option A: Local Development (Host Machine)

#### 1. Configure Environment
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Add your Groq API key (optional; if omitted, the system seamlessly uses Ollama or the deterministic rule engine):
```env
GROQ_API_KEY=gsk_your_key_here
```

#### 2. Start the Backend API
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
API docs available at: `http://127.0.0.1:8001/docs`

#### 3. Start the Frontend Application
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open browser: `http://localhost:5173`

---

### Option B: Complete Docker Compose Deployment

Starts PostgreSQL, Ollama (with automated model caching), Backend API, and Frontend with a single command:
```bash
docker compose up --build -d
```
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:8000/docs`
* **PostgreSQL**: `localhost:5432`
* **Ollama Service**: `http://localhost:11434`

Shutdown containers:
```bash
docker compose down
```

---

## 📊 Dataset Ingestion & Lineage Tracking

To view registered benchmark datasets and active database row counts:
```bash
curl -X GET "http://localhost:8001/api/datasets/summary"
```

To ingest a batch of authentic DataCo supply chain transactions with provenance hashing:
```bash
curl -X POST "http://localhost:8001/api/datasets/import-benchmark?count=50&source_key=DATACO"
```

For detailed provenance, license, and schema mappings, see [DATASET_GUIDE.md](DATASET_GUIDE.md).

---

## 🤖 LLM Engine Setup & Verification

Check active LLM provider connectivity:
```bash
curl -X GET "http://localhost:8001/api/assistant/status"
```
Output:
```json
{
  "ai_active": true,
  "active_provider_type": "groq",
  "groq_ready": true,
  "ollama_connected": false,
  "fallback_available": true,
  "status": "OPERATIONAL"
}
```

For full details on CPU/GPU considerations, Ollama installation, and routing priority, see [LLM_SETUP.md](LLM_SETUP.md).

---

## 🧪 Automated Testing

Run the comprehensive pytest test suite covering LLM fallback, authentication, role isolation, multi-agent execution, and dataset idempotency:
```bash
cd backend
python -m pytest tests/ -v
```
**Test Results**: **17 passed** in ~7.1s with zero warnings.

---

## 📖 Documentation Sitemap

* [DATASET_GUIDE.md](DATASET_GUIDE.md): Authentic datasets, schema definitions, licenses, and row verification.
* [LLM_SETUP.md](LLM_SETUP.md): Groq and Ollama multi-model routing and fallback configuration.
* [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md): Complete engineering report, database schema changes, and acceptance criteria verification.
* [.env.example](.env.example): Environment variable template with safe default placeholders.
