const gradient = require('gradient-string');
const colors = require('colors');
const fs = require('fs-extra');

exports.templates = {
    js: {
        esm: `${__dirname}/templates/JavaScript/esm`,
        cjs: `${__dirname}/templates/JavaScript/cjs`,
    },
};

exports.colors = {
    commandkit: ['#fdba74', '#e4a5a2', '#c288de', '#b27bf9'],
    import: ['#c586c0', '#c586c0'],
    export: ['#569cd6', '#569cd6'],
    require: ['#dcdcaa', '#dcdcaa'],
    module: ['#4ec9b0', '#4ec9b0'],
    js: ['#f7e01c', '#f7e01c'],
    ts: ['#2480c5', '#2480c5'],
};

exports.commands = {
    init: { npm: 'npm init -y', yarn: 'yarn init -y', pnpm: 'pnpm init' },
    install: {
        npm: 'npm install commandkit discord.js dotenv nodemon',
        yarn: 'yarn add commandkit discord.js dotenv nodemon',
        pnpm: 'pnpm add commandkit discord.js dotenv nodemon',
    },
};

exports.hints = {
    import: gradient(exports.colors.import)('import'),
    export: gradient(exports.colors.export)('export'),
    require: gradient(exports.colors.require)('require'),
    module: gradient(exports.colors.module)('exports'),
    javascript: gradient(exports.colors.js)('JavaScript'),
    typescript: gradient(exports.colors.ts)('TypeScript'),
};

exports.commandkit = gradient(exports.colors.commandkit)('CommandKit');
exports.outroMsg = `
${gradient(exports.colors.commandkit)('Thank you for choosing CommandKit!')}

• Documentation: ${colors.blue('https://commandkit.js.org')}
• Join us on Discord: ${colors.blue('https://ctrl.lol/discord')}
`;
