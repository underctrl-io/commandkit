import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const gitignore = `# dependencies
node_modules

# build output
build
out
dist

# commandkit
.commandkit

# env
**/*.env*
!**/*.env.example*

# logging
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# yarn v2+
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# other
**/*.DS_Store
`;

export async function writeGitignore(dir: string) {
  await writeFile(`${dir}/.gitignore`, gitignore);
}

export async function initializeGit(dir: string) {
  try {
    await writeGitignore(dir);
    execSync('git init', { cwd: dir, stdio: 'pipe' });
  } catch {}
}
