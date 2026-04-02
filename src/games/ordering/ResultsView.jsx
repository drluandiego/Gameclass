export default function OrderingResultsView({ config, responses }) {
  const total = responses.length;
  let perfectCount = 0;
  for (const r of responses) {
    const order = r.payload?.order || [];
    if (config.correct_order.every((v, i) => v === order[i])) perfectCount++;
  }
  const pct = total > 0 ? Math.round((perfectCount / total) * 100) : 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <p style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-green-text)', margin: 0, fontFamily: "'SF Mono', monospace" }}>{pct}%</p>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>acertaram a ordem completa</p>

      <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Ordem correta:</p>
        {config.items.map((item, i) => (
          <div key={i} style={{
            padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.25rem',
            background: 'var(--accent-green-bg)', border: '1px solid rgba(52,101,56,0.15)',
            color: 'var(--accent-green-text)', fontWeight: 500, fontSize: '0.85rem',
          }}>
            {i + 1}. {item}
          </div>
        ))}
      </div>
    </div>
  );
}
