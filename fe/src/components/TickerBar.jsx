import { COINS, formatPrice, formatChange } from '../api';

export default function TickerBar({ allPrices }) {
  const items = [...COINS, ...COINS]; // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-b" style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.2)' }}>
      <div className="ticker-track flex items-center gap-0 py-2.5" style={{ width: 'max-content' }}>
        {items.map((coin, i) => {
          const latest = allPrices?.[coin.id]?.slice(-1)[0];
          const change = formatChange(latest?.change24h);
          return (
            <div key={i} className="flex items-center gap-3 px-6 border-r" style={{ borderColor: 'var(--border)' }}>
              <span className="font-display text-xs tracking-wider" style={{ color: coin.color }}>
                {coin.symbol}
              </span>
              <span className="font-display text-xs tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {latest ? formatPrice(latest.priceUsd) : '···'}
              </span>
              {change.positive !== null && (
                <span className="text-xs tabular-nums" style={{ color: change.positive ? 'var(--green)' : 'var(--red)' }}>
                  {change.text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
