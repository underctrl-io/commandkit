import type { Language, ModuleType } from '../types';
import { templates } from '../utils';
import fs from 'fs-extra';

interface CopyTemplatesProps {
  type: ModuleType;
  lang: Language;
  dir: string;
}

export async function copyTemplates({ type, dir, lang }: CopyTemplatesProps) {
  await fs.copy(templates[lang][type], dir);
}
