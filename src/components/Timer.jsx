import CircularTimer from './CircularTimer';

export default function Timer({ durationSec, onEnd, running }) {
  return <CircularTimer durationSec={durationSec} onEnd={onEnd} running={running} />;
}
