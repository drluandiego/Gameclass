export default function QuizPresenterView({ config, responses }) {
  const total = responses.length;

  const voteCounts = config.options.map((_, i) =>
    responses.filter(r => r.payload?.selected_option === i).length
  );

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-blue">Multipla escolha</span>

      <h4 style={{ marginTop: '0.6rem', fontSize: '1rem', lineHeight: '1.4', fontWeight: 600, fontFamily: "'SF Pro Display', sans-serif" }}>
        {config.question}
      </h4>

      <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {config.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((voteCounts[i] / total) * 100) : 0;
          const isCorrect = i === config.correct_option;
          return (
            <div key={i} style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)', border: `1px solid ${isCorrect ? 'rgba(52,101,56,0.3)' : 'var(--border)'}` }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: isCorrect ? 'var(--accent-green-bg)' : 'var(--bg-canvas)',
                width: `${pct}%`, transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
              <div style={{ position: 'relative', padding: '0.45rem 0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: isCorrect ? 'var(--accent-green-text)' : 'var(--text-secondary)' }}>
                  {String.fromCharCode(65 + i)}) {opt}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
                  {voteCounts[i]} ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.6rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
        {total} respostas
      </p>
    </div>
  );
}
