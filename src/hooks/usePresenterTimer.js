import { useState, useEffect, useRef } from 'react';

export function usePresenterTimer() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;

  return { elapsed, formatted };
}
