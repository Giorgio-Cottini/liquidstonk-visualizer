import { useMemo } from "react";
import type { BacktestResult } from "../types";
import { assetColorMap } from "../utils/colors";
import s from "./AssetSelection.module.css";

interface Props {
  result: BacktestResult;
  selected: Set<string>;
  onToggle: (asset: string) => void;
  onSelectAll: (assets: string[]) => void;
  onDeselectAll: (assets: string[]) => void;
}

export default function AssetSelection({
  result,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: Props) {
  const colorMap = useMemo(
    () => assetColorMap(Object.keys(result.per_perp_equity)),
    [result.per_perp_equity],
  );
  const { perps, positive, negative } = useMemo(() => {
    const entries = Object.entries(result.metrics_per_perp);
    return {
      perps: entries,
      positive: entries
        .filter(([, m]) => m.PnL >= 0)
        .sort((a, b) => b[1].PnL - a[1].PnL),
      negative: entries
        .filter(([, m]) => m.PnL < 0)
        .sort((a, b) => a[1].PnL - b[1].PnL),
    };
  }, [result.metrics_per_perp]);

  return (
    <div className={s.card}>
      <div className={s.header}>
        <span className={s.title}>Asset Selection</span>
        <span className={s.assetCount}>{perps.length} assets traded</span>
      </div>
      <div>
        <Section
          variant="positive"
          label="Positive PNL"
          assets={positive}
          colorMap={colorMap}
          selected={selected}
          onToggle={onToggle}
          onSelectAll={() => onSelectAll(positive.map(([n]) => n))}
          onDeselectAll={() => onDeselectAll(positive.map(([n]) => n))}
        />
        <div className={s.sectionDivider} />
        <Section
          variant="negative"
          label="Negative PNL"
          assets={negative}
          colorMap={colorMap}
          selected={selected}
          onToggle={onToggle}
          onSelectAll={() => onSelectAll(negative.map(([n]) => n))}
          onDeselectAll={() => onDeselectAll(negative.map(([n]) => n))}
        />
      </div>
    </div>
  );
}

function Section({
  variant,
  label,
  assets,
  colorMap,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  variant: "positive" | "negative";
  label: string;
  assets: [string, { PnL: number }][];
  colorMap: Record<string, string>;
  selected: Set<string>;
  onToggle: (a: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  const sectionClass = variant === "positive" ? s.sectionPositive : s.sectionNegative;
  const labelClass = variant === "positive" ? s.sectionLabelPositive : s.sectionLabelNegative;

  return (
    <div className={`${s.section} ${sectionClass}`}>
      <div className={s.sectionHeader}>
        <span className={labelClass}>{label}</span>
        <div className={s.spacer} />
        <button className={s.smallBtn} onClick={onSelectAll}>Select All</button>
        <button className={`${s.smallBtn} ${s.deselectBtn}`} onClick={onDeselectAll}>Deselect All</button>
      </div>
      <div className={s.badges}>
        {assets.map(([name]) => (
          <button
            key={name}
            onClick={() => onToggle(name)}
            className={`${s.badge} ${!selected.has(name) ? s.badgeInactive : ''}`}
          >
            <span className={s.colorDot} style={{ background: colorMap[name] ?? '#888' }} />
            <span className={s.badgeText}>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
