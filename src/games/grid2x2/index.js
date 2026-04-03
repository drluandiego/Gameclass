import { lazy } from 'react';

export default {
  type: 'grid2x2',
  label: 'Grade 2×2',
  icon: 'Grid2x2',
  defaultConfig: {
    prompt: '',
    axis_x: { left: '', right: '' },
    axis_y: { bottom: '', top: '' },
  },
  validateConfig: (config) => {
    if (!config.prompt) return 'Enunciado obrigatório';
    if (!config.axis_x?.left || !config.axis_x?.right) return 'Labels do eixo X obrigatórios';
    if (!config.axis_y?.bottom || !config.axis_y?.top) return 'Labels do eixo Y obrigatórios';
    return null;
  },
  scoreResponse: () => ({ score: 0, isCorrect: null }),
  EditorForm: lazy(() => import('./EditorForm')),
  PlayerView: lazy(() => import('./PlayerView')),
  PresenterView: lazy(() => import('./PresenterView')),
  ResultsView: lazy(() => import('./ResultsView')),
};
