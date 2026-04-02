import { useState, useEffect } from 'react';

export default function TrueFalseEditorForm({ config, onChange }) {
  const [statement, setStatement] = useState(config?.statement || '');
  const [correctAnswer, setCorrectAnswer] = useState(config?.correct_answer ?? true);

  useEffect(() => {
    onChange({ statement, correct_answer: correctAnswer });
  }, [statement, correctAnswer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>A Afirmação</label>
        <textarea
          required
          className="input-glass"
          value={statement}
          onChange={e => setStatement(e.target.value)}
          rows="3"
          placeholder="Ex: O coração humano tem 4 câmaras."
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>A resposta correta é:</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setCorrectAnswer(true)}
            style={{
              flex: 1, padding: '0.8rem', borderRadius: '8px', cursor: 'pointer',
              background: correctAnswer ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${correctAnswer ? 'var(--success)' : 'var(--glass-border)'}`,
              color: correctAnswer ? 'var(--success)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '1rem',
            }}
          >
            VERDADEIRO
          </button>
          <button
            type="button"
            onClick={() => setCorrectAnswer(false)}
            style={{
              flex: 1, padding: '0.8rem', borderRadius: '8px', cursor: 'pointer',
              background: !correctAnswer ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${!correctAnswer ? 'var(--danger)' : 'var(--glass-border)'}`,
              color: !correctAnswer ? 'var(--danger)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '1rem',
            }}
          >
            FALSO
          </button>
        </div>
      </div>
    </div>
  );
}
