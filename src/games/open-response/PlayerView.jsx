import { useState } from 'react';

export default function OpenResponsePlayerView({ config, onRespond, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onRespond({ text: text.trim() });
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>
        {config.question}
      </h3>
      <textarea
        className="input-glass"
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={disabled}
        rows="4"
        placeholder="Digite sua resposta..."
        style={{ marginBottom: '0.8rem', fontSize: '0.95rem' }}
      />
      <button onClick={handleSubmit} disabled={disabled || !text.trim()} className="btn-primary"
        style={{ width: '100%', opacity: disabled ? 0.4 : 1 }}>
        Enviar resposta
      </button>
    </div>
  );
}
