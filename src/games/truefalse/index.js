import { lazy } from 'react';
import { calculateScore } from '../../lib/scoring';

export default {
  type: 'truefalse',
  label: 'Verdadeiro ou Falso',
  icon: 'ToggleLeft',
  defaultConfig: { statement: '', correct_answer: true },
  validateConfig: (config) => {
    if (!config.statement) return 'Afirmação obrigatória';
    return null;
  },
  scoreResponse: (config, payload, responseTimeMs, timeLimit, maxPoints) => {
    const isCorrect = payload.answer === config.correct_answer;
    const score = calculateScore(responseTimeMs, timeLimit, maxPoints, isCorrect);
    return { score, isCorrect };
  },
  EditorForm: lazy(() => import('./EditorForm')),
  PlayerView: lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView: lazy(() => import('./ResultsView')),
};
