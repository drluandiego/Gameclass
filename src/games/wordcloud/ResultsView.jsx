import { useMemo } from 'react';

export default function WordCloudResultsView({ config, responses }) {
  const wordFreq = useMemo(() => {
    const freq = {};
    for (const r of responses) {
      const words = r.payload?.words || [];
      for (const w of words) {
        const key = w.toLowerCase().trim();
        if (key) freq[key] = (freq[key] || 0) + 1;
      }
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  }, [responses]);

  const maxFreq = wordFreq.length > 0 ? wordFreq[0][1] : 1;

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        justifyContent: 'center', alignItems: 'center',
        padding: '1.5rem', minHeight: '120px',
        background: 'var(--bg-canvas)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
      }}>
        {wordFreq.map(([word, count]) => {
          const ratio = count / maxFreq;
          const size = 0.9 + ratio * 1.8;
          return (
            <span key={word} style={{
              fontSize: `${size}rem`, fontWeight: ratio > 0.5 ? 700 : 400,
              color: ratio > 0.7 ? 'var(--text-primary)' : ratio > 0.3 ? 'var(--text-secondary)' : 'var(--text-tertiary)',
            }}>
              {word}
            </span>
          );
        })}
      </div>
      <p style={{ color: 'var(--text-tertiary)', marginTop: '0.6rem', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} participantes
      </p>
    </div>
  );
}
