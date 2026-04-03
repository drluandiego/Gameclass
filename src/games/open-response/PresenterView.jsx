import { motion, AnimatePresence } from 'framer-motion';

const TOP_BORDER_COLORS = ['#407294', '#2D9F5D', '#FFD900', '#1B5E8A', '#FF6B35', '#2A8B8B'];

export default function OpenResponsePresenterView({ config, responses, theme }) {
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';

  return (
    <div>
      <span className="tag tag-blue">Resposta aberta</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '1rem', color: subtextColor, fontWeight: 600 }}>{config.question}</h4>

      <div style={{
        marginTop: '0.8rem', maxHeight: '300px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '0.4rem',
      }}>
        <AnimatePresence>
          {responses.length === 0 ? (
            <p style={{ color: subtextColor, fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              Aguardando respostas...
            </p>
          ) : (
            responses.map((r, i) => {
              const borderColor = TOP_BORDER_COLORS[i % TOP_BORDER_COLORS.length];
              return (
                <motion.div
                  key={r.id || i}
                  initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    padding: '0.6rem 0.9rem', borderRadius: 'var(--radius)',
                    background: theme === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
                    borderTop: `3px solid ${borderColor}`,
                    fontSize: '0.9rem', color: textColor,
                  }}
                >
                  {r.payload?.text}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.6rem', color: subtextColor, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} respostas
      </p>
    </div>
  );
}
