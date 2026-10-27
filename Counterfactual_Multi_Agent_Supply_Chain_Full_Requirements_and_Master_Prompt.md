# Counterfactual Multi-Agent Framework for Adaptive Supplier Negotiation and Customer-Aware Supply Chain Switching

## Complete Project Requirements, Workflow, Implementation Scope, and Final Development Prompt

**Project type:** AI-powered multi-agent supply chain management and
supplier decision-support system\
**Primary innovation:** Counterfactual Negotiation Twin (CNT) for
comparing possible supplier agreements before making a supplier
decision\
**Main decision options:** Retain, Negotiate, or Switch\
**Core users:** Admin, Procurement Manager, Customer, and Supplier\
**AI approach:** Supervisor-coordinated agents with optional local LLaMA
integration\
**Delivery target:** A demonstrable end-to-end prototype that can be
built in a short development window

> **Important status note:** The Phase-I review document says that the
> problem definition, research gap, system architecture, agent design,
> supplier evaluation, negotiation workflow, CNT design, adaptive
> decision framework, and initial prototype were completed/designed. It
> lists complete CNT implementation, large-scale experiments, baseline
> comparison, prediction validation, customer-impact testing,
> dashboard/API integration, performance analysis, and final
> documentation as Phase-II plans. Do not claim that every end-to-end
> feature in this specification is already implemented. Update the
> completion status only after testing the actual code.

------------------------------------------------------------------------

# 1. Project Summary

The project proposes a counterfactual multi-agent framework for adaptive
supplier negotiation and customer-aware supply chain switching.

Traditional supplier selection often focuses on individual criteria such
as price, quality, delivery, reliability, and risk. A supplier with a
low price may still cause problems if it has limited capacity, a long
delivery time, poor reliability, or a high risk of disruption.

This project uses specialized agents to evaluate suppliers and negotiate
potential agreements. The Counterfactual Negotiation Twin (CNT) compares
alternative supplier agreements and estimates their possible future
effects on cost, inventory, delivery, risk, profit, and service level.
An adaptive decision module recommends whether the organization should
retain the current supplier, negotiate better terms, or switch to an
alternative supplier.

A Customer Impact Agent assesses whether a supplier decision may affect
customer delivery, availability, quality, or service. When an important
impact is identified, the system provides an appropriate customer
notification. Finally, actual supplier performance can be compared with
predicted performance to inform future decisions.

The web application described in this specification provides an
operational interface for this framework: customer order intake,
inventory and procurement, supplier quotations, negotiation, simulation,
approvals, notifications, order tracking, feedback, reporting, and an AI
assistant.

## 1.1 Problem Statement

Existing supplier negotiation and selection processes may evaluate
price, quality, delivery, and risk without sufficiently evaluating the
downstream consequences of accepting a supplier agreement or switching
suppliers. This can result in inventory shortages, missed deadlines,
increased costs, service-level changes, and reduced customer trust.

A decision-support system is needed to compare alternative agreements
before commitment, adaptively recommend Retain / Negotiate / Switch, and
assess customer impact before supplier changes are finalized.

## 1.2 Proposed Solution

Build a multi-agent supply chain platform that:

1.  Receives and validates customer orders.
2.  Checks inventory and calculates shortages.
3.  Evaluates suppliers using price, quality, delivery, capacity,
    reliability, and risk.
4.  Collects and compares supplier quotations.
5.  Supports buyer--supplier negotiation and counteroffers.
6.  Runs counterfactual scenarios through the CNT.
7.  Recommends Retain, Negotiate, or Switch with an explanation.
8.  Evaluates the impact of the decision on customers.
9.  Requests human approval for consequential decisions.
10. Sends role-appropriate notifications and tracks fulfillment.
11. Compares predicted supplier performance with actual performance when
    actual data becomes available.

## 1.3 Main Research Gap

The project focuses on the combined use of:

-   Multi-agent supplier negotiation.
-   Counterfactual forecasting of alternative supplier agreements.
-   Adaptive supplier retention, negotiation, and switching.
-   Customer-impact analysis and transparency.
-   Feedback from predicted versus actual supplier performance.

The project should not describe these as experimentally proven
improvements until the implementation has been evaluated with
appropriate data and baseline comparisons.

------------------------------------------------------------------------

# 2. Project Objectives

-   Design a modular multi-agent supply chain architecture.
-   Evaluate and rank suppliers using multiple business criteria.
-   Calculate inventory availability and procurement requirements.
-   Support structured supplier quotations and negotiation.
-   Simulate alternative supplier agreements before making a decision.
-   Compare projected cost, profit, inventory, delivery, service level,
    and risk.
-   Recommend whether to retain, negotiate with, or switch suppliers.
-   Evaluate potential customer impact before finalizing a supplier
    change.
-   Keep customers informed about authorized changes to their orders.
-   Compare predicted supplier performance with actual results for
    future improvement.
-   Provide a visual dashboard for administrators and operational users.
-   Offer an optional local LLaMA assistant that retrieves authorized
    application data.
-   Provide a runnable prototype with documented setup and test
    instructions.

# 3. Users and User Requirements

## 3.1 Admin

The Admin needs to:

-   View an overview of orders, inventory, suppliers, procurement,
    risks, and approvals.
-   Receive notifications for new customer requests and important
    workflow events.
-   Review agent reports and task status.
-   Inspect supplier quotations and negotiation outcomes.
-   Compare simulation scenarios.
-   Approve or reject supplier recommendations.
-   View purchase orders, delivery progress, customer feedback, and
    reports.
