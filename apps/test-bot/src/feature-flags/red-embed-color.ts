import { flag } from 'commandkit';

export const redEmbedColor = flag({
  key: 'red-embed-color',
  description: 'Red embed color',
  decide() {
    return Math.random() < 0.5;
  },
});
