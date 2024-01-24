import type { IOType } from 'child_process';
import type { PackageManager } from '../types';

import { commands } from '../utils';
import { execSync } from 'child_process';

interface InstallDepsProps {
    manager: PackageManager;
    dir: string;
    stdio: IOType;
}

export function installDeps({ manager, dir, stdio = 'pipe' }: InstallDepsProps) {
    execSync(commands.install[manager], { cwd: dir, stdio });
}
