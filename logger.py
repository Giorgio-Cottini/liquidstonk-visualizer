"""
logger.py — Standalone exporter for LiquidStonk-compatible JSON.

Drop this file into any Python backtester. Call `export_result()` with your
strategy output; it writes a JSON file that GioVisualizer can load directly.

Required fields: strategy, timeline, total_equity, per_perp_equity,
                 per_perp_position, metrics_total, metrics_per_perp,
                 n_opened, n_closed, n_liquidated.

Optional fields default to zero/empty: margin_mode, liquidation_events, long_pnl,
short_pnl, liq_long_pnl, liq_short_pnl, funding_pnl, total_fees.
"""

from __future__ import annotations

import json
import math
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

_METRIC_KEYS = ("PnL", "DD", "Sharpe", "Sortino")


class LoggerError(ValueError):
    """Raised when payload does not satisfy GioVisualizer invariants."""


def _check_finite_numbers(name: str, seq: List[float]) -> None:
    for i, v in enumerate(seq):
        if not isinstance(v, (int, float)) or not math.isfinite(v):
            raise LoggerError(f"{name}[{i}] = {v!r} is not a finite number")


def _check_metrics(name: str, m: Dict[str, float]) -> None:
    if not isinstance(m, dict):
        raise LoggerError(f"{name}: expected dict, got {type(m).__name__}")
    for k in _METRIC_KEYS:
        if k not in m:
            raise LoggerError(f"{name}: missing required key '{k}'")
        v = m[k]
        if not isinstance(v, (int, float)) or not math.isfinite(v):
            raise LoggerError(f"{name}.{k} = {v!r} is not a finite number")


def _validate_payload(
    *,
    strategy: str,
    timeline: List[str],
    total_equity: List[float],
    per_perp_equity: Dict[str, List[float]],
    per_perp_position: Dict[str, List[float]],
    metrics_total: Dict[str, float],
    metrics_per_perp: Dict[str, Dict[str, float]],
    n_opened: int,
    n_closed: int,
    n_liquidated: int,
    liquidation_events: List[Dict[str, object]],
    margin_mode: str,
) -> None:
    if not isinstance(strategy, str) or not strategy.strip():
        raise LoggerError("strategy must be a non-empty string")
    if margin_mode not in ("cross", "isolated"):
        raise LoggerError("margin_mode: expected 'cross' or 'isolated'")

    if not isinstance(timeline, list) or not timeline:
        raise LoggerError("timeline must be a non-empty list of ISO-8601 strings")

    last_dt: Optional[datetime] = None
    seen = set()
    for i, ts in enumerate(timeline):
        if not isinstance(ts, str):
            raise LoggerError(f"timeline[{i}] must be a string")
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except ValueError as e:
            raise LoggerError(f"timeline[{i}]={ts!r} not ISO-8601: {e}") from e
        if last_dt is not None and dt <= last_dt:
            raise LoggerError(
                f"timeline[{i}]={ts!r} not strictly after previous timestamp"
            )
        last_dt = dt
        if ts in seen:
            raise LoggerError(f"timeline[{i}]={ts!r} is a duplicate")
        seen.add(ts)

    T = len(timeline)
    if not isinstance(total_equity, list) or len(total_equity) != T:
        raise LoggerError(
            f"total_equity: length {len(total_equity)} != timeline length {T}"
        )
    _check_finite_numbers("total_equity", total_equity)

    def _check_perp_series(field: str, d: Dict[str, List[float]]) -> None:
        if not isinstance(d, dict):
            raise LoggerError(f"{field}: expected dict")
        for perp, series in d.items():
            if not isinstance(perp, str):
                raise LoggerError(f"{field}: keys must be strings, got {perp!r}")
            if not isinstance(series, list):
                raise LoggerError(f"{field}.{perp}: expected list")
            if len(series) != T:
                raise LoggerError(
                    f"{field}.{perp}: length {len(series)} != timeline length {T}"
                )
            _check_finite_numbers(f"{field}.{perp}", series)

    _check_perp_series("per_perp_equity", per_perp_equity)
    _check_perp_series("per_perp_position", per_perp_position)

    _check_metrics("metrics_total", metrics_total)
    if not isinstance(metrics_per_perp, dict):
        raise LoggerError("metrics_per_perp: expected dict")
    for perp, m in metrics_per_perp.items():
        _check_metrics(f"metrics_per_perp.{perp}", m)
        if perp not in per_perp_equity:
            raise LoggerError(
                f"metrics_per_perp.{perp}: no matching entry in per_perp_equity"
            )

    for name, v in [
        ("n_opened", n_opened),
        ("n_closed", n_closed),
        ("n_liquidated", n_liquidated),
    ]:
        if not isinstance(v, int) or v < 0:
            raise LoggerError(f"{name}: expected non-negative int, got {v!r}")

    def _is_finite(x: object) -> bool:
        return isinstance(x, (int, float)) and math.isfinite(x)

    if not isinstance(liquidation_events, list):
        raise LoggerError("liquidation_events: expected list")
    for i, e in enumerate(liquidation_events):
        if not isinstance(e, dict):
            raise LoggerError(f"liquidation_events[{i}]: expected dict")
        for key in ("timestamp", "asset"):
            if key not in e:
                raise LoggerError(f"liquidation_events[{i}]: missing '{key}'")
        if e["timestamp"] not in seen:
            raise LoggerError(
                f"liquidation_events[{i}].timestamp={e['timestamp']!r} not present in timeline"
            )
        if e["asset"] not in per_perp_equity:
            raise LoggerError(
                f"liquidation_events[{i}].asset={e['asset']!r} not present in per_perp_equity"
            )
        # Match the visualizer's loader: a finite net_cash_loss OR realized_pnl
        # is enough (loader derives net_cash_loss = realized_pnl - fee otherwise).
        if not _is_finite(e.get("net_cash_loss")) and not _is_finite(e.get("realized_pnl")):
            raise LoggerError(
                f"liquidation_events[{i}]: expected finite 'net_cash_loss' or 'realized_pnl'"
            )
        for key in ("account_equity", "maintenance_margin", "fill_price", "fee"):
            if key in e and not _is_finite(e[key]):
                raise LoggerError(
                    f"liquidation_events[{i}].{key} = {e[key]!r} is not finite"
                )


