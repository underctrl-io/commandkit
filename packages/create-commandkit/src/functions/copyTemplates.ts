import type { HandlerType, Language, ModuleType } from '../types';
import { templates } from '../utils';
import fs from 'fs-extra';

interface CopyTemplatesProps {
  type: ModuleType;
  lang: Language;
  handler: HandlerType;
  dir: string;
}

export async function copyTemplates({
  type,
  dir,
  lang,
  handler,
}: CopyTemplatesProps) {
  await fs.copy(templates[lang][handler][type], dir);
}
