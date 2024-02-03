import { build } from 'tsup';
import { getConfig } from '../../config';
import { join } from 'path';
import { injectShims } from './shims';
import { Environment } from '../env';

export function bundle() {
  switch (true) {
    case Environment.isDevelopment():
      return buildDevelopment();
    default:
      throw new Error('Not implemented');
  }
}

function buildDevelopment() {
  return new Promise<string>((resolve) => {
    const { requirePolyfill } = getConfig();

    return build({
      clean: true,
      format: ['esm'],
      bundle: false,
      dts: false,
      skipNodeModulesBundle: true,
      minify: false,
      shims: true,
      sourcemap: 'inline',
      keepNames: true,
      outDir: '.commandkit',
      silent: true,
      entry: ['src'],
      async onSuccess() {
        const root = join(process.cwd(), '.commandkit');
        await injectShims(root, 'client.mjs', false, requirePolyfill);
        resolve(join(root, 'client.mjs'));
      },
    });
  });
}
