export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'deno';

export interface CLIOptions {
  help?: boolean;
  version?: boolean;
  example?: string;
  examplePath?: string;
  useNpm?: boolean;
  usePnpm?: boolean;
  useYarn?: boolean;
  useBun?: boolean;
  useDeno?: boolean;
  skipInstall?: boolean;
  noGit?: boolean;
  yes?: boolean;
  listExamples?: boolean;
  projectDirectory?: string;
}
