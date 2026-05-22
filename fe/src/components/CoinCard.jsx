import { COINS, formatPrice, formatChange } from '../api';

const ICONS = {
  bitcoin:  '₿',
  ethereum: 'Ξ',
  tether:   '₮',
  solana:   '◎',
};

export default function CoinCard({ coin, data, active, onClick }) {
  const meta = COINS.find(c => c.id === coin);
  const latest = data?.[data.length - 1];
  const price = latest?.priceUsd;
  const change = formatChange(latest?.change24h);

  return (
    <button
      className={`coin-tab w-full text-left ${active ? 'active' : ''}`}
      onClick={onClick}
      style={active ? { borderColor: meta.color + '40', background: meta.bg } : {}}
    >
      {/* Icon circle */}
      <span
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: meta.bg, color: meta.color }}
      >
        {ICONS[coin]}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xs tracking-wider">{meta.symbol}</span>
          {change.positive !== null && (
            <span
              className="text-xs font-medium tabular-nums"
              style={{ color: change.positive ? 'var(--green)' : 'var(--red)' }}
            >
              {change.text}
            </span>
          )}
        </div>
        <div className="font-display text-xs tabular-nums mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          {price ? formatPrice(price) : <span className="skeleton inline-block w-20 h-3" />}
        </div>
      </div>
    </button>
  );
}
