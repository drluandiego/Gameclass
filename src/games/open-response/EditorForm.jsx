import { useState, useEffect } from 'react';

export default function OpenResponseEditorForm({ config, onChange }) {
  const [question, setQuestion] = useState(config?.question || '');

  useEffect(() => {
    onChange({ question });
  }, [question]);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>A Pergunta</label>
      <textarea
        required
        className="input-glass"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        rows="3"
        placeholder="Ex: O que você entendeu sobre o tema?"
      />
    </div>
  );
}