-   Manage users, products, suppliers, and application settings.
-   Inspect audit logs and errors.
-   Ask the AI assistant questions about authorized business data.

## 3.2 Customer

The Customer needs to:

-   Register and log in securely.
-   Submit a product or manufacturing request.
-   Enter product specifications, quantity, budget, delivery date, and
    delivery location.
-   View order status and a timeline of major events.
-   View the expected delivery date and updates when it changes.
-   See the approved supplier-selection explanation in customer-friendly
    language.
-   Receive notifications about order progress and important changes.
-   View only information authorized for that customer.
-   Submit ratings, comments, and feedback after receiving the order.
-   Ask the AI assistant about their own order.

Customers must not see another customer's information, confidential
supplier quotations, internal negotiation limits, private risk notes, or
restricted commercial data.

## 3.3 Procurement Manager

The Procurement Manager needs to:

-   View requests assigned for procurement.
-   Check on-hand, reserved, incoming, and available stock.
-   Calculate shortages and quantities to purchase.
-   View supplier profiles and quotation requests.
-   Compare prices, quantities, delivery estimates, quality,
    reliability, and risk.
-   Start or review negotiations.
-   Review CNT results and supplier recommendations.
-   Prepare reports for the Supervisor Agent and Admin.
-   Track purchase orders and material arrival.
-   Receive alerts for shortages, quotation responses, and delivery
    risks.

## 3.4 Supplier

The Supplier needs to:

-   Log in to a dedicated portal.
-   View quotation requests assigned to that supplier.
-   Review required products, specifications, quantities, and requested
    dates.
-   Submit or revise a quotation before its validity expires.
-   State offered quantity, unit price, delivery estimate, quality
    information, and terms.
-   Upload a quotation document if the feature is implemented.
-   Respond to counteroffers.
-   Accept or reject a purchase order.
-   Update dispatch and delivery status when authorized.

For a short prototype, supplier communication can occur through internal
demo accounts. Do not claim real external supplier integration unless it
has actually been configured.

------------------------------------------------------------------------

# 4. Functional Requirements

## FR-01: Authentication and Role-Based Access

-   Provide login and logout.
-   Store password hashes, not plain-text passwords.
-   Enforce roles on the backend, not only in the frontend.
-   Restrict records and actions by role.
-   Provide safe demo accounts for testing.
-   Record consequential actions in an audit log.

## FR-02: Customer Request and Order Intake

The request form should capture:

-   Customer and delivery details.
-   Product and specifications.
-   Requested quantity.
-   Budget or commercial constraints.
-   Required delivery date.
-   Additional requirements.

On submission, the backend must validate and save the order, assign an
order ID, record a timestamp, notify the Admin, and start the
Supervisor-controlled workflow.

## FR-03: Inventory Management

Track:

-   Product/material ID and name.
-   On-hand stock.
-   Reserved stock.
-   Available stock.
-   Incoming stock and expected arrival.
-   Reorder level.
-   Unit cost.
-   Supplier associations.
-   Stock movement history.

Use a consistent rule:

**Available Stock = On-Hand Stock − Reserved Stock**

**Shortage Quantity = max(0, Required Quantity − Eligible Available
Stock)**

Only include incoming stock when its expected arrival is compatible with
the production and customer delivery schedule. Avoid counting the same
stock twice. Record stock changes as transactions and use database
transactions for critical updates.

## FR-04: Procurement Management

For each order, create a procurement report with:

-   Order ID and requested products.
-   Required quantities.
-   Available stock.
-   Shortage quantity.
-   Estimated purchase cost.
-   Required material arrival date.
-   Supplier categories or eligible suppliers.
-   Priority and delivery risk.
-   Current task status.

Notify the Procurement Manager when additional materials are required.

## FR-05: Supplier Profiles and Quotations

Store supplier details, product categories, capacity, offered quantity,
unit price, expected lead time, quality, reliability, risk, and
quotation validity.

A quotation should be linked to a specific quotation request and
supplier. Preserve quotation versions and timestamps when revisions are
supported.

## FR-06: Supplier Evaluation and Ranking

Evaluate suppliers using a configurable, documented weighted score based
on:

-   Price/cost.
-   Quality.
-   Delivery time.
-   Reliability or past performance.
-   Capacity and quantity availability.
-   Risk.

Normalize values so that criteria with different scales can be compared.
For example, a lower price is generally better, while a higher quality
rating may be better. Make the weights visible and configurable. Explain
the score instead of presenting it as an unexplained AI judgment.

## FR-07: Multi-Agent Negotiation

Support structured buyer--supplier messages containing:

-   Requested quantity.
-   Current offer.
-   Proposed counteroffer.
-   Price and delivery terms.
-   Constraints.
-   Response status.
-   Negotiation round and timestamp.

The AI may suggest a counteroffer, but the backend must enforce approved
price limits, quantities, and other business rules. Do not label a
negotiation successful until a supplier acceptance is recorded.

## FR-08: Counterfactual Negotiation Twin (CNT)

The CNT must compare alternative agreements and scenarios before a
supplier decision is committed.

Potential scenarios include:

-   Supplier A versus Supplier B.
-   A negotiated price versus the original quotation.
-   Demand increase or decrease.
-   Supplier delivery delay.
-   Transportation disruption.
-   Reduced supplier capacity.
-   Inventory shortage.
-   A supplier being unable to fulfill the full quantity.

For each scenario, calculate or estimate:

