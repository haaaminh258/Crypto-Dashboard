import { COINS, formatPrice, formatChange } from '../api';

export default function Ticker({ market }) {
  const items = market?.length ? [...market, ...market] : [];

  return (
    <div style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,.25)', height: 36 }}>
      {!items.length ? null : (
        <div className="ticker-inner" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {items.map((row, i) => {
            const meta = COINS[row.name];
            if (!meta) return null;
            const ch = formatChange(row.change24h);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRight: '1px solid var(--border)', height: '100%', flexShrink: 0 }}>
                <span style={{ color: meta.color, fontFamily: 'Space Mono,monospace', fontSize: 10, letterSpacing: '.05em' }}>{meta.symbol}</span>
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{formatPrice(row.priceUsd)}</span>
                <span style={{ fontSize: 10, fontFamily: 'Space Mono,monospace', color: ch.positive ? 'var(--green)' : 'var(--red)' }}>{ch.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
