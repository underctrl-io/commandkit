// @ts-check

import { join } from 'node:path';
import fs from 'node:fs';
import { rimrafSync } from 'rimraf';

const resetColor = '\x1b[0m';

export const Colors = {
    reset: (text) => `${text}${resetColor}`,
    bright: (text) => `\x1b[1m${text}${resetColor}`,
    dim: (text) => `\x1b[2m${text}${resetColor}`,
    underscore: (text) => `\x1b[4m${text}${resetColor}`,
    blink: (text) => `\x1b[5m${text}${resetColor}`,
    reverse: (text) => `\x1b[7m${text}${resetColor}`,
    hidden: (text) => `\x1b[8m${text}${resetColor}`,

    black: (text) => `\x1b[30m${text}${resetColor}`,
    red: (text) => `\x1b[31m${text}${resetColor}`,
    green: (text) => `\x1b[32m${text}${resetColor}`,
    yellow: (text) => `\x1b[33m${text}${resetColor}`,
    blue: (text) => `\x1b[34m${text}${resetColor}`,
    magenta: (text) => `\x1b[35m${text}${resetColor}`,
    cyan: (text) => `\x1b[36m${text}${resetColor}`,
    white: (text) => `\x1b[37m${text}${resetColor}`,

    bgBlack: (text) => `\x1b[40m${text}${resetColor}`,
    bgRed: (text) => `\x1b[41m${text}${resetColor}`,
    bgGreen: (text) => `\x1b[42m${text}${resetColor}`,
    bgYellow: (text) => `\x1b[43m${text}${resetColor}`,
    bgBlue: (text) => `\x1b[44m${text}${resetColor}`,
    bgMagenta: (text) => `\x1b[45m${text}${resetColor}`,
    bgCyan: (text) => `\x1b[46m${text}${resetColor}`,
    bgWhite: (text) => `\x1b[47m${text}${resetColor}`,
};

export function write(message) {
    process.stdout.write(message);
    process.stdout.write('\n');
}

/**
 * @returns {never}
 */
export function panic(message) {
    write(Colors.red(`Error: ${message}`));
    process.exit(1);
}

export function findPackageJSON() {
    const cwd = process.cwd();
    const target = join(cwd, 'package.json');

    if (!fs.existsSync(target)) {
        panic('Could not find package.json in current directory.');
    }

    return JSON.parse(fs.readFileSync(target, 'utf8'));
}

export function findCommandKitJSON(src) {
    const cwd = process.cwd();
    const target = src || join(cwd, 'commandkit.json');

    if (!fs.existsSync(target)) {
        panic('Could not find commandkit.json in current directory.');
    }

    return JSON.parse(fs.readFileSync(target, 'utf8'));
}

export function erase(dir) {
    rimrafSync(dir);
}
