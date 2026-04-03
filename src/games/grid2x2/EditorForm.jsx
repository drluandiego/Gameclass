import { useState, useEffect } from 'react';

export default function Grid2x2EditorForm({ config, onChange }) {
  const [prompt, setPrompt] = useState(config?.prompt || '');
  const [xLeft, setXLeft] = useState(config?.axis_x?.left || '');
  const [xRight, setXRight] = useState(config?.axis_x?.right || '');
  const [yBottom, setYBottom] = useState(config?.axis_y?.bottom || '');
  const [yTop, setYTop] = useState(config?.axis_y?.top || '');

  useEffect(() => {
    onChange({
      prompt,
      axis_x: { left: xLeft, right: xRight },
      axis_y: { bottom: yBottom, top: yTop },
    });
  }, [prompt, xLeft, xRight, yBottom, yTop]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enunciado</label>
        <textarea
          required
          className="input-glass"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows="3"
          placeholder="Ex: Classifique o caso do paciente X"
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Eixo X (horizontal)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input
            required
            className="input-glass"
            value={xLeft}
            onChange={e => setXLeft(e.target.value)}
            placeholder="← Esquerda (ex: Baixa gravidade)"
          />
          <input
            required
            className="input-glass"
            value={xRight}
            onChange={e => setXRight(e.target.value)}
            placeholder="Direita → (ex: Alta gravidade)"
          />
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Eixo Y (vertical)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input
            required
            className="input-glass"
            value={yBottom}
            onChange={e => setYBottom(e.target.value)}
            placeholder="↓ Inferior (ex: Baixa urgência)"
          />
          <input
            required
            className="input-glass"
            value={yTop}
            onChange={e => setYTop(e.target.value)}
            placeholder="Superior ↑ (ex: Alta urgência)"
          />
        </div>
      </div>
    </div>
  );
}
