import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D', '#1B5E8A', '#FF6B35', '#2A8B8B', '#E85D00'];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// Star clip-path
const STAR_CLIP = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

function getShape(i) {
  const mod = i % 3;
  if (mod === 0) return { borderRadius: '50%', clipPath: 'none' };          // circle
  if (mod === 1) return { borderRadius: '2px', clipPath: 'none' };          // square
  return { borderRadius: '0', clipPath: STAR_CLIP };                         // star
}

export default function Confetti({ trigger, duration = 3000, count = 80 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const allParticles = [];

    // 3 waves: 50% / 30% / 20%
    const waves = [
      { count: Math.round(count * 0.5), delay: 0 },
      { count: Math.round(count * 0.3), delay: 100 },
      { count: Math.round(count * 0.2), delay: 200 },
    ];

    // Sparkle particles (10 mini)
    const sparkles = Array.from({ length: 10 }, (_, i) => ({
      id: `sp-${Date.now()}-${i}`,
      x: randomBetween(15, 85),
      color: '#fff',
      size: randomBetween(3, 5),
      rotation: randomBetween(0, 360),
      dx: randomBetween(-80, 80),
      peakY: randomBetween(-500, -300),
      gravityY: randomBetween(200, 400),
      wave: 0,
      waveDelay: 0,
      isSparkle: true,
      shape: { borderRadius: '50%', clipPath: 'none' },
    }));

    let idx = 0;
    for (const wave of waves) {
      for (let w = 0; w < wave.count; w++) {
        allParticles.push({
          id: `${Date.now()}-${idx}`,
          x: randomBetween(10, 90),
          color: COLORS[idx % COLORS.length],
          size: randomBetween(5, 14),
          rotation: randomBetween(0, 360),
          dx: randomBetween(-120, 120),
          peakY: randomBetween(-600, -300),
          gravityY: randomBetween(100, 350),
          wave: wave.delay,
          waveDelay: wave.delay / 1000,
          isSparkle: false,
          shape: getShape(idx),
        });
        idx++;
      }
    }

    setParticles([...allParticles, ...sparkles]);
    const t = setTimeout(() => setParticles([]), duration + 300);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300, overflow: 'hidden' }}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.x}%`,
              bottom: '10%',
              opacity: 1,
              rotate: 0,
              scale: p.isSparkle ? 0.5 : 1,
            }}
            animate={{
              x: p.dx,
              y: [0, p.peakY, p.peakY + p.gravityY],
              opacity: [1, 1, 0],
              rotate: p.rotation + randomBetween(180, 720),
              scale: p.isSparkle
                ? [0.5, 1, 0.2]
                : [1, randomBetween(0.7, 1.1), randomBetween(0.3, 0.6)],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              ease: [0.16, 1, 0.3, 1],
              delay: p.waveDelay,
              y: { duration: duration / 1000, times: [0, 0.4, 1], ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: duration / 1000, times: [0, 0.7, 1] },
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              background: p.color,
              ...p.shape,
              boxShadow: p.isSparkle ? '0 0 4px #fff' : 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
