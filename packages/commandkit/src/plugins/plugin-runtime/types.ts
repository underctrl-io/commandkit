// this is roughly the types that esbuild plugins use

export interface OnLoadArgs {
  path: string;
  namespace: string;
  suffix: string;
  pluginData: any;
  with: Record<string, string>;
}

export interface OnLoadOptions {
  filter: RegExp;
  namespace?: string;
}

export type Loader = `${'j' | 't'}s` | (string & {});

export interface OnLoadResult {
  contents?: string | Uint8Array;
  errors?: Message[];
  loader?: Loader;
  pluginData?: any;
  pluginName?: string;
  resolveDir?: string;
  warnings?: Message[];
  watchDirs?: string[];
  watchFiles?: string[];
}

export interface Message {
  text: string;
  location: Location | null;
  detail: any; // The original error from a JavaScript plugin, if applicable
}

export interface Location {
  file: string;
  namespace: string;
  line: number; // 1-based
  column: number; // 0-based, in bytes
  length: number; // in bytes
  lineText: string;
}

export interface OnResolveOptions {
  filter: RegExp;
  namespace?: string;
}

export interface OnResolveArgs {
  path: string;
  importer: string;
  namespace: string;
  resolveDir: string;
  kind: ResolveKind;
  pluginData: any;
  with: Record<string, string>;
}

export type ResolveKind =
  | 'entry-point'
  | 'import-statement'
  | 'require-call'
  | 'dynamic-import'
  | 'require-resolve'
  | 'import-rule'
  | 'composes-from'
  | 'url-token';

export interface OnResolveResult {
  errors?: Message[];
  external?: boolean;
  namespace?: string;
  path?: string;
  pluginData?: any;
  pluginName?: string;
  sideEffects?: boolean;
  suffix?: string;
  warnings?: Message[];
  watchDirs?: string[];
  watchFiles?: string[];
}

export interface Setup {
  onStart(fn: () => Promise<void>): void;
  onEnd(fn: () => Promise<void>): void;
  onDispose(fn: () => Promise<void>): void;
  onLoad(
    options: OnLoadOptions,
    cb: (args: OnLoadArgs) => Promise<OnLoadResult>,
  ): Promise<any>;
  onResolve(
    options: OnResolveOptions,
    cb: (args: OnResolveArgs) => Promise<OnResolveResult>,
  ): Promise<any>;
}
