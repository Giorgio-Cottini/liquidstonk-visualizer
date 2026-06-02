import { useState, useMemo, useCallback } from "react";
import type { BacktestResult } from "../types";
import {
  PnlChart,
  PositionsChart,
  PerAssetCards,
  LiquidationTable,
} from "./Charts";
import AssetSelection from "./AssetSelection";
import s from "./Dashboard.module.css";

interface Props {
  result: BacktestResult;
}

export default function Dashboard({ result }: Props) {
  const defaultSelected = useMemo(() => {
    const sorted = Object.entries(result.metrics_per_perp).sort(
      (a, b) => b[1].PnL - a[1].PnL,
    );
    const best5 = sorted.slice(0, 5).map(([n]) => n);
    const worst5 = sorted.slice(-5).map(([n]) => n);
    return new Set([...best5, ...worst5]);
  }, [result]);

  const [selected, setSelected] = useState<Set<string>>(defaultSelected);

  const onToggle = useCallback((asset: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(asset)) next.delete(asset);
      else next.add(asset);
      return next;
    });
  }, []);

  const onSelectAll = useCallback((assets: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      assets.forEach((a) => next.add(a));
      return next;
    });
  }, []);

  const onDeselectAll = useCallback((assets: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      assets.forEach((a) => next.delete(a));
      return next;
    });
  }, []);

  return (
    <div className={s.stack}>
      <PnlChart result={result} />
      <LiquidationTable result={result} selected={selected} />
      <AssetSelection
        result={result}
        selected={selected}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
      <PositionsChart result={result} selected={selected} />
      <PerAssetCards result={result} />
    </div>
  );
}
