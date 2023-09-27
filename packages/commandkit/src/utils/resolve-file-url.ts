import path from 'path';

export function toFileURL(filePath: string) {
    const resolvedPath = path.resolve(filePath);
    return 'file://' + resolvedPath.replace(/\\\\|\\/g, '/');
}
