#!/usr/bin/env node
console.clear();

import type { Language, PackageManager } from './types';

import { intro, text, select, password, confirm, outro } from '@clack/prompts';
import { commandkit, outroMsg } from './utils';
import { setup } from './functions/setup';
import { installDeps } from './functions/installDeps';
import { copyTemplates } from './functions/copyTemplates';

import path from 'node:path';
import colors from 'picocolors';
import fs from 'fs-extra';
import { initializeGit, writeGitignore } from './functions/initializeGit';

await intro(`Welcome to ${commandkit}!`);

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
    { label: 'JavaScript', value: 'js' },
    { label: 'TypeScript', value: 'ts' },
  ],
})) as Language;

const token = (await password({
  message: 'Enter your bot token (stored in .env):',
  mask: colors.gray('*'),
})) as string;

const installNow = (await confirm({
  message: 'Install dependencies now?',
  initialValue: true,
})) as boolean;

const gitInit = await confirm({
  message: 'Initialize a git repository?',
  initialValue: true,
});

outro(colors.cyan('Setup complete.'));

await setup({
  manager,
  dir,
  token,
  devDeps: lang === 'ts',
  installDeps: installNow,
});
await copyTemplates({ dir, lang });

if (gitInit) {
  await initializeGit(dir);
} else {
  await writeGitignore(dir);
}

if (installNow) {
  await installDeps({ manager, dir, lang: 'js', stdio: 'inherit' });
}

console.log(
  outroMsg({
    manager,
  }),
);
