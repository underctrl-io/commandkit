const path = require('path');
const fs = require('fs');

module.exports = function (context) {
  return {
    name: 'llms-txt-plugin',
    loadContent: async () => {
      const { siteDir } = context;
      const docsDir = path.join(siteDir, 'docs');
      const versionedDocsDir = path.join(siteDir, 'versioned_docs');
      const allMdx = [];

      // Recursive function to get all mdx and md files (excluding API reference)
      const getMdxFiles = async (dir, versionPrefix = '') => {
        if (!fs.existsSync(dir)) return;

        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            // Skip api-reference directories
            if (entry.name === 'api-reference') {
              continue;
            }
            await getMdxFiles(fullPath, versionPrefix);
          } else if (
            entry.name.endsWith('.mdx') ||
            entry.name.endsWith('.md')
          ) {
            // Skip files in api-reference paths
            if (fullPath.includes('api-reference')) {
              continue;
            }
            const content = await fs.promises.readFile(fullPath, 'utf8');
            allMdx.push({
              content,
              path: fullPath,
              version: versionPrefix,
            });
          }
        }
      };

      // Get current/latest docs
      await getMdxFiles(docsDir, 'latest');

      // Get versioned docs
      if (fs.existsSync(versionedDocsDir)) {
        const versionDirs = await fs.promises.readdir(versionedDocsDir, {
          withFileTypes: true,
        });
        for (const versionDir of versionDirs) {
          if (versionDir.isDirectory()) {
            const versionName = versionDir.name.replace('version-', '');
            await getMdxFiles(
              path.join(versionedDocsDir, versionDir.name),
              versionName,
            );
          }
        }
      }

      return { allMdx };
    },
    postBuild: async ({ content, outDir }) => {
      const { allMdx } = content;

      // Filter out any remaining API reference content and concatenate
      const filteredContent = allMdx
        .filter((item) => !item.path.includes('api-reference'))
        .map((item) => item.content)
        .join('\n\n---\n\n');

      // Write concatenated content as llms.txt
      const llmsTxtPath = path.join(outDir, 'llms.txt');
      try {
        await fs.promises.writeFile(llmsTxtPath, filteredContent);
        console.log('✅ llms.txt generated successfully');
      } catch (err) {
        console.error('❌ Error generating llms.txt:', err);
        throw err;
      }
    },
  };
};
