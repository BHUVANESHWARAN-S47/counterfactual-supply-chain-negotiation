import re
import json
from typing import Dict, Any, List, Optional
from app.services.llm_service import CentralizedLLMService
from app.services.assistant_tools import AssistantDataTools

class LLMAssistantService:
    """
    Intelligent Conversational AI Assistant Engine for Nexora Supply Chain System.
    Connects to Centralized LLM (Groq LLaMA 3.3 70B -> Groq 8B -> Ollama -> Deterministic Business Fallback),
    strictly grounded in verified database retrieval and role-scoped permissions.
    """

    @classmethod
    def get_engine_status(cls) -> Dict[str, Any]:
        health = CentralizedLLMService.health_check()
        active = health.get("active_provider", "heuristic_fallback")
        return {
            "ai_active": True,
            "active_provider_type": active,
            "groq_ready": health.get("groq", {}).get("configured", False),
            "ollama_connected": health.get("ollama", {}).get("connected", False),
            "fallback_available": True,
            "status": "OPERATIONAL"
        }

    @classmethod
    def query_assistant(
        cls,
        prompt: str,
        role: str,
        context: Dict[str, Any],
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Coordinates intent classification, LLM inference, and deterministic business fallbacks.
        Guarantees zero repetitive generic responses and natural business language.
        """
        p_clean = prompt.strip().lower()

        # 1. Direct Greeting Recognition (Does NOT trigger fake telemetry)
        is_greeting = bool(re.match(r"^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings|howdy|hi\s*there)[!.,\s]*$", p_clean))
        if is_greeting:
            greeting_text = (
                "Hi! I can help you check orders, review supplier quotations, track purchasing tasks, "
                "and understand supply chain reports. What would you like to know?"
            )
            return {
                "answer": greeting_text,
                "model_used": "AI Assistant",
                "is_fallback": False,
                "context_retrieved": {},
                "suggested_actions": cls._get_suggested_actions(role, prompt, context)
            }

        # 2. Check if LLM provider is active (Groq configured or Ollama connected)
        engine_status = cls.get_engine_status()
        llm_connected = engine_status.get("groq_ready") or engine_status.get("ollama_connected")

        answer: str = ""
        is_fallback = not llm_connected

        if llm_connected:
            system_prompt = (
                f"You are the Nexora AI Assistant for an Enterprise Supply Chain Management System.\n"
                f"Current User Role: {role}\n"
                f"Style & Communication Guidelines:\n"
                f"1. Use simple, familiar business language. Never use academic jargon like 'counterfactual neural twin', 'telemetry', or 'domain engine'.\n"
                f"2. Answer the user's specific intent directly and concisely.\n"
                f"3. Strictly base your answers on this verified operational database context:\n"
                f"{json.dumps(context, default=str)}\n"
                f"4. If no records match or data is unavailable, state that honestly without inventing numbers or dates.\n"
                f"5. Maintain context for follow-up questions (such as supplier price vs lead time comparisons).\n"
                f"6. State amounts in INR (₹) and lead times in days.\n"
                f"7. Role Access Control: Never reveal competitor quotes to Suppliers, and never reveal confidential purchasing/supplier negotiations to Customers."
            )

            try:
                llm_res = CentralizedLLMService.generate(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    max_tokens=650,
                    temperature=0.2,
                    history=history
                )
                if llm_res.content and not llm_res.is_fallback:
                    answer = llm_res.content.strip()
                    is_fallback = False
            except Exception:
                is_fallback = True

        # 3. Dynamic Deterministic Business Engine (When LLM is offline or returns fallback)
        if not answer:
            answer = cls._generate_business_response(prompt, role, context, history)
            is_fallback = True

        return {
            "answer": answer,
            "model_used": "AI Assistant",
            "is_fallback": is_fallback,
            "context_retrieved": context,
            "suggested_actions": cls._get_suggested_actions(role, prompt, context)
        }

    @classmethod
    def _generate_business_response(
        cls,
        prompt: str,
        role: str,
        context: Dict[str, Any],
        history: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Generates genuine, helpful, natural business responses directly from retrieved DB records.
        Covers all required prompt scenarios with precise data formatting.
        """
        p_lower = prompt.lower()

        # Scenario A: Pending Approvals
        if "pending_approvals" in context:
            approvals_data = context["pending_approvals"]
            approvals = approvals_data.get("approvals", [])
            total = len(approvals)

            if total == 0:
                return "There are currently no supplier decisions waiting for your approval."

            req_list = ", ".join([a["order_number"] for a in approvals[:3]])
            lines = [
                f"There are **{total} supplier decision{'s' if total > 1 else ''} waiting for approval**. The request{'s are' if total > 1 else ' is'} **{req_list}**."
            ]
            for a in approvals[:3]:
                lines.append(
                    f"• **Order #{a['order_number']}** ({a['product_name']}): "
                    f"Recommended supplier **{a['recommended_supplier']}** at {a['estimated_unit_price']}/unit "
                    f"(Total: {a['total_estimated_cost']}). Delivery target: {a['target_delivery_date']}."
                )
            lines.append("\nWould you like to review and approve them on the **Waiting for Approval** page?")
            return "\n".join(lines)

        # Scenario B: Inventory Shortages
        if "inventory" in context:
            inv_data = context["inventory"]
            items = inv_data.get("inventory", [])
            shortages = [i for i in items if i.get("is_shortage")]

            if not shortages:
                return "All warehouse inventory levels are currently above minimum safety thresholds."

            lines = [
                f"We identified **{len(shortages)} inventory item(s) below required stock levels**:"
            ]
            for item in shortages[:4]:
                lines.append(
                    f"• **{item['product_name']}** (SKU: {item['sku']}): "
                    f"Available: **{item['available']} units** | Minimum buffer: {item['required_minimum']} units "
                    f"(Shortage: **{item['shortage']} units** — Status: **{item['urgency']}**)"
                )
            lines.append("\nPurchase requests have been queued to replenish required buffer stock.")
            return "\n".join(lines)

        # Scenario C: Supplier Comparison & Follow-up questions (Cheaper vs Delivery Time)
        if "supplier_comparison" in context:
            comp = context["supplier_comparison"]
            if not comp.get("order_found"):
                return comp.get("notice", "No active order quotations found for comparison.")

            candidates = comp.get("candidates", [])
            order_num = comp.get("order_number", "the active order")
            prod_name = comp.get("product_name", "Components")

            # Check if this is a follow-up asking about delivery time / speed
            is_delivery_followup = any(w in p_lower for w in ["delivery", "time", "lead", "fast", "speed", "days", "when"])
            # Check if this is asking about cheaper / price
            is_price_inquiry = any(w in p_lower for w in ["cheap", "cheaper", "price", "cost", "lowest"])

            if is_delivery_followup and not is_price_inquiry:
                fastest = comp.get("fastest_supplier")
                lead_days = comp.get("fastest_lead_days")
                lines = [
                    f"For **Order #{order_num}** ({prod_name}), **{fastest}** offers the fastest delivery time of **{lead_days} days**."
                ]
                for c in candidates:
                    lines.append(f"• **{c['supplier_name']}**: {c['lead_days']} days lead time (Unit Price: ₹{c['unit_price']:,.2f})")
                return "\n".join(lines)

            if is_price_inquiry:
                cheapest = comp.get("cheapest_supplier")
                cheapest_price = comp.get("cheapest_price")
                lines = [
                    f"For **Order #{order_num}** ({prod_name}), **{cheapest}** is the cheapest option at **{cheapest_price}** per unit."
                ]
                for c in candidates:
                    lines.append(f"• **{c['supplier_name']}**: ₹{c['unit_price']:,.2f} / unit (Lead time: {c['lead_days']} days)")
                return "\n".join(lines)

            # General comparison
            lines = [
                f"Here is the supplier comparison for **Order #{order_num}** ({prod_name}):"
            ]
            for c in candidates:
                lines.append(
                    f"• **{c['supplier_name']}**: ₹{c['unit_price']:,.2f} / unit | {c['lead_days']} days lead time | "
                    f"{c['reliability_pct']}% on-time rating"
                )
            lines.append(
                f"\n**Recommendation:** **{comp.get('cheapest_supplier')}** offers the best price ({comp.get('cheapest_price')}), "
                f"while **{comp.get('fastest_supplier')}** provides the shortest delivery time ({comp.get('fastest_lead_days')} days)."
            )
            return "\n".join(lines)

        # Scenario D: Purchase Orders
        if "purchase_orders" in context:
            po_data = context["purchase_orders"]
            pos = po_data.get("purchase_orders", [])
            if not pos:
                return (
                    "I couldn't find any purchase orders available to your account. "
                    "You can create a purchase request or change your search filters."
                )

            lines = [f"You have **{len(pos)} purchase order(s)** recorded:"]
            for po in pos[:3]:
                supplier_info = f" from **{po['supplier_name']}**" if "supplier_name" in po else ""
                lines.append(
                    f"• **PO #{po['po_number']}**{supplier_info}: "
                    f"{po['quantity']} units for {po['total_amount']} | Status: **{po['status']}** "
                    f"(Expected Delivery: {po['expected_delivery_date']})"
                )
            return "\n".join(lines)

        # Scenario E: Order Tracking
        if "orders" in context:
            ord_data = context["orders"]
            orders = ord_data.get("orders", [])
            if not orders:
                return "I couldn't find any orders matching your request. Please verify the order number."

            lines = [f"Found **{len(orders)} order(s)**:"]
            for o in orders[:3]:
                delay_str = " (Delayed)" if o.get("is_delayed") else " (On Schedule)"
                lines.append(
                    f"• **Order #{o['order_number']}** ({o['product_name']}): "
                    f"Status is **{o['status']}**{delay_str}. "
                    f"Expected delivery: **{o['target_delivery_date']}**."
                )
            return "\n".join(lines)

        # Default fallback: Concise, professional response based on role
        if role == "CUSTOMER":
            return "I can help you track your shipments, view delivery schedules, and check order statuses. How can I assist you today?"
        elif role == "SUPPLIER":
            return "I can help you check active purchase orders, review quotation requests, and verify delivery lead times. What would you like to review?"
        else:
            return "I can help you track customer orders, compare supplier quotations, review pending approvals, and check inventory stock. What would you like to know?"

    @staticmethod
    def _get_suggested_actions(role: str, prompt: str, context: Dict[str, Any]) -> List[str]:
        if role == "ADMIN":
            return [
                "Which decisions need approval?",
                "Show suppliers that need attention.",
                "Summarize recent system issues."
            ]
        elif role == "PROCUREMENT":
            return [
                "Which requests need suppliers?",
                "Compare quotations for an order.",
                "Show inventory shortages.",
                "Explain the latest supplier recommendation."
            ]
        elif role == "SUPPLIER":
            return [
                "Which quotation requests need my response?",
                "Show my open purchase orders.",
                "Which deliveries need an update?"
            ]
        else:
            return [
                "Track my order.",
                "Show my recent orders.",
                "When is my next delivery expected?"
            ]
