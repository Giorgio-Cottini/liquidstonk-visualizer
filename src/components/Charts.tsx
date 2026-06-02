import { useMemo } from "react";
import type { Layout } from "plotly.js";
import Plot from "react-plotly.js";
import type { BacktestResult } from "../types";
import StatsPanel from "./StatsPanel";
import { assetColorMap } from "../utils/colors";
import { buildTimelineIndex } from "../utils/parseResult";
import { useTheme } from "../context/ThemeContext";
import s from "./Charts.module.css";

const PLOT_CONFIG = {
  responsive: true,
  displaylogo: false,
  displayModeBar: false,
};

function makePlotLayout(yLabel: string, isDark: boolean): Partial<Layout> {
  const grid = isDark ? "#353028" : "#EBEBF0";
  const axis = isDark ? "#7A7268" : "#AEAEB2";
  const plotBg = isDark ? "#211F1D" : "#FAFAFC";
  const hoverBg = isDark ? "#262220" : "#FFFFFF";
  const hoverBorder = isDark ? "#3D3830" : "#E5E5EA";
  const hoverText = isDark ? "#F0EBE3" : "#1C1C1E";
  return {
    paper_bgcolor: "transparent",
    plot_bgcolor: plotBg,
    font: { family: "Inter, -apple-system, sans-serif", color: axis, size: 11 },
    margin: { t: 8, r: 8, b: 36, l: 56 },
    xaxis: { gridcolor: grid, color: axis, zeroline: false, showgrid: true },
    yaxis: {
      gridcolor: grid,
      color: axis,
      zeroline: false,
      showgrid: true,
      title: { text: yLabel, font: { size: 11 } },
    },
    showlegend: false,
    hovermode: "x unified" as const,
    hoverlabel: {
      bgcolor: hoverBg,
      bordercolor: hoverBorder,
      font: {
        family: "Inter, -apple-system, sans-serif",
        color: hoverText,
        size: 12,
      },
    },
  };
}

function makeCardLayout(isDark: boolean, tickprefix = ""): Partial<Layout> {
  const grid = isDark ? "#353028" : "#EBEBF0";
  const axis = isDark ? "#7A7268" : "#AEAEB2";
  const plotBg = isDark ? "#1E1C1A" : "#F9F9FB";
  const zeroline = isDark ? "#5A5248" : "#C0C0CA";
  return {
    paper_bgcolor: "transparent",
    plot_bgcolor: plotBg,
    margin: { t: 6, r: 8, b: 44, l: 54 },
    dragmode: "zoom" as const,
    xaxis: {
      showgrid: false,
      showticklabels: true,
      tickformat: "%b %d",
      tickangle: -30,
      nticks: 4,
      zeroline: false,
      color: axis,
      tickfont: { size: 9, color: axis },
      fixedrange: false,
    },
    yaxis: {
      autorange: true,
      showgrid: true,
      gridcolor: grid,
      zeroline: true,
      zerolinecolor: zeroline,
      zerolinewidth: 1.5,
      tickfont: { size: 9, color: axis },
      tickprefix,
      fixedrange: true, // Add: lock y, no zoom or min/max selection
    },
    autosize: true,
    showlegend: false,
    hovermode: false as const,
  };
}
interface PnlChartProps {
  result: BacktestResult;
}

