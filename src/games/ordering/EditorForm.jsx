import { useState, useEffect } from 'react';

export default function OrderingEditorForm({ config, onChange }) {
  const [instruction, setInstruction] = useState(config?.instruction || '');
  const [items, setItems] = useState(config?.items?.length ? config.items : ['', '', '']);

  useEffect(() => {
    const filled = items.filter(i => i && i.trim());
    const correctOrder = filled.map((_, i) => i);
    onChange({ instruction, items: filled, correct_order: correctOrder });
  }, [instruction, items]);

  const updateItem = (i, val) => {
    const next = [...items];
    next[i] = val;
    setItems(next);
  };

  const addItem = () => {
    if (items.length < 8) setItems([...items, '']);
  };

  const removeItem = (i) => {
    if (items.length <= 2) return;
    setItems(items.filter((_, idx) => idx !== i));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Instrução</label>
        <textarea
          required
          className="input-glass"
          value={instruction}
          onChange={e => setInstruction(e.target.value)}
          rows="2"
          placeholder="Ex: Ordene do menor para o maior..."
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Itens na ORDEM CORRETA (o aluno verá embaralhado)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: '24px' }}>{i + 1}.</span>
              <input
                className="input-glass"
                placeholder={`Item ${i + 1}`}
                value={item}
                onChange={e => updateItem(i, e.target.value)}
              />
              {items.length > 2 && (
                <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              )}
            </div>
          ))}
        </div>
        {items.length < 8 && (
          <button type="button" onClick={addItem} className="btn-secondary" style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            + Adicionar Item
          </button>
        )}
      </div>
    </div>
  );
}
