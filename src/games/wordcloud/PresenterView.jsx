import { useMemo } from 'react';

export default function WordCloudPresenterView({ config, responses }) {
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
    <div>
      <span className="tag tag-blue">Nuvem de palavras</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{config.prompt}</h4>

      <div style={{
        marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap',
        gap: '0.4rem', justifyContent: 'center', alignItems: 'center',
        minHeight: '100px', padding: '1rem',
        background: 'var(--bg-canvas)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
      }}>
        {wordFreq.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Aguardando palavras...</p>
        ) : (
          wordFreq.map(([word, count]) => {
            const ratio = count / maxFreq;
            const size = 0.8 + ratio * 1.6;
            return (
              <span key={word} style={{
                fontSize: `${size}rem`, fontWeight: ratio > 0.5 ? 700 : 400,
                color: ratio > 0.7 ? 'var(--text-primary)' : ratio > 0.3 ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                padding: '0.1rem 0.25rem',
                transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                {word}
              </span>
            );
          })
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} respostas
      </p>
    </div>
  );
}
