import { lazy } from 'react';

export default {
  type: 'qna',
  label: 'Perguntas',
  icon: 'Hand',
  defaultConfig: { prompt: '' },
  validateConfig: (config) => {
    if (!config.prompt) return 'Prompt obrigatório';
    return null;
  },
  scoreResponse: () => ({ score: 0, isCorrect: null }),
  EditorForm:    lazy(() => import('./EditorForm')),
  PlayerView:    lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView:   lazy(() => import('./ResultsView')),
};
