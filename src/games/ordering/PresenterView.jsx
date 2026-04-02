export default function OrderingPresenterView({ config, responses }) {
  const total = responses.length;
  let perfectCount = 0;

  for (const r of responses) {
    const order = r.payload?.order || [];
    const isCorrect = config.correct_order.every((v, i) => v === order[i]);
    if (isCorrect) perfectCount++;
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-blue">Ordenacao</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{config.instruction}</h4>

      <div style={{ marginTop: '0.8rem' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ordem correta</p>
        {config.items.map((item, i) => (
          <div key={i} style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: "'SF Mono', monospace", color: 'var(--text-tertiary)', marginRight: '0.5rem' }}>{i + 1}.</span>
            {item}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.8rem', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace" }}>
          {total} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>respostas</span>
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
          {perfectCount} acertaram tudo
        </p>
      </div>
    </div>
  );
}
