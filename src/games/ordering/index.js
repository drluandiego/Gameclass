import { lazy } from 'react';
import { calculateScore } from '../../lib/scoring';

export default {
  type: 'ordering',
  label: 'Ordenação',
  icon: 'ArrowUpDown',
  defaultConfig: { instruction: '', items: ['', '', ''], correct_order: [0, 1, 2] },
  validateConfig: (config) => {
    if (!config.instruction) return 'Instrução obrigatória';
    const filled = config.items.filter(i => i && i.trim());
    if (filled.length < 2) return 'Mínimo 2 itens';
    return null;
  },
  scoreResponse: (config, payload, responseTimeMs, timeLimit, maxPoints) => {
    const submitted = payload.order || [];
    const correct = config.correct_order;
    let correctPositions = 0;
    for (let i = 0; i < correct.length; i++) {
      if (submitted[i] === correct[i]) correctPositions++;
    }
    const ratio = correctPositions / correct.length;
    const isCorrect = ratio === 1;
    const score = Math.floor(calculateScore(responseTimeMs, timeLimit, maxPoints, true) * ratio);
    return { score, isCorrect };
  },
  EditorForm: lazy(() => import('./EditorForm')),
  PlayerView: lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView: lazy(() => import('./ResultsView')),
};
