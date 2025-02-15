import { execSync } from 'node:child_process';

export async function initializeGit(dir: string) {
  try {
    execSync('git init', { cwd: dir, stdio: 'pipe' });
  } catch {}
}
