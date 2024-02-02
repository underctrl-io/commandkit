import { build } from 'tsup';
import { getConfig } from '../../config';
import { join } from 'path';

export function bundle(mode: 'development' | 'production') {
  switch (mode) {
    case 'development':
      return buildDevelopment();
    default:
      throw new Error('Not implemented');
  }
}

function buildDevelopment() {
  const { watch } = getConfig();

  const outDir = join(process.cwd(), '.commandkit');

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
    watch,
    async onSuccess() {
      // return await injectShims('.commandkit', main, false, requirePolyfill);
    },
  }).then(() => {
    return join(outDir, 'client.mjs');
  });
}
