import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toUpperCase()) {
      // Success Green
      case 'COMPLETED':
      case 'DELIVERED':
      case 'APPROVED':
      case 'HEALTHY':
      case 'AGREED':
      case 'BINDING':
      case 'ON_TIME':
      case 'ON-TIME':
        return 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0] font-bold';

      // Error / Critical Red
      case 'CRITICAL_SHORTAGE':
      case 'FAILED':
      case 'HIGH':
      case 'CRITICAL':
      case 'CANCELLED':
      case 'SLA_BREACH':
      case 'DELAYED':
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] font-bold';

      // Warning Orange
      case 'NEGOTIATE':
      case 'AWAITING_APPROVAL':
      case 'REQUIRES_APPROVAL':
      case 'LOW_STOCK':
      case 'MEDIUM':
      case 'COUNTERED':
      case 'WARNING':
      case 'AT_RISK':
        return 'bg-[#FFF7ED] text-[#F59E0B] border-[#FED7AA] font-bold';

      // Purple AI / Counterfactual Decisions
      case 'SWITCH':
      case 'CNT_OPTIMIZED':
      case 'AI_RECOMMENDED':
      case 'SIMULATED':
        return 'bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF] font-bold';

      // Primary Blue: Active Operations
      case 'RETAIN':
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'RUNNING':
      case 'ACTIVE':
      case 'SUBMITTED':
      case 'PENDING':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE] font-semibold';

      default:
        return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB] font-medium';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getBadgeStyle(
        status
      )}`}
    >
      {formatText(status)}
    </span>
  );
};
