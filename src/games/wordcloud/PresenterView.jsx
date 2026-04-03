import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PALETTE = ['#FF4000', '#407294', '#FFD900', '#2D9F5D', '#1B5E8A', '#FF6B35', '#2A8B8B', '#E85D00'];

export default function WordCloudPresenterView({ config, responses, theme }) {
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
    <div>
      <span className="tag tag-blue">Nuvem de palavras</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '1rem', color: subtextColor, fontWeight: 600 }}>{config.prompt}</h4>

      <div style={{
        marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap',
        gap: '0.5rem 0.8rem', justifyContent: 'center', alignItems: 'center',
        minHeight: '120px', padding: '1.5rem',
        background: 'radial-gradient(circle at 50% 50%, rgba(64,114,148,0.06) 0%, transparent 70%)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <AnimatePresence>
          {wordFreq.length === 0 ? (
            <p style={{ color: subtextColor, fontSize: '0.85rem' }}>Aguardando palavras...</p>
          ) : (
            wordFreq.map(([word, count], idx) => {
              const ratio = count / maxFreq;
              const size = 0.9 + ratio * 2.6;
              const color = PALETTE[idx % PALETTE.length];
              const rotation = (idx % 5 - 2) * 4;
              const isLarge = ratio > 0.6;
              return (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, scale: 0.3, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: isLarge ? [1, 1.03, 1] : 1,
                    y: 0,
                    rotate: rotation,
                  }}
                  transition={{
                    type: 'spring', stiffness: 200, damping: 15, delay: idx * 0.03,
                    scale: isLarge ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined,
                  }}
                  style={{
                    fontSize: `${size}rem`,
                    fontWeight: ratio > 0.4 ? 800 : 500,
                    color: color,
                    padding: '0.1rem 0.3rem',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textShadow: `0 0 ${Math.round(ratio * 12)}px ${color}${Math.round(ratio * 60).toString(16).padStart(2, '0')}`,
                  }}
                >
                  {word}
                  {/* Frequency underline bar */}
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
            })
          )}
        </AnimatePresence>
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.5rem', color: subtextColor, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} respostas
      </p>
    </div>
  );
}