-   Procurement and total cost.
-   Inventory position over time.
-   Material arrival date.
-   Production feasibility and completion estimate.
-   Customer delivery estimate.
-   Deadline variance.
-   Risk.
-   Service-level impact.
-   Estimated revenue, profit, or margin when valid input data is
    available.

Clearly distinguish calculated values from assumptions and predictions.
If real historical data is unavailable, label results as simulated
estimates.

## FR-09: Adaptive Decision --- Retain / Negotiate / Switch

The decision module must recommend one of the following:

### Retain

Keep the existing supplier when the expected overall outcome remains
acceptable, considering reliability, price, quality, capacity, delivery,
and continuity.

### Negotiate

Continue with the supplier but seek better price, delivery, quantity, or
other terms when negotiation may improve the overall outcome.

### Switch

Consider an alternative supplier when the current supplier has
unacceptable cost, delivery, quality, capacity, or risk, and the
alternative provides a better feasible outcome.

Show the reasons, trade-offs, constraints, and risks behind the
recommendation. The recommendation must not automatically commit the
business to a supplier.

## FR-10: Customer Impact and Notifications

Before finalizing a supplier change, assess potential effects on:

-   Delivery date.
-   Product availability.
-   Quality.
-   Service level.
-   Order continuity.

If a significant impact is predicted, flag it for review and prepare a
customer-friendly explanation. Send notifications according to the
configured workflow and approved information-sharing rules.

Persist notifications in the database with recipient, event type,
message, related order, timestamp, and read status.

## FR-11: Fulfillment Tracking

Track major states such as:

-   Request Received.
-   Inventory Analysis.
-   Procurement Required.
-   Awaiting Quotations.
-   Negotiation in Progress.
-   Simulation Completed.
-   Awaiting Approval.
-   Supplier Approved.
-   Purchase Order Created.
-   Materials in Transit.
-   Materials Received.
-   Production Started.
-   Production Completed.
-   Shipped.
-   Delivered.
-   Completed.

Use only statuses supported by recorded events. Do not claim that
production or delivery occurred without the corresponding update.

## FR-12: Customer Feedback

Allow customers to submit ratings and comments after an appropriate
order milestone. Store feedback and show aggregate results to authorized
Admin users. Do not treat feedback as proof of supplier performance
without considering sample size and context.

## FR-13: Reports and Analytics

Provide charts and tables for:

-   Supplier cost and performance comparison.
-   Inventory and shortage analysis.
-   Order status distribution.
-   Procurement costs.
-   Delivery performance.
-   Negotiation rounds and agreement success.
-   Supplier risk.
-   CNT scenario comparisons.
-   Customer-impact events.
-   Predicted versus actual performance, when actual data exists.

Charts must use backend data or clearly labeled demo data---not
unrelated hardcoded values.

## FR-14: AI Assistant

Provide a role-aware assistant using local LLaMA through Ollama when
available. It should answer questions using authorized application data,
summarize reports, explain simulation results, and suggest next actions.

All critical calculations must be performed by backend code. The LLM
should not be the source of truth for inventory, prices, approval state,
or order status. Sensitive actions require authorization and
confirmation. Provide a rule-based or non-LLM fallback so the
application remains usable when the model is unavailable.

------------------------------------------------------------------------

# 5. Proposed System Architecture

## 5.1 Logical Components

1.  **Frontend:** React-based role-specific dashboards, forms, charts,
    timeline, and assistant.
2.  **Backend API:** FastAPI endpoints, validation, authorization,
    workflow logic, and reporting.
3.  **Database:** PostgreSQL or MySQL, selected consistently for the
    prototype.
4.  **Supervisor Agent:** Central task coordinator and workflow state
    manager.
5.  **Specialized Agents:** Request analysis, inventory, procurement,
    buyer, supplier, logistics, negotiation, risk, CNT, customer impact,
    notification, and reporting.
6.  **CNT Simulation Engine:** Deterministic scenario calculations and
    supplier comparisons.
7.  **Local LLM:** Ollama-hosted LLaMA model for language understanding,
    explanations, and negotiation suggestions.
8.  **Notification Service:** Database-backed notifications with polling
    or WebSockets.
9.  **Deployment:** Docker Compose for the application services.

## 5.2 Agent Responsibilities

### Supervisor Agent

Receives the order workflow, assigns tasks, waits for dependencies,
collects results, escalates approvals, and maintains the current
workflow state.

### Customer Request Analysis Agent

Validates requirements and creates a structured order summary without
inventing missing details.

### Buyer / Procurement Agent

Represents the enterprise's requirements and constraints, calculates
procurement needs, and prepares quotation requests.

### Inventory Agent

Checks stock, reservations, incoming quantities, and shortages.

### Supplier Agent(s)

Represents each supplier's submitted quotation, capacity, price, and
delivery commitments. In a prototype, supplier agents may operate over
simulated supplier accounts.

### Negotiation Agent

Evaluates offers and suggests counteroffers within approved constraints.

### Logistics Agent

Evaluates transportation time, shipping cost, and logistics disruptions
when corresponding data is available.

### Risk Agent

Evaluates supply, delivery, capacity, quality, and inventory risks using
defined rules or validated models.

### Counterfactual Negotiation Twin

Runs alternative scenarios and estimates downstream outcomes.

### Adaptive Decision Agent

Uses CNT outputs and configured criteria to recommend Retain / Negotiate
/ Switch.

### Customer Impact Agent

Evaluates customer-facing changes in delivery, availability, quality,
and service.

### Notification Agent

Creates and delivers role-appropriate in-app notifications.

### Reporting Agent

Consolidates operational and simulation results into readable reports.

