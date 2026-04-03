import { useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function DebatePresenterView({ config, responses, theme }) {
  const { agreeCount, disagreeCount, neutralCount, total } = useMemo(() => {
    let a = 0, d = 0, n = 0;
    for (const r of responses) {
      const p = r.payload?.position;
      if (p === 'agree') a++;
      else if (p === 'disagree') d++;
      else if (p === 'neutral') n++;
    }
    return { agreeCount: a, disagreeCount: d, neutralCount: n, total: responses.length };
  }, [responses]);

  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';

  const agreePct = total > 0 ? Math.round((agreeCount / total) * 100) : 0;
  const disagreePct = total > 0 ? Math.round((disagreeCount / total) * 100) : 0;
  const neutralPct = total > 0 ? 100 - agreePct - disagreePct : 0;

  const hasNeutral = config.showNeutral && neutralCount > 0;

  // For the tug-of-war bar widths
  const barTotal = agreeCount + disagreeCount + neutralCount || 1;
  const agreeW = (agreeCount / barTotal) * 100;
  const disagreeW = (disagreeCount / barTotal) * 100;
  const neutralW = hasNeutral ? (neutralCount / barTotal) * 100 : 0;

  const agreeWins = total > 0 && agreeCount > disagreeCount && agreeCount > neutralCount;
  const disagreeWins = total > 0 && disagreeCount > agreeCount && disagreeCount > neutralCount;

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-purple">Debate</span>

      <h4 style={{ marginTop: '0.6rem', fontSize: '1.1rem', lineHeight: 1.4, fontWeight: 700, color: textColor }}>
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
          animate={{ width: total > 0 ? `${agreeW}%` : '50%' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(90deg, #2D9F5D, #3CC474)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '48px', position: 'relative',
            animation: agreeWins ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', position: 'relative' }}>
            {agreePct}%
          </span>
        </motion.div>

        {hasNeutral && (
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${neutralW}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'linear-gradient(90deg, #6B7280, #9CA3AF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: neutralCount > 0 ? '36px' : 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
              {neutralPct}%
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: total > 0 ? `${disagreeW}%` : '50%' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(90deg, #FF6B35, #FF4000)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '48px',
            animation: disagreeWins ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
            {disagreePct}%
          </span>
        </motion.div>
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{
          color: '#2D9F5D', fontWeight: 700, fontSize: '0.75rem',
          background: 'rgba(45,159,93,0.12)', padding: '0.15rem 0.6rem',
          borderRadius: '9999px', backdropFilter: 'blur(4px)',
        }}>
          Concordo · <AnimatedCounter value={agreeCount} duration={600} />
        </span>
        {hasNeutral && (
          <span style={{
            color: '#6B7280', fontWeight: 700, fontSize: '0.75rem',
            background: 'rgba(107,114,128,0.12)', padding: '0.15rem 0.6rem',
            borderRadius: '9999px',
          }}>
            Neutro · <AnimatedCounter value={neutralCount} duration={600} />
          </span>
        )}
        <span style={{
          color: '#FF4000', fontWeight: 700, fontSize: '0.75rem',
          background: 'rgba(255,64,0,0.12)', padding: '0.15rem 0.6rem',
          borderRadius: '9999px', backdropFilter: 'blur(4px)',
        }}>
          Discordo · <AnimatedCounter value={disagreeCount} duration={600} />
        </span>
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.6rem', color: subtextColor, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {total} respostas
      </p>
    </div>
  );
}
