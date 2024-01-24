import colors from 'colors';
import gradient from 'gradient-string';
import path from 'path';
import url from 'url';

const getDirname = (meta: ImportMeta) => path.dirname(url.fileURLToPath(meta.url));
const __dirname = getDirname(import.meta);

export const templates = {
    js: {
        esm: `${__dirname}/../templates/JavaScript/esm`,
        cjs: `${__dirname}/../templates/JavaScript/cjs`,
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

export const commands = {
    init: { npm: 'npm init -y', yarn: 'yarn init -y', pnpm: 'pnpm init' },
    install: {
        npm: 'npm install commandkit discord.js dotenv',
        yarn: 'yarn add commandkit discord.js dotenv',
        pnpm: 'pnpm add commandkit discord.js dotenv',
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
