import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';

import type { Language } from '../types';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const templates = {
  js: path.join(__dirname, '..', 'templates', 'JavaScript'),
  ts: path.join(__dirname, '..', 'templates', 'TypeScript'),
};

export async function copyTemplates({
  dir,
  lang,
}: {
  lang: Language;
  dir: string;
}) {
  await fs.copy(templates[lang], dir);
}
