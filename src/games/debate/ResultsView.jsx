import { useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function DebateResultsView({ config, responses, theme }) {
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

  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';

  const agreePct = total > 0 ? Math.round((agreeCount / total) * 100) : 0;
  const disagreePct = total > 0 ? Math.round((disagreeCount / total) * 100) : 0;
  const neutralPct = total > 0 ? 100 - agreePct - disagreePct : 0;

  const hasNeutral = config.showNeutral && neutralCount > 0;
  const barTotal = agreeCount + disagreeCount + neutralCount || 1;
  const agreeW = (agreeCount / barTotal) * 100;
  const disagreeW = (disagreeCount / barTotal) * 100;
  const neutralW = hasNeutral ? (neutralCount / barTotal) * 100 : 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <h4 style={{ fontSize: '1rem', lineHeight: 1.4, fontWeight: 700, color: textColor, marginBottom: '1rem' }}>
        {config.statement}
      </h4>

      {/* Final bar */}
      <div style={{
        borderRadius: 'var(--radius)', overflow: 'hidden', height: '56px',
        display: 'flex',
        background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${agreeW}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            background: 'linear-gradient(90deg, #2D9F5D, #3CC474)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: agreeCount > 0 ? '48px' : 0,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{agreePct}%</span>
        </motion.div>
        {hasNeutral && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${neutralW}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{
              background: 'linear-gradient(90deg, #6B7280, #9CA3AF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: neutralCount > 0 ? '36px' : 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>{neutralPct}%</span>
          </motion.div>
        )}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${disagreeW}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          style={{
            background: 'linear-gradient(90deg, #FF6B35, #FF4000)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: disagreeCount > 0 ? '48px' : 0,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{disagreePct}%</span>
        </motion.div>
      </div>

      {/* Cards with counts */}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            flex: 1, textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-lg)',
            background: 'rgba(45,159,93,0.12)',
            border: '1px solid rgba(45,159,93,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <AnimatedCounter value={agreeCount} glow bounce style={{ fontSize: '1.8rem', color: '#2D9F5D' }} />
          <p style={{ color: subtextColor, fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Concordo</p>
        </motion.div>

        {hasNeutral && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              flex: 1, textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-lg)',
              background: 'rgba(107,114,128,0.12)',
              border: '1px solid rgba(107,114,128,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <AnimatedCounter value={neutralCount} glow bounce style={{ fontSize: '1.8rem', color: '#6B7280' }} />
            <p style={{ color: subtextColor, fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Neutro</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            flex: 1, textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,64,0,0.12)',
            border: '1px solid rgba(255,64,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <AnimatedCounter value={disagreeCount} glow bounce style={{ fontSize: '1.8rem', color: '#FF4000' }} />
          <p style={{ color: subtextColor, fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Discordo</p>
        </motion.div>
      </div>

      <p style={{ color: subtextColor, marginTop: '0.8rem', fontSize: '0.85rem' }}>
        {total} participantes
      </p>
    </div>
  );
}
