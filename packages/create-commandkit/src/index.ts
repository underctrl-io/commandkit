#!/usr/bin/env node
console.clear();

import { confirm, intro, outro, password, select, text } from '@clack/prompts';
import fs from 'fs-extra';
import gradient from 'gradient-string';
import { execSync } from 'node:child_process';
import path from 'node:path';
import colors from 'picocolors';

import { copyTemplates } from './functions/copyTemplates.js';
import { installDeps } from './functions/installDeps.js';
import { setup } from './functions/setup.js';
import type { Language, PackageManager } from './types';
import { textColors } from './utils.js';

const commandkitGradient = gradient(textColors.commandkit)('CommandKit');
intro(`Welcome to ${commandkitGradient}!`);

const dir = path.resolve(
  process.cwd(),
  (await text({
    message: 'Enter a project directory:',
    placeholder: 'Leave blank for current directory',
    defaultValue: '.',
    validate: (value) => {
      value = path.resolve(process.cwd(), value);
      let isEmpty;

      try {
        const contents = fs.readdirSync(value);
        isEmpty = contents.length === 0;
      } catch {
        isEmpty = true;
      }

      return isEmpty ? undefined : 'Directory is not empty!';
    },
  })) as string,
);

const manager = (await select({
  message: 'Select a package manager:',
  initialValue: 'npm' as PackageManager,
  options: [
    { label: 'npm', value: 'npm' },
    { label: 'pnpm', value: 'pnpm' },
    { label: 'yarn', value: 'yarn' },
    { label: 'bun', value: 'bun' },
  ],
})) as PackageManager;

const lang = (await select({
  message: 'Select the language to use:',
  initialValue: 'ts' as Language,
  options: [
    { label: 'TypeScript', value: 'ts' },
    { label: 'JavaScript', value: 'js' },
  ],
})) as Language;

const token = (await password({
  message: 'Enter your Discord bot token (stored in .env, optional):',
  mask: colors.gray('*'),
})) as string;

const gitInit = await confirm({
  message: 'Initialize a git repository?',
  initialValue: true,
});

outro(colors.cyan('Setup complete.'));

await setup({
  manager,
  dir,
  token,
});

await copyTemplates({ dir, lang });

if (gitInit) {
  try {
    execSync('git init', { cwd: dir, stdio: 'pipe' });
  } catch (error) {
    console.log(
      colors.yellow(
        'Warning: Git initialization failed. Make sure Git is installed on your system.',
      ),
    );
  }
}

installDeps({
  dir,
  manager,
  lang,
  stdio: 'pipe',
});

console.log(
  `${gradient(textColors.commandkit)('Thank you for choosing CommandKit!')}

To start your bot, use the following commands:
  ${colors.magenta(`${manager} run dev`)}     - Run your bot in development mode
  ${colors.magenta(`${manager} run build`)}   - Build your bot for production
  ${colors.magenta(`${manager} run start`)}   - Run your bot in production mode

• Documentation: ${colors.blue('https://commandkit.dev')}
• GitHub: ${colors.blue('https://github.com/underctrl-io/commandkit')}
• Under Ctrl: ${colors.blue('https://underctrl.io')}
• Discord community: ${colors.blue('https://ctrl.lol/discord')}

Happy coding! 🚀`,
);
