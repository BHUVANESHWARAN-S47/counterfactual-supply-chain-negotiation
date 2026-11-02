/**
 * Formats a numeric value into Indian Rupee (INR) representation.
 * Examples:
 *   formatINR(12500) -> "₹12,500"
 *   formatINR(152600000) -> "₹15.26 Cr" or "₹15,26,00,000"
 */
export const formatINR = (
  amount: number | string | undefined | null,
  options?: { compact?: boolean; decimals?: number }
): string => {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  if (options?.compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(options.decimals ?? 1)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(options.decimals ?? 1)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(options.decimals ?? 1)}k`;
    }
  }

  const fractionDigits = options?.decimals !== undefined ? options.decimals : (num % 1 !== 0 ? 2 : 0);
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
};

export const formatINRUnit = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || amount === '') return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toFixed(2)}`;
};
