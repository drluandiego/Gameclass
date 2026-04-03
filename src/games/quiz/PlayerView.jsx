import { motion } from 'framer-motion';

const OPTION_COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_ICONS = ['\u25B2', '\u25C6', '\u25CF', '\u25A0'];

function lighten(hex, amt = 30) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

export default function QuizPlayerView({ config, onRespond, disabled }) {
  return (
    <div style={{
      width: '100%',
      background: 'radial-gradient(circle at 50% 30%, rgba(64,114,148,0.06) 0%, transparent 70%)',
      padding: '0.5rem 0',
    }}>
      <h3 style={{
        marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem',
        textAlign: 'center', lineHeight: 1.4,
      }}>
        {config.question}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {config.options.map((opt, i) => (
          <motion.button
            key={i}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              onRespond({ selected_option: i });
            }}
            disabled={disabled}
            whileTap={!disabled ? { scale: 0.93 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: disabled ? 0.4 : 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              padding: '1rem 0.6rem', minHeight: '90px',
              background: `linear-gradient(135deg, ${OPTION_COLORS[i]}, ${lighten(OPTION_COLORS[i], 40)})`,
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: '#fff',
              cursor: disabled ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', gap: '0.3rem',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px -3px ${OPTION_COLORS[i]}66, inset 0 1px 1px rgba(255,255,255,0.25)`,
            }}
          >
            {/* Letter label + icon circle */}
            <span style={{
              width: 34, height: 34,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 800,
              letterSpacing: '0.02em',
            }}>
              {OPTION_LABELS[i]}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3, textAlign: 'center' }}>{opt}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
