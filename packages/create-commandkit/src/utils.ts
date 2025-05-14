export const textColors = {
  commandkit: ['#fdba74', '#e4a5a2', '#c288de', '#b27bf9'],
  js: ['#f7e01c', '#f7e01c'],
  ts: ['#2480c5', '#2480c5'],
};

export const commands = {
  init: {
    npm: 'npm init -y',
    yarn: 'yarn init -y; yarn config set nodeLinker node-modules; yarn set version stable',
    pnpm: 'pnpm init',
    bun: 'bun init -y',
  },
};
