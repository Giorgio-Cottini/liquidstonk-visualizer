export interface Metrics {
  PnL: number;
  DD: number;
  Sharpe: number;
  Sortino: number;
}

export interface LiquidationEvent {
  timestamp: string;
  asset: string;
  net_cash_loss: number;
  account_equity?: number;
  maintenance_margin?: number;
  fill_price?: number;
  realized_pnl?: number;
  fee?: number;
}

/**
 * Normalized backtest result — the shape returned by `parseBacktestResult`.
 *
 * Every field is guaranteed present here: fields that are optional in the
 * source JSON (margin_mode, per_perp_position, liquidation_events, the pnl/fee
 * scalars) are filled with documented defaults by the parser. See README.md for
 * which fields the *input* JSON may omit, and parseResult.ts for the defaults.
 */
export interface BacktestResult {
  strategy: string;
  margin_mode: "cross" | "isolated";
  timeline: string[];
  total_equity: number[];
  per_perp_equity: Record<string, number[]>;
  per_perp_position: Record<string, number[]>;
  metrics_total: Metrics;
  metrics_per_perp: Record<string, Metrics>;
  n_opened: number;
  n_closed: number;
  n_liquidated: number;
  liquidation_events: LiquidationEvent[];
  long_pnl: number;
  short_pnl: number;
  liq_long_pnl: number;
  liq_short_pnl: number;
  funding_pnl: number;
  total_fees: number;
}
