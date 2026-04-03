import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

const ITEM_COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D', '#1B5E8A', '#FF6B35', '#2A8B8B', '#E85D00'];

export default function OrderingPresenterView({ config, responses, theme }) {
  const total = responses.length;
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';
  let perfectCount = 0;

  for (const r of responses) {
    const order = r.payload?.order || [];
    const isCorrect = config.correct_order.every((v, i) => v === order[i]);
    if (isCorrect) perfectCount++;
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-blue">Ordenacao</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '1rem', color: subtextColor, fontWeight: 600 }}>{config.instruction}</h4>

      <div style={{ marginTop: '0.8rem' }}>
        <p style={{ color: subtextColor, fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
          Ordem correta
        </p>
        {config.items.map((item, i) => {
          const color = ITEM_COLORS[i % ITEM_COLORS.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: '0.5rem 0.8rem', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
                borderLeft: `3px solid transparent`,
                borderImage: `linear-gradient(to bottom, ${color}, transparent) 1`,
              }}
            >
              {/* Circular number badge with glow */}
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${color}18`,
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'SF Mono', monospace",
                fontWeight: 800, fontSize: '0.8rem',
                color: color,
                boxShadow: `0 0 8px ${color}30`,
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{ color: textColor }}>{item}</span>
            </motion.div>
          );
        })}
      </div>

      <div style={{
        marginTop: '1rem', padding: '0.8rem', borderRadius: 'var(--radius)',
        background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)',
        backdropFilter: 'blur(8px)',
        textAlign: 'center',
      }}>
        <AnimatedCounter value={total} glow style={{ fontSize: '1.5rem', color: textColor }} />
        <span style={{ fontSize: '0.8rem', color: subtextColor, marginLeft: '0.4rem' }}>respostas</span>
        <p style={{ color: 'var(--game-green)', fontSize: '0.85rem', marginTop: '0.2rem', fontWeight: 600 }}>
          <AnimatedCounter value={perfectCount} duration={800} glow style={{ color: 'var(--game-green)' }} /> acertaram tudo
        </p>
      </div>
    </div>
  );
}
