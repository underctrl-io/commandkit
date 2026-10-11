import fs from 'fs-extra';
import path from 'node:path';
import { downloadTemplate } from 'giget';
import { validateExampleName } from './validate.js';

function toGigetSource(source: string): string {
  if (!source.startsWith('http://') && !source.startsWith('https://')) {
    return `github:${source}`;
  }

  const url = new URL(source);
  const segments = url.pathname.split('/').filter(Boolean);
  const [owner, rawRepository, tree, ...rest] = segments;

  if (!owner || !rawRepository) {
    throw new Error('GitHub example URLs must include an owner and repository');
  }

  const repository = rawRepository.replace(/\.git$/, '');
  if (tree === 'tree' && rest.length > 0) {
    const [ref, ...subdirectory] = rest;
    const path = subdirectory.length > 0 ? `/${subdirectory.join('/')}` : '';
    return `github:${owner}/${repository}${path}#${ref}`;
  }

  if (segments.length === 2) {
    return `github:${owner}/${repository}`;
  }

  throw new Error(
    'GitHub example URLs must point to a repository or a /tree/<branch>/<path> directory',
  );
}

export interface FetchExampleOptions {
  example: string;
  examplePath?: string;
  targetDir: string;
}

export async function fetchExample({
  example,
  examplePath,
  targetDir,
}: FetchExampleOptions): Promise<void> {
  const validation = validateExampleName(example);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let sourceUrl: string;

  // Check if it's a GitHub URL
  if (example.startsWith('http://') || example.startsWith('https://')) {
    sourceUrl = example;
  } else {
    // Construct URL for curated examples
    sourceUrl = `neplextech/commandkit/examples/${example}`;
  }

  // Create temporary directory for download
  const tempDir = path.join(targetDir, '.temp-example');

  try {
    // Download the example
    await downloadTemplate(toGigetSource(sourceUrl), {
      dir: tempDir,
      forceClean: true,
    });

    // If examplePath is specified, navigate to that subdirectory
    const sourceDir = examplePath ? path.join(tempDir, examplePath) : tempDir;

    if (examplePath && !fs.existsSync(sourceDir)) {
      throw new Error(
        `Example path '${examplePath}' not found in the repository`,
      );
    }

    // Copy contents to target directory
    const contents = fs.readdirSync(sourceDir);

    for (const item of contents) {
      const srcPath = path.join(sourceDir, item);
      const destPath = path.join(targetDir, item);

      if (fs.statSync(srcPath).isDirectory()) {
        await fs.copy(srcPath, destPath);
      } else {
        await fs.copy(srcPath, destPath);
      }
    }

    // Clean up temporary directory
    await fs.remove(tempDir);
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      await fs.remove(tempDir);
    }

    if (error instanceof Error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('404')
      ) {
        throw new Error(
          `Example '${example}' not found. Available examples: basic-ts, basic-js, deno-ts, without-cli`,
        );
      }
      throw new Error(`Failed to fetch example: ${error.message}`);
    }

    throw new Error('Failed to fetch example due to an unknown error');
  }
}
