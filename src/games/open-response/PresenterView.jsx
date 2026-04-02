export default function OpenResponsePresenterView({ config, responses }) {
  return (
    <div>
      <span className="tag tag-blue">Resposta aberta</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{config.question}</h4>

      <div style={{
        marginTop: '0.8rem', maxHeight: '280px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '0.35rem',
      }}>
        {responses.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem' }}>
            Aguardando respostas...
          </p>
        ) : (
          responses.map((r, i) => (
            <div key={r.id || i} style={{
              padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-canvas)', border: '1px solid var(--border)',
              fontSize: '0.85rem', color: 'var(--text-primary)',
              animation: 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              {r.payload?.text}
            </div>
          ))
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} respostas
      </p>
    </div>
  );
}