## 5.3 Communication Pattern

Use a centralized Supervisor and structured task records for the first
implementation. Each task should include:

-   Task ID.
-   Agent name.
-   Related order or procurement request.
-   Status.
-   Structured input.
-   Structured output.
-   Start and completion timestamps.
-   Error information.
-   Retry count.
-   Approval requirement, if applicable.

Use JSON schemas or validated Pydantic models for inter-agent messages.
Prevent duplicate purchase orders and duplicate inventory movements
through idempotency checks.

### Main Workflow

Customer Request\
→ Request Validation\
→ Supervisor Agent\
→ Inventory Analysis\
→ Procurement Requirement\
→ Supplier Quotation Requests\
→ Supplier Responses\
→ Supplier Evaluation\
→ Negotiation\
→ CNT Scenario Simulation\
→ Adaptive Decision: Retain / Negotiate / Switch\
→ Customer Impact Assessment\
→ Authorized Human Approval\
→ Purchase Order / Supplier Update\
→ Material and Production Tracking\
→ Customer Notifications\
→ Delivery and Feedback\
→ Predicted-versus-Actual Performance Review

------------------------------------------------------------------------

# 6. CNT Simulation Design

## 6.1 Simulation Inputs

-   Customer order and deadline.
-   Required product/material quantities.
-   On-hand, reserved, and incoming stock.
-   Supplier quotations and validity.
-   Supplier capacity.
-   Unit price and other configured costs.
-   Expected delivery and transportation time.
-   Quality and reliability indicators.
-   Risk assumptions.
-   Production duration and capacity.
-   Customer revenue or selling price, if available.
-   Scenario assumptions such as demand variation or delay.

## 6.2 Suggested Calculations

These are implementation formulas, not claims about measured project
results.

**Procurement Cost**\
Sum of (quantity purchased from each supplier × approved unit price).

**Total Estimated Cost**\
Procurement Cost + Transportation Cost + Production Cost + Other
Configured Costs.

**Estimated Profit**\
Estimated Revenue − Total Estimated Cost.

**Estimated Profit Margin**\
(Estimated Profit / Estimated Revenue) × 100, only when revenue is
greater than zero.

**Deadline Variance**\
Estimated Delivery Date − Required Delivery Date.

**Shortage Quantity**\
max(0, Required Quantity − Eligible Available Stock).

For split sourcing, calculate quantity allocation across suppliers and
ensure that the total allocated quantity meets the requirement without
exceeding supplier capacity.

## 6.3 Supplier Comparison Dashboard

Display at least two candidate suppliers where available. Include:

-   Unit price and total estimated cost.
-   Available quantity and capacity.
-   Delivery estimate and deadline feasibility.
-   Quality.
-   Reliability.
-   Risk.
-   Estimated profit or margin when supported.
-   Cost difference and estimated savings.
-   Customer-impact explanation.
-   Recommendation and reasons.

Suggested charts:

-   Bar chart: total cost by supplier.
-   Bar chart: delivery time by supplier.
-   Donut chart: estimated cost distribution.
-   Line chart: projected inventory over time.
-   Scenario comparison chart.
-   Risk comparison chart.
-   KPI cards: estimated cost, deadline feasibility, and projected
    margin.

Use actual scenario calculation outputs. Every chart should have labels,
legends, tooltips, and clear units.

## 6.4 Action Buttons

-   Run Simulation.
-   Compare Suppliers.
-   Negotiate.
-   Retain Supplier.
-   Switch Supplier.
-   View Report.
-   Export Report.
-   Approve Supplier.
-   Reset Scenario.

The actions must have meaningful behavior. Negotiate, Retain, and Switch
should change the scenario being evaluated. Approve Supplier must
require authorization and confirmation, revalidate the quotation and
quantity, record the decision, and create the required records
transactionally.

A success notification must be displayed only after the backend
operation succeeds.

## 6.5 Simulation Limitations

A CNT simulation is a decision-support estimate, not a guarantee of
future events. Prediction quality depends on data quality, assumptions,
supplier-performance history, demand, inventory, logistics, and model
validation. Clearly label assumptions and simulated values. Do not
fabricate confidence or probability values unless a defined model
supports them.

------------------------------------------------------------------------

# 7. Dashboard and Page Requirements

## 7.1 Main Navigation

1.  Overview Dashboard.
2.  Customer Orders.
3.  Inventory Management.
4.  Procurement Management.
5.  Supplier Management.
6.  Supplier Negotiation.
7.  Counterfactual Negotiation Twin.
8.  AI Agent Monitor.
9.  Notifications.
10. Reports and Analytics.
11. Customer Feedback.
12. AI Assistant.
13. Settings and User Management.

## 7.2 Admin Dashboard

KPI cards may include total orders, pending orders, procurement
requests, active suppliers, low-stock items, pending quotations, pending
approvals, orders at risk, and on-time delivery rate---provided the data
exists.

Sections should include recent requests, inventory warnings, quotations,
negotiation activity, simulation results, agent tasks, and pending
approvals.

## 7.3 Procurement Dashboard

Show stock availability, shortages, required quantities, quotation
requests, supplier comparison, procurement cost, and expected material
arrival.

## 7.4 Supplier Portal

Show assigned quotation requests, submitted quotations, counteroffers,
purchase orders, and fulfillment status.

## 7.5 Customer Portal

Show the customer's orders, progress timeline, approved supplier
explanation, expected delivery date, relevant notifications, and
feedback form.

## 7.6 AI Agent Monitor

