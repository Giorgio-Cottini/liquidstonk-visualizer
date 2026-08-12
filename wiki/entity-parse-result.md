---
type: entity
layer: core
origin: liquidstonk-visualizer
title: "parseBacktestResult() — the strict client-side loader"
date: 2026-06-16
---

# parseBacktestResult() / ParseError

The strict JSON validator in `src/utils/parseResult.ts`. Graph node
`graph:utils_parseresult_parsebacktestresult` (god node, 7 edges). It turns untrusted file
text into a typed [[entity-backtestresult]] or throws.

## Behavior

Validates the dropped file field-by-field and **fails loud**: on any violation it raises
`ParseError` (`graph:utils_parseresult_parseerror`) listing *every* broken rule, rather than
rendering a partial chart. This determinism is a project invariant — see [[source-claude]].

Supporting checks in the same module:
- `graph:utils_parseresult_isfinitenumber` (`isFiniteNumber()`),
  `graph:utils_parseresult_isnumberarray`, `graph:utils_parseresult_isstringarray`
- `graph:utils_parseresult_validatemetrics` (`validateMetrics()`),
  `graph:utils_parseresult_validateliquidationevent`,
  `graph:utils_parseresult_normalizeliquidationevent`
- `graph:utils_parseresult_buildtimelineindex` — indexes the timeline for liquidation lookup.

## Mirror relationship

`parseResult.ts` is the TypeScript mirror of the Python [[entity-export-result]] checks;
both enforce the one [[concept-json-contract]]. The README schema is the third copy.

## Connections

- [[entity-backtestresult]] — its output type.
- [[concept-json-contract]] — the contract it enforces.
- [[synthesis-data-flow]] · [[source-frontend]]
- [[concept-perp-backtest-visualization]] — the visualization this loader feeds.
