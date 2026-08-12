---
type: source
layer: core
origin: liquidstonk-visualizer
title: "LiquidStonk/src — Vite + React + TypeScript frontend"
date: 2026-06-16
graph: wiki/graphs/src/graph.json
---

# LiquidStonk/src — Frontend

The client-side single-page app that turns a backtest JSON into interactive charts.
Vite + React 18 + TypeScript (strict) + Mantine 7 + Plotly. The structural graph lives
at `wiki/graphs/src/graph.json`; its plain-language audit is `wiki/graphs/src/GRAPH_REPORT.md`.

## What it is

Everything runs in the browser. The user drops a `.json` file; the app parses and
validates it, then renders an equity curve, per-asset PnL, position timelines, and
liquidation markers. No backend, no network calls — see [[concept-perp-backtest-visualization]].

## Graph signal (from `wiki/graphs/src/`)

Graph: **61 nodes, 113 edges, 8 communities** · 100% EXTRACTED (AST, no inference).

**God nodes (most connected — the core abstractions):**
- `graph:src_types_backtestresult` — `BacktestResult`, 11 edges. The central data type
  and a cross-community bridge (betweenness 0.126). See [[entity-backtestresult]].
- `graph:context_themecontext_usetheme` — `useTheme()`, 7 edges. See [[entity-theme-context]].
- `graph:utils_parseresult_parsebacktestresult` — `parseBacktestResult()`, 7 edges.
  The strict loader. See [[entity-parse-result]].
- `graph:components_charts_pnlchart` — `PnlChart()`, 5 edges.
- `graph:utils_format_formatcompact` — `formatCompact()`, 5 edges.

**Surprising connections (EXTRACTED):**
- Many component `Props` types `--reference-->` `graph:src_types_backtestresult` — the
  single type radiates through `Dashboard`, `AssetSelection`, and `Charts`.
- `graph:src_app_app` (`App()`) `--calls-->` `graph:context_themecontext_usetheme`.
- `graph:components_charts_pnlchart` `--calls-->` `graph:utils_format_formatcompact`.

No import cycles detected. Ten weakly-connected nodes (Plotly layout helpers, prop types)
are flagged as possible documentation gaps in the report.

## Connections

- [[concept-json-contract]] — the `BacktestResult` contract this UI consumes.
- [[synthesis-data-flow]] — end-to-end flow from logger to charts.
- [[source-logger]] — the Python side that produces the JSON.
- [[source-readme]] — user-facing schema doc.
- [[source-claude]] — maintainer brief mapping this source layout.
