import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ScalePlayerView({ config, onRespond, disabled }) {
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);
  const values = [];
  for (let i = config.min; i <= config.max; i++) values.push(i);

  const useGrid = values.length > 7;
  const columns = useGrid ? Math.ceil(values.length / 2) : values.length;

  const handleSelect = (v) => {
    if (disabled || sent) return;
    if (navigator.vibrate) navigator.vibrate(30);
    setSelected(v);
  };

  const handleSend = () => {
    if (selected === null || sent) return;
    if (navigator.vibrate) navigator.vibrate(50);
    setSent(true);
    onRespond({ value: selected });
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4 }}>
        {config.question}
      </h3>

      {/* Labels */}
      {(config.minLabel || config.maxLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <span>{config.minLabel}</span>
          <span>{config.maxLabel}</span>
        </div>
      )}

      {/* Value buttons — grid layout for large scales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: useGrid ? `repeat(${columns}, 1fr)` : `repeat(${values.length}, 1fr)`,
        gap: '0.5rem',
        justifyItems: 'center',
        marginBottom: '1.2rem',
      }}>
        {values.map((v, i) => {
          const isSelected = selected === v;
          return (
            <motion.button
              key={v}
              onClick={() => handleSelect(v)}
              disabled={disabled || sent}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: disabled ? 0.4 : 1, scale: isSelected ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.03 }}
              whileTap={!disabled && !sent ? { scale: 0.88 } : {}}
              style={{
                width: 52, height: 52, borderRadius: '50%',
                cursor: disabled || sent ? 'default' : 'pointer',
                background: isSelected
                  ? 'linear-gradient(135deg, #407294, #0E2F44)'
                  : 'var(--bg-canvas)',
                border: isSelected
                  ? '2.5px solid #407294'
                  : '2px solid var(--border)',
                color: isSelected ? '#fff' : 'var(--text-primary)',
                fontWeight: 800, fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSelected ? '0 0 16px rgba(64,114,148,0.4), 0 0 32px rgba(64,114,148,0.15)' : 'none',
                transition: 'box-shadow 0.2s, border 0.2s',
              }}
            >
              {v}
            </motion.button>
          );
        })}
      </div>

      {/* Selected value indicator */}
      {selected !== null && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '0.8rem', color: 'var(--game-blue)', fontWeight: 700,
            marginBottom: '0.8rem', fontFamily: "'SF Mono', monospace",
          }}
        >
          Selecionado: {selected}
        </motion.p>
      )}

      <motion.button
        onClick={handleSend}
        disabled={selected === null || disabled || sent}
        whileTap={selected !== null && !disabled && !sent ? { scale: 0.95 } : {}}
        animate={{ opacity: selected !== null && !sent ? 1 : 0.4 }}
        style={{
          width: '100%', padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, #407294, #0E2F44)',
          border: 'none', color: '#fff',
          fontWeight: 700, fontSize: '1rem',
          cursor: selected !== null && !disabled && !sent ? 'pointer' : 'default',
        }}
      >
        Enviar
      </motion.button>
    </div>
  );
}
