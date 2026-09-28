# CLAUDE.md — LiquidStonk

## PURPOSE

Make `LiquidStonk` (currentl folder name: GioVisualizer) a **GitHub-ready, standalone repository** that anyone can clone, install, run, and deploy with no dependency on the parent `HL` monorepo.

LiquidStonk is a static React app. Drop a backtest JSON exported by `GioTester` (or any backtester via `gio_exporter.py`) → interactive equity charts, per-asset PnL, position timelines, liquidation markers. No backend; all parsing/rendering client-side.

User-facing docs already exist:

* `README.md` — quick start, JSON schema, invariants, file structure
* `instructions.md` — step-by-step run + Netlify deploy walkthrough

This file is the **maintainer/agent brief**: what the repo is, how it is wired, and what must change to ship it standalone.

**Planner:** `.planner-general/workflow.md`, read by the PM at session start. The state lives in the GitHub issues, milestones and PRs of `liquidstonk-visualizer`.

---

## STACK

```txt
Build    : Vite 5 (ESM)
UI       : React 18 + react-dom
Lang     : TypeScript 5 (strict, noEmit — tsc typechecks, vite bundles)
Components: Mantine 7 (@mantine/core, hooks, dropzone)
Charts   : plotly.js + react-plotly.js
CSS      : PostCSS + postcss-preset-mantine, CSS modules, raw vars in index.html
Polyfill : vite-plugin-node-polyfills (plotly needs node globals)
Runtime  : Node.js 18+ (developed on Node 22)
```

Scripts (`package.json`):

```bash
npm run dev       # vite dev server → http://localhost:5173
npm run build     # tsc && vite build → dist/
npm run preview   # serve built dist/
```

---

## SOURCE LAYOUT

```txt
LiquidStonk/
├── src/
│   ├── main.tsx                  # entry — mounts App, MantineProvider, ThemeProvider
│   ├── App.tsx / App.module.css  # root: file load + parse + error display
│   ├── types.ts                  # BacktestResult, Metrics, LiquidationEvent
│   ├── components/
│   │   ├── Dashboard.tsx         # layout + asset-selection state
│   │   ├── Charts.tsx            # Plotly chart grid
│   │   ├── AssetSelection.tsx    # asset toggle UI
│   │   ├── StatsPanel.tsx        # best/worst asset panel
│   │   └── DropZone.tsx          # Mantine dropzone
│   ├── context/ThemeContext.tsx  # dark/light mode
│   └── utils/
│       ├── parseResult.ts        # strict JSON validator (throws ParseError)
│       ├── colors.ts             # asset color palette
│       └── logo.png
├── gio_exporter.py               # standalone Python exporter (stdlib only)
├── index.html                    # CSS vars (light/dark), font preload, #root
├── vite.config.ts                # react + nodePolyfills + plotly optimizeDeps
├── tsconfig.json / tsconfig.node.json
├── postcss.config.cjs
├── netlify.toml                  # base=LiquidStonk, build, SPA redirect
├── package.json / package-lock.json
└── README.md / instructions.md
```

`types.ts` is the contract. `parseResult.ts` enforces it at load time. Keep the two in sync — `README.md` documents the JSON schema and every enforced invariant.

---

## GITHUB-READY: WHAT MUST CHANGE

State of repo as scanned — blockers to standalone publish:

### 1. `node_modules/` is committed (17,810 files)

Generated deps tracked in git. Must be untracked. From repo root:

```bash
git rm -r --cached LiquidStonk/node_modules
git rm -r --cached LiquidStonk/dist        # if present
```

### 2. No `.gitignore` in LiquidStonk

Add `LiquidStonk/.gitignore`:

```gitignore
node_modules/
dist/
__pycache__/
*.pyc
.vite/
.netlify/
.DS_Store
*.local
```

### 3. Parent `.gitignore` excludes the whole folder

The monorepo root `.gitignore` lists `LiquidStonk/`, so the directory is ignored upstream and its files only exist in git via force-add. To ship standalone, the canonical move is to **split LiquidStonk into its own repo** (`git subtree split` or fresh `git init` from a copy), where `node_modules`/`dist` are ignored and source is tracked normally.

> Project HARD CONSTRAINT: never modify the parent `.gitignore`. The split/new-repo path is the github-ready route — do not edit the monorepo ignore rules.

### 4. Verify a clean install builds

After untracking, confirm reproducibility:

```bash
rm -rf node_modules dist
npm ci          # uses package-lock.json — must succeed offline-of-source
npm run build   # tsc strict + vite build must pass
npm run preview # smoke test dist/
```

### 5. Optional polish for a public repo

* `LICENSE` (none present)
* trim duplicated content between `README.md` and `instructions.md` (large overlap)
* sample JSON committed under `examples/` so a fresh cloner can drop-test immediately

---

## INVARIANTS

Never break:

* the JSON contract in `types.ts` / `parseResult.ts` / `README.md` (all three agree)
* strict TS — build runs `tsc` before `vite build`; do not relax `strict`
* deterministic client-side parse — `parseResult.ts` throws `ParseError` listing every violated check; do not swallow or soft-fallback
* Netlify config (`base=LiquidStonk`, `publish=dist`, SPA redirect)

Never:

* commit `node_modules/`, `dist/`, or `__pycache__/`
* edit the parent monorepo `.gitignore`
* add a backend or network call — app is fully static
* weaken the loader's validation to accept malformed JSON

---

## DATA FLOW

`gio_exporter.py` (or `GioTester`) writes `<strategy>.json` → user drops file in `DropZone` → `App.tsx` reads text → `parseResult.ts` validates against `BacktestResult` → on success `Dashboard` renders `Charts` + `StatsPanel`; on failure errors list to UI. Schema and all enforced checks: see `README.md`.

---

## CONFIDENCE PROTOCOL

Before non-trivial changes:

```txt
Confidence : HIGH | MEDIUM | LOW
Uncertainty: <missing info>
Resolves if: <what removes it>
```

LOW → ask before proceeding.
