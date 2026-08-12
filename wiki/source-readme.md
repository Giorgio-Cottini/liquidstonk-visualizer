---
type: source
layer: core
origin: liquidstonk-visualizer
title: "LiquidStonk README — user-facing schema and features"
date: 2026-06-16
source_path: README.md
---

# LiquidStonk README (source)

User-facing documentation for the deployed app at https://liquidstonk.netlify.app.
Source read in place: the project's own `README.md` at the project root.

## One-sentence summary

Interactive, client-side visualizer for perp-trading backtests: drop a backtest JSON,
get an equity curve, per-asset PnL, position timelines, and liquidation markers.

## Key points

- **Loop:** export a result from any backtester → drag the `.json` onto the page → read charts.
- **Views:** equity curve (Sharpe / Sortino / max-drawdown pinned, ⚡ liquidation markers),
  best/worst asset leaderboard, liquidations table, asset toggles (auto: 5 best + 5 worst),
  positions timeline (signed invested USD), per-asset PnL+position cards, dark/light mode.
- **Privacy:** fully static SPA; the dropped file is read with the browser `FileReader`
  and discarded on reload — nothing is uploaded.
- **Tech:** Vite · React 18 · TypeScript strict · Mantine 7 · Plotly · Netlify.

## Notable contract detail

The loader **fails loud**: a bad file produces a list of every violated rule rather than a
broken chart. `DD` is a fraction (`0.12` → `12%`). If `LiquidationEvent.net_cash_loss` is
omitted, the loader derives it from `realized_pnl - fee`. Full field-by-field schema is the
subject of [[concept-json-contract]].

## Connections

- [[concept-json-contract]] — the JSON schema this README documents.
- [[concept-perp-backtest-visualization]] — the domain concept.
- [[source-logger]] — the reference exporter README points users to.
- [[entity-backtestresult]] — the type the schema describes.
- [[entity-theme-context]] — the dark/light mode the README describes.
- [[source-claude]] — the maintainer brief that complements this user doc.
- [[source-frontend]] — the app this README documents.
