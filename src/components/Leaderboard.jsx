const AVATARS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];

export default function Leaderboard({ rankings, visible }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 150, padding: '2rem' }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '440px',
        maxHeight: '80vh', overflow: 'auto',
      }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          Ranking
        </h2>

        {rankings.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhum participante.</p>
        ) : (
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {rankings.map((student, i) => (
              <div
                key={student.id}
                style={{ '--index': i,
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.7rem 0.8rem', borderRadius: 'var(--radius)',
                  background: i < 3 ? 'var(--accent-yellow-bg)' : 'var(--bg-canvas)',
                  border: `1px solid ${i < 3 ? 'rgba(149,100,0,0.15)' : 'var(--border)'}`,
                  transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span style={{
                  fontFamily: "'SF Mono', monospace", fontSize: '0.85rem',
                  fontWeight: 700, minWidth: '28px', textAlign: 'center',
                  color: i < 3 ? 'var(--accent-yellow-text)' : 'var(--text-secondary)',
                }}>
                  {i + 1}
                </span>

                <div style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                  background: i < 3 ? 'var(--accent-yellow-text)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem', color: '#fff',
                }}>
                  {AVATARS[i % AVATARS.length]}
                </div>

                <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  Participante {i + 1}
                </span>

                <span style={{
                  fontWeight: 700, color: i < 3 ? 'var(--accent-yellow-text)' : 'var(--text-secondary)',
                  fontSize: '0.9rem', fontFamily: "'SF Mono', monospace",
                }}>
                  {student.total_score || 0}
                </span>
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          {rankings.length} participantes &middot; <kbd>L</kbd> para fechar
        </p>
      </div>
    </div>
  );
}
