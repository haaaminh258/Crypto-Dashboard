import { COINS, formatPrice, formatMarketCap, formatChange, formatVolume } from '../api';

export default function MarketTable({ market, onSelect, selectedCoin }) {
  if (!market?.length) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[...Array(8)].map((_,i) => (
          <div key={i} className="skel h-10 w-full" style={{ animationDelay: `${i*0.05}s` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['#','Coin','Price','24h','Mkt Cap','Volume'].map(h => (
              <th key={h} style={{ padding: '8px 12px', color: 'var(--muted)', fontFamily: 'Space Mono,monospace', fontSize: '10px', letterSpacing: '.06em', textAlign: h === '#' || h === 'Coin' ? 'left' : 'right', fontWeight: 400 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {market.map((row, i) => {
            const meta = COINS[row.name];
            if (!meta) return null;
            const ch = formatChange(row.change24h);
            const active = selectedCoin === row.name;
            return (
              <tr
                key={row.name}
                onClick={() => onSelect(row.name)}
                style={{
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: active ? 'rgba(255,255,255,.04)' : 'transparent',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.025)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Space Mono,monospace', fontSize: '11px' }}>{i + 1}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {meta.icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{meta.label}</div>
                      <div style={{ color: 'var(--muted)', fontFamily: 'Space Mono,monospace', fontSize: 10 }}>{meta.symbol}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Space Mono,monospace', fontSize: 12 }}>{formatPrice(row.priceUsd)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <span className={`badge ${ch.positive ? 'badge-up' : ch.positive === false ? 'badge-down' : ''}`}>{ch.text}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{formatMarketCap(row.marketCapUsd)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{formatVolume(row.volume24h)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
