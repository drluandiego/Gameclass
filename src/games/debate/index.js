import { lazy } from 'react';

export default {
  type: 'debate',
  label: 'Debate',
  icon: 'Scale',
  defaultConfig: { statement: '', showNeutral: false },
  validateConfig: (config) => {
    if (!config.statement) return 'Afirmação obrigatória';
    return null;
  },
  scoreResponse: () => ({ score: 0, isCorrect: null }),
  EditorForm:    lazy(() => import('./EditorForm')),
  PlayerView:    lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView:   lazy(() => import('./ResultsView')),
};
