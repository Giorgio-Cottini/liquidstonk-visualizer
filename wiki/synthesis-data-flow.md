---
type: synthesis
layer: core
origin: liquidstonk-visualizer
title: "End-to-end data flow: backtester → JSON → charts"
date: 2026-06-16
---

# Synthesis — From Backtest to Chart

How the two halves of LiquidStonk (the Python exporter and the React frontend, two separate
structural graphs) connect through one artifact: a JSON file conforming to
[[concept-json-contract]].

## The pipeline

1. **Produce.** A backtester — or the reference `logger.py` via
   `graph:logger_export_result` (`export_result()`) — builds a payload. `_validate_payload()`
   (`graph:logger_validate_payload`) enforces the contract; `LoggerError`
   (`graph:logger_loggererror`) on any violation. Output: `<strategy>.json`. See [[source-logger]].
2. **Transport.** The file is moved by the user — not the network. LiquidStonk has no
   backend; the JSON is the only interface between the two worlds.
3. **Ingest.** The user drops the file on `graph:components_dropzone_dropzone`
   (`DropZone()`); `graph:src_app_app` (`App()`) reads the text.
4. **Validate.** `graph:utils_parseresult_parsebacktestresult` (`parseBacktestResult()`)
   checks every rule and throws `ParseError` (`graph:utils_parseresult_parseerror`) listing
   all violations, or returns a typed [[entity-backtestresult]]. See [[entity-parse-result]].
5. **Render.** `graph:components_dashboard_dashboard` (`Dashboard()`) lays out
   `graph:components_charts_pnlchart` (`PnlChart()`), `PositionsChart()`, `PerAssetCards()`,
   and the stats panel — all themed through `graph:context_themecontext_usetheme`
   ([[entity-theme-context]]). See [[source-frontend]].

## The key insight

The producer (`logger.py`/`LoggerError`) and the consumer (`parseResult.ts`/`ParseError`)
are mirror enforcers of the **same** contract. That symmetry is what lets *any* backtester
feed *this* visualizer, and why the project's top invariant is keeping `types.ts`,
`parseResult.ts`, `README.md`, and `logger.py` in lockstep ([[source-claude]]).

## Connections

- [[concept-json-contract]] — the shared contract.
- [[source-frontend]] · [[source-logger]] — the two graphs this synthesis bridges.
- [[entity-backtestresult]] · [[entity-parse-result]] · [[entity-export-result]]
