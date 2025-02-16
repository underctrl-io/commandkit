export interface CLIOptions {
  main: string;
  outDir: string;
  nodeOptions?: string[];
  envExtra?: boolean;
  sourcemap?: boolean | 'inline';
  env?: Record<string, string>;
  watch?: boolean;
}

export interface BuildOptions extends CLIOptions {
  minify?: boolean;
  antiCrash?: boolean;
  requirePolyfill?: boolean;
  isDevelopment?: boolean;
}
