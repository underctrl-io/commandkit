import { flag } from 'commandkit';

export const redEmbedColor = flag({
  key: 'red-embed-color',
  description: 'Red embed color',
  identify() {
    return { user: '123' };
  },
  decide() {
    return Math.random() < 0.5;
  },
});
