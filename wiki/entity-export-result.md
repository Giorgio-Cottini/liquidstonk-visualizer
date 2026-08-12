---
type: entity
layer: core
origin: liquidstonk-visualizer
title: "export_result() — the Python reference exporter"
date: 2026-06-16
---

# export_result() / LoggerError

The public entry point of `logger.py`. Graph node `graph:logger_export_result`. It writes a
LiquidStonk-compatible `<strategy>.json` after validating the payload, and is the reference
implementation of the [[concept-json-contract]].

## Behavior

`export_result(...)` delegates validation to `_validate_payload()`
(`graph:logger_validate_payload`), which runs invariant checks
`graph:logger_check_finite_numbers` (`_check_finite_numbers()`) and
`graph:logger_check_metrics` (`_check_metrics()`). Any violation raises `LoggerError`
(`graph:logger_loggererror`) — "a file that writes successfully will load successfully."

When the caller omits metrics, helpers `graph:logger_max_drawdown` (`_max_drawdown()`) and
`graph:logger_sharpe` (`_sharpe()`) derive them.

## Mirror relationship

The Python equivalent of the TypeScript [[entity-parse-result]]: same contract, enforced on
the producing side instead of the consuming side.

## Connections

- [[concept-json-contract]] — the contract it implements.
- [[entity-backtestresult]] — the shape it emits.
- [[source-logger]] · [[synthesis-data-flow]]
