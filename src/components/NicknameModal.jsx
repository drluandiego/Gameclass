import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NicknameModal({ onSubmit }) {
  const [nick, setNick] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nick.trim() || nick.trim().length < 2) {
      setError('O nome precisa ter pelo menos 2 caracteres.');
      return;
    }
    if (nick.trim().length > 20) {
      setError('Maximo de 20 caracteres.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(nick.trim());
    } catch {
      setError('Esse nome ja esta em uso. Tente outro!');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass-panel"
        style={{
          width: '100%', maxWidth: '380px',
          textAlign: 'center',
        }}
      >
        <h2 style={{
          fontSize: '1.6rem', marginBottom: '0.5rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #407294, #0E2F44)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Qual seu nome?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Escolha um apelido para participar das atividades.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div>
            <input
              type="text"
              inputMode="text"
              placeholder="Ex: Maria, Lucas P."
              className="input-glass"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              autoFocus
              maxLength={20}
              style={{ textAlign: 'center', fontSize: '16px', width: '100%' }}
            />
            <p style={{
              textAlign: 'right', fontSize: '0.7rem', marginTop: '0.3rem',
              fontFamily: "'SF Mono', monospace",
              color: nick.length >= 18 ? 'var(--game-orange)' : 'var(--text-tertiary)',
            }}>
              {nick.length}/20
            </p>
          </div>
          {error && (
            <p style={{ color: 'var(--game-red)', fontSize: '0.8rem', margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || nick.trim().length < 2}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {submitting && (
              <span style={{
                width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                display: 'inline-block', animation: 'spin 0.6s linear infinite',
              }} />
            )}
            {submitting ? 'Entrando...' : 'Entrar na sala'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
