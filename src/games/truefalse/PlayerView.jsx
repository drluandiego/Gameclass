import { motion } from 'framer-motion';

export default function TrueFalsePlayerView({ config, onRespond, disabled }) {
  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4 }}>
        {config.statement}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <motion.button
          onClick={() => { if (navigator.vibrate) navigator.vibrate(50); onRespond({ answer: true }); }}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.95, boxShadow: '0 0 24px rgba(45,159,93,0.6)' } : {}}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: disabled ? 0.4 : 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            width: '100%', padding: '1.4rem 1rem',
            borderRadius: 'var(--radius-lg)', cursor: disabled ? 'default' : 'pointer',
            background: 'linear-gradient(135deg, #2D9F5D, #3CC474)',
            border: 'none',
            color: '#fff', fontWeight: 800, fontSize: '1.3rem',
            boxShadow: '0 4px 14px -3px rgba(45,159,93,0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
          }}>✓</span>
          Verdadeiro
        </motion.button>

        <motion.button
          onClick={() => { if (navigator.vibrate) navigator.vibrate(50); onRespond({ answer: false }); }}
          disabled={disabled}
          whileTap={!disabled ? { scale: 0.95, boxShadow: '0 0 24px rgba(255,64,0,0.6)' } : {}}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: disabled ? 0.4 : 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.05 }}
          style={{
            width: '100%', padding: '1.4rem 1rem',
            borderRadius: 'var(--radius-lg)', cursor: disabled ? 'default' : 'pointer',
            background: 'linear-gradient(135deg, #FF4000, #FF6B35)',
            border: 'none',
            color: '#fff', fontWeight: 800, fontSize: '1.3rem',
            boxShadow: '0 4px 14px -3px rgba(255,64,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
          }}>✗</span>
          Falso
        </motion.button>
      </div>
    </div>
  );
}
