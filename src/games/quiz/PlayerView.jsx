export default function QuizPlayerView({ config, onRespond, disabled }) {
  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ marginBottom: '1.2rem', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', lineHeight: 1.4 }}>
        {config.question}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        {config.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onRespond({ selected_option: i })}
            disabled={disabled}
            style={{
              padding: '1.2rem 0.8rem', minHeight: '80px', fontSize: '0.9rem', fontWeight: 500,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', color: 'var(--text-primary)',
              cursor: disabled ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
              alignItems: 'center', justifyContent: 'center',
              opacity: disabled ? 0.4 : 1,
              transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: "'SF Mono', monospace", color: 'var(--text-secondary)' }}>{String.fromCharCode(65 + i)}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
