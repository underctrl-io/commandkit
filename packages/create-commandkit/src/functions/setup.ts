import type { ModuleType, PackageManager } from '../types';
import { type IOType, execSync } from 'child_process';
import { commands } from '../utils';

import fs from 'fs-extra';
import path from 'path';

interface SetupProps {
    manager: PackageManager;
    type: ModuleType;
    token: string;
    dir: string;
    stdio?: IOType;
}

export async function setup({ manager, type, token, dir, stdio = 'pipe' }: SetupProps) {
    await fs.emptyDir(dir);
    execSync(commands.init[manager], { cwd: dir, stdio });

    const packageJsonPath = path.join(dir, 'package.json');
    const packageJson = await fs.readJSON(packageJsonPath);

    delete packageJson.main;
    packageJson.name = packageJson.name.toLowerCase();
    packageJson.type = type == 'esm' ? 'module' : 'commonjs';
    packageJson.version = '0.0.0';

    packageJson.scripts = {
        dev: 'commandkit dev',
        build: 'commandkit build',
        start: 'commandkit start',
    };

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 4 });
    await fs.writeFile(`${dir}/.env`, `TOKEN=${token}`);
}
