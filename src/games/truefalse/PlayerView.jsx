export default function TrueFalsePlayerView({ config, onRespond, disabled }) {
  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 }}>
        {config.statement}
      </h3>

      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
        <button
          onClick={() => onRespond({ answer: true })}
          disabled={disabled}
          style={{
            flex: 1, maxWidth: '160px', padding: '1.5rem 1rem',
            borderRadius: 'var(--radius-lg)', cursor: disabled ? 'default' : 'pointer',
            background: 'var(--accent-green-bg)', border: '1px solid rgba(52,101,56,0.2)',
            color: 'var(--accent-green-text)', fontWeight: 700, fontSize: '1.2rem',
            opacity: disabled ? 0.4 : 1, transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          V
          <br />
          <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Verdadeiro</span>
        </button>
        <button
          onClick={() => onRespond({ answer: false })}
          disabled={disabled}
          style={{
            flex: 1, maxWidth: '160px', padding: '1.5rem 1rem',
            borderRadius: 'var(--radius-lg)', cursor: disabled ? 'default' : 'pointer',
            background: 'var(--accent-red-bg)', border: '1px solid rgba(159,47,45,0.2)',
            color: 'var(--accent-red-text)', fontWeight: 700, fontSize: '1.2rem',
            opacity: disabled ? 0.4 : 1, transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          F
          <br />
          <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Falso</span>
        </button>
      </div>
    </div>
  );
}
