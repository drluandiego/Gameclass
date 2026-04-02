import { getAllPlugins } from '../games/registry';
import { HelpCircle, ToggleLeft, Cloud, ArrowUpDown, MessageSquare, Disc } from 'lucide-react';

const iconMap = {
  HelpCircle: HelpCircle,
  ToggleLeft: ToggleLeft,
  Cloud: Cloud,
  ArrowUpDown: ArrowUpDown,
  MessageSquare: MessageSquare,
  Disc: Disc,
};

export default function GameSelector({ onSelect, selectedType }) {
  const plugins = getAllPlugins();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
      {plugins.map((plugin) => {
        const Icon = iconMap[plugin.icon] || HelpCircle;
        const isSelected = selectedType === plugin.type;
        return (
          <button
            key={plugin.type}
            onClick={() => onSelect(plugin.type)}
            style={{
              background: isSelected ? 'var(--bg-canvas)' : 'var(--bg-surface)',
              border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '0.7rem 0.4rem',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.35rem',
              transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Icon size={20} strokeWidth={isSelected ? 2.5 : 1.5} />
            <span style={{ fontSize: '0.65rem', fontWeight: isSelected ? 600 : 400, textAlign: 'center' }}>
              {plugin.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
