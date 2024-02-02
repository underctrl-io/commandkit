import path from 'path';

/**
 * Convert a local file path to a file URL.
 * @param filePath - The local file's path.
 * @returns - The converted file URL.
 */
export function toFileURL(filePath: string) {
  const resolvedPath = path.resolve(filePath);
  return 'file://' + resolvedPath.replace(/\\\\|\\/g, '/');
}