def export_result(
    *,
    path: str,
    strategy: str,
    timeline: List[str],
    total_equity: List[float],
    per_perp_equity: Dict[str, List[float]],
    per_perp_position: Dict[str, List[float]],
    metrics_total: Dict[str, float],
    metrics_per_perp: Dict[str, Dict[str, float]],
    n_opened: int,
    n_closed: int,
    n_liquidated: int,
    margin_mode: str = "cross",
    liquidation_events: Optional[List[Dict[str, object]]] = None,
    long_pnl: float = 0.0,
    short_pnl: float = 0.0,
    liq_long_pnl: float = 0.0,
    liq_short_pnl: float = 0.0,
    funding_pnl: float = 0.0,
    total_fees: float = 0.0,
) -> None:
    """Write a GioVisualizer-compatible JSON file.

    Parameters
    ----------
    path : str
        Output file path (directories created automatically).
    strategy : str
        Strategy name shown in the visualizer header.
    timeline : List[str]
        ISO-8601 UTC timestamps, one per bar. Example: "2024-01-01T00:00:00+00:00".
    total_equity : List[float]
        Absolute portfolio equity at each bar. Must have same length as timeline.
    per_perp_equity : Dict[str, List[float]]
        Per-asset PnL contribution series. Include only assets that traded.
        Each series must have same length as timeline.
    per_perp_position : Dict[str, List[float]]
        Per-asset signed invested USD at each bar. Positive = long, negative = short.
        Same keys as per_perp_equity.
    metrics_total : Dict[str, float]
        Portfolio-level metrics. Required keys: "PnL", "DD", "Sharpe", "Sortino".
    metrics_per_perp : Dict[str, Dict[str, float]]
        Per-asset metrics. Same keys as per_perp_equity. Each value requires
        "PnL", "DD", "Sharpe", "Sortino".
    n_opened : int
        Total positions opened.
    n_closed : int
        Total positions closed (non-liquidation).
    n_liquidated : int
        Total positions liquidated.
    margin_mode : str
        "cross" or "isolated". Defaults to "cross".
    liquidation_events : list, optional
        List of dicts with keys "timestamp" (ISO-8601 str), "asset" (str),
        "net_cash_loss" (float, always <= 0).
    long_pnl : float
        Realized PnL from non-liquidated long closes.
    short_pnl : float
        Realized PnL from non-liquidated short closes.
    liq_long_pnl : float
        Realized PnL of liquidated long positions (typically negative).
    liq_short_pnl : float
        Realized PnL of liquidated short positions (typically negative).
    funding_pnl : float
        Net funding received (negative = paid).
    total_fees : float
        Total fees paid (always >= 0).
    """
    events = list(liquidation_events or [])

    _validate_payload(
        strategy=strategy,
        timeline=timeline,
        total_equity=total_equity,
        per_perp_equity=per_perp_equity,
        per_perp_position=per_perp_position,
        metrics_total=metrics_total,
        metrics_per_perp=metrics_per_perp,
        n_opened=n_opened,
        n_closed=n_closed,
        n_liquidated=n_liquidated,
        liquidation_events=events,
        margin_mode=margin_mode,
    )

    payload = {
        "strategy": strategy,
        "margin_mode": margin_mode,
        "timeline": timeline,
        "total_equity": total_equity,
        "per_perp_equity": per_perp_equity,
        "per_perp_position": per_perp_position,
        "liquidation_events": events,
        "metrics_total": metrics_total,
        "metrics_per_perp": metrics_per_perp,
        "n_opened": n_opened,
        "n_closed": n_closed,
        "n_liquidated": n_liquidated,
        "long_pnl": long_pnl,
        "short_pnl": short_pnl,
        "liq_long_pnl": liq_long_pnl,
        "liq_short_pnl": liq_short_pnl,
        "funding_pnl": funding_pnl,
        "total_fees": total_fees,
    }
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))