Show agent status, current task, latest output summary, timestamps,
failures, retries, and approval requirements. Do not expose secrets or
other users' confidential information in logs.

------------------------------------------------------------------------

# 8. Suggested Technology Stack

The Phase-I review document identifies Python, Pandas, Scikit-learn,
MySQL/PostgreSQL, an LLM/multi-agent framework, and FastAPI/Flask as
relevant implementation technologies.

For a one-day demonstrable web prototype, use one consistent stack:

-   **Frontend:** React + Vite + TypeScript + Tailwind CSS.
-   **Charts:** Recharts.
-   **Backend:** Python + FastAPI + Pydantic + SQLAlchemy.
-   **Database:** Choose either PostgreSQL or MySQL; do not maintain two
    databases unnecessarily.
-   **Data processing:** Pandas and NumPy where useful.
-   **Modeling:** Scikit-learn only for tasks where a model is actually
    trained and evaluated.
-   **LLM:** Ollama with a locally available LLaMA-compatible model.
-   **Deployment:** Docker Compose.
-   **Testing:** Pytest for backend and workflow tests.

This is a practical implementation recommendation. It is not a claim
that all these tools are already implemented in the submitted Phase-I
work.

------------------------------------------------------------------------

# 9. Suggested Database Entities

Use a normalized schema with primary keys, foreign keys, constraints,
timestamps, and indexes as appropriate.

-   `users`
-   `customers`
-   `suppliers`
-   `products`
-   `inventory`
-   `inventory_transactions`
-   `customer_orders`
-   `order_items`
-   `procurement_requests`
-   `procurement_items`
-   `quotations`
-   `quotation_items`
-   `negotiation_sessions`
-   `negotiation_messages`
-   `purchase_orders`
-   `purchase_order_items`
-   `production_plans`
-   `shipments`
-   `agent_tasks`
-   `agent_logs`
-   `simulation_runs`
-   `simulation_scenarios`
-   `notifications`
-   `customer_feedback`
-   `audit_logs`

For the first-day version, implement the smallest schema that supports
the complete demo workflow, then expand it without breaking
relationships.

------------------------------------------------------------------------

# 10. Suggested API Areas

Organize FastAPI routes by business function. Example route names:

-   `/api/auth`
-   `/api/users`
-   `/api/customers`
-   `/api/orders`
-   `/api/products`
-   `/api/inventory`
-   `/api/procurement`
-   `/api/suppliers`
-   `/api/quotations`
-   `/api/negotiations`
-   `/api/simulations`
-   `/api/purchase-orders`
-   `/api/shipments`
-   `/api/agents`
-   `/api/notifications`
-   `/api/feedback`
-   `/api/reports`
-   `/api/assistant`

Example operations:

-   Create and list orders.
-   Retrieve an order and its timeline.
-   Calculate inventory availability and shortages.
-   Create procurement requests.
-   Submit and compare quotations.
-   Create a negotiation counteroffer.
-   Run and retrieve a simulation.
-   Approve a supplier decision.
-   View agent status and task history.
-   Retrieve notifications.
-   Submit feedback.
-   Ask the AI assistant a question.

Validate all input, enforce role permissions, and return meaningful
errors. Final endpoint names should match the actual code.

------------------------------------------------------------------------

# 11. Non-Functional Requirements

## Performance and Usability

-   Keep the interface responsive on laptop and mobile screens.
-   Provide loading, empty, success, and error states.
-   Avoid unnecessary complexity in the first prototype.
-   Use pagination for larger tables.

## Security

-   Hash passwords.
-   Use environment variables for secrets.
-   Enforce authorization on the backend.
-   Validate file uploads.
-   Protect customer and supplier information.
-   Log sensitive actions.
-   Require approval for consequential supplier and purchase-order
    decisions.

## Data Integrity

-   Use database transactions for critical updates.
-   Validate quotation validity, quantity, capacity, and budget before
    approval.
-   Prevent duplicate orders and stock movements.
-   Keep audit trails for supplier decisions and inventory changes.

## AI Reliability

-   Treat LLM output as a suggestion, not authoritative business data.
-   Use deterministic backend calculations for cost, inventory, profit,
    and state transitions.
-   Validate structured AI output.
-   Handle model unavailability gracefully.
-   Clearly label estimates and assumptions.

## Transparency

-   Explain why a supplier was recommended.
-   Show trade-offs and risks.
-   Provide customer-facing explanations only for authorized
    information.
-   Compare predictions with actual outcomes when those outcomes are
    recorded.

------------------------------------------------------------------------

# 12. Data Requirements

The system may use synthetic demonstration data when real supplier data
is unavailable.

Suggested demo data: - Several customers and orders. - Several
products/materials. - At least five fictional suppliers. - Different
supplier prices, capacities, lead times, quality ratings, reliability,
and risk values. - Inventory with both sufficient stock and shortages. -
Multiple quotations for the same procurement request. - Negotiation
rounds and counteroffers. - Delivery-delay and demand-variation
scenarios. - Notifications and customer feedback.

The Phase-I review mentions a possible experimental case study with 20
suppliers and 1,000 negotiation scenarios. This is a proposed
experimental setup, not evidence that these experiments have already
been completed. Scale the dataset according to the available development
time and clearly report the actual experiment size.

Preprocessing may include: - Duplicate and noise removal. -
Missing-value validation. - Categorical encoding. - Numerical
normalization where required. - Validation of supplier, inventory,
demand, and logistics fields.

------------------------------------------------------------------------

# 13. Testing and Acceptance Criteria

A working prototype should pass the following end-to-end scenario.

