import { useState, useEffect } from 'react';

export default function WordCloudEditorForm({ config, onChange }) {
  const [prompt, setPrompt] = useState(config?.prompt || '');
  const [maxWords, setMaxWords] = useState(config?.max_words ?? 3);

  useEffect(() => {
    onChange({ prompt, max_words: maxWords });
  }, [prompt, maxWords]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pergunta / Prompt</label>
        <textarea
          required
          className="input-glass"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows="3"
          placeholder="Ex: Qual palavra define esta aula?"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Máximo de palavras por aluno</label>
        <input
          type="number"
          min="1"
          max="10"
          className="input-glass"
          value={maxWords}
          onChange={e => setMaxWords(parseInt(e.target.value) || 1)}
          style={{ width: '100px', textAlign: 'center' }}
        />
      </div>
    </div>
  );
}
