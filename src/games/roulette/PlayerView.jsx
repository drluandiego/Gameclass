export default function RoulettePlayerView() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{
        width: '48px', height: '48px', margin: '0 auto 1rem',
        border: '2px solid var(--border)', borderTop: '2px solid var(--text-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <h3 style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '1.1rem' }}>Sorteio em andamento</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Acompanhe na tela principal.</p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
