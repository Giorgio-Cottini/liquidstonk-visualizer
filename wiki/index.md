---
layer: core
type: index
---

# LiquidStonk — project catalog

Interactive visualizer for perp-trading backtests (Vite + React + TypeScript frontend,
plus a Python `logger.py`). Onboarded into GeorgOS by `graph-connect` on 2026-06-16.
Origin slug: `liquidstonk-visualizer` — filter this project's knowledge anywhere in the
vault with an `origin: liquidstonk-visualizer` search.

## Structural graphs

- `wiki/graphs/src/GRAPH_REPORT.md` — src frontend graph: App, components, context, utils, types.
- `wiki/graphs/logger/GRAPH_REPORT.md` — logger Python data graph: `logger.py`.

## Curated pages

Filter all of them anywhere in the vault with an `origin: liquidstonk-visualizer` search.

**Sources**
- [[source-frontend]] — Vite/React/TS frontend (cites `wiki/graphs/src/`).
- [[source-logger]] — `logger.py` stdlib exporter (cites `wiki/graphs/logger/`).
- [[source-readme]] — user-facing README schema + features.
- [[source-claude]] — maintainer brief (the project's own `CLAUDE.md`).

**Entities**
- [[entity-backtestresult]] — the central `BacktestResult` type / god node.
- [[entity-parse-result]] — `parseBacktestResult()` / `ParseError` (the loader).
- [[entity-export-result]] — `export_result()` / `LoggerError` (the exporter).
- [[entity-theme-context]] — `useTheme()` / `ThemeProvider` dark-light context.

**Concepts & synthesis**
- [[concept-json-contract]] — the `BacktestResult` contract (3-4 synced copies).
- [[concept-perp-backtest-visualization]] — the client-side domain idea.
- [[synthesis-data-flow]] — backtester → JSON → charts, end to end.

## Map

Structure map: `wiki/tree.txt`. Config: `region.yml`. Log: `wiki/log.md`.
