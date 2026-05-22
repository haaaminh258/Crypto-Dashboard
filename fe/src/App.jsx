import { useState, useEffect, useRef, useCallback } from 'react';
import { api, COINS, RANGES } from './api';
import Header from './components/Header';
import Ticker from './components/Ticker';
import Sidebar from './components/Sidebar';
import CoinDetail from './components/CoinDetail';
import PriceChart from './components/PriceChart';
import MarketTable from './components/MarketTable';
import TopMovers from './components/TopMovers';

const TABS = ['CHART', 'MARKET', 'MOVERS'];

export default function App() {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [range, setRange]               = useState('1d');
  const [tab, setTab]                   = useState('CHART');
  const [liveUpdate, setLiveUpdate]     = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);

  // Data
  const [chartData, setChartData]   = useState([]);
  const [market, setMarket]         = useState([]);
  const [movers, setMovers]         = useState(null);
  const [coinLatest, setCoinLatest] = useState(null);

  // UI state
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);

  const liveRef = useRef(null);

  // ── Loaders ──────────────────────────────────────────────────────────────────
  const loadMarket = useCallback(async () => {
    setLoadingMarket(true);
    try {
      const data = await api.market();
      setMarket(data);
      const found = data.find(d => d.name === selectedCoin);
      if (found) setCoinLatest(found);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMarket(false);
    }
  }, [selectedCoin]);

  const loadChart = useCallback(async (coin, r) => {
    setLoadingChart(true);
    setError(null);
    try {
      const data = await api.history(coin, r, 250);
      setChartData(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  const loadMovers = useCallback(async () => {
    try { setMovers(await api.movers(5)); } catch (_) {}
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Github Action is handling the data fetching now, so we just reload from DB
    await Promise.all([loadMarket(), loadChart(selectedCoin, range), loadMovers()]);
    setRefreshing(false);
  };

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadMarket();
    loadChart(selectedCoin, range);
    loadMovers();
  }, []);

  // ── Re-fetch when coin / range changes ───────────────────────────────────────
  useEffect(() => {
    loadChart(selectedCoin, range);
    // Also update coinLatest from market cache
    const found = market.find(d => d.name === selectedCoin);
    if (found) setCoinLatest(found);
  }, [selectedCoin, range]);

  // ── Live update every 5 minutes ────────────────────────────────────────────────────
  useEffect(() => {
    if (liveUpdate) {
      liveRef.current = setInterval(async () => {
        await loadMarket();
        await loadChart(selectedCoin, range);
      }, 300000); // 5 minutes
    } else {
      clearInterval(liveRef.current);
    }
    return () => clearInterval(liveRef.current);
  }, [liveUpdate, selectedCoin, range]);

  const handleSelectCoin = (id) => {
    setSelectedCoin(id);
    setTab('CHART');
  };

  // ── Rank coins from market data ───────────────────────────────────────────────
  const rankedMarket = [...market].sort((a, b) => parseFloat(b.marketCapUsd) - parseFloat(a.marketCapUsd));
  const latestWithRank = coinLatest ? { ...coinLatest, rank: rankedMarket.findIndex(r => r.name === selectedCoin) + 1 } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        liveUpdate={liveUpdate}
        onLiveToggle={setLiveUpdate}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      <Ticker market={rankedMarket} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ display: sidebarOpen ? 'block' : 'none', flexShrink: 0, overflow: 'hidden', height: '100%' }}>
          <Sidebar market={market} selectedCoin={selectedCoin} onSelect={handleSelectCoin} />
        </div>

        {/* Main panel */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>

          {/* Sidebar toggle (mobile / collapse) */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <div className="fade-up" style={{ display: 'flex', gap: 4 }}>
              {TABS.map(t => (
                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="fade-up" style={{ background: 'rgba(255,64,96,.08)', border: '1px solid rgba(255,64,96,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--red)', fontSize: 12 }}>⚠</span>
              <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'Space Mono,monospace' }}>
                Backend unreachable — run your Spring Boot app on :8080
              </span>
              <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          )}

          {/* ── CHART TAB ── */}
          {tab === 'CHART' && (
            <div className="fade-up">
              <CoinDetail coinId={selectedCoin} latest={latestWithRank} loading={loadingChart && !latestWithRank} />
              <div className="card" style={{ padding: '18px 20px' }}>
                {/* Range selector */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.07em' }}>PRICE HISTORY</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {RANGES.map(r => (
                      <button key={r.value} className={`range-btn ${range === r.value ? 'active' : ''}`} onClick={() => setRange(r.value)}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart or skeleton */}
                {loadingChart ? (
                  <div className="chart-wrap flex flex-col justify-end gap-2 p-2">
                    {[...Array(5)].map((_,i) => <div key={i} className="skel" style={{ height: `${28 + Math.random()*50}px` }} />)}
                  </div>
                ) : (
                  <PriceChart coinId={selectedCoin} data={chartData} range={range} />
                )}

                <p className="mono" style={{ fontSize: 9, color: 'var(--muted)', marginTop: 10, textAlign: 'right', letterSpacing: '.05em' }}>
                  {chartData.length} data points · {range.toUpperCase()} · auto-sampled
                </p>
              </div>

              {/* Live status */}
              {liveUpdate && (
                <div style={{ marginTop: 12, background: 'rgba(16,217,142,.05)', border: '1px solid rgba(16,217,142,.12)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0, display: 'flex' }}>
                    <span className="ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--green)', opacity: .6 }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', position: 'relative' }} />
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--green)', letterSpacing: '.07em' }}>
                    LIVE — REFRESHING EVERY 5 MINUTES
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── MARKET TAB ── */}
          {tab === 'MARKET' && (
            <div className="card fade-up">
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.07em' }}>ALL MARKETS · {rankedMarket.length} COINS</p>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Click a row to view chart</span>
              </div>
              <MarketTable market={rankedMarket} onSelect={handleSelectCoin} selectedCoin={selectedCoin} />
            </div>
          )}

          {/* ── MOVERS TAB ── */}
          {tab === 'MOVERS' && (
            <div className="fade-up">
              <div className="card" style={{ padding: '18px 20px' }}>
                <p className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.07em', marginBottom: 18 }}>TOP MOVERS — 24H CHANGE</p>
                <TopMovers movers={movers} onSelect={handleSelectCoin} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
