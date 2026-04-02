import { lazy } from 'react';
import { calculateScore } from '../../lib/scoring';

export default {
  type: 'quiz',
  label: 'Quiz (Múltipla Escolha)',
  icon: 'HelpCircle',
  defaultConfig: { question: '', options: ['', '', '', ''], correct_option: 0 },
  validateConfig: (config) => {
    if (!config.question) return 'Pergunta obrigatória';
    const filled = config.options.filter(o => o && o.trim());
    if (filled.length < 2) return 'Mínimo 2 opções';
    return null;
  },
  scoreResponse: (config, payload, responseTimeMs, timeLimit, maxPoints) => {
    const isCorrect = payload.selected_option === config.correct_option;
    const score = calculateScore(responseTimeMs, timeLimit, maxPoints, isCorrect);
    return { score, isCorrect };
  },
  EditorForm: lazy(() => import('./EditorForm')),
  PlayerView: lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView: lazy(() => import('./ResultsView')),
};
