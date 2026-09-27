/**
 * Utility functions for currency, numbers, and string formatting.
 */

/**
 * Formats a numeric value into an Indian Rupee currency string.
 * Example: 120000 -> "₹1,20,000"
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Formats a number with sign (+ or -) in INR.
 * Example: 15000 -> "+₹15,000", -5000 -> "-₹5,000"
 */
export function formatSignedINR(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}₹${Math.abs(Math.round(amount)).toLocaleString('en-IN')}`;
}

/**
 * Formats a percentage value.
 * Example: 24.56 -> "24.6%"
 */
export function formatPercentage(val: number | null | undefined, decimals: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '0%';
  }
  return `${Number(val.toFixed(decimals))}%`;
}

/**
 * Formats a short currency abbreviation (e.g. ₹45k).
 */
export function formatShortINR(amount: number): string {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${Math.round(amount / 1000)}k`;
  }
  return `₹${Math.round(amount)}`;
}
