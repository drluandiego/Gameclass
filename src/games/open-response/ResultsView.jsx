import { motion } from 'framer-motion';

const GRADIENT_PAIRS = [
  ['rgba(64,114,148,0.08)', 'rgba(64,114,148,0.03)'],
  ['rgba(45,159,93,0.08)', 'rgba(45,159,93,0.03)'],
  ['rgba(255,217,0,0.06)', 'rgba(255,217,0,0.02)'],
  ['rgba(27,94,138,0.08)', 'rgba(27,94,138,0.03)'],
  ['rgba(255,107,53,0.08)', 'rgba(255,107,53,0.03)'],
  ['rgba(42,139,139,0.08)', 'rgba(42,139,139,0.03)'],
];

export default function OpenResponseResultsView({ config, responses, theme }) {
  const isDark = theme === 'dark';

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>Resultado</span>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>{config.question}</p>

      <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
        {responses.map((r, i) => {
          const [bg1, bg2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
          return (
            <motion.div
              key={r.id || i}
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)',
                background: isDark
                  ? `rgba(255,255,255,${0.04 + (i % 2) * 0.02})`
                  : `linear-gradient(135deg, ${bg1}, ${bg2})`,
                backdropFilter: isDark ? 'blur(6px)' : 'none',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
                fontSize: '0.85rem',
                color: isDark ? '#fff' : 'var(--text-primary)',
              }}
            >
              {r.payload?.text}
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
