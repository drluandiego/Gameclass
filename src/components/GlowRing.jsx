import { useId, useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

export default function GlowRing({
  value = 0,
  size = 120,
  strokeWidth = 10,
  color = 'var(--game-green)',
  glowColor,
  label,
  delay = 0,
  suffix = '%',
}) {
  const id = useId();
  const resolvedGlow = glowColor || color;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const offset = useTransform(spring, (v) => circumference * (1 - v / 100));
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      spring.set(value);
    }, delay * 1000);
    return () => clearTimeout(timerRef.current);
  }, [value, delay]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      if (v >= value - 0.5 && !done) setDone(true);
    });
    return unsub;
  }, [value, done]);

  const filterId = `glow-${id}`;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={0.1}
        />

        {/* Animated arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <AnimatedCounter
          value={value}
          suffix={suffix}
          glow
          bounce
          style={{
            fontSize: size * 0.28,
            color: color,
            textShadow: done ? `0 0 12px ${resolvedGlow}66` : 'none',
          }}
        />
        {label && (
          <span style={{
            fontSize: size * 0.11,
            color: 'inherit',
            opacity: 0.6,
            marginTop: 2,
          }}>
            {label}
          </span>
        )}
      </div>

      {/* Pulse glow on complete */}
      {done && (
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          boxShadow: `0 0 20px ${resolvedGlow}30, 0 0 40px ${resolvedGlow}15`,
          animation: 'pulseGlow 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}
