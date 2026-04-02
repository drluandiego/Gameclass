import { Suspense } from 'react';
import { getPlugin } from '../games/registry';
import Timer from './Timer';

/**
 * Wrapper universal para games.
 * Delega para o plugin correto baseado em role e game_type.
 *
 * role: 'player' | 'presenter' | 'results'
 */
export default function GameShell({
  gameType,
  config,
  role,
  timeLimit,
  timerRunning,
  onTimerEnd,
  onRespond,
  responses = [],
  disabled = false,
}) {
  const plugin = getPlugin(gameType);
  if (!plugin) return <p style={{ color: 'var(--danger)' }}>Tipo de game desconhecido: {gameType}</p>;

  let ViewComponent;
  if (role === 'player') ViewComponent = plugin.PlayerView;
  else if (role === 'presenter') ViewComponent = plugin.PresenterView;
  else if (role === 'results') ViewComponent = plugin.ResultsView;
  else return null;

  return (
    <div style={{ width: '100%' }}>
      {role === 'player' && timeLimit && (
        <Timer durationSec={timeLimit} running={timerRunning} onEnd={onTimerEnd} />
      )}
      <Suspense fallback={<p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Carregando...</p>}>
        <ViewComponent
          config={config}
          onRespond={onRespond}
          responses={responses}
          disabled={disabled}
        />
      </Suspense>
    </div>
  );
}
