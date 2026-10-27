import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toUpperCase()) {
      // Semantic Green: Pass / Completed / Success
      case 'COMPLETED':
      case 'DELIVERED':
      case 'APPROVED':
      case 'HEALTHY':
      case 'AGREED':
      case 'BINDING':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';

      // Semantic Red: Alert / Critical / Shortage / Failed
      case 'CRITICAL_SHORTAGE':
      case 'FAILED':
      case 'HIGH':
      case 'CRITICAL':
      case 'CANCELLED':
      case 'SLA_BREACH':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-bold';

      // Semantic Amber: Warning / Under Evaluation / Action Required
      case 'NEGOTIATE':
      case 'AWAITING_APPROVAL':
      case 'REQUIRES_APPROVAL':
      case 'LOW_STOCK':
      case 'MEDIUM':
      case 'COUNTERED':
      case 'WARNING':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';

      // Brand Berry Wine: Neutral active, strategic decisions
      case 'RETAIN':
      case 'SWITCH':
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'RUNNING':
      case 'ACTIVE':
      default:
        return 'bg-[#fdf2f8] text-[#8e3a59] border-[#d2b0bd] font-semibold';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border shadow-2xs ${getBadgeStyle(
        status
      )}`}
    >
      {formatText(status)}
    </span>
  );
};
