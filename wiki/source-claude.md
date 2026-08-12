---
type: source
layer: core
origin: liquidstonk-visualizer
title: "LiquidStonk maintainer brief (CLAUDE.md)"
date: 2026-06-16
source_path: CLAUDE.md
---

# LiquidStonk Maintainer Brief (source)

The project's own `CLAUDE.md` — the maintainer/agent brief, distinct from the GeorgOS
region router. Source read in place: the project's own `CLAUDE.md` at the project root.

## One-sentence summary

How LiquidStonk (folder formerly `GioVisualizer`) is wired and what must change to ship it
as a standalone, GitHub-ready repo independent of its parent `HL` monorepo.

## Key points

- **Stack:** Vite 5 (ESM), React 18, TypeScript 5 strict (`tsc` typechecks, vite bundles),
  Mantine 7, plotly.js + react-plotly.js, PostCSS, `vite-plugin-node-polyfills`, Node 18+.
- **Scripts:** `npm run dev` (5173), `npm run build` (`tsc && vite build` → `dist/`), `npm run preview`.
- **Contract triad:** `types.ts` (the contract) ↔ `parseResult.ts` (enforces at load,
  throws `ParseError`) ↔ `README.md` (documents schema). All three must agree.

## Invariants (never break)

- The JSON contract across `types.ts` / `parseResult.ts` / `README.md`.
- Strict TS — do not relax `strict`; build runs `tsc` before `vite build`.
- Deterministic client-side parse — `parseResult.ts` lists every violated check; never
  swallow or soft-fallback.
- Netlify config (`base=LiquidStonk`, `publish=dist`, SPA redirect).
- Never commit `node_modules/`, `dist/`, `__pycache__/`; never add a backend or network call.

## GitHub-ready blockers (as scanned)

`node_modules/` was committed (17,810 files); no local `.gitignore` originally; parent
monorepo `.gitignore` excludes the folder. HARD CONSTRAINT recorded: never edit the parent
`.gitignore` — the standalone-repo split is the sanctioned path.

## Connections

- [[concept-json-contract]] — the contract triad this brief protects.
- [[synthesis-data-flow]] — the data flow it documents.
- [[source-frontend]] — the source layout it maps.
- [[source-readme]] — the user-facing doc it complements.
- [[entity-parse-result]] — the fail-loud loader whose determinism this brief mandates.
