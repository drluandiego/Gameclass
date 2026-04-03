import { useState, useMemo } from 'react';
import { Reorder, motion } from 'framer-motion';

const ITEM_COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D', '#1B5E8A', '#FF6B35', '#2A8B8B', '#E85D00'];

export default function OrderingPlayerView({ config, onRespond, disabled }) {
  const shuffledItems = useMemo(() => {
    const indexed = config.items.map((item, i) => ({ item, originalIdx: i, id: `item-${i}` }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    return indexed;
  }, []);

  const [items, setItems] = useState(shuffledItems);

  const handleSubmit = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    const order = items.map(i => i.originalIdx);
    onRespond({ order });
  };

  const moveItem = (from, to) => {
    if (from === to) return;
    if (navigator.vibrate) navigator.vibrate(30);
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '0.8rem', fontWeight: 700, fontSize: '1.05rem' }}>
        {config.instruction}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
        Arraste ou use as setas para ordenar
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', padding: 0 }}
      >
        {items.map((entry, i) => {
          const color = ITEM_COLORS[entry.originalIdx % ITEM_COLORS.length];
          return (
            <Reorder.Item
              key={entry.id}
              value={entry}
              dragListener={!disabled}
              whileDrag={{
                scale: 1.03,
                boxShadow: `0 0 16px ${color}60, 0 8px 24px rgba(0,0,0,0.2)`,
                zIndex: 10,
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.8rem 0.7rem', borderRadius: 'var(--radius)',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border)',
                borderLeftWidth: '4px',
                borderLeftColor: color,
                cursor: disabled ? 'default' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              {/* Arrow buttons — 44px touch targets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                <button type="button" disabled={disabled || i === 0} onClick={() => moveItem(i, i - 1)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: disabled || i === 0 ? 'var(--border)' : 'var(--text-secondary)',
                    cursor: disabled || i === 0 ? 'default' : 'pointer',
                    fontSize: '0.85rem', fontWeight: 700,
                    width: 34, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>&#9650;</button>
                <button type="button" disabled={disabled || i === items.length - 1} onClick={() => moveItem(i, i + 1)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: disabled || i === items.length - 1 ? 'var(--border)' : 'var(--text-secondary)',
                    cursor: disabled || i === items.length - 1 ? 'default' : 'pointer',
                    fontSize: '0.85rem', fontWeight: 700,
                    width: 34, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>&#9660;</button>
              </div>
              {/* Circular number badge */}
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${color}18`,
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.75rem',
                fontFamily: "'SF Mono', monospace",
                color: color,
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: '0.9rem', fontWeight: 500 }}>{entry.item}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', flexShrink: 0 }}>⠿</span>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      <motion.button
        onClick={handleSubmit}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        animate={{ opacity: disabled ? 0.4 : 1 }}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        Confirmar ordem
      </motion.button>
    </div>
  );
}
