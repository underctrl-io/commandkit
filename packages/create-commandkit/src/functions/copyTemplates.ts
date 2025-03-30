import type { Language } from '../types';
import { templates } from '../utils';
import fs from 'fs-extra';

interface CopyTemplatesProps {
  lang: Language;
  dir: string;
}

export async function copyTemplates({ dir, lang }: CopyTemplatesProps) {
  await fs.copy(templates[lang], dir);
}
