import { type IOType, execSync } from 'node:child_process';
import ora from 'ora';

import type { Language, PackageManager } from '../types';
import { getCommandKitVersion } from '../utils.js';

const getBaseDependencies = () => [
  `commandkit${getCommandKitVersion()}`,
  'discord.js',
];

const getDependencies = () => ({
  js: {
    dependencies: getBaseDependencies(),
    devDependencies: ['prettier'],
  },
  ts: {
    dependencies: getBaseDependencies(),
    devDependencies: ['@types/node', 'typescript', 'prettier'],
  },
});

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
    const dependencies = getDependencies();

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
