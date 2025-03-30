import colors from 'picocolors';
import gradient from 'gradient-string';
import path from 'node:path';
import url from 'node:url';
import { PackageManager } from './types';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const templates = {
  js: path.join(__dirname, '..', 'templates', 'JavaScript'),
  ts: path.join(__dirname, '..', 'templates', 'TypeScript'),
};

export const textColors = {
  commandkit: ['#fdba74', '#e4a5a2', '#c288de', '#b27bf9'],
  js: ['#f7e01c', '#f7e01c'],
  ts: ['#2480c5', '#2480c5'],
};

// TODO: use stable version when we're ready
const baseDependencies = ['commandkit@dev', 'discord.js@14'];

export const dependencies = {
  js: {
    dependencies: baseDependencies,
    devDependencies: ['@types/node'],
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
    bun: 'bun init -y',
  },
};

export const hints = {
  javascript: gradient(textColors.js)('JavaScript'),
  typescript: gradient(textColors.ts)('TypeScript'),
};

export const commandkit = gradient(textColors.commandkit)('CommandKit');

interface OutroMessageProps {
  manager: PackageManager;
}

export const outroMsg = ({ manager }: OutroMessageProps) => `
${gradient(textColors.commandkit)('Thank you for choosing CommandKit!')}

To start your bot, use the following commands:
  ${colors.magenta(`${manager} run dev`)}     - Run your bot in development mode
  ${colors.magenta(`${manager} run build`)}   - Build your bot for production
  ${colors.magenta(`${manager} run start`)}   - Run your bot in production mode

• Documentation: ${colors.blue('https://commandkit.dev')}
• GitHub: ${colors.blue('https://github.com/underctrl-io/commandkit')}
• UnderCtrl: ${colors.blue('https://underctrl.io')}
• Join us on Discord: ${colors.blue('https://ctrl.lol/discord')}

Happy coding! 🚀
`;
