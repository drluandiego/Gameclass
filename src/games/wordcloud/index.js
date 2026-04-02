import { lazy } from 'react';

export default {
  type: 'wordcloud',
  label: 'Nuvem de Palavras',
  icon: 'Cloud',
  defaultConfig: { prompt: '', max_words: 3 },
  validateConfig: (config) => {
    if (!config.prompt) return 'Prompt obrigatório';
    return null;
  },
  scoreResponse: () => ({ score: 0, isCorrect: null }),
  EditorForm: lazy(() => import('./EditorForm')),
  PlayerView: lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView: lazy(() => import('./ResultsView')),
};
