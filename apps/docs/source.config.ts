import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { remarkInstall } from 'fumadocs-docgen';
import { remarkAdmonition } from 'fumadocs-core/mdx-plugins';

export const { docs, meta } = defineDocs({
  dir: ['content/guide'],
});

export const { docs: apiDocs, meta: apiMeta } = defineDocs({
  dir: ['content/docs'],
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkInstall, remarkAdmonition],
  },
});
