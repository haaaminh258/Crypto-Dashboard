import { COINS, formatPrice, formatMarketCap, formatChange, formatVolume } from '../api';

function StatBox({ label, value, accent }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <p className="mono" style={{ fontSize: 9, letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>{label}</p>
      <p className="mono" style={{ fontSize: 13, fontWeight: 700, color: accent || 'var(--text)' }}>
        {value ?? <span className="skel inline-block" style={{ width: 70, height: 14 }} />}
      </p>
    </div>
  );
}

export default function CoinDetail({ coinId, latest, loading }) {
  const meta = COINS[coinId];
  if (!meta) return null;
  const ch = formatChange(latest?.change24h);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 48, height: 48, borderRadius: 14, background: meta.bg, color: meta.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, flexShrink: 0,
          }}>{meta.icon}</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{meta.label}</h2>
            <p className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{meta.symbol} / USD</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {loading
            ? <div className="skel" style={{ width: 160, height: 38, borderRadius: 8 }} />
            : <p className="mono" style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 700, color: meta.color, letterSpacing: '-.02em' }}>
                {formatPrice(latest?.priceUsd)}
              </p>
          }
          {ch.positive !== null && (
            <span className={`badge ${ch.positive ? 'badge-up' : 'badge-down'}`} style={{ marginTop: 6, display: 'inline-block' }}>
              {ch.text} 24h
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatBox label="MARKET CAP"  value={formatMarketCap(latest?.marketCapUsd)} />
        <StatBox label="24H VOLUME"  value={formatVolume(latest?.volume24h)} />
        <StatBox label="24H CHANGE"  value={ch.text} accent={ch.positive ? 'var(--green)' : ch.positive === false ? 'var(--red)' : undefined} />
        <StatBox label="RANK"        value={latest ? '#' + (latest.rank ?? '—') : null} />
      </div>
    </div>
  );
}
