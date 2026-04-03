import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

const AVATARS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
const PODIUM_COLORS = ['#FFD900', '#A29890', '#CD7F32'];
const AVATAR_COLORS = ['#FF4000', '#407294', '#2D9F5D', '#1B5E8A', '#FF6B35', '#2A8B8B', '#E85D00', '#FFD900'];

export default function Leaderboard({ rankings, visible, theme, onDismiss }) {
  if (!visible) return null;

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3;
  const podiumHeights = ['100px', '130px', '80px'];
  const podiumOriginalRanks = top3.length >= 3 ? [2, 1, 3] : top3.map((_, i) => i + 1);

  return (
    <div className="modal-overlay" style={{ zIndex: 150, padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass-panel"
        style={{
          width: '100%', maxWidth: '480px',
          maxHeight: '85vh', overflow: 'auto',
          background: theme === 'dark' ? 'rgba(13,17,23,0.95)' : undefined,
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : undefined,
        }}
      >
        <h2 style={{
          textAlign: 'center', fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.6rem',
          color: theme === 'dark' ? '#fff' : 'var(--text-primary)',
        }}>
          Ranking
        </h2>

        {rankings.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhum participante.</p>
        ) : (
          <>
            {top3.length > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                gap: '0.6rem', marginBottom: '1.5rem', padding: '0 1rem',
              }}>
                {podiumOrder.map((student, i) => {
                  const rank = podiumOriginalRanks[i];
                  const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const podiumColor = PODIUM_COLORS[rank - 1];
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.15, type: 'spring', stiffness: 200, damping: 18 }}
                      style={{
                        flex: 1, textAlign: 'center', maxWidth: '120px',
                      }}
                    >
                      {/* Crown for 1st place */}
                      {rank === 1 && (
                        <motion.span
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
                          style={{ display: 'block', fontSize: '1.4rem', marginBottom: '-0.3rem' }}
                        >
                          👑
                        </motion.span>
                      )}

                      {/* Avatar */}
                      <div style={{
                        width: rank === 1 ? '52px' : '42px',
                        height: rank === 1 ? '52px' : '42px',
                        borderRadius: '50%',
                        background: avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: rank === 1 ? '1rem' : '0.85rem', color: '#fff',
                        margin: '0 auto 0.4rem',
                        boxShadow: `0 4px 12px ${avatarColor}40`,
                      }}>
                        {AVATARS[(rank - 1) % AVATARS.length]}
                      </div>

                      <p style={{
                        fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                      }}>
                        Participante {rank}
                      </p>

                      <AnimatedCounter
                        value={student.total_score || 0}
                        glow
                        bounce
                        style={{
                          fontSize: rank === 1 ? '1.3rem' : '1rem',
                          color: podiumColor,
                        }}
                      />

                      {/* Podium block with gradient + shimmer */}
                      <div style={{
                        marginTop: '0.4rem',
                        height: podiumHeights[i],
                        background: `linear-gradient(180deg, ${podiumColor}40, ${podiumColor}15)`,
                        borderRadius: '8px 8px 0 0',
                        border: `2px solid ${podiumColor}`,
                        borderBottom: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: `0 0 12px ${podiumColor}25`,
                      }}>
                        {/* Shimmer sweep */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                          animation: 'shimmerSweep 3s ease-in-out infinite',
                          pointerEvents: 'none',
                        }} />
                        <span style={{
                          fontSize: '1.5rem', fontWeight: 800,
                          color: podiumColor,
                          position: 'relative',
                        }}>
                          {rank}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {rest.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {rest.map((student, i) => {
                  const rank = i + 4;
                  const avatarColor = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 250, damping: 22 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.7rem',
                        padding: '0.6rem 0.8rem', borderRadius: 'var(--radius)',
                        background: theme === 'dark'
                          ? `rgba(255,255,255,${0.03 + (i % 2) * 0.02})`
                          : i % 2 === 0 ? 'var(--bg-canvas)' : 'rgba(64,114,148,0.04)',
                        backdropFilter: theme === 'dark' ? 'blur(6px)' : 'none',
                        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
                      }}
                    >
                      <span style={{
                        fontFamily: "'SF Mono', monospace", fontSize: '0.85rem',
                        fontWeight: 700, minWidth: '28px', textAlign: 'center',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'var(--text-tertiary)',
                      }}>
                        {rank}
                      </span>

                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8rem', color: '#fff',
                      }}>
                        {AVATARS[(rank - 1) % AVATARS.length]}
                      </div>

                      <span style={{
                        flex: 1, fontWeight: 500, fontSize: '0.9rem',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'var(--text-primary)',
                      }}>
                        Participante {rank}
                      </span>

                      <span style={{
                        fontWeight: 700, fontSize: '0.9rem', fontFamily: "'SF Mono', monospace",
                        color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)',
                      }}>
                        {student.total_score || 0}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Dismiss button + info */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.5rem 1.2rem',
                fontSize: '0.8rem', fontWeight: 600,
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)',
                cursor: 'pointer', marginBottom: '0.5rem',
              }}
            >
              Fechar
            </button>
          )}
          <p style={{
            fontSize: '0.75rem',
            color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'var(--text-tertiary)',
          }}>
            {rankings.length} participantes
          </p>
        </div>
      </motion.div>
    </div>
  );
}