1.  A customer submits an order for 100 units of a product.
2.  The system stores the order and notifies the Admin.
3.  The Supervisor Agent creates and assigns tasks.
4.  The Inventory Agent calculates available stock and shortage.
5.  The Procurement Agent creates a quotation request.
6.  Two suppliers submit quotations with different prices, quantities,
    and lead times.
7.  The supplier evaluation module ranks the offers.
8.  The Negotiation Agent suggests or records a counteroffer.
9.  The CNT compares at least two supplier scenarios.
10. The dashboard shows cost, delivery feasibility, risk, and estimated
    profit where the required inputs exist.
11. The Adaptive Decision module recommends Retain, Negotiate, or Switch
    and explains the reason.
12. The Customer Impact Agent identifies relevant delivery or
    availability changes.
13. An authorized Admin approves the selected supplier.
14. The system creates a purchase order without duplicating it.
15. The supplier receives an in-app notification.
16. The customer receives an appropriate status update.
17. The order can progress through material arrival, production,
    shipment, and delivery when those events are entered.
18. The customer can submit feedback.
19. The Admin can inspect agent logs and the order timeline.
20. The application continues to support core operations when Ollama is
    unavailable.

Test calculations, permissions, API validation, database updates, and
error states---not only the visual appearance.

------------------------------------------------------------------------

# 14. Current Progress Versus Planned Work

The following status summary is based on the uploaded Phase-I review
presentation.

## 14.1 Reported Phase-I Completed or Designed

-   Problem and research gap identified.
-   System architecture finalized.
-   Multi-agent workflow designed.
-   Supplier evaluation module designed/implemented, as described in the
    review.
-   Counterfactual Negotiation Twin designed.
-   Supplier comparison and adaptive decision logic developed.
-   Customer-impact workflow designed.
-   Literature survey and research gap.
-   Agent design.
-   Negotiation workflow.
-   Adaptive supplier decision framework.
-   Initial prototype.

**Important:** The presentation does not provide enough implementation
evidence to conclude that every feature is production-ready or fully
integrated. Verify each feature against the source code and test
results.

## 14.2 Phase-II Work Listed as Planned

-   Complete CNT implementation.
-   Large-scale experiments.
-   Comparison with baseline methods.
-   Prediction-accuracy validation.
-   Customer-impact testing.
-   Dashboard/API integration.
-   Final performance analysis.
-   Research paper and final documentation.

## 14.3 Additional Product Requirements from the User

The full web application should also include the following, subject to
implementation and testing:

-   Separate Admin, Customer, Procurement Manager, and Supplier portals.
-   End-to-end order intake and fulfillment timeline.
-   Inventory and stock movement management.
-   Supplier quotation portal.
-   Negotiation interface with Negotiate / Retain / Switch actions.
-   Interactive CNT simulation dashboard.
-   Backend-connected charts and reports.
-   Database-backed notifications.
-   Customer order tracking and feedback.
-   AI Agent Monitor.
-   Local LLaMA assistant through Ollama.
-   Docker Compose deployment.
-   Role-based access control.
-   Demo data and demo accounts.
-   End-to-end tests and setup instructions.

These additional product requirements should not be marked complete
until implemented and verified.

------------------------------------------------------------------------

# 15. One-Day Development Plan

The aim is to produce a demonstrable prototype, not to claim a fully
validated enterprise deployment in one day.

## Phase A --- Core Workflow

-   Inspect the current repository.
-   Create the frontend and backend structure.
-   Configure the database.
-   Implement authentication and roles.
-   Implement orders, products, inventory, and shortage calculations.
-   Add seed data.

## Phase B --- Supplier Workflow

-   Implement supplier profiles.
-   Implement quotation requests and supplier responses.
-   Implement quotation comparison.
-   Implement negotiation records and counteroffers.
-   Implement supplier approval and purchase-order creation.

## Phase C --- CNT Simulation

-   Implement deterministic scenario calculations.
-   Compare two or more suppliers.
-   Implement Retain / Negotiate / Switch modes.
-   Build charts using real simulation outputs.
-   Show assumptions, risk, delivery feasibility, and recommendation
    reasons.

## Phase D --- Multi-Agent and AI

-   Implement the Supervisor Agent and structured task records.
-   Add specialized agents as modular services/classes.
-   Add agent status and logs.
-   Integrate Ollama if the local model is available.
-   Add a rule-based fallback.

## Phase E --- Customer Transparency and Delivery

-   Implement role-specific notifications.
-   Implement customer tracking.
-   Implement customer impact summaries.
-   Implement feedback.
-   Add audit history.

## Phase F --- Final Verification

-   Run backend tests.
-   Run the end-to-end demo scenario.
-   Fix startup and integration issues.
-   Verify Docker Compose.
-   Write the README and list actual limitations.

If time runs short, preserve a complete, testable core workflow rather
than adding many agents that do not actually communicate.

------------------------------------------------------------------------

# 16. Definition of Done

The prototype can be described as end-to-end functional when:

-   Frontend pages retrieve and update backend data.
-   Database records persist after restarting the application.
-   Role-based permissions are enforced by the backend.
-   Inventory and procurement calculations are tested.
-   Supplier quotations can be submitted and compared.
-   CNT scenarios use defined calculations and real input records.
-   Retain / Negotiate / Switch choices are visible and explained.
-   Approval creates a consistent purchase order and audit entry.
-   Notifications are stored and visible to the correct roles.
-   Customer tracking reflects actual workflow status.
-   The AI assistant uses authorized application data when available.
-   The app has a fallback if the local LLM is unavailable.
-   Docker startup and setup instructions have been tested.
-   The README identifies completed, partial, and planned features
    honestly.

