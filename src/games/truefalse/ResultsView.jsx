import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';
import Confetti from '../../components/Confetti';
import GlowRing from '../../components/GlowRing';

export default function TrueFalseResultsView({ config, responses, theme }) {
  const total = responses.length;
  const trueCount = responses.filter(r => r.payload?.answer === true).length;
  const falseCount = total - trueCount;
  const correctCount = responses.filter(r => r.payload?.answer === config.correct_answer).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';

  return (
    <div style={{ textAlign: 'center' }}>
      <Confetti trigger={pct >= 70} />

      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ marginBottom: '1.2rem' }}
      >
        <GlowRing value={pct} size={110} color="var(--game-green)" label="acertaram" delay={0.2} />
      </motion.div>

      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            flex: 1, textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-lg)',
            background: config.correct_answer
              ? 'rgba(45,159,93,0.12)'
              : (theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)'),
            border: config.correct_answer ? '2px solid #2D9F5D' : `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: config.correct_answer ? '0 0 16px rgba(45,159,93,0.2)' : 'none',
            animation: config.correct_answer ? 'pulseGlow 3s ease-in-out infinite' : 'none',
          }}
        >
          <AnimatedCounter value={trueCount} glow bounce style={{ fontSize: '1.8rem', color: '#2D9F5D' }} />
          <p style={{ color: subtextColor, fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Verdadeiro</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            flex: 1, textAlign: 'center', padding: '1rem', borderRadius: 'var(--radius-lg)',
            background: !config.correct_answer
              ? 'rgba(45,159,93,0.12)'
              : (theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)'),
            border: !config.correct_answer ? '2px solid #2D9F5D' : `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: !config.correct_answer ? '0 0 16px rgba(45,159,93,0.2)' : 'none',
            animation: !config.correct_answer ? 'pulseGlow 3s ease-in-out infinite' : 'none',
          }}
        >
          <AnimatedCounter value={falseCount} glow bounce style={{ fontSize: '1.8rem', color: '#FF4000' }} />
          <p style={{ color: subtextColor, fontSize: '0.8rem', margin: '0.2rem 0 0' }}>Falso</p>
        </motion.div>
      </div>

      <p style={{ color: subtextColor, marginTop: '0.8rem', fontSize: '0.85rem' }}>
        Resposta correta: <strong style={{ color: config.correct_answer ? '#2D9F5D' : '#FF4000' }}>
          {config.correct_answer ? 'Verdadeiro' : 'Falso'}
        </strong>
      </p>
    </div>
  );
}
