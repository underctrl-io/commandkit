import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { COMMANDKIT_IS_DEV } from './constants';
import { existsSync } from 'node:fs';

export async function generateTypesPackage() {
  const location = join(process.cwd(), 'node_modules', 'commandkit-types');
  if (!COMMANDKIT_IS_DEV) return location;
  const packageJSON = join(location, 'package.json');
  const index = join(location, 'index.js');
  const types = join(location, 'index.d.ts');
  const command = join(location, 'command.d.ts');

  const packageJSONContent = {
    name: 'commandkit-types',
    version: '1.0.0',
    description: 'CommandKit types package',
    type: 'commonjs',
    main: 'index.js',
    types: 'index.d.ts',
  };

  const indexContent = `module.exports = {};`;

  // Restructuring the type declarations to properly extend rather than replace types
  const typesContent = `// Main types index file - imports all type declarations
import './command';
export {};
`;

  // Properly set up command types to extend the CommandTypeData interface
  const commandTypesContent = `// Auto-generated command types
  export {};
declare module 'commandkit' {
   type CommandTypeData = string
}`;

  await mkdir(location, { recursive: true }).catch(() => {});
  await writeFile(packageJSON, JSON.stringify(packageJSONContent, null, 2));
  await writeFile(index, indexContent);
  await writeFile(types, typesContent);
  await writeFile(command, commandTypesContent);

  return location;
}

export async function rewriteCommandDeclaration(data: string) {
  const commandTypesContent = `// Auto-generated command types
  declare module 'commandkit' {
    ${data}
}
    export {};
`;

  const location = join(process.cwd(), 'node_modules', 'commandkit-types');

  if (!existsSync(location)) return;

  const type = join(location, 'command.d.ts');

  await writeFile(type, commandTypesContent, { encoding: 'utf-8' });
}
