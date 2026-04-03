import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function Grid2x2PlayerView({ config, onRespond, disabled }) {
  const [point, setPoint] = useState(null);
  const gridRef = useRef(null);

  const calcPoint = useCallback((e) => {
    const rect = gridRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    return { x: +x.toFixed(3), y: +y.toFixed(3) };
  }, []);

  const handleInteraction = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setPoint(calcPoint(e));
  }, [disabled, calcPoint]);

  const { axis_x, axis_y } = config;

  const handleConfirmWithHaptic = () => {
    if (!point) return;
    if (navigator.vibrate) navigator.vibrate(50);
    onRespond({ x: point.x, y: point.y });
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '0.8rem', fontWeight: 700, fontSize: '1.05rem' }}>
        {config.prompt}
      </h3>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
        ↑ {axis_y.top}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <p style={{
          fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600,
          writingMode: 'vertical-lr', transform: 'rotate(180deg)', whiteSpace: 'nowrap',
        }}>
          {axis_x.left} ←
        </p>

        <div
          ref={gridRef}
          onClick={handleInteraction}
          onTouchStart={handleInteraction}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            background: 'radial-gradient(circle at 50% 50%, rgba(64,114,148,0.06) 0%, var(--bg-surface) 70%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            touchAction: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Grid lines — thicker for mobile visibility */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px',
            background: 'var(--border)', transform: 'translateX(-50%)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0, height: '2px',
            background: 'var(--border)', transform: 'translateY(-50%)',
          }} />

          {/* Point with pulsing glow */}
          {point && (
            <motion.div
              key={`${point.x}-${point.y}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                position: 'absolute',
                left: `${point.x * 100}%`,
                bottom: `${point.y * 100}%`,
                width: 20, height: 20,
                borderRadius: '50%',
                background: 'var(--game-blue)',
                border: '2.5px solid #fff',
                boxShadow: '0 0 10px rgba(64,114,148,0.5), 0 0 20px rgba(64,114,148,0.25), 0 2px 8px rgba(64,114,148,0.4)',
                transform: 'translate(-50%, 50%)',
                pointerEvents: 'none',
                animation: 'pulseGlow 2s ease-in-out infinite',
              }}
            />
          )}
        </div>

        <p style={{
          fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600,
          writingMode: 'vertical-lr', whiteSpace: 'nowrap',
        }}>
          → {axis_x.right}
        </p>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontWeight: 600 }}>
        ↓ {axis_y.bottom}
      </p>

      {/* Coordinate feedback */}
      {point && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '0.75rem', color: 'var(--game-blue)', fontWeight: 600,
            marginTop: '0.4rem', fontFamily: "'SF Mono', monospace",
          }}
        >
          Posição: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
        </motion.p>
      )}

      <motion.button
        onClick={handleConfirmWithHaptic}
        disabled={disabled || !point}
        whileTap={!disabled && point ? { scale: 0.95 } : {}}
        animate={{ opacity: (disabled || !point) ? 0.4 : 1 }}
        className="btn-primary"
        style={{ width: '100%', marginTop: '0.6rem' }}
      >
        Confirmar posição
      </motion.button>
    </div>
  );
}
