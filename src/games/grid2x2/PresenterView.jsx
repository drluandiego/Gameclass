import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

const DOT_COLORS = [
  '#407294', '#2D9F5D', '#FF6B35', '#1B5E8A', '#2A8B8B',
  '#E85D00', '#FF4000', '#FFD900',
];

function getQuadrant(x, y) {
  if (x < 0.5 && y >= 0.5) return 0;
  if (x >= 0.5 && y >= 0.5) return 1;
  if (x < 0.5 && y < 0.5) return 2;
  return 3;
}

function countQuadrants(responses) {
  const counts = [0, 0, 0, 0];
  responses.forEach(r => {
    const p = r.payload;
    if (p && typeof p.x === 'number') counts[getQuadrant(p.x, p.y)]++;
  });
  return counts;
}

export default function Grid2x2PresenterView({ config, responses, theme }) {
  const isDark = theme === 'dark';
  const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';
  const lineColor = isDark ? 'rgba(255,255,255,0.15)' : 'var(--border)';
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'var(--text-tertiary)';
  const counts = countQuadrants(responses);

  return (
    <div>
      <span className="tag tag-purple">Grade 2×2</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '1rem', color: subtextColor, fontWeight: 600 }}>
        {config.prompt}
      </h4>

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: labelColor, fontWeight: 600, marginTop: '0.6rem' }}>
        ↑ {config.axis_y.top}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
        <p style={{
          fontSize: '0.6rem', color: labelColor, fontWeight: 600,
          writingMode: 'vertical-lr', transform: 'rotate(180deg)', whiteSpace: 'nowrap',
        }}>
          {config.axis_x.left} ←
        </p>

        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(64,114,148,0.04) 0%, var(--bg-surface) 70%)',
          border: `1px solid ${lineColor}`,
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          {/* Cross lines with glow */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px',
            background: lineColor,
            boxShadow: isDark ? `0 0 6px ${lineColor}` : 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0, height: '1px',
            background: lineColor,
            boxShadow: isDark ? `0 0 6px ${lineColor}` : 'none',
          }} />

          {/* Quadrant counts with glow */}
          {[
            { q: 0, top: '4%', left: '4%' },
            { q: 1, top: '4%', right: '4%' },
            { q: 2, bottom: '4%', left: '4%' },
            { q: 3, bottom: '4%', right: '4%' },
          ].map(({ q, ...pos }) => (
            <div key={q} style={{
              position: 'absolute', ...pos,
              fontSize: '0.75rem', fontWeight: 700, color: labelColor,
              fontFamily: "'SF Mono', monospace",
              textShadow: counts[q] > 0 ? `0 0 6px ${DOT_COLORS[q % DOT_COLORS.length]}40` : 'none',
            }}>
              <AnimatedCounter value={counts[q]} glow style={{ color: labelColor }} />
            </div>
          ))}

          {/* Dots with glow shadow */}
          <AnimatePresence>
            {responses.map((r, i) => {
              const p = r.payload;
              if (!p || typeof p.x !== 'number') return null;
              const color = DOT_COLORS[i % DOT_COLORS.length];
              return (
                <motion.div
                  key={r.id || i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.85 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  style={{
                    position: 'absolute',
                    left: `${p.x * 100}%`,
                    bottom: `${p.y * 100}%`,
                    width: 10, height: 10,
                    borderRadius: '50%',
                    background: color,
                    border: isDark ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #fff',
                    boxShadow: `0 0 6px ${color}60, 0 1px 4px rgba(0,0,0,0.2)`,
                    transform: 'translate(-50%, 50%)',
                    pointerEvents: 'none',
                  }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        <p style={{
          fontSize: '0.6rem', color: labelColor, fontWeight: 600,
          writingMode: 'vertical-lr', whiteSpace: 'nowrap',
        }}>
          → {config.axis_x.right}
        </p>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: labelColor, fontWeight: 600, marginTop: '0.15rem' }}>
        ↓ {config.axis_y.bottom}
      </p>

      <p style={{ textAlign: 'center', marginTop: '0.4rem', color: subtextColor, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} respostas
      </p>
    </div>
  );
}
