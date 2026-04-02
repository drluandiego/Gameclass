import { useState, useMemo } from 'react';

export default function OrderingPlayerView({ config, onRespond, disabled }) {
  const shuffledItems = useMemo(() => {
    const indexed = config.items.map((item, i) => ({ item, originalIdx: i }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return indexed;
  }, []);

  const [items, setItems] = useState(shuffledItems);
  const [dragIdx, setDragIdx] = useState(null);

  const moveItem = (from, to) => {
    if (from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  };

  const handleSubmit = () => {
    const order = items.map(i => i.originalIdx);
    onRespond({ order });
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '0.8rem', fontWeight: 600, fontSize: '1.05rem' }}>
        {config.instruction}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
        Arraste ou use as setas para ordenar
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
        {items.map((entry, i) => (
          <div key={entry.originalIdx} draggable={!disabled}
            onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()}
            onDrop={() => { moveItem(dragIdx, i); setDragIdx(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)',
              background: dragIdx === i ? 'var(--accent-blue-bg)' : 'var(--bg-surface)',
              border: `1px solid ${dragIdx === i ? 'var(--accent-blue-text)' : 'var(--border)'}`,
              cursor: disabled ? 'default' : 'grab', transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <button type="button" disabled={disabled || i === 0} onClick={() => moveItem(i, i - 1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.65rem', padding: 0 }}>&#9650;</button>
              <button type="button" disabled={disabled || i === items.length - 1} onClick={() => moveItem(i, i + 1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.65rem', padding: 0 }}>&#9660;</button>
            </div>
            <span style={{ fontWeight: 600, minWidth: '18px', fontFamily: "'SF Mono', monospace", color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{i + 1}.</span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: '0.85rem' }}>{entry.item}</span>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={disabled} className="btn-primary"
        style={{ width: '100%', opacity: disabled ? 0.4 : 1 }}>
        Confirmar ordem
      </button>
    </div>
  );
}
