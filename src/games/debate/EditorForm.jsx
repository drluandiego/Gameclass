import { useState, useEffect } from 'react';

export default function DebateEditorForm({ config, onChange }) {
  const [statement, setStatement] = useState(config?.statement || '');
  const [showNeutral, setShowNeutral] = useState(config?.showNeutral ?? false);

  useEffect(() => {
    onChange({ statement, showNeutral });
  }, [statement, showNeutral]);

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
          placeholder="Ex: A inteligência artificial vai substituir professores."
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <input
          type="checkbox"
          checked={showNeutral}
          onChange={e => setShowNeutral(e.target.checked)}
          style={{ width: '18px', height: '18px', accentColor: 'var(--game-blue)' }}
        />
        Permitir opção Neutro
      </label>
    </div>
  );
}
