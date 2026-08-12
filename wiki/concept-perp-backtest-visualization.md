---
type: concept
layer: core
origin: liquidstonk-visualizer
title: "Perp-trading backtest visualization (client-side)"
date: 2026-06-16
---

# Perp-Trading Backtest Visualization

The domain idea LiquidStonk implements: take the output of a perpetual-futures trading
backtest and make it legible as charts, entirely in the browser.

## The artifacts it surfaces

- **Equity curve** — portfolio equity over time, with Sharpe / Sortino / max-drawdown
  pinned and ⚡ liquidation markers placed on the curve.
- **Per-asset PnL** — best/worst leaderboard and a sparkline card per asset.
- **Positions timeline** — signed invested USD per asset (positive = long, negative = short).
- **Liquidations table** — every liquidation event, sorted by realized loss.

## Defining constraints

- **Client-side only.** Static SPA, no backend, no analytics, no network calls; the dropped
  file is read with `FileReader` and discarded on reload. Privacy is structural, not a policy.
- **Fail loud.** A malformed file yields a list of every violated rule, never a broken chart
  — enforced by [[entity-parse-result]] against [[concept-json-contract]].

## Connections

- [[concept-json-contract]] — the data this concept renders.
- [[source-readme]] — the feature list in the user's words.
- [[source-frontend]] — the components that draw these views.
- [[entity-theme-context]] — the dark/light presentation layer.