------------------------------------------------------------------------

# 17. Final Master Prompt for an AI Coding Tool

Copy the prompt below into the coding assistant you use. It combines the
academic project details, the user's workflow requirements,
implementation scope, and the need to report exactly what was built.

------------------------------------------------------------------------

## MASTER DEVELOPMENT PROMPT

You are a senior full-stack developer, AI engineer, multi-agent systems
architect, database engineer, UI/UX designer, tester, and DevOps
engineer.

Build a runnable web application for the project:

**"A Counterfactual Multi-Agent Framework for Adaptive Supplier
Negotiation and Customer-Aware Supply Chain Switching."**

Use the project specification in this Markdown file as the source of
truth. Preserve the central research concept: supplier evaluation,
multi-agent negotiation, Counterfactual Negotiation Twin (CNT), adaptive
Retain / Negotiate / Switch decisions, Customer Impact analysis,
customer transparency, and predicted-versus-actual performance feedback.

### A. First inspect, then implement

1.  Inspect the existing repository and available runtime.
2.  Identify files and modules that already exist.
3.  Reuse working code where appropriate.
4.  Do not overwrite useful work without checking it.
5.  Create a concise implementation plan, then immediately begin
    implementation.
6.  Do not stop after producing a plan, architecture diagram, or static
    UI.
7.  Run the application and tests where the environment permits.
8.  Fix errors discovered during testing.
9.  Report any operation that could not be completed because of a
    missing dependency, unavailable model, or environment limitation.

### B. Required application workflow

Implement this end-to-end process:

Customer submits a product request\
→ request is saved and assigned an order ID\
→ Admin is notified\
→ Supervisor Agent assigns workflow tasks\
→ Inventory Agent calculates stock availability and shortage\
→ Procurement Agent creates procurement requirements\
→ Supplier portal receives quotation requests\
→ Suppliers submit quotations\
→ Supplier evaluation compares price, quality, delivery, capacity,
reliability, and risk\
→ Negotiation Agent supports offers and counteroffers\
→ CNT simulates alternative supplier agreements and disruption
scenarios\
→ Adaptive Decision module recommends Retain / Negotiate / Switch\
→ Customer Impact Agent assesses delivery, availability, quality, and
service effects\
→ authorized Admin reviews and approves the decision\
→ purchase order is created\
→ supplier and relevant internal users receive notifications\
→ customer sees an authorized status update and explanation\
→ material, production, shipment, and delivery progress are recorded\
→ customer submits feedback\
→ actual performance is compared with predictions when actual results
become available.

### C. Required roles and pages

Implement role-based access for Admin, Customer, Procurement Manager,
and Supplier.

Provide: - Login and role-based dashboard. - Customer order intake and
tracking. - Inventory and stock movement management. - Procurement
requirement and shortage reports. - Supplier profiles and quotation
management. - Supplier negotiation. - Counterfactual Negotiation Twin
simulation. - AI Agent Monitor. - Notifications. - Reports and
analytics. - Customer feedback. - Role-aware AI Assistant. - Settings
and user management.

Every important page must use the backend. Avoid dead buttons,
decorative-only controls, and fake success messages.

### D. Multi-agent implementation

Create a centralized Supervisor Agent and modular specialized agents
for: - Customer request analysis. - Inventory. - Procurement / Buyer. -
Supplier communication. - Negotiation. - Logistics. - Risk. -
Counterfactual simulation. - Adaptive supplier decision. - Customer
impact. - Notifications. - Reporting.

Use structured, validated input and output. Record task IDs, statuses,
timestamps, outputs, and errors. Implement dependency handling, retries,
and duplicate-operation protection.

Do not create multiple agents that merely have different names but do no
separate work. Each implemented agent must have a defined responsibility
and produce an observable result.

### E. CNT and decision logic

Implement deterministic backend calculations for stock, costs, delivery
estimates, risk scoring, and supplier comparison.

Compare alternative suppliers and candidate agreements under scenarios
such as: - Price counteroffer. - Demand variation. - Supplier delay. -
Transportation disruption. - Inventory shortage. - Reduced supplier
capacity.

Display total estimated cost, material availability, expected arrival,
delivery feasibility, deadline variance, risk, and estimated profit when
revenue and cost inputs exist.

Build interactive charts from actual simulation results. Label
assumptions and simulated values clearly. Do not invent measured
accuracy, confidence, or performance improvements.

The decision module must recommend Retain, Negotiate, or Switch with
reasons and trade-offs. Require authorized approval before committing a
supplier decision.

### F. Customer impact and transparency

Before finalizing a supplier switch, assess possible changes to
delivery, availability, quality, and service.

Notify the customer when appropriate, using only information authorized
for customer access. Provide a clear explanation of important changes.
Keep confidential quotations, internal negotiation limits, and other
customers' records private.

### G. AI assistant and local LLaMA

Integrate Ollama with a configurable locally available LLaMA-compatible
model.

Use the LLM for language understanding, report summaries, explanations,
and negotiation suggestions. Retrieve operational facts through
authorized backend functions. Never rely on generated text alone for
financial calculations, stock updates, approvals, or order status.

Provide a fallback when Ollama or the model is unavailable. Do not claim
the model is working unless a real connection test succeeds. Do not
assume a model download is instantaneous.

### H. Technology and deployment

