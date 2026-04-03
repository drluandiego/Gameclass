import { motion } from 'framer-motion';
import Confetti from '../../components/Confetti';
import GlowRing from '../../components/GlowRing';

const ITEM_COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D', '#1B5E8A', '#FF6B35', '#2A8B8B', '#E85D00'];

export default function OrderingResultsView({ config, responses, theme }) {
  const total = responses.length;
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';
  let perfectCount = 0;
  for (const r of responses) {
    const order = r.payload?.order || [];
    if (config.correct_order.every((v, i) => v === order[i])) perfectCount++;
  }
  const pct = total > 0 ? Math.round((perfectCount / total) * 100) : 0;

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
        <GlowRing value={pct} size={110} color="var(--game-green)" label="acertaram tudo" delay={0.2} />
      </motion.div>

      <div style={{ textAlign: 'left', maxWidth: '340px', margin: '0 auto' }}>
        <p style={{ color: subtextColor, fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>Ordem correta:</p>
        {config.items.map((item, i) => {
          const color = ITEM_COLORS[i % ITEM_COLORS.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                padding: '0.5rem 0.8rem', borderRadius: 'var(--radius)', marginBottom: '0.3rem',
                background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                borderLeft: `4px solid ${color}`,
                fontWeight: 600, fontSize: '0.9rem',
                color: theme === 'dark' ? '#fff' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: `${color}18`, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'SF Mono', monospace",
                color: color, fontWeight: 800, fontSize: '0.7rem',
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              {item}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
