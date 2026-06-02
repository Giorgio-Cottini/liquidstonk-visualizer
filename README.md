# LiquidStonk

**Interactive visualizer for perp-trading backtests.** Drop in a backtest JSON → equity curve, per-asset PnL, position timelines, and liquidation markers. No install, no signup, nothing leaves your browser.

## ▶ [Open LiquidStonk](https://liquidstonk.netlify.app)

> Export a result from your backtester, drag the `.json` onto the page, read your charts. That's the whole loop.

---

## What you get

- **Equity curve** — total portfolio equity over time, with Sharpe / Sortino / max-drawdown pinned to the header and ⚡ liquidation markers placed on the curve.
- **Best / worst assets** — ranked PnL leaderboard alongside the equity chart.
- **Liquidations table** — every liquidation event, sorted by realized loss.
- **Asset selection** — toggle which assets feed the charts; auto-starts with your 5 best and 5 worst.
- **Positions timeline** — signed invested USD per selected asset (positive = long, negative = short).
- **Per-asset breakdown** — a PnL + position sparkline card per asset, sorted by |PnL|.
- **Dark / light** — follows your OS, manual toggle overrides.

Everything runs client-side. Your backtest file is parsed in-browser and never uploaded.

---

## Feeding it data

LiquidStonk reads one JSON file matching the schema below. Any backtester can produce it. The repo ships **[`logger.py`](logger.py)** — a stdlib-only helper that validates your payload and writes a compatible file:

```python
from logger import export_result

export_result(
    path="results/my_strategy.json",
    strategy="my_strategy",
    timeline=timestamps,            # ISO-8601, strictly ascending, no dupes
    total_equity=equity_series,     # one value per timestamp
    per_perp_equity={"BTC": [...]}, # per-asset PnL contribution
    per_perp_position={"BTC": [...]},
    metrics_total={"PnL": ..., "DD": ..., "Sharpe": ..., "Sortino": ...},
    metrics_per_perp={"BTC": {"PnL": ..., "DD": ..., "Sharpe": ..., "Sortino": ...}},
    n_opened=..., n_closed=..., n_liquidated=...,
)
```

`export_result` raises `loggerError` on any contract violation, so a file that writes successfully will load successfully. Run the module directly (`python logger.py`) to generate a small sample under `results/` and drop-test the live site.

You don't have to use the logger — emit the schema however you like. The logger is just the reference implementation of the contract.

---

## JSON schema

The loader validates strictly and **fails loud**: a bad file produces a list of every violated rule rather than a broken chart.

### Required

| Field              | Type                    | Rules                                                 |
| ------------------ | ----------------------- | ----------------------------------------------------- |
| `strategy`         | string                  | non-empty                                             |
| `timeline`         | string[]                | ISO-8601, strictly ascending, no duplicates, ≥1 entry |
| `total_equity`     | number[]                | finite; length == `timeline`                          |
| `per_perp_equity`  | `{ [asset]: number[] }` | each series finite, length == `timeline`              |
| `metrics_total`    | `Metrics`               | see below                                             |
| `metrics_per_perp` | `{ [asset]: Metrics }`  | every key must also appear in `per_perp_equity`       |
| `n_opened`         | int                     | ≥ 0                                                   |
| `n_closed`         | int                     | ≥ 0                                                   |
| `n_liquidated`     | int                     | ≥ 0                                                   |

`Metrics` = `{ PnL: number, DD: number, Sharpe: number, Sortino: number }`, all finite. `DD` is a fraction (`0.12` renders as `12%`).

### Optional (default empty / 0)

| Field                           | Type                    | Notes                                     |
| ------------------------------- | ----------------------- | ----------------------------------------- |
| `margin_mode`                   | `"cross" \| "isolated"` | defaults to `"cross"`                     |
| `per_perp_position`             | `{ [asset]: number[] }` | signed invested USD; length == `timeline` |
| `liquidation_events`            | `LiquidationEvent[]`    | see below                                 |
| `long_pnl`, `short_pnl`         | number                  | realized PnL from non-liquidated closes   |
| `liq_long_pnl`, `liq_short_pnl` | number                  | realized PnL from liquidated positions    |
| `funding_pnl`                   | number                  | net funding (negative = paid)             |
| `total_fees`                    | number                  | total fees paid                           |

### `LiquidationEvent`

| Field                                                                       | Type    | Rules                                            |
| --------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| `timestamp`                                                                 | string  | must exist in `timeline`                         |
| `asset`                                                                     | string  | must exist in `per_perp_equity`                  |
| `net_cash_loss`                                                             | number  | finite — or supply finite `realized_pnl` instead |
| `account_equity`, `maintenance_margin`, `fill_price`, `realized_pnl`, `fee` | number? | finite when present                              |

If `net_cash_loss` is omitted, the loader derives it from `realized_pnl - fee`.

---

## Privacy

Static single-page app. No backend, no analytics, no network calls. The file you drop is read with the browser's `FileReader` and discarded on reload.

---

## Tech

Vite · React 18 · TypeScript (strict) · Mantine 7 · Plotly. Deployed as a static site on Netlify.
