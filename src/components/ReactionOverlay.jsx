export default function ReactionOverlay({ reactions }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden',
    }}>
      {reactions.map((r) => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            bottom: '0',
            left: `${r.x}%`,
            fontSize: '2rem',
            animation: 'floatUp 3s ease-out forwards',
            willChange: 'transform, opacity',
          }}
        >
          {r.emoji}
        </span>
      ))}

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
