import { lazy } from 'react';

export default {
  type: 'open_response',
  label: 'Resposta Aberta',
  icon: 'MessageSquare',
  defaultConfig: { question: '' },
  validateConfig: (config) => {
    if (!config.question) return 'Pergunta obrigatória';
    return null;
  },
  scoreResponse: () => ({ score: 0, isCorrect: null }),
  EditorForm: lazy(() => import('./EditorForm')),
  PlayerView: lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView: lazy(() => import('./ResultsView')),
};
