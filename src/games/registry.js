import quizPlugin from './quiz/index.js';
import truefalsePlugin from './truefalse/index.js';
import wordcloudPlugin from './wordcloud/index.js';
import orderingPlugin from './ordering/index.js';
import openResponsePlugin from './open-response/index.js';
import roulettePlugin from './roulette/index.js';

const plugins = {
  quiz: quizPlugin,
  truefalse: truefalsePlugin,
  wordcloud: wordcloudPlugin,
  ordering: orderingPlugin,
  open_response: openResponsePlugin,
  roulette: roulettePlugin,
};

export function getPlugin(type) {
  return plugins[type] || null;
}

export function getAllPlugins() {
  return Object.values(plugins);
}

export default plugins;
