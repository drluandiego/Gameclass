import { useState, useEffect } from 'react';

export default function QnAEditorForm({ config, onChange }) {
  const [prompt, setPrompt] = useState(config?.prompt || '');

  useEffect(() => {
    onChange({ prompt });
  }, [prompt]);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>O Prompt</label>
      <textarea
        required
        className="input-glass"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows="3"
        placeholder="Ex: Que dúvidas vocês têm sobre o conteúdo?"
      />
    </div>
  );
}