Use a consistent practical stack: - React + Vite + TypeScript. -
Tailwind CSS. - Recharts. - FastAPI. - Pydantic and SQLAlchemy. - One
selected database: PostgreSQL or MySQL. - Pandas / NumPy where useful. -
Scikit-learn only where an actual model is implemented and evaluated. -
Ollama for local LLM integration. - Docker Compose.

Create environment examples, database initialization or migrations, seed
data, Dockerfiles, Docker Compose configuration, tests, and README
instructions.

### I. Data, testing, and safety

Use fictional demo data if real supplier data is unavailable and label
it as synthetic.

Test: - Authentication and authorization. - Order creation. - Inventory
availability and shortages. - Quotation submission. - Supplier
comparison. - Negotiation state changes. - CNT calculations. -
Customer-impact results. - Supplier approval and purchase-order
creation. - Notification visibility. - Feedback submission. -
LLM-unavailable fallback. - Complete end-to-end order flow.

Protect secrets and private data. Use database transactions and
idempotency checks for purchase orders and inventory movements. Do not
expose confidential records across roles.

### J. Required deliverables

Create or update: 1. Frontend source code. 2. Backend source code. 3.
Database schema/models and initialization. 4. Agent implementations and
Supervisor orchestration. 5. Supplier quotation and negotiation
workflows. 6. CNT simulation engine. 7. Adaptive decision logic. 8.
Customer-impact logic. 9. Role-based dashboards. 10. Charts,
notifications, reports, and feedback. 11. Local LLaMA integration and
fallback. 12. Docker configuration. 13. Seed/demo data and demo
accounts. 14. Automated tests. 15. README with exact setup, startup,
shutdown, model setup, and demo steps. 16. A final implementation
report.

### K. Mandatory final implementation report

After implementing and testing the project, create
`IMPLEMENTATION_REPORT.md` and include:

1.  **Executive Summary:** What the application does.
2.  **Requirements Covered:** A checklist mapping each user requirement
    to the implemented feature.
3.  **Architecture Implemented:** Actual frontend, backend, database,
    agents, CNT, LLM, and deployment components.
4.  **Files Created or Modified:** List the main files and their
    purposes.
5.  **Features Completed:** Only features that exist in the code and
    were verified.
6.  **Features Partially Completed:** State what works and what remains.
7.  **Features Not Implemented:** Be explicit.
8.  **Agent Responsibilities:** Describe what each agent actually does
    and how it communicates.
9.  **CNT Method:** Explain the implemented scenario inputs,
    calculations, assumptions, and decision logic.
10. **Database:** List the actual tables and key relationships.
11. **API:** List the actual endpoints and their purposes.
12. **UI Pages:** List the real pages and functional actions.
13. **Testing Results:** Show tests executed, passed, failed, and not
    run. Never invent test results.
14. **Demo Walkthrough:** Give a repeatable step-by-step demonstration
    using the seeded data.
15. **Run Instructions:** Provide exact commands for this repository and
    environment.
16. **LLM Status:** State whether Ollama is connected, which model is
    configured, and what fallback works.
17. **Known Limitations:** Include synthetic data, lack of external
    supplier integration, simulation assumptions, or other real
    limitations.
18. **Phase-I / Phase-II Mapping:** Separate the work described as
    completed or designed in the Phase-I review from the planned work
    and newly implemented application features.
19. **Next Steps:** Prioritize remaining work.

Also create or update `README.md` so another student can run the
application without guessing.

For every requirement, use one of these honest statuses: - **Implemented
and tested** - **Implemented, not yet fully tested** - **Partially
implemented** - **Not implemented** - **Blocked by environment**

Do not claim a feature is completed merely because its UI exists. Verify
its backend behavior. Do not claim an experiment, accuracy, external
supplier integration, model connection, or test result unless it
actually happened.

Start by inspecting the repository, then build the highest-priority
working end-to-end workflow. Continue through implementation, execution,
testing, and documentation. The final result must be a runnable
prototype, not just a plan.

------------------------------------------------------------------------

# 18. Final Reporting Checklist

Before presenting the finished project, answer these questions in the
implementation report:

-   What did we build?
-   Which user requirements are satisfied?
-   Which requirements are partially satisfied?
-   What is the actual role of the Supervisor Agent?
-   What does each specialized agent do?
-   How are agents coordinated?
-   How are inventory shortages calculated?
-   How are supplier quotations compared?
-   What scenarios does the CNT simulate?
-   How is Retain / Negotiate / Switch selected?
-   How is customer impact assessed?
-   What information can each role see?
-   Does the AI assistant use real backend data?
-   Does the application work if the local LLM is unavailable?
-   Which database tables and APIs are implemented?
-   Which charts use actual calculated data?
-   What tests were run, and what were the results?
-   How can a reviewer run the complete demonstration?
-   What is still incomplete?
-   What should be implemented next?

This final report must describe the actual code and test evidence, not
the intended design alone.

Supervisor Agent — Coordinates all agents and manages the workflow.
Buyer Agent — Defines procurement requirements and buyer objectives.
Supplier Agent — Handles supplier information, offers, and responses.
Price Analysis Agent — Evaluates prices, costs, and price competitiveness.
Risk Assessment Agent — Identifies and evaluates supplier and supply-chain risks.
Logistics Agent — Evaluates delivery time, transportation, and logistics constraints.
AI Negotiation Agent — Manages offers, counteroffers, negotiation rounds, and constraints.
Decision Agent — Recommends RETAIN, NEGOTIATE, or SWITCH.
Customer Impact Agent — Evaluates the impact of supplier decisions on customer orders and service level

this are the agent list where use in this project.