import { useMemo } from 'react';
import type { BacktestResult } from '../types';
import s from './StatsPanel.module.css';

interface Props { result: BacktestResult; }

const fmtNum = (v: number): string =>
  Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2);

export default function StatsPanel({ result }: Props) {
  const { best5, worst5 } = useMemo(() => {
    const sorted = Object.entries(result.metrics_per_perp).sort(
      (a, b) => b[1].PnL - a[1].PnL,
    );
    // Disjoint halves: when fewer than 10 assets, worst starts past best so an
    // asset never appears in both columns.
    const worstStart = Math.max(5, sorted.length - 5);
    return {
      best5: sorted.slice(0, 5),
      worst5: sorted.slice(worstStart).reverse(),
    };
  }, [result.metrics_per_perp]);

  return (
    <div className={s.panel}>
      <div className={s.section}>
        <div className={s.sectionTitle}>Best Assets</div>
        {best5.map(([name, met]) => (
          <AssetRow key={name} name={name} pnl={met.PnL} positive />
        ))}
      </div>
      <div className={s.divider} />
      <div className={s.section}>
        <div className={s.sectionTitle}>Worst Assets</div>
        {worst5.map(([name, met]) => (
          <AssetRow key={name} name={name} pnl={met.PnL} positive={false} />
        ))}
      </div>
    </div>
  );
}

function AssetRow({ name, pnl, positive }: { name: string; pnl: number; positive: boolean }) {
  return (
    <div className={s.row}>
      <span className={s.rowName}>{name}</span>
      <span className={`${s.rowValue} ${positive ? s.positive : s.negative}`}>
        {pnl > 0 ? '+' : ''}${fmtNum(pnl)}
      </span>
    </div>
  );
}
