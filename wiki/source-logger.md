---
type: source
layer: core
origin: liquidstonk-visualizer
title: "LiquidStonk/logger.py — stdlib JSON exporter"
date: 2026-06-16
graph: wiki/graphs/logger/graph.json
---

# LiquidStonk/logger.py — Reference Exporter

A standalone, stdlib-only Python module that validates a backtest payload and writes a
LiquidStonk-compatible JSON file. It is the **reference implementation of the data
contract** — any backtester may emit the schema directly, but a file `logger.py` writes
successfully is guaranteed to load. Structural graph: `wiki/graphs/logger/graph.json`.

## What it is

`export_result(...)` builds and validates the payload, then writes `<strategy>.json`.
Running the module directly (`python logger.py`) emits a small sample under `results/`
for drop-testing the live site.

## Graph signal (from `wiki/graphs/logger/`)

Graph: **12 nodes, 17 edges, 3 communities** · 100% EXTRACTED (AST).

**God nodes:**
- `graph:logger_loggererror` — `LoggerError`. Raised on any contract violation.
- `graph:logger_export_result` — `export_result()`. Public entry point.
- `graph:logger_validate_payload` — `_validate_payload()`. The gatekeeper that fails loud.
- `graph:logger_check_finite_numbers`, `graph:logger_check_metrics` — invariant checks.

Helper stats `graph:logger_max_drawdown` (`_max_drawdown()`) and `graph:logger_sharpe`
(`_sharpe()`) compute metrics when the caller does not supply them.

## Connections

- [[entity-export-result]] — the `export_result()` / `LoggerError` entity.
- [[concept-json-contract]] — the contract this module enforces (mirror of `parseResult.ts`).
- [[synthesis-data-flow]] — where the produced JSON goes.
- [[source-frontend]] — the consumer of this output.
- [[source-readme]] — user doc that points readers to this reference exporter.
