import type { Language, PackageManager } from '../types';
import { type IOType, execSync } from 'node:child_process';
import { dependencies } from '../utils';

interface InstallDepsProps {
    manager: PackageManager;
    dir: string;
    lang: Language;
    stdio: IOType;
}

export function installDeps({ manager, dir, lang, stdio = 'pipe' }: InstallDepsProps) {
    execSync(`${manager} add ${dependencies[lang].join(' ')}`, { cwd: dir, stdio });
}
