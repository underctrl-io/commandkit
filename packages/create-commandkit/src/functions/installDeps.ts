import type { IOType } from 'child_process';
import type { Language, PackageManager } from '../types';

import { dependencies } from '../utils';
import { execSync } from 'child_process';

interface InstallDepsProps {
    manager: PackageManager;
    dir: string;
    lang: Language;
    stdio: IOType;
}

export function installDeps({ manager, dir, lang, stdio = 'pipe' }: InstallDepsProps) {
    execSync(`${manager} add ${dependencies[lang].join(' ')}`, { cwd: dir, stdio });
}
