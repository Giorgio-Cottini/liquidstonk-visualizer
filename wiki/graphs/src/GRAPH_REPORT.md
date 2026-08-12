# Graph Report - .  (2026-06-16)

## Corpus Check
- Corpus is ~9,006 words - fits in a single context window. You may not need a graph.

## Summary
- 61 nodes · 113 edges · 8 communities (7 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6

## God Nodes (most connected - your core abstractions)
1. `BacktestResult` - 11 edges
2. `useTheme()` - 7 edges
3. `parseBacktestResult()` - 7 edges
4. `PnlChart()` - 5 edges
5. `formatCompact()` - 5 edges
6. `PositionsChart()` - 4 edges
7. `isFiniteNumber()` - 4 edges
8. `makePlotLayout()` - 3 edges
9. `PerAssetCards()` - 3 edges
10. `assetColorMap()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `BacktestResult`  [EXTRACTED]
  src/components/Dashboard.tsx → src/types.ts
- `App()` --calls--> `useTheme()`  [EXTRACTED]
  src/App.tsx → src/context/ThemeContext.tsx
- `Props` --references--> `BacktestResult`  [EXTRACTED]
  src/components/AssetSelection.tsx → src/types.ts
- `PnlChartProps` --references--> `BacktestResult`  [EXTRACTED]
  src/components/Charts.tsx → src/types.ts
- `PnlChart()` --calls--> `formatCompact()`  [EXTRACTED]
  src/components/Charts.tsx → src/utils/format.ts

## Import Cycles
- None detected.

## Communities (8 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (6): DropZone(), Props, ThemeContext, ThemeCtx, ThemeProvider(), ParseError

### Community 1 - "Community 1"
Cohesion: 0.32
Nodes (10): LiquidationEvent, Metrics, isFiniteNumber(), isNumberArray(), isStringArray(), METRIC_KEYS, normalizeLiquidationEvent(), parseBacktestResult() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (6): Props, PnlChartProps, Props, BacktestResult, ASSET_COLORS, assetColorMap()

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (6): LiquidationTableProps, PerAssetCardsProps, Plot, PLOT_CONFIG, PositionsChartProps, buildTimelineIndex()

### Community 4 - "Community 4"
Cohesion: 0.40
Nodes (6): makePlotLayout(), PerAssetCards(), PnlChart(), PositionsChart(), useTheme(), App()

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (3): LiquidationTable(), Dashboard(), Props

## Knowledge Gaps
- **10 isolated node(s):** `Plot`, `PLOT_CONFIG`, `PositionsChartProps`, `PerAssetCardsProps`, `LiquidationTableProps` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BacktestResult` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `ParseError` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Community 4` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `Plot`, `PLOT_CONFIG`, `PositionsChartProps` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._