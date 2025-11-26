/**
 * Shared utility functions for Finance Planning components
 */

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number, options?: { fractionDigits?: number }) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: options?.fractionDigits ?? 1,
    maximumFractionDigits: options?.fractionDigits ?? 1,
  }).format(value / 100);

export const formatPercentSigned = (value: number, fractionDigits = 1) => {
  const formatted = Math.abs(value).toFixed(fractionDigits);
  return `${value >= 0 ? '+' : '-'}${formatted}%`;
};

