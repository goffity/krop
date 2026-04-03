/**
 * Format number with commas: 1200000 → "1,200,000"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/**
 * Format number string for display in input: "1200000" → "1,200,000"
 * Preserves decimal point while typing
 */
export function formatInputNumber(raw: string): string {
  if (!raw) return '';
  const parts = raw.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return `${intPart}.${parts[1]}`;
  }
  return intPart;
}

/**
 * Parse formatted number back to raw: "1,200,000" → "1200000"
 */
export function parseInputNumber(formatted: string): string {
  return formatted.replace(/,/g, '');
}

/**
 * Format currency: 1200000 → "฿1,200,000"
 */
export function formatCurrency(n: number): string {
  return `฿${formatNumber(n)}`;
}
