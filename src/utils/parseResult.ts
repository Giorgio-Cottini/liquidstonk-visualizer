/**
 * Strict, fail-loud validator for BacktestResult JSON.
 *
 * Surfaces malformed data immediately instead of letting it propagate into
 * the chart layer, where errors manifest as silent visual glitches.
 *
 * Throws ParseError on any structural problem. Optional fields default to
 * empty/zero (documented) — no fallback for required fields.
 */

import type { BacktestResult, LiquidationEvent, Metrics } from "../types";

export class ParseError extends Error {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(`Invalid backtest JSON:\n  - ${issues.join("\n  - ")}`);
    this.name = "ParseError";
    this.issues = issues;
  }
}

const METRIC_KEYS: (keyof Metrics)[] = ["PnL", "DD", "Sharpe", "Sortino"];

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every((x) => typeof x === "number");
}

function validateMetrics(label: string, v: unknown, issues: string[]): v is Metrics {
  if (!v || typeof v !== "object") {
    issues.push(`${label}: expected object, got ${typeof v}`);
    return false;
  }
  let ok = true;
  for (const k of METRIC_KEYS) {
    const x = (v as Record<string, unknown>)[k];
    if (!isFiniteNumber(x)) {
      issues.push(`${label}.${k}: expected finite number, got ${String(x)}`);
      ok = false;
    }
  }
  return ok;
}

function validateLiquidationEvent(
  e: unknown,
  idx: number,
  issues: string[],
): e is Record<string, unknown> {
  if (!e || typeof e !== "object") {
    issues.push(`liquidation_events[${idx}]: expected object`);
    return false;
  }
  const r = e as Record<string, unknown>;
  let ok = true;
  if (typeof r.timestamp !== "string") {
    issues.push(`liquidation_events[${idx}].timestamp: expected string`);
    ok = false;
  }
  if (typeof r.asset !== "string") {
    issues.push(`liquidation_events[${idx}].asset: expected string`);
    ok = false;
  }
  if (!isFiniteNumber(r.net_cash_loss) && !isFiniteNumber(r.realized_pnl)) {
    issues.push(
      `liquidation_events[${idx}]: expected finite net_cash_loss or realized_pnl`,
    );
    ok = false;
  }
  for (const key of [
    "account_equity",
    "maintenance_margin",
    "fill_price",
    "fee",
  ]) {
    const v = r[key];
    if (v !== undefined && !isFiniteNumber(v)) {
      issues.push(`liquidation_events[${idx}].${key}: expected finite number`);
      ok = false;
    }
  }
  return ok;
}

function normalizeLiquidationEvent(e: Record<string, unknown>): LiquidationEvent {
  const realizedPnl = e.realized_pnl;
  const fee = isFiniteNumber(e.fee) ? e.fee : 0;
  const netCashLoss = isFiniteNumber(e.net_cash_loss)
    ? e.net_cash_loss
    : (realizedPnl as number) - fee;

  const out: LiquidationEvent = {
    timestamp: e.timestamp as string,
    asset: e.asset as string,
    net_cash_loss: netCashLoss,
  };

  for (const key of [
    "account_equity",
    "maintenance_margin",
    "fill_price",
    "realized_pnl",
    "fee",
  ] as const) {
    const v = e[key];
    if (isFiniteNumber(v)) out[key] = v;
  }

  return out;
}

/**
 * Validate, normalise, and return a strongly-typed BacktestResult.
 *
 * Required fields: strategy, timeline, total_equity, per_perp_equity,
 *                  metrics_total, metrics_per_perp, n_opened, n_closed, n_liquidated.
 * Optional fields (default to empty/zero): per_perp_position,
 *                  liquidation_events, long_pnl, short_pnl, liq_long_pnl,
 *                  liq_short_pnl, funding_pnl, total_fees.
 */
