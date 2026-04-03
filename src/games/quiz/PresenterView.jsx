import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

const BAR_COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D'];

export default function QuizPresenterView({ config, responses, theme }) {
  const total = responses.length;
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';

  const voteCounts = config.options.map((_, i) =>
    responses.filter(r => r.payload?.selected_option === i).length
  );

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-blue">Multipla escolha</span>

      <h4 style={{
        marginTop: '0.6rem', fontSize: '1.1rem', lineHeight: '1.4',
        fontWeight: 700, color: textColor,
      }}>
        {config.question}
      </h4>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {config.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((voteCounts[i] / total) * 100) : 0;
          const isCorrect = i === config.correct_option;
          return (
            <div key={i} style={{
              position: 'relative', overflow: 'hidden',
              borderRadius: 'var(--radius)', height: '48px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)',
              backdropFilter: theme === 'dark' ? 'blur(8px)' : 'none',
              border: isCorrect ? `2px solid ${BAR_COLORS[i]}` : '1px solid transparent',
              boxShadow: isCorrect ? `0 0 12px ${BAR_COLORS[i]}40, 0 0 24px ${BAR_COLORS[i]}15` : 'none',
              animation: isCorrect ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(90deg, transparent, ${BAR_COLORS[i]}${isCorrect ? 'CC' : '33'})`,
                  borderRadius: 'var(--radius)',
                }}
              />
              {/* Shimmer sweep */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.8 + i * 0.15 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />
              <div style={{
                position: 'relative', padding: '0 1rem', height: '100%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '0.9rem', fontWeight: 600,
                  color: isCorrect ? (theme === 'dark' ? '#fff' : BAR_COLORS[i]) : subtextColor,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  {isCorrect && <span style={{ fontSize: '0.85rem' }}>✓</span>}
                  {String.fromCharCode(65 + i)}) {opt}
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  {/* Pill badge for vote count */}
                  <span style={{
                    background: `${BAR_COLORS[i]}25`,
                    color: BAR_COLORS[i],
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    fontWeight: 700, fontSize: '0.8rem',
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    <AnimatedCounter value={voteCounts[i]} duration={800} />
                  </span>
                  <span style={{ color: subtextColor, fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
                    {pct}%
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.8rem', color: subtextColor, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {total} respostas
      </p>
    </div>
  );
}
