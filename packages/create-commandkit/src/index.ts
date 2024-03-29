#!/usr/bin/env node
console.clear();

import type { Language, ModuleType, PackageManager } from './types';

import { intro, text, select, password, confirm, outro } from '@clack/prompts';
import { commandkit, hints, outroMsg } from './utils';
import { setup } from './functions/setup';
import { installDeps } from './functions/installDeps';
import { copyTemplates } from './functions/copyTemplates';

import path from 'node:path';
import colors from 'colors';
import fs from 'fs-extra';

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
  options: [
    { label: 'npm', value: 'npm' },
    { label: 'pnpm', value: 'pnpm' },
    { label: 'yarn', value: 'yarn' },
  ],
})) as PackageManager;

const lang = (await select({
  message: 'Select the language to use:',
  options: [
    { label: 'JavaScript', value: 'js' },
    { label: 'TypeScript', value: 'ts' },
  ],
})) as Language;

const type = (await select({
  message: 'Select a module type:',
  options: [
    {
      label: 'CommonJS',
      value: 'cjs',
      hint: `${hints.require} & ${hints.module}`,
    },
    {
      label: 'ES Modules',
      value: 'esm',
      hint: `${hints.import} & ${hints.export}`,
    },
  ],
})) as ModuleType;

const token = (await password({
  message: 'Enter your bot token:',
  mask: colors.gray('*'),
})) as string;

const installNow = await confirm({
  message: 'Install dependencies now?',
  initialValue: true,
});

outro(colors.cyan('Setup complete.'));

await setup({ manager, dir, token, type });
await copyTemplates({ type, dir, lang });

if (installNow) {
  await installDeps({ manager, dir, lang: 'js', stdio: 'inherit' });
}

console.log(outroMsg);
