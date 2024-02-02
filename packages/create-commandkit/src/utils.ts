import colors from 'colors';
import gradient from 'gradient-string';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const templates = {
  js: {
    esm: path.join(__dirname, '..', 'templates', 'JavaScript', 'esm'),
    cjs: path.join(__dirname, '..', 'templates', 'JavaScript', 'cjs'),
  },
  ts: {
    esm: path.join(__dirname, '..', 'templates', 'TypeScript', 'esm'),
    cjs: path.join(__dirname, '..', 'templates', 'TypeScript', 'cjs'),
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
};

const baseDependencies = ['commandkit', 'discord.js', 'dotenv'];

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
};

export const commandkit = gradient(textColors.commandkit)('CommandKit');
export const outroMsg = `
${gradient(textColors.commandkit)('Thank you for choosing CommandKit!')}

• Documentation: ${colors.blue('https://commandkit.js.org')}
• Join us on Discord: ${colors.blue('https://ctrl.lol/discord')}
`;
