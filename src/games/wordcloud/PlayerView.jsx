import { useState } from 'react';

export default function WordCloudPlayerView({ config, onRespond, disabled }) {
  const [words, setWords] = useState('');

  const handleSubmit = () => {
    const parsed = words.split(/[,\n]+/).map(w => w.trim()).filter(Boolean).slice(0, config.max_words || 3);
    if (parsed.length === 0) return;
    onRespond({ words: parsed });
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>
        {config.prompt}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
        Ate {config.max_words || 3} palavras, separadas por virgula
      </p>
      <textarea
        className="input-glass"
        value={words}
        onChange={e => setWords(e.target.value)}
        disabled={disabled}
        rows="3"
        placeholder="palavra1, palavra2, palavra3"
        style={{ marginBottom: '0.8rem', textAlign: 'center', fontSize: '1rem' }}
      />
      <button onClick={handleSubmit} disabled={disabled || !words.trim()} className="btn-primary"
        style={{ width: '100%', opacity: disabled ? 0.4 : 1 }}>
        Enviar
      </button>
    </div>
  );
}
