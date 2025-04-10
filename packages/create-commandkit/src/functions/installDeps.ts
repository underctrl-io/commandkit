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
  if (dependencies[lang].dependencies.length) {
    const depsCommand = `${manager} add ${dependencies[lang].dependencies.join(
      ' ',
    )}`;

    execSync(depsCommand, { cwd: dir, stdio });
  }

  if (dependencies[lang].devDependencies.length) {
    const devDepsCommand = `${manager} add -D ${dependencies[
      lang
    ].devDependencies.join(' ')}`;

    execSync(devDepsCommand, { cwd: dir, stdio });
  }
}
