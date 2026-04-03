import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, duration = 1200, suffix = '', style = {}, glow = false, bounce = false }) {
  const [display, setDisplay] = useState(0);
  const [finished, setFinished] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = Date.now();
    setFinished(false);
    const target = typeof value === 'number' ? value : 0;

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (target - fromRef.current) * eased;
      setDisplay(Math.round(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setFinished(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const glowStyle = glow && style.color ? {
    textShadow: `0 0 8px ${style.color}55, 0 0 16px ${style.color}30`,
  } : {};

  const bounceClass = bounce && finished ? 'counter-bounce' : '';

  return (
    <span
      className={bounceClass}
      style={{
        fontFamily: "'SF Mono', 'Geist Mono', monospace",
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        ...glowStyle,
        ...style,
      }}
    >
      {display}{suffix}
    </span>
  );
}
