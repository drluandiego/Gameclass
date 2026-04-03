import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

const DOT_COLORS = [
  '#407294', '#2D9F5D', '#FF6B35', '#1B5E8A', '#2A8B8B',
  '#E85D00', '#FF4000', '#FFD900',
];

const QUADRANT_COLORS = ['var(--game-blue)', 'var(--game-green)', 'var(--game-orange)', 'var(--game-teal)'];
const QUADRANT_RAW = ['#407294', '#2D9F5D', '#E85D00', '#2A8B8B'];

function getQuadrant(x, y) {
  if (x < 0.5 && y >= 0.5) return 0;
  if (x >= 0.5 && y >= 0.5) return 1;
  if (x < 0.5 && y < 0.5) return 2;
  return 3;
}

function quadrantLabel(config, q) {
  const labels = [
    `${config.axis_x.left} + ${config.axis_y.top}`,
    `${config.axis_x.right} + ${config.axis_y.top}`,
    `${config.axis_x.left} + ${config.axis_y.bottom}`,
    `${config.axis_x.right} + ${config.axis_y.bottom}`,
  ];
  return labels[q];
}

export default function Grid2x2ResultsView({ config, responses }) {
  const counts = [0, 0, 0, 0];
  responses.forEach(r => {
    const p = r.payload;
    if (p && typeof p.x === 'number') counts[getQuadrant(p.x, p.y)]++;
  });
  const total = responses.length || 1;
  const maxQ = counts.indexOf(Math.max(...counts));

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>Resultado</span>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.85rem' }}>{config.prompt}</p>

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 340,
        margin: '0 auto',
        aspectRatio: '1',
        background: 'radial-gradient(circle at 50% 50%, rgba(64,114,148,0.04) 0%, var(--bg-surface) 70%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--border)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)' }} />

        {responses.map((r, i) => {
          const p = r.payload;
          if (!p || typeof p.x !== 'number') return null;
          const color = DOT_COLORS[i % DOT_COLORS.length];
          return (
            <motion.div
              key={r.id || i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22, delay: i * 0.03 }}
              style={{
                position: 'absolute',
                left: `${p.x * 100}%`,
                bottom: `${p.y * 100}%`,
                width: 9, height: 9,
                borderRadius: '50%',
                background: color,
                border: '1.5px solid #fff',
                boxShadow: `0 0 5px ${color}50, 0 1px 4px rgba(0,0,0,0.15)`,
                transform: 'translate(-50%, 50%)',
              }}
            />
          );
        })}
      </div>

      {/* Quadrant badges with glassmorphism */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
        marginTop: '0.8rem', maxWidth: 340, margin: '0.8rem auto 0',
      }}>
        {[0, 1, 2, 3].map(q => {
          const isWinner = q === maxQ && counts[q] > 0;
          return (
            <motion.div
              key={q}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + q * 0.08 }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius)',
                background: isWinner
                  ? `linear-gradient(135deg, ${QUADRANT_RAW[q]}18, ${QUADRANT_RAW[q]}08)`
                  : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(6px)',
                border: `1px solid ${isWinner ? QUADRANT_RAW[q] : 'var(--border)'}`,
                boxShadow: isWinner ? `0 0 12px ${QUADRANT_RAW[q]}25` : 'none',
                transition: 'all 300ms ease',
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: QUADRANT_COLORS[q] }}>
                <AnimatedCounter value={counts[q]} glow style={{ color: QUADRANT_COLORS[q] }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: '0.2rem' }}>
                  ({Math.round(counts[q] / total * 100)}%)
                </span>
              </div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem', lineHeight: 1.3 }}>
                {quadrantLabel(config, q)}
              </p>
            </motion.div>
          );
        })}
      </div>

      <p style={{ marginTop: '0.6rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} respostas
      </p>
    </div>
  );
}
