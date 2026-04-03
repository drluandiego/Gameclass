import { useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function ScaleResultsView({ config, responses, theme }) {
  const values = [];
  for (let i = config.min; i <= config.max; i++) values.push(i);

  const { distribution, avg, median, total } = useMemo(() => {
    const dist = {};
    values.forEach(v => { dist[v] = 0; });
    const all = [];
    let sum = 0;
    for (const r of responses) {
      const v = r.payload?.value;
      if (v != null && dist[v] !== undefined) {
        dist[v]++;
        all.push(v);
        sum += v;
      }
    }
    const t = all.length;
    all.sort((a, b) => a - b);
    const med = t > 0
      ? (t % 2 === 0 ? (all[t / 2 - 1] + all[t / 2]) / 2 : all[Math.floor(t / 2)])
      : 0;
    return { distribution: dist, avg: t > 0 ? (sum / t) : 0, median: med, total: t };
  }, [responses, config.min, config.max]);

  const maxCount = Math.max(1, ...Object.values(distribution));
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const barBg = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)';

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <h4 style={{ fontSize: '1rem', lineHeight: 1.4, fontWeight: 700, color: textColor, marginBottom: '1rem' }}>
        {config.question}
      </h4>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.2rem' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ textAlign: 'center' }}
        >
          <AnimatedCounter value={Number(avg.toFixed(1))} glow bounce style={{ fontSize: '2rem', color: '#407294' }} />
          <p style={{ color: subtextColor, fontSize: '0.75rem', margin: '0.1rem 0 0' }}>média</p>
        </motion.div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ textAlign: 'center' }}
        >
          <AnimatedCounter value={Number(median.toFixed(1))} glow bounce style={{ fontSize: '2rem', color: '#5BA4D9' }} />
          <p style={{ color: subtextColor, fontSize: '0.75rem', margin: '0.1rem 0 0' }}>mediana</p>
        </motion.div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <AnimatedCounter value={total} glow bounce style={{ fontSize: '2rem', color: subtextColor }} />
          <p style={{ color: subtextColor, fontSize: '0.75rem', margin: '0.1rem 0 0' }}>respostas</p>
        </motion.div>
      </div>

      {/* Bars */}
      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {values.map((v, i) => {
          const count = distribution[v];
          const pct = total > 0 ? (count / maxCount) * 100 : 0;
          return (
            <motion.div
              key={v}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <span style={{ width: '2rem', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: textColor, fontFamily: "'SF Mono', monospace" }}>
                {v}
              </span>
              <div style={{ flex: 1, height: '32px', borderRadius: 'var(--radius)', background: barBg, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.05 }}
                  style={{
                    height: '100%',
                    borderRadius: 'var(--radius)',
                    background: 'linear-gradient(90deg, #407294, #5BA4D9)',
                    minWidth: count > 0 ? '24px' : 0,
                  }}
                />
              </div>
              <span style={{ width: '2rem', fontWeight: 600, fontSize: '0.85rem', color: subtextColor, fontFamily: "'SF Mono', monospace" }}>
                {count}
              </span>
            </motion.div>
          );
        })}
      </div>

      {(config.minLabel || config.maxLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingLeft: '2.6rem', fontSize: '0.7rem', color: subtextColor }}>
          <span>{config.minLabel}</span>
          <span>{config.maxLabel}</span>
        </div>
      )}
    </div>
  );
}
