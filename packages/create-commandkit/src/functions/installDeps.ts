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
    devDependencies: ['@types/node', 'typescript'],
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

function getInstallCommand(
  manager: PackageManager,
  deps: string[],
  dev = false,
) {
  switch (manager) {
    case 'npm':
    case 'pnpm':
    case 'yarn':
    case 'bun':
      return `${manager} add ${dev ? '-D' : ''} ${deps.join(' ')}`;
    case 'deno':
      return `deno add ${dev ? '--dev' : ''} ${deps.map((d) => `npm:${d}`).join(' ')}`;
    default:
      return manager satisfies never;
  }
}

export function installDeps({
  manager,
  dir,
  lang,
  stdio = 'inherit',
}: InstallDepsProps) {
  const spinner = ora('Installing dependencies...').start();

  try {
    if (dependencies[lang].dependencies.length) {
      const depsCommand = getInstallCommand(
        manager,
        dependencies[lang].dependencies,
      );

      execSync(depsCommand, { cwd: dir, stdio });
    }

    if (dependencies[lang].devDependencies.length) {
      const devDepsCommand = getInstallCommand(
        manager,
        dependencies[lang].devDependencies,
        true,
      );

      execSync(devDepsCommand, { cwd: dir, stdio });
    }

    spinner.succeed('Dependencies installed successfully!');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
}
