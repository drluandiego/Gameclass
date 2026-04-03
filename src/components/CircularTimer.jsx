import { useState, useEffect, useRef, useId } from 'react';

const SIZE = 80;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CircularTimer({ durationSec, onEnd, running }) {
  const [remaining, setRemaining] = useState(durationSec);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const filterId = useId();
  const gradId = useId();

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

  const pct = remaining / durationSec;
  const offset = CIRCUMFERENCE * (1 - pct);
  const isLow = remaining <= 5;
  const isCritical = remaining <= 3;

  const strokeColor = isCritical ? 'var(--game-red)' : isLow ? 'var(--game-orange)' : undefined;

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      marginBottom: '0.8rem',
    }}>
      <div style={{
        position: 'relative', width: SIZE, height: SIZE,
        borderRadius: '50%',
        background: isCritical
          ? 'radial-gradient(circle, rgba(255,64,0,0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(64,114,148,0.06) 0%, transparent 70%)',
        animation: isCritical ? 'pulseGlow 0.8s ease-in-out infinite' : 'none',
        boxShadow: isCritical ? '0 0 20px rgba(255,64,0,0.25), 0 0 40px rgba(255,64,0,0.1)' : 'none',
        transition: 'box-shadow 0.5s ease, background 0.5s ease',
      }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--game-blue)" />
              <stop offset="100%" stopColor="var(--game-green)" />
            </linearGradient>
            <filter id={filterId}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
            opacity={0.4}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke={strokeColor || `url(#${gradId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            filter={`url(#${filterId})`}
            style={{
              transition: 'stroke-dashoffset 0.3s linear, stroke 0.5s ease',
            }}
          />
        </svg>
        {/* Center number */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: isLow ? '1.4rem' : '1.2rem',
            fontWeight: 800,
            fontFamily: "'SF Mono', monospace",
            color: isCritical ? 'var(--game-red)' : isLow ? 'var(--game-orange)' : 'var(--game-blue)',
            transition: 'color 0.5s ease, font-size 0.3s ease',
            animation: isCritical ? 'timerPulse 0.6s ease-in-out infinite' : 'none',
            textShadow: isCritical ? '0 0 8px rgba(255,64,0,0.5)' : 'none',
          }}>
            {Math.ceil(remaining)}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes timerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