export function PnlChart({ result }: PnlChartProps) {
  const { isDark } = useTheme();
  const t = result.timeline;
  const m = result.metrics_total;

  // O(1) timestamp lookup; parseBacktestResult guarantees the index exists.
  const { liqTs, liqValues, liqCustom } = useMemo(() => {
    const idx = buildTimelineIndex(t);
    const ts: string[] = [];
    const vals: number[] = [];
    const custom: [string, number][] = [];
    for (const e of result.liquidation_events) {
      const i = idx.get(e.timestamp);
      if (i === undefined) continue;
      ts.push(e.timestamp);
      vals.push(result.total_equity[i]);
      custom.push([e.asset, e.net_cash_loss]);
    }
    return { liqTs: ts, liqValues: vals, liqCustom: custom };
  }, [t, result.liquidation_events, result.total_equity]);

  return (
    <div className={s.pnlCard}>
      <div className={s.pnlChartWrap}>
        <div className={s.pnlTop}>
          <div>
            <div className={s.pnlLabel}>Total PNL</div>
            <div
              className={`${s.pnlValue} ${m.PnL >= 0 ? s.positive : s.negative}`}
            >
              {m.PnL >= 0 ? "+" : ""}${formatCompact(m.PnL)}
            </div>
          </div>
          <div className={s.dividerV} />
          <MetricPill label="Sharpe" value={m.Sharpe.toFixed(2)} />
          <MetricPill label="Sortino" value={m.Sortino.toFixed(2)} />
          <MetricPill
            label="Max DD"
            value={`${(m.DD * 100).toFixed(1)}%`}
            negative
          />
          <div className={s.spacer} />
          {result.liquidation_events.length > 0 && (
            <div className={s.liqIndicator}>
              ⚡ {result.liquidation_events.length} Liquidations
            </div>
          )}
        </div>
        <Plot
          data={[
            {
              x: t,
              y: result.total_equity,
              type: "scatter",
              mode: "lines",
              line: { color: "#007AFF", width: 2 },
              fill: "tozeroy",
              fillcolor: "rgba(0,122,255,0.08)",
              hovertemplate: "$%{y:,.0f}<extra></extra>",
            },
            ...(liqTs.length > 0
              ? [
                  {
                    x: liqTs,
                    y: liqValues,
                    customdata: liqCustom,
                    type: "scatter" as const,
                    mode: "markers" as const,
                    marker: { color: "#FF3B30", size: 6, symbol: "o" },
                    name: "Liquidation",
                    hovertemplate:
                      "<b>Liquidation</b><br>%{x}<br>Asset: %{customdata[0]}<br>Loss: $%{customdata[1]:,.0f}<extra></extra>",
                  },
                ]
              : []),
          ]}
          layout={{ ...makePlotLayout("USD ($)", isDark), height: 380 }}
          config={PLOT_CONFIG}
          style={{ width: "100%", height: 380 }}
          useResizeHandler
        />
      </div>
      <StatsPanel result={result} />
    </div>
  );
}

interface PositionsChartProps {
  result: BacktestResult;
  selected: Set<string>;
}

