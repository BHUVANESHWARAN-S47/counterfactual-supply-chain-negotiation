from typing import List, Dict, Any

class SupplierEvaluator:
    # Default weights totaling 1.0
    WEIGHTS = {
        "price": 0.30,
        "lead_time": 0.20,
        "quality": 0.20,
        "reliability": 0.15,
        "risk": 0.15
    }

    @classmethod
    def evaluate_quotations(cls, quotations: List[Dict[str, Any]], required_quantity: int) -> List[Dict[str, Any]]:
        """
        Calculates multi-criteria normalized weighted score for quotations.
        Returns sorted list with score and rank.
        """
        if not quotations:
            return []

        # Find min and max bounds for normalization
        prices = [q["unit_price"] for q in quotations]
        lead_times = [q["delivery_lead_days"] for q in quotations]

        min_price = min(prices) if prices else 1.0
        max_price = max(prices) if prices else 1.0
        min_lead = min(lead_times) if lead_times else 1
        max_lead = max(lead_times) if lead_times else 1

        evaluated = []
        for q in quotations:
            price = q["unit_price"]
            lead = q["delivery_lead_days"]
            quality = q.get("quality_rating", 4.0)  # scale 1-5
            reliability = q.get("reliability_score", 0.85)  # scale 0-1
            risk = q.get("risk_score", 0.20)  # scale 0-1 (lower is better)
            offered_qty = q.get("offered_quantity", required_quantity)

            # Price score (lower is better: min_price / price)
            price_score = (min_price / price) if price > 0 else 1.0

            # Lead time score (lower is better: min_lead / lead)
            lead_score = (min_lead / lead) if lead > 0 else 1.0

            # Quality normalized (1 to 5 -> 0.2 to 1.0)
            quality_score = min(1.0, max(0.0, quality / 5.0))

            # Reliability (0.0 to 1.0)
            rel_score = min(1.0, max(0.0, reliability))

            # Risk score (inverted: 1.0 - risk)
            risk_score = min(1.0, max(0.0, 1.0 - risk))

            # Capacity compliance penalty if offered < required
            capacity_multiplier = min(1.0, offered_qty / required_quantity) if required_quantity > 0 else 1.0

            weighted_sum = (
                cls.WEIGHTS["price"] * price_score +
                cls.WEIGHTS["lead_time"] * lead_score +
                cls.WEIGHTS["quality"] * quality_score +
                cls.WEIGHTS["reliability"] * rel_score +
                cls.WEIGHTS["risk"] * risk_score
            ) * capacity_multiplier

            total_score = round(weighted_sum * 100, 2)

            item = dict(q)
            item["total_score"] = total_score
            item["score_breakdown"] = {
                "price_score": round(price_score * 100, 1),
                "lead_time_score": round(lead_score * 100, 1),
                "quality_score": round(quality_score * 100, 1),
                "reliability_score": round(rel_score * 100, 1),
                "risk_score": round(risk_score * 100, 1),
                "capacity_multiplier": round(capacity_multiplier, 2)
            }
            evaluated.append(item)

        # Sort descending by total_score
        evaluated.sort(key=lambda x: x["total_score"], reverse=True)
        for idx, item in enumerate(evaluated):
            item["rank"] = idx + 1

        return evaluated
