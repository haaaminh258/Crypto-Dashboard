const BASE = '/api/crypto';

// ─── Coin metadata (20 coins) ─────────────────────────────────────────────────
export const COINS = {
  'bitcoin':         { symbol: 'BTC',  label: 'Bitcoin',       color: '#f7931a', bg: 'rgba(247,147,26,0.12)',  icon: '₿' },
  'ethereum':        { symbol: 'ETH',  label: 'Ethereum',      color: '#627eea', bg: 'rgba(98,126,234,0.12)',  icon: 'Ξ' },
  'tether':          { symbol: 'USDT', label: 'Tether',        color: '#26a17b', bg: 'rgba(38,161,123,0.12)',  icon: '₮' },
  'solana':          { symbol: 'SOL',  label: 'Solana',        color: '#9945ff', bg: 'rgba(153,69,255,0.12)',  icon: '◎' },
  'binancecoin':     { symbol: 'BNB',  label: 'BNB',           color: '#f3ba2f', bg: 'rgba(243,186,47,0.12)',  icon: 'B' },
  'ripple':          { symbol: 'XRP',  label: 'XRP',           color: '#00aae4', bg: 'rgba(0,170,228,0.12)',   icon: '✕' },
  'usd-coin':        { symbol: 'USDC', label: 'USD Coin',      color: '#2775ca', bg: 'rgba(39,117,202,0.12)',  icon: '$' },
  'dogecoin':        { symbol: 'DOGE', label: 'Dogecoin',      color: '#c2a633', bg: 'rgba(194,166,51,0.12)',  icon: 'Ð' },
  'tron':            { symbol: 'TRX',  label: 'TRON',          color: '#eb0029', bg: 'rgba(235,0,41,0.12)',    icon: 'T' },
  'cardano':         { symbol: 'ADA',  label: 'Cardano',       color: '#0033ad', bg: 'rgba(0,51,173,0.12)',    icon: '₳' },
  'avalanche-2':     { symbol: 'AVAX', label: 'Avalanche',     color: '#e84142', bg: 'rgba(232,65,66,0.12)',   icon: 'A' },
  'chainlink':       { symbol: 'LINK', label: 'Chainlink',     color: '#375bd2', bg: 'rgba(55,91,210,0.12)',   icon: '⬡' },
  'shiba-inu':       { symbol: 'SHIB', label: 'Shiba Inu',     color: '#ffa409', bg: 'rgba(255,164,9,0.12)',   icon: '🐕' },
  'polkadot':        { symbol: 'DOT',  label: 'Polkadot',      color: '#e6007a', bg: 'rgba(230,0,122,0.12)',   icon: '●' },
  'wrapped-bitcoin': { symbol: 'WBTC', label: 'Wrapped BTC',   color: '#f09242', bg: 'rgba(240,146,66,0.12)',  icon: '₿' },
  'bitcoin-cash':    { symbol: 'BCH',  label: 'Bitcoin Cash',  color: '#8dc351', bg: 'rgba(141,195,81,0.12)',  icon: '₿' },
  'near':            { symbol: 'NEAR', label: 'NEAR Protocol', color: '#00c08b', bg: 'rgba(0,192,139,0.12)',   icon: 'N' },
  'litecoin':        { symbol: 'LTC',  label: 'Litecoin',      color: '#bfbbbb', bg: 'rgba(191,187,187,0.12)', icon: 'Ł' },
  'uniswap':         { symbol: 'UNI',  label: 'Uniswap',       color: '#ff007a', bg: 'rgba(255,0,122,0.12)',   icon: '🦄' },
};

export const COIN_IDS = Object.keys(COINS);

export const RANGES = [
  { value: '1h',  label: '1H'  },
  { value: '6h',  label: '6H'  },
  { value: '1d',  label: '1D'  },
  { value: '1w',  label: '1W'  },
  { value: '1m',  label: '1M'  },
  { value: '3m',  label: '3M'  },
];

// ─── API calls ────────────────────────────────────────────────────────────────
async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  return res.json();
}

async function post(path) {
  const res = await fetch(BASE + path, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  return res.json();
}

export const api = {
  market:   ()                       => get('/market'),
  coin:     (id)                     => get(`/market/${id}`),
  history:  (id, range = '1d', max = 200) => get(`/history/${id}?range=${range}&maxPoints=${max}`),
  movers:   (limit = 5)              => get(`/movers?limit=${limit}`),
  compare:  (ids)                    => get(`/compare?symbols=${ids.join(',')}`),
  refresh:  ()                       => post('/refresh'),
  coins:    ()                       => get('/coins'),
};

// ─── Formatters ───────────────────────────────────────────────────────────────
export function formatPrice(value) {
  if (value == null) return '—';
  const n = parseFloat(value);
  if (n === 0) return '$0.00';
  if (n >= 10000)  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  if (n >= 1)      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(n);
  if (n >= 0.0001) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(n);
  return `$${n.toExponential(4)}`;
}

export function formatMarketCap(v) {
  if (!v) return '—';
  const n = parseFloat(v);
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

export function formatChange(v) {
  if (v == null) return { text: '—', positive: null };
  const n = parseFloat(v);
  return { text: `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`, positive: n >= 0 };
}

export function formatVolume(v) {
  return formatMarketCap(v);
}

export function formatTime(ts, range) {
  if (!ts) return '';
  const d = new Date(ts);
  if (range === '1h' || range === '6h') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (range === '1d') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (range === '1w') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTooltipTime(ts, range) {
  if (!ts) return '';
  const d = new Date(ts);
  if (range === '1h' || range === '6h' || range === '1d')
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}
