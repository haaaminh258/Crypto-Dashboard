import { useState } from 'react';
import { COINS, formatPrice, formatChange } from '../api';

export default function Sidebar({ market, selectedCoin, onSelect }) {
  const [search, setSearch] = useState('');

  const marketMap = {};
  if (market) market.forEach(m => { marketMap[m.name] = m; });

  const filtered = Object.entries(COINS).filter(([id, meta]) => {
    const q = search.toLowerCase();
    return !q || meta.label.toLowerCase().includes(q) || meta.symbol.toLowerCase().includes(q) || id.includes(q);
  });

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(7,9,15,.6)', backdropFilter: 'blur(8px)',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border)' }}>
        <p className="mono text-xs mb-3" style={{ color: 'var(--muted)', letterSpacing: '.07em' }}>MARKETS ({Object.keys(COINS).length})</p>
        <input
          className="search-input"
          placeholder="Search coin..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
        {filtered.map(([id, meta]) => {
          const row = marketMap[id];
          const ch = formatChange(row?.change24h);
          const active = selectedCoin === id;
          return (
            <div
              key={id}
              className={`coin-row ${active ? 'active' : ''}`}
              onClick={() => onSelect(id)}
              style={active ? { borderColor: meta.color + '40', background: meta.bg } : {}}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: meta.bg, color: meta.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>{meta.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '.04em', color: active ? 'var(--text)' : 'var(--text)' }}>{meta.symbol}</span>
                  {ch.positive !== null && (
                    <span style={{ fontSize: 10, fontFamily: 'Space Mono,monospace', color: ch.positive ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>{ch.text}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'Space Mono,monospace', color: 'var(--muted)', marginTop: 1 }}>
                  {row ? formatPrice(row.priceUsd) : <span className="skel inline-block" style={{ width: 60, height: 10 }} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
