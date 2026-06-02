/** Compact USD-magnitude formatter: 1_250_000 → "1.25M", 3400 → "3.4k", 12.5 → "12.50". */
export function formatCompact(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toFixed(2);
}
