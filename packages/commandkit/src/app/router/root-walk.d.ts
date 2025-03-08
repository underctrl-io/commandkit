declare module '@root/walk' {
  import type { Dirent } from 'node:fs';

  export type WalkFn = (
    err: Error | null | undefined,
    pathname: string,
    dirent: Dirent,
  ) => Promise<boolean | void>;

  function walk(pathname: string, fn: WalkFn): Promise<void>;

  export default { walk };
}