export function PositionsChart({ result, selected }: PositionsChartProps) {
  const { isDark } = useTheme();
  const t = result.timeline;
  const hasPositionData = Object.keys(result.per_perp_position).length > 0;

  const colorMap = useMemo(
    () => assetColorMap(Object.keys(result.per_perp_equity)),
    [result.per_perp_equity],
  );

  const perps = useMemo(
    () =>
      Object.keys(result.per_perp_position)
        .filter((p) => selected.has(p))
        .sort(),
    [result.per_perp_position, selected],
  );

  if (!hasPositionData) return null;

  return (
    <div className={s.card}>
      <div className={s.cardHeader}>
        <div>
          <span className={s.cardTitle}>Positions</span>
          <span className={s.cardSubtitle}> — Selected assets over time</span>
        </div>
        <div className={s.spacer} />
        <div className={s.legend}>
          {perps.map((p) => (
            <div key={p} className={s.legendItem}>
              <div
                className={s.legendLine}
                style={{ background: colorMap[p] ?? "#888" }}
              />
              <span className={s.legendText}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={s.plotPadding}>
        <Plot
          data={perps.map((p) => ({
            x: t,
            y: result.per_perp_position[p] || [],
            type: "scatter" as const,
            mode: "lines" as const,
            name: p,
            line: { color: colorMap[p] ?? "#888", width: 2 },
            hovertemplate: `${p}: $%{y:,.2f}<extra></extra>`,
          }))}
          layout={{
            ...makePlotLayout("Invested USD ($)", isDark),
            height: 340,
            showlegend: false,
          }}
          config={PLOT_CONFIG}
          style={{ width: "100%", height: 340 }}
          useResizeHandler
        />
      </div>
    </div>
  );
}

interface PerAssetCardsProps {
  result: BacktestResult;
}

export function PerAssetCards({ result }: PerAssetCardsProps) {
  const { isDark } = useTheme();
  const t = result.timeline;
  const colorMap = useMemo(
    () => assetColorMap(Object.keys(result.per_perp_equity)),
    [result.per_perp_equity],
  );
  const perps = useMemo(
    () =>
      Object.entries(result.metrics_per_perp).sort(
        (a, b) => Math.abs(b[1].PnL) - Math.abs(a[1].PnL),
      ),
    [result.metrics_per_perp],
  );
  const liquidationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of result.liquidation_events) {
      counts.set(event.asset, (counts.get(event.asset) ?? 0) + 1);
    }
    return counts;
  }, [result.liquidation_events]);
  const hasPositionData = Object.keys(result.per_perp_position).length > 0;

  return (
    <div className={s.perAssetSection}>
      <div className={s.perAssetHeader}>
        <span className={s.cardTitle}>Per-Asset Breakdown</span>
        <div className={s.spacer} />
        <span className={s.sortLabel}>Sorted by |PNL|</span>
      </div>
      <div className={s.perAssetGrid}>
        {perps.map(([name, metrics]) => {
          const pnlData = result.per_perp_equity[name] || [];
          const posData = result.per_perp_position[name] || [];
          const pnlColor = metrics.PnL >= 0 ? "#34C759" : "#FF3B30";
          const posColor = colorMap[name] ?? "#888";
          const liquidationCount = liquidationCounts.get(name) ?? 0;

          return (
            <div key={name} className={s.assetCard}>
              <div className={s.assetCardHeader}>
                <div className={s.assetHeaderTop}>
                  <div className={s.assetName}>{name}:</div>
                  <div
                    className={`${s.assetPnl} ${metrics.PnL >= 0 ? s.positive : s.negative}`}
                  >
                    {metrics.PnL >= 0 ? "+" : ""}${formatCompact(metrics.PnL)}
                  </div>
                </div>
                <div className={s.assetHeaderMeta}>
                  {liquidationCount > 0 && (
                    <span className={s.assetLiqCount}>
                      {liquidationCount}⚡
                    </span>
                  )}
                  <span className={s.metricSmall}>
                    SO: {metrics.Sortino.toFixed(2)}
                  </span>
                  <span className={s.metricSmall}>
                    DD: {(metrics.DD * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className={s.cardChartWrap}>
                <div className={s.sparkLabel}>PNL</div>
                <div className={s.chartPlotFill}>
                  <Plot
                    data={[
                      {
                        x: t,
                        y: pnlData,
                        type: "scatter",
                        mode: "lines",
                        line: { color: pnlColor, width: 1.5 },
                        hoverinfo: "skip" as const,
                      },
                    ]}
                    layout={makeCardLayout(isDark, "$")}
                    config={PLOT_CONFIG}
                    style={{ width: "100%", height: "100%" }}
                    useResizeHandler
                  />
                </div>
              </div>
              {hasPositionData && (
                <>
                  <div className={s.sparkDivider} />
                  <div className={s.cardChartWrap}>
                    <div className={s.sparkLabel}>POSITION</div>
                    <div className={s.chartPlotFill}>
                      <Plot
                        data={[
                          {
                            x: t,
                            y: posData,
                            type: "scatter",
                            mode: "lines",
                            line: { color: posColor, width: 1.5 },
                            hoverinfo: "skip" as const,
                          },
                        ]}
                        layout={makeCardLayout(isDark, "$")}
                        config={PLOT_CONFIG}
                        style={{ width: "100%", height: "100%" }}
                        useResizeHandler
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className={s.metricPill}>
      <span className={s.metricLabel}>{label}</span>
      <span className={`${s.metricValue} ${negative ? s.negative : ""}`}>
        {value}
      </span>
    </div>
  );
}

function formatCompact(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toFixed(2);
}

interface LiquidationTableProps {
  result: BacktestResult;
  selected: Set<string>;
}

export function LiquidationTable({ result, selected }: LiquidationTableProps) {
  const colorMap = useMemo(
    () => assetColorMap(Object.keys(result.per_perp_equity)),
    [result.per_perp_equity],
  );
  const liquidations = useMemo(() => {
    return [...result.liquidation_events]
      .filter((e) => selected.size === 0 || selected.has(e.asset))
      .sort((a, b) => Math.abs(b.net_cash_loss) - Math.abs(a.net_cash_loss));
  }, [result.liquidation_events, selected]);

  if (liquidations.length === 0) return null;

  return (
    <div className={s.card}>
      <div className={s.cardHeader}>
        <div>
          <span className={s.cardTitle}>Liquidations</span>
          <span className={s.cardSubtitle}> — Sorted by realized loss</span>
        </div>

        <div className={s.spacer} />

        <div className={s.liqCountBadge}>{liquidations.length} events</div>
      </div>

      <div className={s.liquidationTableWrap}>
        <table className={s.liquidationTable}>
          <thead>
            <tr>
              <th>Asset</th>
              <th>PNL Lost</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {liquidations.map((e, idx) => (
              <tr key={`${e.asset}-${e.timestamp}-${idx}`}>
                <td>
                  <div className={s.assetCell}>
                    <div
                      className={s.assetDot}
                      style={{ background: colorMap[e.asset] ?? "#888" }}
                    />
                    <span>{e.asset}</span>
                  </div>
                </td>

                <td className={s.negative}>
                  -${formatCompact(Math.abs(e.net_cash_loss))}
                </td>

                <td className={s.timeCell}>
                  {new Date(e.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
