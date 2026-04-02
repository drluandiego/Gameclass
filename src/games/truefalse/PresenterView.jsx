export default function TrueFalsePresenterView({ config, responses }) {
  const total = responses.length;
  const trueCount = responses.filter(r => r.payload?.answer === true).length;
  const falseCount = total - trueCount;

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-purple">Verdadeiro ou falso</span>

      <h4 style={{ marginTop: '0.6rem', fontSize: '1rem', lineHeight: '1.4', fontWeight: 600, fontFamily: "'SF Pro Display', sans-serif" }}>
        {config.statement}
      </h4>

      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.8rem', borderRadius: 'var(--radius)', background: 'var(--accent-green-bg)', border: '1px solid rgba(52,101,56,0.15)' }}>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-green-text)', margin: 0, fontFamily: "'SF Mono', monospace" }}>{trueCount}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Verdadeiro</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.8rem', borderRadius: 'var(--radius)', background: 'var(--accent-red-bg)', border: '1px solid rgba(159,47,45,0.15)' }}>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-red-text)', margin: 0, fontFamily: "'SF Mono', monospace" }}>{falseCount}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Falso</p>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.6rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
        {total} respostas
      </p>
    </div>
  );
}
