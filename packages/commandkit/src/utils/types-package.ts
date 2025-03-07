import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function generateTypesPackage() {
  const location = join(process.cwd(), 'node_modules', 'commandkit-types');
  const packageJSON = join(location, 'package.json');
  const index = join(location, 'index.js');
  const types = join(location, 'index.d.ts');
  const locale = join(location, 'locale.d.ts');
  const command = join(location, 'command.d.ts');
  const exists = existsSync(packageJSON);

  if (exists) return location;

  const packageJSONContent = {
    name: 'commandkit-types',
    version: '1.0.0',
    description: 'CommandKit types package',
    type: 'commonjs',
    main: 'index.js',
    types: 'index.d.ts',
  };

  const indexContent = `module.exports = {};`;

  const typesContent = `import { CommandLocalizationTypeData } from './locale.d.ts';
  import { CommandTypeData } from './command.d.ts';
  
  declare module 'commandkit' {
    export interface CommandKitTypeReferences {
      locale: CommandLocalizationTypeData;
      command: CommandTypeData;
    }
  }`;

  await mkdir(location, { recursive: true });

  await writeFile(packageJSON, JSON.stringify(packageJSONContent, null, 2));
  await writeFile(index, indexContent);
  await writeFile(types, typesContent);
  await writeFile(locale, '');
  await writeFile(command, '');

  return location;
}
