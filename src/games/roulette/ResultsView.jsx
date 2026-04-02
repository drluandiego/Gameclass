export default function RouletteResultsView({ config }) {
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>Encerrado</span>
      <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{config.title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>O sorteio foi encerrado.</p>
    </div>
  );
}
