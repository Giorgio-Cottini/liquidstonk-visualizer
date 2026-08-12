---
layer: core
type: log
---

# LiquidStonk — log

Append-only record of graph-connect / ingest / lint runs on this region.

## [2026-06-16] onboard | LiquidStonk
- graph units: graphs/src/graph.json (61 nodes, 113 edges, 8 communities), graphs/logger/graph.json (12 nodes, 17 edges, 3 communities)
- curated pages: created 11 (4 source, 4 entity, 2 concept, 1 synthesis), updated 0
- origin: liquidstonk-visualizer
- wrap: .obsidian/ (dormant), region.yml, index.md, log.md written; CLAUDE.md kept (project's own — not overwritten)
- routing override: tsx/jsx → graphify lane
- notes: own git repo; excluded from GeorgOS tracking via .gitignore. logger.py graphed via direct extract (detect() returns empty for a lone file). Community labels left as defaults; re-run graphify labeling later if desired.

## [2026-06-16] re-lay | LiquidStonk → wiki/ layout
- migrated all generated knowledge into `wiki/`: curated pages, index.md, log.md, tree.txt, graphs/ (no graphify/ingest re-run — same content, paths only)
- raw/ removed: region is now in-place (`raw: .`); README.md / CLAUDE.md read at the project root, never copied
- fixed ghost links: former wikilinks to graph.json / GRAPH_REPORT.md under graphs/ are now plain backtick paths (graph artifacts are not wiki pages, so they must not be wikilinked)
- root hub entry now resolves to `LiquidStonk-visualizer/wiki/index`
- origin: liquidstonk-visualizer

## [2026-06-16] lint
- checked: 11 pages, 4 in-place sources, 2 graphs
- errors: 11 — frontmatter conformance: all 11 pages use `date:` instead of `created:`/`updated:`, and the 4 source pages omit `source_file:`/`source_kind:`. Root cause is schema drift: lint's check 6 predates the lighter frontmatter that graph-connect/ingest actually emit (`type:`/`layer:`/`origin:`/`date:`/`graph:`); the pages are not corrupt.
- warnings: 9 — asymmetric links (one-way `[[wikilinks]]` with no reciprocal): CPBV→CJC, CPBV→EPR, EPR→source-claude, theme-context→readme, source-claude→frontend, source-claude→readme, frontend→readme, readme→logger, data-flow→theme-context.
- info: 0
- not run: raw↔source linkage (check 7) is not applicable to an in-place region (`raw: .`); lint has no `raw: .` rule yet.
- clean: no orphans, no broken/ghost links, no contradictions or stale claims detected, graph-citations 27/27 resolve, index matches the page set, no empty/stub files.
- fixes applied: none (report-only; re-run with `--fix` to add the 9 reciprocal links).
- gaps for discover: none.

## [2026-06-16] lint (re-run, after reconciling check 6 + adding raw: . support)
- checked: 11 pages, 0 copied sources (in-place), 2 graphs
- errors: 0 — the previous 11 were lint/generator schema drift. Check 6 now accepts a single `date:` as a valid timestamp and treats `source_file:`/`source_kind:` as optional, matching what graph-connect/ingest actually emit.
- warnings: 11 — asymmetric links ×9; missing source-page provenance ×2 (source-claude, source-readme carry no `source_path:` or `graph:` to name the in-place file they summarize).
- info: 0
- not run: raw↔source linkage (check 7) — skipped for in-place region (`raw: .`).
- clean: orphans 0, broken/ghost links 0, graph-citations 27/27 resolve, index matches the page set, no empty/stub files.
- fixes applied: none (report-only).
- gaps for discover: none.

## [2026-06-16] lint --fix
- checked: 11 pages, 4 in-place sources, 2 graphs
- errors: 0
- warnings: 0
- fixes applied: stamped `source_path:` on source-claude (`CLAUDE.md`) and source-readme (`README.md`), clearing the 2 provenance warnings; added 10 reciprocal `[[links]]`, clearing every asymmetric-link warning. The earlier report estimated 9 asymmetric pairs; recomputing during the fix surfaced a 10th (synthesis-data-flow ↔ entity-backtestresult) that the manual count had missed.
- result: fixed 12, remaining 0 — region is clean.
- gaps for discover: none.
