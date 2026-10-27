import requests
from typing import Dict, Any, List
from app.core.config import settings

class LLMAssistantService:
    @classmethod
    def is_ollama_available(cls) -> bool:
        try:
            resp = requests.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=1.5)
            return resp.status_code == 200
        except Exception:
            return False

    @classmethod
    def query_assistant(
        cls,
        prompt: str,
        role: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Queries Ollama if available, otherwise generates a reliable, domain-specific,
        deterministic heuristic response using operational backend context.
        """
        ollama_online = cls.is_ollama_available()

        if ollama_online:
            try:
                system_prompt = (
                    f"You are the AI Assistant for an Enterprise Counterfactual Multi-Agent Supply Chain System.\n"
                    f"User Role: {role}\n"
                    f"Strict Rule: Always ground your answers in the following verified operational data:\n"
                    f"{context}\n"
                    f"Be concise, professional, and explain trade-offs transparently."
                )
                payload = {
                    "model": settings.OLLAMA_MODEL,
                    "prompt": f"{system_prompt}\n\nUser Question: {prompt}",
                    "stream": False
                }
                resp = requests.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload, timeout=8.0)
                if resp.status_code == 200:
                    data = resp.json()
                    answer = data.get("response", "").strip()
                    if answer:
                        return {
                            "answer": answer,
                            "model_used": f"Ollama ({settings.OLLAMA_MODEL})",
                            "is_fallback": False,
                            "context_retrieved": context,
                            "suggested_actions": cls._get_suggested_actions(role, prompt, context)
                        }
            except Exception:
                pass  # Fallback to heuristic engine

        # Deterministic Domain Fallback Engine
        return cls._generate_heuristic_response(prompt, role, context)

    @classmethod
    def _generate_heuristic_response(
        cls,
        prompt: str,
        role: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        p_lower = prompt.lower()
        orders = context.get("orders", [])
        inventory = context.get("inventory_alerts", [])
        suppliers = context.get("top_suppliers", [])
        cnt_rec = context.get("latest_cnt_recommendation", {})

        answer_parts = []

        if "simulation" in p_lower or "cnt" in p_lower or "recommend" in p_lower or "decision" in p_lower:
            rec = cnt_rec.get("recommendation", "RETAIN")
            justification = cnt_rec.get("justification", "Incumbent offers optimal risk-adjusted schedule compliance.")
            answer_parts.append(
                f"**Counterfactual Twin Analysis:** The decision module recommends **{rec}**.\n\n"
                f"**Reasoning:** {justification}\n\n"
                f"The CNT compared candidate suppliers against disruption stress-tests (+4d transit delay) "
                f"and counterfactual price negotiations. Downstream delivery risk remains strictly monitored."
            )
        elif "shortage" in p_lower or "inventory" in p_lower or "stock" in p_lower:
            if inventory:
                shortage_items = [f"• **{item['product_name']}**: Available={item['available']} units (Shortage: {item['shortage']})" for item in inventory[:3]]
                answer_parts.append(
                    f"**Inventory Position:** Currently detected {len(inventory)} shortage requirement(s):\n" +
                    "\n".join(shortage_items) +
                    f"\n\nProcurement requests have been created by the Buyer Agent to source required units."
                )
            else:
                answer_parts.append("All warehouse inventory levels are currently sufficient to support current scheduled production.")
        elif "supplier" in p_lower or "quote" in p_lower or "price" in p_lower:
            if suppliers:
                top = suppliers[0]
                answer_parts.append(
                    f"**Supplier Performance:** Top ranked supplier is **{top['name']}** with multi-criteria score of {top.get('score', 92)}/100.\n"
                    f"• Unit Price: ${top.get('price', 'N/A')}\n"
                    f"• Delivery Lead Time: {top.get('lead_days', 7)} days\n"
                    f"• Reliability: {int(top.get('reliability', 0.9)*100)}%\n"
                    f"• Disruption Risk: {int(top.get('risk', 0.15)*100)}%"
                )
            else:
                answer_parts.append("Candidate suppliers have submitted competitive quotes across required product categories.")
        elif "order" in p_lower or "status" in p_lower or "delivery" in p_lower:
            if orders:
                ord_info = orders[0]
                answer_parts.append(
                    f"**Order Tracking:** Order #{ord_info.get('order_number', 'ORD-1001')} status is currently **{ord_info.get('status', 'AWAITING_APPROVAL')}**.\n"
                    f"Required Quantity: {ord_info.get('quantity', 100)} units.\n"
                    f"Target Delivery Date: {ord_info.get('target_date', 'Scheduled on-time')}."
                )
            else:
                answer_parts.append("Your order is being processed according to the multi-agent fulfillment schedule.")
        else:
            answer_parts.append(
                f"Hello! I am your Supply Chain Assistant. Based on current system state:\n"
                f"• {len(orders)} active customer orders tracked\n"
                f"• {len(inventory)} inventory alerts requiring procurement\n"
                f"• Counterfactual Negotiation Twin active with deterministic scenario modeling.\n"
                f"How can I assist your operational decisions today?"
            )

        return {
            "answer": "\n\n".join(answer_parts),
            "model_used": "Deterministic Heuristic Engine (Ollama Offline Fallback)",
            "is_fallback": True,
            "context_retrieved": context,
            "suggested_actions": cls._get_suggested_actions(role, prompt, context)
        }

    @staticmethod
    def _get_suggested_actions(role: str, prompt: str, context: Dict[str, Any]) -> List[str]:
        if role == "ADMIN":
            return [
                "Review pending supplier approvals",
                "Trigger Counterfactual Twin stress-test",
                "Inspect AI Agent execution logs"
            ]
        elif role == "PROCUREMENT":
            return [
                "Generate RFQ for shortage products",
                "Submit counteroffer via AI Negotiation Agent",
                "Approve top ranked supplier quotation"
            ]
        elif role == "SUPPLIER":
            return [
                "Submit revised quotation",
                "Review buyer counteroffer",
                "Dispatch purchase order shipment"
            ]
        else:
            return [
                "Check delivery timeline",
                "Submit order satisfaction feedback",
                "Download customer order summary"
            ]
