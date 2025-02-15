import colors from 'colors';
import gradient from 'gradient-string';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const templates = {
  js: {
    app: {
      esm: path.join(__dirname, '..', 'templates', 'JavaScript', 'app', 'esm'),
      cjs: path.join(__dirname, '..', 'templates', 'JavaScript', 'app', 'cjs'),
    },
    legacy: {
      esm: path.join(
        __dirname,
        '..',
        'templates',
        'JavaScript',
        'legacy',
        'esm',
      ),
      cjs: path.join(
        __dirname,
        '..',
        'templates',
        'JavaScript',
        'legacy',
        'cjs',
      ),
    },
  },
  ts: {
    app: {
      esm: path.join(__dirname, '..', 'templates', 'TypeScript', 'app', 'esm'),
      cjs: path.join(__dirname, '..', 'templates', 'TypeScript', 'app', 'cjs'),
    },
    legacy: {
      esm: path.join(
        __dirname,
        '..',
        'templates',
        'TypeScript',
        'legacy',
        'esm',
      ),
      cjs: path.join(
        __dirname,
        '..',
        'templates',
        'TypeScript',
        'legacy',
        'cjs',
      ),
    },
  },
};

export const textColors = {
  commandkit: ['#fdba74', '#e4a5a2', '#c288de', '#b27bf9'],
  import: ['#c586c0', '#c586c0'],
  export: ['#569cd6', '#569cd6'],
  require: ['#dcdcaa', '#dcdcaa'],
  module: ['#4ec9b0', '#4ec9b0'],
  js: ['#f7e01c', '#f7e01c'],
  ts: ['#2480c5', '#2480c5'],
  app: ['#e4a5a2', '#e4a5a2'],
  legacy: ['#dcdcaa', '#dcdcaa'],
};

const baseDependencies = ['commandkit', 'discord.js'];

export const dependencies = {
  js: {
    dependencies: baseDependencies,
  },
  ts: {
    dependencies: baseDependencies,
    devDependencies: ['@types/node', 'typescript'],
  },
};

export const commands = {
  init: {
    npm: 'npm init -y',
    yarn: 'yarn init -y; yarn config set nodeLinker node-modules; yarn set version stable',
    pnpm: 'pnpm init',
  },
};

export const hints = {
  import: gradient(textColors.import)('import'),
  export: gradient(textColors.export)('export'),
  require: gradient(textColors.require)('require'),
  module: gradient(textColors.module)('exports'),
  javascript: gradient(textColors.js)('JavaScript'),
  typescript: gradient(textColors.ts)('TypeScript'),
  app: gradient(textColors.app)('app'),
  legacy: gradient(textColors.legacy)('legacy'),
};

export const commandkit = gradient(textColors.commandkit)('CommandKit');
export const outroMsg = `
${gradient(textColors.commandkit)('Thank you for choosing CommandKit!')}

• Documentation: ${colors.blue('https://commandkit.dev')}
• GitHub: ${colors.blue('https://github.com/underctrl-io/commandkit')}
• Join us on Discord: ${colors.blue('https://ctrl.lol/discord')}
`;
