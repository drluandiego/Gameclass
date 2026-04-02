import { useState, useEffect, useRef } from 'react';

export default function Timer({ durationSec, onEnd, running }) {
  const [remaining, setRemaining] = useState(durationSec);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!running || !durationSec) return;

    startRef.current = Date.now();
    setRemaining(durationSec);

    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, durationSec - elapsed);
      setRemaining(left);

      if (left <= 0) {
        onEnd?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, durationSec]);

  if (!durationSec) return null;

  const pct = (remaining / durationSec) * 100;
  const isLow = remaining <= 5;

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
      <div style={{
        height: '4px', borderRadius: '2px',
        background: 'var(--border)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: `${pct}%`,
          background: isLow ? 'var(--accent-red-text)' : 'var(--text-primary)',
          transition: 'width 0.3s linear, background 0.3s',
        }} />
      </div>
      <p style={{
        textAlign: 'center', marginTop: '0.3rem',
        fontSize: '0.8rem', fontWeight: 600,
        fontFamily: "'SF Mono', 'Geist Mono', monospace",
        color: isLow ? 'var(--accent-red-text)' : 'var(--text-secondary)',
      }}>
        {Math.ceil(remaining)}s
      </p>
    </div>
  );
}
