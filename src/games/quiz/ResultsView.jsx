import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';
import Confetti from '../../components/Confetti';
import GlowRing from '../../components/GlowRing';

const BAR_COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D'];

export default function QuizResultsView({ config, responses, theme }) {
  const total = responses.length;
  const correctCount = responses.filter(r => r.payload?.selected_option === config.correct_option).length;
  const pctCorrect = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';

  return (
    <div style={{ textAlign: 'center' }}>
      <Confetti trigger={pctCorrect >= 70} />

      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1.5rem', alignItems: 'center' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <GlowRing
            value={pctCorrect}
            size={110}
            color="var(--game-green)"
            label="acertaram"
            delay={0.2}
          />
        </motion.div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <AnimatedCounter
            value={total}
            glow
            bounce
            style={{ fontSize: '2.8rem', color: textColor }}
          />
          <p style={{ color: subtextColor, fontSize: '0.8rem' }}>responderam</p>
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
        {config.options.map((opt, i) => {
          const count = responses.filter(r => r.payload?.selected_option === i).length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isCorrect = i === config.correct_option;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                position: 'relative', overflow: 'hidden',
                padding: '0.6rem 0.9rem', borderRadius: 'var(--radius)',
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)',
                border: isCorrect ? `2px solid ${BAR_COLORS[i]}` : `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
                boxShadow: isCorrect ? `0 0 10px ${BAR_COLORS[i]}30` : 'none',
                display: 'flex', justifyContent: 'space-between',
              }}
            >
              {/* Gradient bar background */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.08 }}
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  background: `linear-gradient(90deg, transparent, ${BAR_COLORS[i]}20)`,
                  borderRadius: 'var(--radius)',
                }}
              />
              <span style={{
                position: 'relative',
                color: isCorrect ? BAR_COLORS[i] : (theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)'),
                fontWeight: isCorrect ? 700 : 400, fontSize: '0.9rem',
              }}>
                {isCorrect ? '✓ ' : ''}{String.fromCharCode(65 + i)}) {opt}
              </span>
              <span style={{ position: 'relative', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'SF Mono', monospace", color: textColor }}>
                {count} ({pct}%)
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
