export default function TrueFalseResultsView({ config, responses }) {
  const total = responses.length;
  const trueCount = responses.filter(r => r.payload?.answer === true).length;
  const falseCount = total - trueCount;
  const correctCount = responses.filter(r => r.payload?.answer === config.correct_answer).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <p style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-green-text)', margin: 0, fontFamily: "'SF Mono', monospace" }}>{pct}%</p>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>acertaram</p>

      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.8rem', borderRadius: 'var(--radius)', background: config.correct_answer ? 'var(--accent-green-bg)' : 'var(--bg-canvas)', border: `1px solid ${config.correct_answer ? 'rgba(52,101,56,0.15)' : 'var(--border)'}` }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace" }}>{trueCount}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Verdadeiro</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.8rem', borderRadius: 'var(--radius)', background: !config.correct_answer ? 'var(--accent-green-bg)' : 'var(--bg-canvas)', border: `1px solid ${!config.correct_answer ? 'rgba(52,101,56,0.15)' : 'var(--border)'}` }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace" }}>{falseCount}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Falso</p>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', fontSize: '0.8rem' }}>
        Resposta correta: <strong>{config.correct_answer ? 'Verdadeiro' : 'Falso'}</strong>
      </p>
    </div>
  );
}
