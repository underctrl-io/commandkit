#!/usr/bin/env node
console.clear();

import type {
  HandlerType,
  Language,
  ModuleType,
  PackageManager,
} from './types';

import { intro, text, select, password, confirm, outro } from '@clack/prompts';
import { commandkit, hints, outroMsg } from './utils';
import { setup } from './functions/setup';
import { installDeps } from './functions/installDeps';
import { copyTemplates } from './functions/copyTemplates';

import path from 'node:path';
import colors from 'picocolors';
import fs from 'fs-extra';
import { initializeGit } from './functions/initializeGit';

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

const handler = (await select({
  message: 'Select a command handler:',
  initialValue: 'app' as HandlerType,
  options: [
    {
      label: 'App',
      value: 'app',
      hint: 'recommended',
    },
    {
      label: 'Legacy',
      value: 'legacy',
    },
  ],
})) as HandlerType;

const type = (await select({
  message: 'Select a module type:',
  initialValue: 'esm' as ModuleType,
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
  message: 'Enter your bot token (stored in .env):',
  mask: colors.gray('*'),
})) as string;

const installNow = await confirm({
  message: 'Install dependencies now?',
  initialValue: true,
});

const gitInit = await confirm({
  message: 'Initialize a git repository?',
  initialValue: true,
});

outro(colors.cyan('Setup complete.'));

await setup({ manager, dir, token, type });
await copyTemplates({ type, dir, lang, handler });

if (gitInit) {
  await initializeGit(dir);
}

if (installNow) {
  await installDeps({ manager, dir, lang: 'js', stdio: 'inherit' });
}

console.log(
  outroMsg({
    manager,
  }),
);
