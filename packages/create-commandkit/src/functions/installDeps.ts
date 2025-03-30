import type { Language, PackageManager } from '../types';
import { type IOType, execSync } from 'node:child_process';
import { dependencies } from '../utils';

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
  const depsCommand = `${manager} add ${dependencies[lang].dependencies.join(
    ' ',
  )}`;
  const devDepsCommand = `${manager} add ${dependencies.ts.devDependencies.join(
    ' ',
  )}`;

  execSync(depsCommand, { cwd: dir, stdio });

  if (devDepsCommand) {
    execSync(devDepsCommand, { cwd: dir, stdio });
  }
}
