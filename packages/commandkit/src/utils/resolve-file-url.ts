import path from 'path';

/**
 * Convert a local file path to a file URL.
 * @param filePath - The local file's path.
 * @param withTs - Whether to append a timestamp to the URL.
 * @returns - The converted file URL.
 */
export function toFileURL(filePath: string, withTs = false) {
  const resolvedPath = path.resolve(filePath);
  return `${'file://' + resolvedPath.replace(/\\\\|\\/g, '/')}${withTs ? `?ts=${Date.now()}` : ''}`;
}
