---
type: concept
layer: core
origin: liquidstonk-visualizer
title: "The BacktestResult JSON contract"
date: 2026-06-16
---

# The BacktestResult JSON Contract

The single data contract that the whole project is built to protect. It exists in **three
synchronized copies** that must always agree:

1. **`types.ts`** — the TypeScript shape ([[entity-backtestresult]]).
2. **`parseResult.ts`** — the consuming-side enforcer ([[entity-parse-result]]); throws
   `ParseError` listing every violation.
3. **`README.md`** — the human-readable schema ([[source-readme]]).

A fourth, optional copy is the producing-side reference: **`logger.py`**
([[entity-export-result]]), whose `LoggerError` mirrors `ParseError`.

## The invariant

> A file that writes successfully (logger) will load successfully (parser).

Both sides enforce the *same* rules: ISO-8601 strictly-ascending `timeline`; finite numeric
series whose length equals `timeline`; every `metrics_per_perp` key present in
`per_perp_equity`; `Metrics` = `{ PnL, DD, Sharpe, Sortino }` all finite, `DD` a fraction;
non-negative `n_opened` / `n_closed` / `n_liquidated`. `LiquidationEvent.net_cash_loss`,
when absent, is derived from `realized_pnl - fee`.

## Why it matters

This contract is the seam between the Python world (any backtester) and the browser world
(the visualizer). Keeping the three/four copies in lockstep is the project's top invariant —
breaking it produces either a loud `ParseError` or, worse, a silently wrong chart, which the
fail-loud design exists to prevent (see [[source-claude]]).

## Connections

- [[synthesis-data-flow]] — the contract in motion, end to end.
- [[entity-backtestresult]] · [[entity-parse-result]] · [[entity-export-result]]
- [[source-readme]] · [[source-frontend]] · [[source-logger]]
- [[concept-perp-backtest-visualization]] — the domain idea this contract enables.
