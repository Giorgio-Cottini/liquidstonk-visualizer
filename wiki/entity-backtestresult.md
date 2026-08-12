---
type: entity
layer: core
origin: liquidstonk-visualizer
title: "BacktestResult — the central backtest data type"
date: 2026-06-16
---

# BacktestResult

The TypeScript type that every part of the frontend revolves around — defined in
`src/types.ts`, validated by `parseResult.ts`, documented in `README.md`. In the structural
graph it is `graph:src_types_backtestresult`, the top god node (11 edges) and the highest
cross-community bridge (betweenness 0.126).

## Shape (required fields)

- `strategy: string` (non-empty)
- `timeline: string[]` — ISO-8601, strictly ascending, no duplicates, ≥1 entry
- `total_equity: number[]` — finite, length == `timeline`
- `per_perp_equity: { [asset]: number[] }` — finite series, length == `timeline`
- `metrics_total: Metrics`, `metrics_per_perp: { [asset]: Metrics }` — every key must also
  appear in `per_perp_equity`
- `n_opened`, `n_closed`, `n_liquidated: int` (≥ 0)

`Metrics` (`graph:src_types_metrics`) = `{ PnL, DD, Sharpe, Sortino }`, all finite; `DD` is
a fraction. Optional fields add `margin_mode`, `per_perp_position`, `liquidation_events`
(`graph:src_types_liquidationevent`), and PnL/fee breakdowns. Full rules: [[concept-json-contract]].

## Role in the graph

Component prop types across `Dashboard`, `AssetSelection`, and `Charts` all
`--reference-->` `graph:src_types_backtestresult`. It is the data spine of the UI: parse
produces it, every chart consumes it.

## Connections

- [[concept-json-contract]] — the enforced contract over this type.
- [[entity-parse-result]] — the validator that produces a `BacktestResult`.
- [[entity-export-result]] — the Python side that emits a conforming payload.
- [[source-frontend]] · [[source-readme]]
- [[synthesis-data-flow]] — this type tracked through the end-to-end data flow.
