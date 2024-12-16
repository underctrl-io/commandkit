import { createDocumentation, DefaultLinksFactory } from 'micro-docgen';
import { DiscordLinks } from './links';

async function main() {
  const docs = await createDocumentation({
    tsconfigPath: '../../packages/commandkit/tsconfig.json',
    input: ['../../packages/commandkit/src'],
    markdown: true,
    clean: true,
    typeLinkerBasePath: '/docs/api-reference',
    extension: 'mdx',
    includeMarkdownHeaders: true,
    omitTypeLinkerExtension: true,
    output: './docs/api-reference',
    links: { ...DefaultLinksFactory, ...DiscordLinks },
  });

  console.log(`Generated docs in ${docs.metadata.generationMs}`);
}

main();