export function parseBacktestResult(raw: unknown): BacktestResult {
  const issues: string[] = [];

  if (!raw || typeof raw !== "object") {
    throw new ParseError(["root: expected object"]);
  }
  const r = raw as Record<string, unknown>;

  // ——— required scalar fields ———
  if (typeof r.strategy !== "string" || !r.strategy.trim()) {
    issues.push("strategy: expected non-empty string");
  }
  const margin_mode =
    r.margin_mode === undefined ? "cross" : r.margin_mode;
  if (margin_mode !== "cross" && margin_mode !== "isolated") {
    issues.push("margin_mode: expected 'cross' or 'isolated'");
  }

  // ——— timeline ———
  if (!isStringArray(r.timeline)) {
    issues.push("timeline: expected array of ISO-8601 strings");
  }
  const timeline = isStringArray(r.timeline) ? r.timeline : [];
  const T = timeline.length;
  if (T === 0) {
    issues.push("timeline: must contain at least one bar");
  }

  // Strict ascending + finite + no-duplicates check. Only membership is needed
  // downstream (liquidation timestamps), so a Set suffices — the render-time
  // timestamp→index map is built lazily by buildTimelineIndex.
  const tsSeen = new Set<string>();
  let lastTs = -Infinity;
  for (let i = 0; i < timeline.length; i++) {
    const ts = timeline[i];
    const ms = Date.parse(ts);
    if (!Number.isFinite(ms)) {
      issues.push(`timeline[${i}]="${ts}" is not a valid ISO-8601 timestamp`);
      continue;
    }
    if (ms <= lastTs) {
      issues.push(
        `timeline[${i}]="${ts}" is not strictly after timeline[${i - 1}]`,
      );
    }
    lastTs = ms;
    if (tsSeen.has(ts)) {
      issues.push(`timeline[${i}]="${ts}" is a duplicate`);
    } else {
      tsSeen.add(ts);
    }
  }

  // ——— total_equity ———
  if (!isNumberArray(r.total_equity)) {
    issues.push("total_equity: expected array of numbers");
  } else {
    if (r.total_equity.length !== T) {
      issues.push(
        `total_equity: length ${r.total_equity.length} != timeline length ${T}`,
      );
    }
    for (let i = 0; i < r.total_equity.length; i++) {
      if (!Number.isFinite(r.total_equity[i])) {
        issues.push(`total_equity[${i}] is not finite`);
        break;
      }
    }
  }

  // ——— per-perp series ———
  const validatePerpSeries = (
    field: "per_perp_equity" | "per_perp_position",
    required: boolean,
  ): Record<string, number[]> => {
    const v = r[field];
    if (v == null) {
      if (required) issues.push(`${field}: required object missing`);
      return {};
    }
    if (typeof v !== "object" || Array.isArray(v)) {
      issues.push(`${field}: expected object`);
      return {};
    }
    const out: Record<string, number[]> = {};
    for (const [perp, series] of Object.entries(v as Record<string, unknown>)) {
      if (!isNumberArray(series)) {
        issues.push(`${field}.${perp}: expected array of numbers`);
        continue;
      }
      if (series.length !== T) {
        issues.push(
          `${field}.${perp}: length ${series.length} != timeline length ${T}`,
        );
        continue;
      }
      out[perp] = series;
    }
    return out;
  };
  const per_perp_equity = validatePerpSeries("per_perp_equity", true);
  const per_perp_position = validatePerpSeries("per_perp_position", false);

  // ——— metrics ———
  validateMetrics("metrics_total", r.metrics_total, issues);
  const metrics_per_perp: Record<string, Metrics> = {};
  if (!r.metrics_per_perp || typeof r.metrics_per_perp !== "object") {
    issues.push("metrics_per_perp: expected object");
  } else {
    for (const [perp, m] of Object.entries(
      r.metrics_per_perp as Record<string, unknown>,
    )) {
      if (validateMetrics(`metrics_per_perp.${perp}`, m, issues)) {
        metrics_per_perp[perp] = m as Metrics;
      }
    }
    // Cross-reference: every metrics_per_perp key must have an equity series.
    for (const perp of Object.keys(metrics_per_perp)) {
      if (!(perp in per_perp_equity)) {
        issues.push(
          `metrics_per_perp.${perp}: no matching entry in per_perp_equity`,
        );
      }
    }
  }

  // ——— counters ———
  const intField = (name: string): number => {
    const v = r[name];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) {
      issues.push(`${name}: expected non-negative integer`);
      return 0;
    }
    return v;
  };
  const n_opened = intField("n_opened");
  const n_closed = intField("n_closed");
  const n_liquidated = intField("n_liquidated");

  // ——— optional liquidation events ———
  const rawLiq = r.liquidation_events ?? [];
  if (!Array.isArray(rawLiq)) {
    issues.push("liquidation_events: expected array");
  }
  const liquidation_events: LiquidationEvent[] = [];
  if (Array.isArray(rawLiq)) {
    for (let i = 0; i < rawLiq.length; i++) {
      const e = rawLiq[i];
      if (!validateLiquidationEvent(e, i, issues)) continue;
      const le = normalizeLiquidationEvent(e);
      if (!tsSeen.has(le.timestamp)) {
        issues.push(
          `liquidation_events[${i}].timestamp="${le.timestamp}" not present in timeline`,
        );
        continue;
      }
      if (!(le.asset in per_perp_equity)) {
        issues.push(
          `liquidation_events[${i}].asset="${le.asset}" not present in per_perp_equity`,
        );
        continue;
      }
      liquidation_events.push(le);
    }
  }

  // ——— optional scalars ———
  const optFloat = (name: string): number => {
    const v = r[name];
    if (v === undefined) return 0.0;
    if (!isFiniteNumber(v)) {
      issues.push(`${name}: expected finite number, got ${String(v)}`);
      return 0.0;
    }
    return v;
  };
  const long_pnl = optFloat("long_pnl");
  const short_pnl = optFloat("short_pnl");
  const liq_long_pnl = optFloat("liq_long_pnl");
  const liq_short_pnl = optFloat("liq_short_pnl");
  const funding_pnl = optFloat("funding_pnl");
  const total_fees = optFloat("total_fees");

  if (issues.length > 0) {
    throw new ParseError(issues);
  }

  return {
    strategy: r.strategy as string,
    margin_mode: margin_mode as "cross" | "isolated",
    timeline,
    total_equity: r.total_equity as number[],
    per_perp_equity,
    per_perp_position,
    metrics_total: r.metrics_total as Metrics,
    metrics_per_perp,
    n_opened,
    n_closed,
    n_liquidated,
    liquidation_events,
    long_pnl,
    short_pnl,
    liq_long_pnl,
    liq_short_pnl,
    funding_pnl,
    total_fees,
  };
}

/** Build a timestamp -> bar index map; useful for O(1) liquidation lookups. */
export function buildTimelineIndex(timeline: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < timeline.length; i++) m.set(timeline[i], i);
  return m;
}
