import { useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function ScalePresenterView({ config, responses, theme }) {
  const values = [];
  for (let i = config.min; i <= config.max; i++) values.push(i);

  const { distribution, avg, total } = useMemo(() => {
    const dist = {};
    values.forEach(v => { dist[v] = 0; });
    let sum = 0;
    for (const r of responses) {
      const v = r.payload?.value;
      if (v != null && dist[v] !== undefined) {
        dist[v]++;
        sum += v;
      }
    }
    const t = responses.length;
    return { distribution: dist, avg: t > 0 ? (sum / t) : 0, total: t };
  }, [responses, config.min, config.max]);

  const maxCount = Math.max(1, ...Object.values(distribution));
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';
  const barBg = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)';

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-purple">Escala</span>

      <h4 style={{ marginTop: '0.6rem', fontSize: '1.1rem', lineHeight: 1.4, fontWeight: 700, color: textColor }}>
        {config.question}
      </h4>

      {/* Horizontal bars */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {values.map((v, i) => {
          const count = distribution[v];
          const pct = total > 0 ? (count / maxCount) * 100 : 0;
          return (
            <motion.div
              key={v}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <span style={{ width: '2rem', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: textColor, fontFamily: "'SF Mono', monospace" }}>
                {v}
              </span>
              <div style={{ flex: 1, height: '32px', borderRadius: 'var(--radius)', background: barBg, overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: 'var(--radius)',
                    background: 'linear-gradient(90deg, #407294, #5BA4D9)',
                    minWidth: count > 0 ? '24px' : 0,
                  }}
                />
              </div>
              <span style={{ width: '2rem', fontWeight: 600, fontSize: '0.85rem', color: subtextColor, fontFamily: "'SF Mono', monospace" }}>
                <AnimatedCounter value={count} duration={600} />
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Labels */}
      {(config.minLabel || config.maxLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingLeft: '2.6rem', fontSize: '0.7rem', color: subtextColor }}>
          <span>{config.minLabel}</span>
          <span>{config.maxLabel}</span>
        </div>
      )}

      {/* Average + count */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.8rem', textAlign: 'center' }}>
        <div>
          <AnimatedCounter value={Number(avg.toFixed(1))} duration={800} suffix="" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#407294' }} glow />
          <p style={{ color: subtextColor, fontSize: '0.7rem', margin: '0.1rem 0 0' }}>média</p>
        </div>
        <div>
          <p style={{ fontSize: '0.8rem', color: subtextColor, fontFamily: "'SF Mono', monospace", marginTop: '0.4rem' }}>
            {total} respostas
          </p>
        </div>
      </div>
    </div>
  );
}
