import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js';
import { COINS, formatPrice, formatTime, formatTooltipTime } from '../api';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

export default function PriceChart({ coinId, data, range }) {
  const meta = COINS[coinId] || { color: '#6366f1', bg: 'rgba(99,102,241,.12)' };

  if (!data?.length) {
    return (
      <div className="chart-wrap flex flex-col items-center justify-center gap-3">
        <p className="mono text-xs" style={{ color: 'var(--muted)' }}>NO DATA FOR THIS RANGE</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>Start the backend and wait for the first fetch cycle</p>
      </div>
    );
  }

  const tsList = data.map(d => d.timestamp);
  const prices = data.map(d => parseFloat(d.priceUsd));
  const labels = tsList.map(ts => formatTime(ts, range));
  const min = Math.min(...prices), max = Math.max(...prices);
  const pad = (max - min) * 0.12 || max * 0.01 || 1;

  const maxTicks = { '1h': 6, '6h': 6, '1d': 8, '1w': 7, '1m': 8, '3m': 9 }[range] || 8;

  const chartData = {
    labels,
    datasets: [{
      data: prices,
      borderColor: meta.color,
      borderWidth: 2,
      pointRadius: prices.length > 100 ? 0 : prices.length > 40 ? 2 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: meta.color,
      pointBorderColor: '#0c101a',
      pointBorderWidth: 2,
      fill: true,
      backgroundColor: ctx => {
        const { ctx: c, chartArea } = ctx.chart;
        if (!chartArea) return 'transparent';
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0,   meta.color + '55');
        g.addColorStop(0.5, meta.color + '15');
        g.addColorStop(1,   meta.color + '02');
        return g;
      },
      tension: 0.38,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 350, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: 'rgba(255,255,255,.1)', borderWidth: 1,
        titleColor: '#5a6680', bodyColor: '#e2e8f2',
        padding: 12, cornerRadius: 10, displayColors: false,
        callbacks: {
          title: items => formatTooltipTime(tsList[items[0].dataIndex], range),
          label: item => `  ${formatPrice(item.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,.03)', drawBorder: false },
        ticks: { color: 'rgba(90,102,128,.8)', font: { family: 'Space Mono', size: 9 }, maxTicksLimit: maxTicks, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,.03)', drawBorder: false },
        ticks: { color: 'rgba(90,102,128,.8)', font: { family: 'Space Mono', size: 9 }, callback: v => formatPrice(v), maxTicksLimit: 6 },
        border: { display: false },
        min: min - pad, max: max + pad,
      },
    },
  };

  return (
    <div className="chart-wrap">
      <Line key={`${coinId}-${range}-${data.length}`} data={chartData} options={options} />
    </div>
  );
}
