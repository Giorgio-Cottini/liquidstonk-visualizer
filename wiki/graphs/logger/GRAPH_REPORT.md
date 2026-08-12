# Graph Report - .  (2026-06-16)

## Corpus Check
- 1 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 12 nodes · 17 edges · 3 communities (1 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2

## God Nodes (most connected - your core abstractions)
1. `LoggerError` - 6 edges
2. `_validate_payload()` - 5 edges
3. `_check_finite_numbers()` - 3 edges
4. `_check_metrics()` - 3 edges
5. `export_result()` - 3 edges
6. `logger.py — Standalone exporter for LiquidStonk-compatible JSON.  Drop this fi` - 1 edges
7. `Raised when payload does not satisfy GioVisualizer invariants.` - 1 edges
8. `Write a GioVisualizer-compatible JSON file.      Parameters     ----------` - 1 edges

## Surprising Connections (you probably didn't know these)
- `export_result()` --calls--> `_validate_payload()`  [EXTRACTED]
  logger.py → logger.py  _Bridges community 0 → community 2_

## Import Cycles
- None detected.

## Communities (3 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.47
Nodes (6): _check_finite_numbers(), _check_metrics(), LoggerError, Raised when payload does not satisfy GioVisualizer invariants., _validate_payload(), ValueError

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LoggerError` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.352) - this node is a cross-community bridge._
- **Why does `export_result()` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Why does `_validate_payload()` connect `Community 0` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `logger.py — Standalone exporter for LiquidStonk-compatible JSON.  Drop this fi`, `Raised when payload does not satisfy GioVisualizer invariants.`, `Write a GioVisualizer-compatible JSON file.      Parameters     ----------` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._