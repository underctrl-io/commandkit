import fs from 'fs-extra';
import path from 'node:path';
import validateNpmPackageName from 'validate-npm-package-name';

export function validateProjectName(name: string): {
  valid: boolean;
  error?: string;
} {
  const result = validateNpmPackageName(name);

  if (!result.validForNewPackages) {
    const errors = result.errors || [];
    const warnings = result.warnings || [];
    const allIssues = [...errors, ...warnings];

    return {
      valid: false,
      error: allIssues.length > 0 ? allIssues[0] : 'Invalid project name',
    };
  }

  return { valid: true };
}

export function validateDirectory(dir: string): {
  valid: boolean;
  error?: string;
} {
  const resolvedDir = path.resolve(process.cwd(), dir);

  try {
    const exists = fs.existsSync(resolvedDir);

    if (!exists) {
      return { valid: true };
    }

    const contents = fs.readdirSync(resolvedDir);
    const isEmpty = contents.length === 0;

    if (!isEmpty) {
      return {
        valid: false,
        error: 'Directory is not empty!',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Unable to access directory',
    };
  }
}

export function validateExampleName(example: string): {
  valid: boolean;
  error?: string;
} {
  // Check if it's a GitHub URL
  if (example.startsWith('http://') || example.startsWith('https://')) {
    try {
      const url = new URL(example);
      if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
        return { valid: true };
      }
      return {
        valid: false,
        error: 'Only GitHub URLs are supported',
      };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }
  }

  // Check if it's a valid example name (alphanumeric, hyphens, underscores)
  const exampleNameRegex = /^[a-zA-Z0-9-_]+$/;
  if (!exampleNameRegex.test(example)) {
    return {
      valid: false,
      error:
        'Example name can only contain letters, numbers, hyphens, and underscores',
    };
  }

  return { valid: true };
}
