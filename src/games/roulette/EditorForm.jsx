import { useState, useEffect } from 'react';

export default function RouletteEditorForm({ config, onChange }) {
  const [title, setTitle] = useState(config?.title || 'Sorteio');

  useEffect(() => {
    onChange({ title });
  }, [title]);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Título do Sorteio</label>
      <input
        required
        className="input-glass"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Ex: Quem apresenta primeiro?"
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
        A roleta sorteará um aluno aleatório dentre os que entraram na sala.
      </p>
    </div>
  );
}
