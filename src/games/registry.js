import quizPlugin from './quiz/index.js';
import truefalsePlugin from './truefalse/index.js';
import wordcloudPlugin from './wordcloud/index.js';
import orderingPlugin from './ordering/index.js';
import openResponsePlugin from './open-response/index.js';
import roulettePlugin from './roulette/index.js';
import grid2x2Plugin from './grid2x2/index.js';
import scalePlugin from './scale/index.js';
import debatePlugin from './debate/index.js';
import qnaPlugin from './qna/index.js';

const plugins = {
  quiz: quizPlugin,
  truefalse: truefalsePlugin,
  wordcloud: wordcloudPlugin,
  ordering: orderingPlugin,
  open_response: openResponsePlugin,
  roulette: roulettePlugin,
  grid2x2: grid2x2Plugin,
  scale: scalePlugin,
  debate: debatePlugin,
  qna: qnaPlugin,
};

export function getPlugin(type) {
  return plugins[type] || null;
}

export function getAllPlugins() {
  return Object.values(plugins);
}

export default plugins;
