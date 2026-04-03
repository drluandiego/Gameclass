import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Limit visible reactions for performance
const MAX_VISIBLE = 30;

export default function ReactionOverlay({ reactions }) {
  const visibleReactions = useMemo(() =>
    reactions.slice(-MAX_VISIBLE),
  [reactions]);

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden',
    }}>
      <AnimatePresence>
        {visibleReactions.map((r) => {
          const wobbleX = (Math.random() - 0.5) * 60;
          // 2 trails instead of 3 for better mobile performance
          return [0, 1].map((trail) => (
            <motion.span
              key={`${r.id}-${trail}`}
              initial={{
                position: 'absolute',
                bottom: '0%',
                left: `${r.x}%`,
                opacity: trail === 0 ? 1 : 0.3,
                scale: 1,
                rotate: 0,
              }}
              animate={{
                y: '-100vh',
                x: [0, wobbleX, -wobbleX * 0.6, wobbleX * 0.3],
                opacity: trail === 0 ? [1, 0.9, 0] : [0.25, 0.15, 0],
                scale: [1, 1.2, 1, 1.15, 0.5],
                rotate: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                ease: 'easeOut',
                delay: trail * 0.08,
                x: { duration: 3, times: [0, 0.3, 0.6, 1], ease: 'easeInOut' },
                scale: { duration: 3, times: [0, 0.2, 0.5, 0.7, 1] },
              }}
              style={{
                fontSize: '2rem',
                position: 'absolute',
                willChange: 'transform, opacity',
                textShadow: trail === 0 ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                filter: trail > 0 ? 'blur(1px)' : 'none',
              }}
            >
              {r.emoji}
            </motion.span>
          ));
        })}
      </AnimatePresence>
    </div>
  );
}
