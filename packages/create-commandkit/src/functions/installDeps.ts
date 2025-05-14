import { type IOType, execSync } from 'node:child_process';
import ora from 'ora';

import type { Language, PackageManager } from '../types';

const baseDependencies = [
  // TODO: use latest tag for CommandKit v1
  'commandkit@dev',
  'discord.js',
];

const dependencies = {
  js: {
    dependencies: baseDependencies,
    devDependencies: ['@types/node'],
  },
  ts: {
    dependencies: baseDependencies,
    devDependencies: ['@types/node', 'typescript'],
  },
};

interface InstallDepsProps {
  manager: PackageManager;
  dir: string;
  lang: Language;
  stdio: IOType;
}

export function installDeps({
  manager,
  dir,
  lang,
  stdio = 'pipe',
}: InstallDepsProps) {
  const spinner = ora('Installing dependencies...').start();

  try {
    if (dependencies[lang].dependencies.length) {
      const depsCommand = `${manager} add ${dependencies[
        lang
      ].dependencies.join(' ')}`;

      execSync(depsCommand, { cwd: dir, stdio });
    }

    if (dependencies[lang].devDependencies.length) {
      const devDepsCommand = `${manager} add -D ${dependencies[
        lang
      ].devDependencies.join(' ')}`;

      execSync(devDepsCommand, { cwd: dir, stdio });
    }

    spinner.succeed('Dependencies installed successfully!');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
}
