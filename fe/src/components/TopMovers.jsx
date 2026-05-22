import { COINS, formatPrice, formatChange } from '../api';

function MoverItem({ coin, onSelect }) {
  const meta = COINS[coin.name];
  if (!meta) return null;
  const ch = formatChange(coin.change24h);
  return (
    <div className="mover-card cursor-pointer" onClick={() => onSelect(coin.name)}
      style={{ transition: 'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
          {meta.icon}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{meta.symbol}</div>
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>{formatPrice(coin.priceUsd)}</div>
        </div>
      </div>
      <span className={`badge ${ch.positive ? 'badge-up' : 'badge-down'}`}>{ch.text}</span>
    </div>
  );
}

export default function TopMovers({ movers, onSelect }) {
  if (!movers) return (
    <div className="flex flex-col gap-2">
      {[...Array(5)].map((_,i) => <div key={i} className="skel h-12" style={{ borderRadius: 10, animationDelay: `${i*.06}s` }} />)}
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <p className="mono text-xs mb-3" style={{ color: 'var(--green)', letterSpacing: '.07em' }}>▲ TOP GAINERS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {movers.gainers?.map(c => <MoverItem key={c.name} coin={c} onSelect={onSelect} />)}
        </div>
      </div>
      <div>
        <p className="mono text-xs mb-3" style={{ color: 'var(--red)', letterSpacing: '.07em' }}>▼ TOP LOSERS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {movers.losers?.map(c => <MoverItem key={c.name} coin={c} onSelect={onSelect} />)}
        </div>
      </div>
    </div>
  );
}
