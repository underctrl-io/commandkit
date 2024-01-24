const { execSync: ex } = require('child_process');
const { commands } = require('../constants');

const fs = require('fs-extra');
const path = require('path');

module.exports = async ({ manager, dir, token, type, stdio = 'pipe' }) => {
    await fs.emptyDir(dir);
    ex(commands.init[manager], { cwd: dir, stdio });

    const packageJsonPath = path.join(dir, 'package.json');
    const packageJson = await fs.readJSON(packageJsonPath);

    packageJson.name = packageJson.name.toLowerCase();
    packageJson.type = type == 'esm' ? 'module' : 'commonjs';

    packageJson.main = './src/index.js';
    packageJson.version = '0.0.0';

    packageJson.scripts = {
        start: 'node ./src/index.js',
        dev: 'nodemon --ext js,json,ts ./src/index.js',
    };

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 4 });
    await fs.writeFile(`${dir}/.env`, `TOKEN = ${token}`);
};
