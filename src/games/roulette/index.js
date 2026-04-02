import { lazy } from 'react';

export default {
  type: 'roulette',
  label: 'Roleta / Sorteio',
  icon: 'Disc',
  defaultConfig: { title: 'Sorteio' },
  validateConfig: (config) => {
    if (!config.title) return 'Título obrigatório';
    return null;
  },
  scoreResponse: () => ({ score: 0, isCorrect: null }),
  EditorForm: lazy(() => import('./EditorForm')),
  PlayerView: lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView: lazy(() => import('./ResultsView')),
};
