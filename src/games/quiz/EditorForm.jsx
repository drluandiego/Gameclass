import { useState, useEffect } from 'react';

export default function QuizEditorForm({ config, onChange }) {
  const [question, setQuestion] = useState(config?.question || '');
  const [options, setOptions] = useState(config?.options || ['', '', '', '']);
  const [correct, setCorrect] = useState(config?.correct_option ?? 0);

  useEffect(() => {
    onChange({
      question,
      options: options.filter(o => o && o.trim()),
      correct_option: correct,
    });
  }, [question, options, correct]);

  const updateOption = (i, val) => {
    const next = [...options];
    next[i] = val;
    setOptions(next);
  };

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
          placeholder="Ex: Qual parte do cérebro controla...?"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <input placeholder="Letra A" required className="input-glass" value={options[0]} onChange={e => updateOption(0, e.target.value)} />
        <input placeholder="Letra B" required className="input-glass" value={options[1]} onChange={e => updateOption(1, e.target.value)} />
        <input placeholder="Letra C (opcional)" className="input-glass" value={options[2]} onChange={e => updateOption(2, e.target.value)} />
        <input placeholder="Letra D (opcional)" className="input-glass" value={options[3]} onChange={e => updateOption(3, e.target.value)} />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>A Resposta Correta é a:</label>
        <select className="input-glass" value={correct} onChange={e => setCorrect(parseInt(e.target.value))}>
          <option value={0}>Alternativa A</option>
          <option value={1}>Alternativa B</option>
          <option value={2}>Alternativa C</option>
          <option value={3}>Alternativa D</option>
        </select>
      </div>
    </div>
  );
}
