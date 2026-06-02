export const ASSET_COLORS = [
  '#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF2D55',
  '#AF52DE', '#5AC8FA', '#FFCC00', '#FF3B30', '#30B0C7',
];

export function assetColorMap(allAssets: string[]): Record<string, string> {
  const sorted = [...allAssets].sort();
  const map: Record<string, string> = {};
  sorted.forEach((a, i) => { map[a] = ASSET_COLORS[i % ASSET_COLORS.length]; });
  return map;
}
