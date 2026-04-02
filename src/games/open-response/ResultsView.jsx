export default function OpenResponseResultsView({ config, responses }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>Resultado</span>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>{config.question}</p>

      <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
        {responses.map((r, i) => (
          <div key={r.id || i} style={{
            padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-canvas)', border: '1px solid var(--border)',
            fontSize: '0.85rem',
          }}>
            {r.payload?.text}
          </div>
        ))}
      </div>

      <p style={{ marginTop: '0.6rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} respostas
      </p>
    </div>
  );
}
