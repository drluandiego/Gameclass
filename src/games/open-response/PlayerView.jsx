import { useState } from 'react';
import { motion } from 'framer-motion';

const MAX_CHARS = 500;

export default function OpenResponsePlayerView({ config, onRespond, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (navigator.vibrate) navigator.vibrate(50);
    onRespond({ text: text.trim() });
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
        {config.question}
      </h3>
      <textarea
        className="input-glass"
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
        disabled={disabled}
        rows="4"
        maxLength={MAX_CHARS}
        placeholder="Digite sua resposta..."
        style={{ marginBottom: '0.4rem', fontSize: '16px', resize: 'none' }}
      />

      {/* Character counter */}
      <p style={{
        textAlign: 'right', fontSize: '0.75rem', marginBottom: '0.8rem',
        fontFamily: "'SF Mono', monospace",
        color: text.length > MAX_CHARS * 0.9 ? 'var(--game-orange)' : 'var(--text-tertiary)',
        transition: 'color 0.2s',
      }}>
        {text.length}/{MAX_CHARS}
      </p>

      <motion.button
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        whileTap={!disabled && text.trim() ? { scale: 0.95 } : {}}
        animate={{ opacity: disabled || !text.trim() ? 0.4 : 1 }}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        Enviar resposta
      </motion.button>
    </div>
  );
}
