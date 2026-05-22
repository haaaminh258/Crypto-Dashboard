import { api } from '../api';

export default function Header({ liveUpdate, onLiveToggle, lastUpdated, onRefresh, refreshing }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', height: 56, flexShrink: 0,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(7,9,15,.8)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #9945ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>◈</div>
        <div>
          <p className="mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em' }}>CRYPTOTRACK</p>
          <p style={{ fontSize: 10, color: 'var(--muted)' }}>20 coins · live data</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Last updated */}
        {lastUpdated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,217,142,.07)', border: '1px solid rgba(16,217,142,.18)', borderRadius: 100, padding: '3px 10px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'block', flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 10, color: 'var(--green)' }}>
              {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
            color: refreshing ? 'var(--muted)' : 'var(--text)', fontSize: 11,
            fontFamily: 'Space Mono,monospace', transition: 'all .15s', letterSpacing: '.06em',
          }}
        >
          {refreshing ? '⟳ ...' : '⟳ FETCH'}
        </button>

        {/* Live toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '.06em', color: liveUpdate ? 'var(--green)' : 'var(--muted)' }}>LIVE</span>
          <label className="toggle">
            <input type="checkbox" checked={liveUpdate} onChange={e => onLiveToggle(e.target.checked)} />
            <span className="toggle-track" />
          </label>
          {liveUpdate && (
            <span style={{ position: 'relative', width: 8, height: 8, display: 'flex' }}>
              <span className="ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--green)', opacity: .7 }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', position: 'relative' }} />
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
