export default function QuizResultsView({ config, responses }) {
  const total = responses.length;
  const correctCount = responses.filter(r => r.payload?.selected_option === config.correct_option).length;
  const pctCorrect = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-green-text)', margin: 0, fontFamily: "'SF Mono', monospace" }}>{pctCorrect}%</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>acertaram</p>
        </div>
        <div>
          <p style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace" }}>{total}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>responderam</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
        {config.options.map((opt, i) => {
          const count = responses.filter(r => r.payload?.selected_option === i).length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isCorrect = i === config.correct_option;
          return (
            <div key={i} style={{
              padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)',
              background: isCorrect ? 'var(--accent-green-bg)' : 'var(--bg-canvas)',
              border: `1px solid ${isCorrect ? 'rgba(52,101,56,0.2)' : 'var(--border)'}`,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ color: isCorrect ? 'var(--accent-green-text)' : 'var(--text-secondary)', fontWeight: isCorrect ? 600 : 400, fontSize: '0.85rem' }}>
                {String.fromCharCode(65 + i)}) {opt}
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>{count} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
