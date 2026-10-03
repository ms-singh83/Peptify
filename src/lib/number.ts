/**
 * Parse a user-typed decimal. Accepts "1.5", "1,5" (EU keyboards), ".5".
 * Returns null for empty or invalid input.
 */
export function parseDecimal(input: string): number | null {
  const s = input.trim().replace(',', '.');
  if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
