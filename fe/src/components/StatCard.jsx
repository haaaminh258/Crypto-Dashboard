export default function StatCard({ label, value, loading, accent }) {
  return (
    <div className="card-glow p-4">
      <p className="text-xs font-display tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      {loading ? (
        <div className="skeleton w-24 h-5" />
      ) : (
        <p
          className="font-display text-sm tabular-nums font-bold"
          style={{ color: accent || 'var(--text-primary)' }}
        >
          {value || '—'}
        </p>
      )}
    </div>
  );
}
