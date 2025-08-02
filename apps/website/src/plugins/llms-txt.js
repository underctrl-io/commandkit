const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

module.exports = function (context) {
  return {
    name: 'llms-txt-plugin',
    loadContent: async () => {
      const { siteDir } = context;
      const docsDir = path.join(siteDir, 'docs');
      const guideDir = path.join(docsDir, 'guide');
      const versionedDocsDir = path.join(siteDir, 'versioned_docs');
      const allDocs = [];

      const getMdxFiles = async (dir, versionPrefix = '') => {
        if (!fs.existsSync(dir)) return;

        // skip versioned docs
        if (dir.includes(versionedDocsDir)) return;

        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await getMdxFiles(fullPath, versionPrefix);
          } else if (
            entry.name.endsWith('.mdx') ||
            entry.name.endsWith('.md')
          ) {
            const content = await fs.promises.readFile(fullPath, 'utf8');
            const { data: frontmatter, content: markdownContent } =
              matter(content);

            // Get relative path from guide directory
            const relativePath = path
              .relative(guideDir, fullPath)
              .replace(/\.mdx?$/, '')
              .replace(/\\/g, '/');

            allDocs.push({
              title: frontmatter.title,
              description: frontmatter.description,
              path: relativePath,
              version: versionPrefix,
              content: markdownContent,
            });
          }
        }
      };

      // Only process guide directory
      if (fs.existsSync(guideDir)) {
        await getMdxFiles(guideDir, 'latest');
      }

      return { allDocs };
    },
    postBuild: async ({ content, outDir }) => {
      const { allDocs } = content;

      // Generate markdown content
      const markdownContent = [
        '# CommandKit Documentation\n\n',
        ...allDocs
          .filter((doc) => doc.title && doc.content)
          .map((doc) => {
            return `## ${doc.title}\n\n${doc.content}\n\n---\n\n`;
          }),
      ].join('');

      // Write markdown content
      const llmsTxtPath = path.join(outDir, 'llms.txt');
      try {
        await fs.promises.writeFile(llmsTxtPath, markdownContent);
        console.log('✅ llms.txt generated successfully');
      } catch (err) {
        console.error('❌ Error generating llms.txt:', err);
        throw err;
      }
    },
  };
};
