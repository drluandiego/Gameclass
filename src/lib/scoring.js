/**
 * Calcula pontuação com decaimento por tempo.
 * Resposta rápida = mais pontos.
 */
export function calculateScore(responseTimeMs, timeLimitSec, maxPoints, isCorrect) {
  if (!isCorrect) return 0;
  if (!timeLimitSec) return maxPoints;

  const timeLimitMs = timeLimitSec * 1000;
  const elapsed = Math.min(responseTimeMs, timeLimitMs);
  const timeRatio = 1 - (elapsed / timeLimitMs);
  const minScore = Math.floor(maxPoints * 0.5);
  const bonusRange = maxPoints - minScore;

  return Math.floor(minScore + bonusRange * timeRatio);
}
