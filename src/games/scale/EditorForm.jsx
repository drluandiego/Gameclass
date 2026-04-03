import { useState, useEffect } from 'react';

export default function ScaleEditorForm({ config, onChange }) {
  const [question, setQuestion] = useState(config?.question || '');
  const [min, setMin] = useState(config?.min ?? 1);
  const [max, setMax] = useState(config?.max ?? 5);
  const [minLabel, setMinLabel] = useState(config?.minLabel || '');
  const [maxLabel, setMaxLabel] = useState(config?.maxLabel || '');

  useEffect(() => {
    onChange({ question, min, max, minLabel, maxLabel });
  }, [question, min, max, minLabel, maxLabel]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>A Pergunta</label>
        <textarea
          required
          className="input-glass"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows="3"
          placeholder="Ex: De 1 a 5, quanto você entendeu o conteúdo?"
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mínimo</label>
          <select
            className="input-glass"
            value={min}
            onChange={e => setMin(Number(e.target.value))}
            style={{ width: '100%' }}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Máximo</label>
          <select
            className="input-glass"
            value={max}
            onChange={e => setMax(Number(e.target.value))}
            style={{ width: '100%' }}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Label do mínimo</label>
          <input
            className="input-glass"
            value={minLabel}
            onChange={e => setMinLabel(e.target.value)}
            placeholder="Ex: Nada"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Label do máximo</label>
          <input
            className="input-glass"
            value={maxLabel}
            onChange={e => setMaxLabel(e.target.value)}
            placeholder="Ex: Totalmente"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
