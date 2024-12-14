import { createDocumentation } from 'micro-docgen';
import { writeFile } from 'node:fs/promises';

async function main() {
  const docs = await createDocumentation({
    tsconfigPath: './packages/commandkit/tsconfig.json',
    input: ['./packages/commandkit/src'],
    markdown: true,
    clean: true,
    typeLinkerBasePath: '/docs',
    extension: 'mdx',
    includeMarkdownHeaders: true,
    output: './apps/docs/content/docs',
  });

  console.log(`Generated docs in ${docs.metadata.generationMs}`);

  const mod = docs.modules?.commandkit;

  if (!mod) return;

  const heading = (name: string, description: string) =>
    `---\ntitle: ${name}\ndescription: ${
      description || 'No description available.'
    }\n---\n\n`;

  const classes = Object.values(mod.classes).map((cls) => {
    return `<Card title="${cls.data.name}" description="${
      cls.data.description || 'No description available.'
    }" href="/docs/classes/${cls.data.name}" />`;
  });

  const types = Object.values(mod.types).map((int) => {
    return `<Card title="${int.data.name}" description="${
      int.data.description || 'No description available.'
    }" href="/docs/types/${int.data.name}" />`;
  });

  const functions = Object.values(mod.functions).map((func) => {
    return `<Card title="${func.data.name}" description="${
      func.data.description || 'No description available.'
    }" href="/docs/functions/${func.data.name}" />`;
  });

  const variables = Object.values(mod.variables).map((varr) => {
    return `<Card title="${varr.data.name}" description="${
      varr.data.description || 'No description available.'
    }" href="/docs/variables/${varr.data.name}" />`;
  });

  const enums = Object.values(mod.enum).map((en) => {
    return `<Card title="${en.data.name}" description="${
      en.data.description || 'No description available.'
    }" href="/docs/enums/${en.data.name}" />`;
  });

  const classesContent = classes.length
    ? `# Classes\n\n<Cards>${classes.join('\n\n')}</Cards>`
    : '';

  const interfacesContent = types.length
    ? `# Types\n\n<Cards>${types.join('\n\n')}</Cards>`
    : '';

  const functionsContent = functions.length
    ? `# Functions\n\n<Cards>${functions.join('\n\n')}</Cards>`
    : '';

  const variablesContent = variables.length
    ? `# Variables\n\n<Cards>${variables.join('\n\n')}</Cards>`
    : '';

  const enumsContent = enums.length
    ? `# Enums\n\n<Cards>${enums.join('\n\n')}</Cards>`
    : '';

  const content = [
    heading(
      mod.name,
      'Beginner friendly command & event handler for Discord.js',
    ),
    '\n',
    classesContent,
    '\n',
    interfacesContent,
    '\n',
    functionsContent,
    '\n',
    variablesContent,
    '\n',
    enumsContent,
  ].join('\n');

  // classes index
  if (classesContent)
    await writeFile(
      './apps/docs/content/docs/classes/index.mdx',
      heading('Classes', 'Classes provided by CommandKit') + classesContent,
    ).catch(Object);

  // interfaces index
  if (interfacesContent)
    await writeFile(
      './apps/docs/content/docs/types/index.mdx',
      heading('Interfaces', 'Interfaces provided by CommandKit') +
        interfacesContent,
    ).catch(Object);

  // functions index
  if (functionsContent)
    await writeFile(
      './apps/docs/content/docs/functions/index.mdx',
      heading('Functions', 'Functions provided by CommandKit') +
        functionsContent,
    ).catch(Object);

  // variables index
  if (variablesContent)
    await writeFile(
      './apps/docs/content/docs/variables/index.mdx',
      heading('Variables', 'Variables provided by CommandKit') +
        variablesContent,
    ).catch(Object);

  // enums index
  if (enumsContent)
    await writeFile(
      './apps/docs/content/docs/enums/index.mdx',
      heading('Enums', 'Enums provided by CommandKit') + enumsContent,
    ).catch(Object);

  await writeFile('./apps/docs/content/docs/index.mdx', content);
}

main();
