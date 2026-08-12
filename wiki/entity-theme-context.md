---
type: entity
layer: core
origin: liquidstonk-visualizer
title: "useTheme() / ThemeProvider — dark-light mode context"
date: 2026-06-16
---

# useTheme() / ThemeProvider

The React context in `src/context/ThemeContext.tsx` that drives dark/light mode. Graph node
`graph:context_themecontext_usetheme` (`useTheme()`) is a god node (7 edges) and a
cross-community bridge — it is consumed by `App()` and the chart components for theming.

## Behavior

- `graph:context_themecontext_themeprovider` (`ThemeProvider()`) wraps the app and holds
  the current mode; `graph:context_themecontext_systemdark` (`systemDark()`) reads the OS
  preference. A manual toggle overrides the system default (per [[source-readme]]).
- `graph:src_app_app` (`App()`) `--calls-->` `useTheme()` — a notable cross-community edge
  from the report.

## Connections

- [[source-frontend]] — where this node sits in the graph.
- [[concept-perp-backtest-visualization]] — the UX it serves.
- [[synthesis-data-flow]] — the end-to-end flow this theming wraps.
