import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function WordCloudPlayerView({ config, onRespond, disabled }) {
  const [words, setWords] = useState('');
  const maxWords = config.max_words || 3;

  const parsed = useMemo(() =>
    words.split(/[,\n]+/).map(w => w.trim()).filter(Boolean),
  [words]);

  const wordCount = Math.min(parsed.length, maxWords);
  const isAtLimit = parsed.length >= maxWords;

  const handleSubmit = () => {
    const final = parsed.slice(0, maxWords);
    if (final.length === 0) return;
    if (navigator.vibrate) navigator.vibrate(50);
    onRespond({ words: final });
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
        {config.prompt}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
        Ate {maxWords} palavras, separadas por virgula
      </p>
      <textarea
        className="input-glass"
        value={words}
        onChange={e => setWords(e.target.value)}
        disabled={disabled}
        rows="3"
        placeholder="palavra1, palavra2, palavra3"
        style={{ marginBottom: '0.4rem', textAlign: 'center', fontSize: '16px', resize: 'none' }}
      />

      {/* Live word counter */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem',
        marginBottom: '0.8rem', fontSize: '0.8rem',
        color: isAtLimit ? 'var(--game-blue)' : 'var(--text-tertiary)',
        fontFamily: "'SF Mono', monospace", fontWeight: 600,
        transition: 'color 0.2s',
      }}>
        <span>{wordCount}/{maxWords} palavras</span>
        {isAtLimit && parsed.length > maxWords && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: 'var(--game-orange)', fontSize: '0.75rem', fontFamily: 'inherit' }}
          >
            (extras ignoradas)
          </motion.span>
        )}
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={disabled || wordCount === 0}
        whileTap={!disabled && wordCount > 0 ? { scale: 0.95 } : {}}
        animate={{ opacity: disabled || wordCount === 0 ? 0.4 : 1 }}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        {wordCount > 0 ? `Enviar ${wordCount} palavra${wordCount > 1 ? 's' : ''}` : 'Enviar'}
      </motion.button>
    </div>
  );
}
