import { lazy } from 'react';

export default {
  type: 'scale',
  label: 'Escala',
  icon: 'SlidersHorizontal',
  defaultConfig: { question: '', min: 1, max: 5, minLabel: '', maxLabel: '' },
  validateConfig: (config) => {
    if (!config.question) return 'Pergunta obrigatória';
    if (config.min >= config.max) return 'O mínimo deve ser menor que o máximo';
    return null;
  },
  scoreResponse: () => ({ score: 0, isCorrect: null }),
  EditorForm:    lazy(() => import('./EditorForm')),
  PlayerView:    lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView:   lazy(() => import('./ResultsView')),
};
