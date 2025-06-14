import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';

import type { Language } from '../types';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const templates = {
  js: path.join(__dirname, '..', 'templates', 'JavaScript'),
  ts: path.join(__dirname, '..', 'templates', 'TypeScript'),
};

const gitignore = `
# dependencies
node_modules

# build output
build
out
dist

# commandkit
.commandkit
dist
compiled-commandkit.config.mjs

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

export async function copyTemplates({
  dir,
  lang,
}: {
  lang: Language;
  dir: string;
}) {
  await fs.copy(templates[lang], dir);
  await fs.writeFile(path.join(dir, '.gitignore'), gitignore);
}
