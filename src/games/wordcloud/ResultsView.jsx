import { useMemo } from 'react';
import { motion } from 'framer-motion';

const PALETTE = ['#FF4000', '#407294', '#FFD900', '#2D9F5D', '#1B5E8A', '#FF6B35', '#2A8B8B', '#E85D00'];
const MEDAL_COLORS = ['#FFD900', '#C0C0C0', '#CD7F32'];

export default function WordCloudResultsView({ config, responses, theme }) {
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';

  const wordFreq = useMemo(() => {
    const freq = {};
    for (const r of responses) {
      const words = r.payload?.words || [];
      for (const w of words) {
        const key = w.toLowerCase().trim();
        if (key) freq[key] = (freq[key] || 0) + 1;
      }
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  }, [responses]);

  const maxFreq = wordFreq.length > 0 ? wordFreq[0][1] : 1;

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.8rem',
        justifyContent: 'center', alignItems: 'center',
        padding: '1.5rem', minHeight: '120px',
        background: 'radial-gradient(circle at 50% 50%, rgba(64,114,148,0.05) 0%, transparent 70%)',
        borderRadius: 'var(--radius-lg)',
      }}>
        {wordFreq.map(([word, count], idx) => {
          const ratio = count / maxFreq;
          const size = 0.9 + ratio * 2.6;
          const color = PALETTE[idx % PALETTE.length];
          const rotation = (idx % 5 - 2) * 4;
          const isTop3 = idx < 3;
          return (
            <motion.span
              key={word}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1, rotate: rotation }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: idx * 0.03 }}
              style={{
                fontSize: `${size}rem`,
                fontWeight: ratio > 0.4 ? 800 : 500,
                color: color,
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                textShadow: idx === 0
                  ? `0 0 16px #FFD90066, 0 0 32px #FFD90030`
                  : `0 0 ${Math.round(ratio * 10)}px ${color}40`,
              }}
            >
              {/* Top 3 badge */}
              {isTop3 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.6em', right: '-0.5em',
                  fontSize: '0.5em',
                  fontWeight: 800,
                  background: MEDAL_COLORS[idx],
                  color: idx === 0 ? '#5a4800' : '#fff',
                  width: '1.6em', height: '1.6em',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 8px ${MEDAL_COLORS[idx]}60`,
                }}>
                  #{idx + 1}
                </span>
              )}
              {word}
              <span style={{
                display: 'block',
                width: `${ratio * 100}%`,
                height: 2,
                background: `linear-gradient(90deg, ${color}, transparent)`,
                borderRadius: '1px',
                marginTop: 1,
                opacity: 0.5,
              }} />
            </motion.span>
          );
        })}
      </div>

      <p style={{ color: subtextColor, marginTop: '0.6rem', fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} participantes
      </p>
    </div>
  );
}