# ——— usage example ———————————————————————————————————————————————————————— #

if __name__ == "__main__":
    import math

    # Minimal synthetic backtest: 1 asset ("BTC"), 5 hourly bars
    timestamps = [
        "2024-01-01T00:00:00+00:00",
        "2024-01-01T01:00:00+00:00",
        "2024-01-01T02:00:00+00:00",
        "2024-01-01T03:00:00+00:00",
        "2024-01-01T04:00:00+00:00",
    ]
    initial_equity = 2000.0
    btc_pnl = [0.0, 1.5, 3.2, 2.8, 4.1]
    total_equity = [initial_equity + p for p in btc_pnl]

    def _max_drawdown(eq: List[float]) -> float:
        peak = eq[0]
        worst = 0.0
        for v in eq:
            peak = max(peak, v)
            worst = min(worst, (v - peak) / peak if peak else 0.0)
        return worst

    def _sharpe(pnl_series: List[float], ann: int = 8760) -> float:
        rets = [pnl_series[i] - pnl_series[i - 1] for i in range(1, len(pnl_series))]
        if not rets:
            return 0.0
        mu = sum(rets) / len(rets)
        var = sum((r - mu) ** 2 for r in rets) / max(len(rets) - 1, 1)
        sd = math.sqrt(var)
        return (mu / sd * math.sqrt(ann)) if sd > 0 else 0.0

    btc_metrics = {
        "PnL": btc_pnl[-1] - btc_pnl[0],
        "DD": _max_drawdown(total_equity),
        "Sharpe": _sharpe(btc_pnl),
        "Sortino": 0.0,  # simplified
    }

    export_result(
        path="results/example_strategy.json",
        strategy="example_strategy",
        timeline=timestamps,
        total_equity=total_equity,
        per_perp_equity={"BTC": btc_pnl},
        per_perp_position={"BTC": [0.0, 10.0, 10.0, 10.0, 0.0]},
        metrics_total={
            "PnL": total_equity[-1] - initial_equity,
            "DD": _max_drawdown(total_equity),
            "Sharpe": _sharpe(total_equity),
            "Sortino": 0.0,
        },
        metrics_per_perp={"BTC": btc_metrics},
        n_opened=1,
        n_closed=1,
        n_liquidated=0,
        long_pnl=4.1,
        total_fees=0.09,
    )
    print("Written: results/example_strategy.json")
