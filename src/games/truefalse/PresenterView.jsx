import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function TrueFalsePresenterView({ config, responses, theme }) {
  const total = responses.length;
  const trueCount = responses.filter(r => r.payload?.answer === true).length;
  const falseCount = total - trueCount;
  const truePct = total > 0 ? Math.round((trueCount / total) * 100) : 50;
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';
  const trueWins = total > 0 && trueCount > falseCount;
  const falseWins = total > 0 && falseCount > trueCount;

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-purple">Verdadeiro ou falso</span>

      <h4 style={{
        marginTop: '0.6rem', fontSize: '1.1rem', lineHeight: '1.4',
        fontWeight: 700, color: textColor,
      }}>
        {config.statement}
      </h4>

      {/* Tug-of-war bar */}
      <div style={{
        marginTop: '1.2rem', borderRadius: 'var(--radius)',
        overflow: 'hidden', height: '56px',
        display: 'flex', position: 'relative',
        background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)',
      }}>
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${total > 0 ? truePct : 50}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(90deg, #2D9F5D, #3CC474)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '60px',
            animation: trueWins ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
          }}
        >
          {/* Shimmer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.8 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', position: 'relative' }}>
            <AnimatedCounter value={trueCount} duration={800} />
          </span>
        </motion.div>

        {/* Central divider with glow */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px',
          background: '#fff',
          boxShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 16px rgba(255,255,255,0.3)',
          transform: 'translateX(-50%)',
          zIndex: 2,
          opacity: 0.7,
        }} />

        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${total > 0 ? 100 - truePct : 50}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(90deg, #FF6B35, #FF4000)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '60px',
            animation: falseWins ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', position: 'relative' }}>
            <AnimatedCounter value={falseCount} duration={800} />
          </span>
        </motion.div>
      </div>

      {/* Labels as pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{
          color: '#2D9F5D', fontWeight: 700, fontSize: '0.75rem',
          background: 'rgba(45,159,93,0.12)', padding: '0.15rem 0.6rem',
          borderRadius: '9999px', backdropFilter: 'blur(4px)',
        }}>Verdadeiro</span>
        <span style={{
          color: '#FF4000', fontWeight: 700, fontSize: '0.75rem',
          background: 'rgba(255,64,0,0.12)', padding: '0.15rem 0.6rem',
          borderRadius: '9999px', backdropFilter: 'blur(4px)',
        }}>Falso</span>
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.6rem', color: subtextColor, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {total} respostas
      </p>
    </div>
  );
}
