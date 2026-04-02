import { useState } from 'react';

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
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '380px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontWeight: 700 }}>
          Qual seu nome?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Escolha um apelido para participar das atividades.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <input
            type="text"
            placeholder="Ex: Maria, Lucas P."
            className="input-glass"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            autoFocus
            maxLength={20}
            style={{ textAlign: 'center', fontSize: '1.1rem' }}
          />
          {error && (
            <p style={{ color: 'var(--accent-red-text)', fontSize: '0.8rem', margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Entrando...' : 'Entrar na sala'}
          </button>
        </form>
      </div>
    </div>
  );
}
